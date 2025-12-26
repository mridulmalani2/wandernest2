import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const emailKey = `otp:email:${hashIdentifier(normalizedEmail)}`
    const ipKey = `otp:ip:${hashIdentifier(ip)}`

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

    // Check if account already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account already exists. Please sign in.',
          code: 'ACCOUNT_EXISTS'
        },
        { status: 400 }
      );
    }

    // 6-digit OTP using secure RNG
    const { randomInt } = await import('crypto');
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Optimize DB operations: Invalidate old OTPs and create new one in a single transaction
    await prisma.$transaction([
      prisma.studentOtp.updateMany({
        where: {
          email: normalizedEmail,
          used: false,
        },
        data: {
          used: true,
        },
      }),
      prisma.studentOtp.create({
        data: {
          email: normalizedEmail,
          code,
          expiresAt,
        },
      }),
    ])

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ OTP Generated for:', normalizedEmail);
    }

    // Send email synchronously for debugging
    console.log('Attempting to send OTP email to:', normalizedEmail);
    const emailResult = await sendVerificationEmail(normalizedEmail, code);
    console.log('Email send result:', emailResult);

    if (!emailResult.success) {
      console.error(`Failed to send OTP email to ${normalizedEmail}:`, emailResult.error);
      await prisma.studentOtp.deleteMany({
        where: {
          email: normalizedEmail,
          code,
          used: false,
        },
      })
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
