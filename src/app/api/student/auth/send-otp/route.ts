import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email' // jahan tumne sendVerificationEmail export kiya hai

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Pehle ke unused OTPs ko invalidate kar do (optional but good)
    await prisma.studentOtp.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Naya OTP record banao
    await prisma.studentOtp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    })

    const { success, error } = await sendVerificationEmail(email, code)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: error ?? 'Failed to send verification email',
        },
        { status: 500 }
      )
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