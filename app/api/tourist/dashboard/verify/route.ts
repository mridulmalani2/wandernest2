import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/auth'

// Verify code and create JWT token
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Find the session
    const session = await prisma.touristSession.findFirst({
      where: {
        email,
        verificationCode: code,
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
    await prisma.touristSession.update({
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
