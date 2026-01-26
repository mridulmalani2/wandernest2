import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { isZodError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

const confirmResetSchema = z.object({
  email: emailSchema,
  code: z.string().min(1).max(12),
  newPassword: z.string().min(8).max(128),
}).strict()

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'student-forgot-password-confirm')
    await rateLimitByIp(req, 20, 60 * 60, 'student-forgot-password-confirm-hour')
    const { email, code, newPassword } = await validateJson<{ email: string; code: string; newPassword: string }>(
      req,
      confirmResetSchema
    )
    const normalizedEmail = email.toLowerCase().trim()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(`password-reset-confirm:email:${hashIdentifier(normalizedEmail)}`, 5, 60 * 10),
      checkRateLimit(`password-reset-confirm:ip:${hashIdentifier(ip)}`, 20, 60 * 10),
    ])

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const otpRecord = await prisma.studentOtp.findFirst({
      where: {
        email: normalizedEmail,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction([
      prisma.studentOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      }),
      prisma.student.update({
        where: { email: normalizedEmail },
        data: { passwordHash: hashedPassword },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    if (isZodError(error)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password reset payload' },
        { status: 400 }
      )
    }
    logger.error('Password reset confirmation error', {
      errorType: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
