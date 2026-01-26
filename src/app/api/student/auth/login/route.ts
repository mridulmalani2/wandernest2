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

export const dynamic = 'force-dynamic'

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
    const remember = rememberMe === true || rememberMe === 'true'
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(`student-login:email:${hashIdentifier(email)}`, 5, 60 * 10),
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
      where: { email },
    })

    const dummyHash = '$2a$10$u2UADs4d4o2gwHh2UF7QdOaCq1U2eE6n9Gsaadf0mY7sQmT0V6p6q'
    const passwordHash = student?.passwordHash || dummyHash

    // 2. Verify Password (timing-safe even when user does not exist)
    const isValid = await bcrypt.compare(password, passwordHash)

    if (!student || !student.passwordHash || !isValid) {
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
        email,
        studentId: student.id,
        isVerified: true,
        expiresAt,
        token: tokenHash,
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
