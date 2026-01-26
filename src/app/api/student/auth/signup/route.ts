import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'
import { emailSchema, phoneSchema } from '@/lib/schemas/common'
import { sanitizeText } from '@/lib/sanitization'
import { createStudentSessionToken } from '@/lib/student-auth'
import { logger } from '@/lib/logger'
import { isZodError } from '@/lib/error-handler'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  email: emailSchema,
  code: z.string().min(1).max(12),
  name: z.string().trim().min(1).max(100).optional(),
  phone: phoneSchema.optional(),
  city: z.string().trim().min(1).max(100).optional(),
}).strict()

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'student-signup')
    await rateLimitByIp(req, 20, 60 * 60, 'student-signup-hour')
    const { email, code, name, phone, city } = await validateJson<{
      email: string
      code: string
      name?: string
      phone?: string
      city?: string
    }>(req, signupSchema)
    const sanitizedName = name ? sanitizeText(name, 100) : undefined
    const sanitizedCity = city ? sanitizeText(city, 100) : undefined
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(`student-signup:email:${hashIdentifier(email)}`, 5, 60 * 10),
      checkRateLimit(`student-signup:ip:${hashIdentifier(ip)}`, 20, 60 * 10),
    ])

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // 1. Verify OTP
    const now = new Date()
    const updateResult = await prisma.studentOtp.updateMany({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: now },
      },
      data: {
        used: true,
      },
    })

    if (updateResult.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // 2. Create or Update Student Record
    let student = await prisma.student.findUnique({
      where: { email },
    })

    if (!student) {
      student = await prisma.student.create({
        data: {
          email,
          name: sanitizedName,
          phoneNumber: phone || undefined,
          city: sanitizedCity,
          status: 'PENDING_APPROVAL',
          emailVerified: true,
          profileCompleteness: 10,
        },
      })

      try {
        await sendWelcomeEmail(email)
      } catch (emailErr) {
        logger.warn('Failed to send welcome email', {
          errorType: emailErr instanceof Error ? emailErr.name : 'unknown',
          errorMessage: emailErr instanceof Error ? emailErr.message : 'Unknown error',
        })
      }
    } else {
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: sanitizedName || student.name,
          phoneNumber: phone || student.phoneNumber,
          city: sanitizedCity || student.city,
          emailVerified: true,
        },
      })
    }

    // 3. Create Session
    const sessionDuration = 24 * 60 * 60 * 1000
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
        { success: false, error: 'Invalid signup payload' },
        { status: 400 }
      )
    }
    logger.error('Error in signup route', {
      errorType: err instanceof Error ? err.name : 'unknown',
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Something went wrong processing signup' },
      { status: 500 }
    )
  }
}
