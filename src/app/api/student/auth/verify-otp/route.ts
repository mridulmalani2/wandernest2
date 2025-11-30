import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers';


export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const now = new Date()

    const record = await prisma.studentOtp.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Mark as used
    await prisma.studentOtp.update({
      where: { id: record.id },
      data: {
        used: true,
      },
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await prisma.studentSession.create({
      data: {
        email,
        isVerified: true,
        expiresAt,
        token: crypto.randomUUID(),
      },
    });

    // 👇 IMPORTANT: cookie set yahi hona chahiye
    cookies().set('student_session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in verify-otp route:', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
