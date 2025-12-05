import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { waitUntil } from '@vercel/functions'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // 6-digit OTP using secure RNG
    const { randomInt } = await import('crypto');
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Optimize DB operations: Invalidate old OTPs and create new one in a single transaction
    await prisma.$transaction([
      prisma.studentOtp.updateMany({
        where: {
          email,
          used: false,
        },
        data: {
          used: true,
        },
      }),
      prisma.studentOtp.create({
        data: {
          email,
          code,
          expiresAt,
        },
      }),
    ])

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ OTP Generated for:', email);
    }

    // Send email synchronously for debugging
    console.log('Attempting to send OTP email to:', email);
    const emailResult = await sendVerificationEmail(email, code);
    console.log('Email send result:', emailResult);

    if (!emailResult.success) {
      console.error(`Failed to send OTP email to ${email}:`, emailResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in send-otp route:', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}