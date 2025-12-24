// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { generateVerificationCode } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'
import { hashVerificationCode } from '@/lib/redis'
import { sanitizeEmail } from '@/lib/sanitization'

// Send verification code to tourist email
export async function POST(request: NextRequest) {
  try {
    const db = requireDatabase()
    const { email } = await request.json()
    let normalizedEmail = ''
    try {
      normalizedEmail = typeof email === 'string' ? sanitizeEmail(email) : ''
    } catch {
      normalizedEmail = ''
    }

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit code
    const verificationCode = generateVerificationCode()
    const hashedCode = hashVerificationCode(verificationCode)

    // Create or update tourist session
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing unverified sessions for this email
    await db.$transaction(async (tx) => {
      await tx.touristSession.deleteMany({
        where: {
          email: normalizedEmail,
          isVerified: false,
        },
      })

      await tx.touristSession.create({
        data: {
          email: normalizedEmail,
          verificationCode: hashedCode,
          expiresAt,
        },
      })
    })

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationCode)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
