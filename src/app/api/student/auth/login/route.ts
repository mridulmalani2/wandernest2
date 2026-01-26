import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'
import { createStudentSessionToken } from '@/lib/student-auth'
import { logger } from '@/lib/logger'
import { isZodError } from '@/lib/error-handler'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'
import {
  getLockoutUntil,
  isLockoutActive,
  shouldLockout,
} from '@/lib/auth/securityPolicy'

export const dynamic = 'force-dynamic'

const DUMMY_BCRYPT_HASH =
  '$2a$10$txxd33/oxVxxykdFk4.Wx.DejyScXefQyL8rA/16dEj9o.or5z15S'

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  rememberMe: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
}).strict()

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'student-login')
    await rateLimitByIp(req, 20, 60 * 60, 'student-login-hour')
    const { email, password, rememberMe } = await validateJson<{ email: string; password: string; rememberMe?: boolean | string }>(req, loginSchema)
    const normalizedEmail = email.toLowerCase().trim()
    const remember = rememberMe === true || rememberMe === 'true'
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(`student-login:email:${hashIdentifier(normalizedEmail)}`, 5, 60 * 10),
      checkRateLimit(`student-login:ip:${hashIdentifier(ip)}`, 20, 60 * 10),
    ])

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // 1. Find Student
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    })

    const now = new Date()
    const isLocked = isLockoutActive(student?.lockoutUntil, now)

    // 2. Verify Password (always compare to avoid timing leaks)
    const passwordHash = student?.passwordHash || DUMMY_BCRYPT_HASH
    const isValid = await bcrypt.compare(password, passwordHash)

    if (isLocked) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!student || !student.passwordHash || !isValid) {
      if (student) {
        const updated = await prisma.student.update({
          where: { id: student.id },
          data: {
            failedLoginAttempts: { increment: 1 },
            lastFailedLoginAt: now,
          },
        })

        if (shouldLockout(updated.failedLoginAttempts)) {
          await prisma.student.update({
            where: { id: student.id },
            data: {
              failedLoginAttempts: 0,
              lockoutUntil: getLockoutUntil(now),
            },
          })
        }
      }
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 3. Create Session
    const sessionDuration = remember
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000

    const expiresAt = new Date(Date.now() + sessionDuration)
    const { token, tokenHash } = createStudentSessionToken()

    await prisma.studentSession.create({
      data: {
        email: normalizedEmail,
        studentId: student.id,
        isVerified: true,
        expiresAt,
        token: tokenHash,
      },
    })

    await prisma.student.update({
      where: { id: student.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastFailedLoginAt: null,
      },
    })

    const cookieStore = await cookies()
    cookieStore.set('student_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionDuration / 1000,
    })

    return NextResponse.json({ success: true, studentId: student.id })
  } catch (err) {
    if (err instanceof NextResponse) {
      return err
    }
    if (isZodError(err)) {
      return NextResponse.json(
        { success: false, error: 'Invalid login payload' },
        { status: 400 }
      )
    }
    logger.error('Error in login route', {
      errorType: err instanceof Error ? err.name : 'unknown',
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
