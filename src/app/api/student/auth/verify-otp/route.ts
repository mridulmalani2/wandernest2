import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers';


export async function POST(req: Request) {
  try {
    const { email, code, rememberMe } = await req.json()

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
      // Debugging: Find out WHY it failed
      const debugRecord = await prisma.studentOtp.findFirst({
        where: { email, code },
        orderBy: { createdAt: 'desc' }
      });

      console.log('❌ OTP Verification Failed:', {
        email,
        codeProvided: code,
        serverTime: now.toISOString(),
        recordFound: !!debugRecord,
        reason: !debugRecord
          ? 'Code not found'
          : debugRecord.used
            ? 'Code already used'
            : debugRecord.expiresAt <= now
              ? `Code expired (Expires: ${debugRecord.expiresAt.toISOString()}, Now: ${now.toISOString()})`
              : 'Unknown'
      });

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

    // Determine session duration based on rememberMe preference
    // Default (unchecked): 24 hours
    // Remember Me (checked): 30 days
    const sessionDuration = rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000;     // 24 hours

    const expiresAt = new Date(Date.now() + sessionDuration);

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
      maxAge: sessionDuration / 1000, // Convert to seconds for cookie
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
