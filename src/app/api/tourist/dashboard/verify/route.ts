// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { hashVerificationCode } from '@/lib/redis'

// Verify code and create JWT token
export async function POST(request: NextRequest) {
  try {
    const db = requireDatabase()
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const hashedCode = hashVerificationCode(code)

    // Find the session
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

    // Check if code is expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({ email }, '1h')

    // Update session with token and mark as verified
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
      expiresIn: 3600, // 1 hour in seconds
    })
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
