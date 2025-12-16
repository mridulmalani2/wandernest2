import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'

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

    // Atomic Consumption: Try to mark as used where valid
    const updateResult = await prisma.studentOtp.updateMany({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: now },
      },
      data: {
        used: true,
      },
    })

    if (updateResult.count === 0) {
      // Debugging: Find out WHY it failed (safe, as atomic action already failed)
      // Only log safely if needed, do NOT log actual codes in production
      const debugRecord = await prisma.studentOtp.findFirst({
        where: { email, code },
        orderBy: { createdAt: 'desc' }
      });

      // Sanitized logging
      console.log('❌ OTP Verification Failed for:', {
        email,
        reason: !debugRecord
          ? 'Code not found'
          : debugRecord.used
            ? 'Code already used'
            : debugRecord.expiresAt <= now
              ? 'Code expired'
              : 'Unknown'
      });

      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // OTP consumed successfully, now create session
    // We need to find the student ID to bind the session if possible (optional improvement, but keeping scope to fix)

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
    const cookieStore = await cookies()
    cookieStore.set('student_session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionDuration / 1000, // Convert to seconds for cookie
    });

    // Check if user is new (no Student record yet) to send Welcome Email
    // This runs asynchronously ensuring it doesn't block the response
    const existingStudent = await prisma.student.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!existingStudent) {
      // Fire and forget - don't await to keep login fast
      sendWelcomeEmail(email).catch(err => console.error('Failed to send welcome email:', err));
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in verify-otp route:', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
