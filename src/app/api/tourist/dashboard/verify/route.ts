// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { hashVerificationCode } from '@/lib/redis'
import { sanitizeEmail } from '@/lib/sanitization'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
}).strict()

export async function POST(request: NextRequest) {
  try {
    await rateLimitByIp(request, 5, 60, 'tourist-dashboard-verify')
    await rateLimitByIp(request, 20, 60 * 60, 'tourist-dashboard-verify-hour')
    const db = requireDatabase()
    const { email, code } = await validateJson<{ email: string; code: string }>(request, verifySchema)

    let normalizedEmail = ''
    try {
      normalizedEmail = sanitizeEmail(email)
    } catch {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }
    const hashedCode = hashVerificationCode(code)

    const session = await db.touristSession.findFirst({
      where: {
        email: normalizedEmail,
        verificationCode: hashedCode,
        isVerified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    const token = generateToken({ email: normalizedEmail }, '1h')

    await db.touristSession.update({
      where: { id: session.id },
      data: {
        token,
        isVerified: true,
      },
    })

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 3600,
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
