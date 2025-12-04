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

    // 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
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

    // Send email in background to prevent timeout
    // The user will receive a success response immediately
    waitUntil(
      sendVerificationEmail(email, code).then(({ success, error }) => {
        if (!success) {
          console.error(`Failed to send OTP email to ${email}:`, error)
        }
      })
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in send-otp route:', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}