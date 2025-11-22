// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { generateVerificationCode } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'

// Send verification code to tourist email
export async function POST(request: NextRequest) {
  try {
      const prisma = requireDatabase()

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit code
    const verificationCode = generateVerificationCode()

    // Create or update tourist session
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing unverified sessions for this email
    await prisma.touristSession.deleteMany({
      where: {
        email,
        isVerified: false,
      },
    })

    // Create new session
    await prisma.touristSession.create({
      data: {
        email,
        verificationCode,
        expiresAt,
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

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
