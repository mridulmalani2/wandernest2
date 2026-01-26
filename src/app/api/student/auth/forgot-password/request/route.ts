import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { randomInt } from 'crypto'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'
import { logger } from '@/lib/logger'
import { isZodError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'
import { generateOtpHmac } from '@/lib/auth/otp'

const forgotPasswordSchema = z.object({
  email: emailSchema,
}).strict()

const OTP_SCOPE = 'student-password-reset'

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'student-forgot-password')
    await rateLimitByIp(req, 20, 60 * 60, 'student-forgot-password-hour')
    const { email } = await validateJson<{ email: string }>(req, forgotPasswordSchema)
    const normalizedEmail = email.toLowerCase().trim()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const emailKey = `password-reset:email:${hashIdentifier(normalizedEmail)}`
    const ipKey = `password-reset:ip:${hashIdentifier(ip)}`

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(emailKey, 3, 60 * 10),
      checkRateLimit(ipKey, 10, 60 * 10),
    ])

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    })

    if (!student) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a verification code has been sent.',
      })
    }

    const code = randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const otpHmac = generateOtpHmac({
      scope: OTP_SCOPE,
      identifier: normalizedEmail,
      otp: code,
      expiresAt,
    })

    await prisma.$transaction([
      prisma.studentOtp.updateMany({
        where: { email: normalizedEmail, used: false },
        data: { used: true },
      }),
      prisma.studentOtp.create({
        data: {
          email: normalizedEmail,
          otpHmac,
          expiresAt,
          otpAttempts: 0,
        },
      }),
    ])

    const emailResult = await sendVerificationEmail(normalizedEmail, code)

    if (!emailResult.success) {
      await prisma.studentOtp.deleteMany({
        where: {
          email: normalizedEmail,
          otpHmac,
          used: false,
        },
      })
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a verification code has been sent.',
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    if (isZodError(error)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }
    logger.error('Password reset request error', {
      errorType: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
