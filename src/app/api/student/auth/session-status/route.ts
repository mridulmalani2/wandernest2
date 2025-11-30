import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('student_session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, nextPath: '/student/signin', reason: 'NO_TOKEN' },
        { status: 200 }
      );
    }

    const session = await prisma.studentSession.findUnique({
      where: { token },
    });

    const now = new Date();

    if (!session || !session.isVerified || session.expiresAt < now) {
      return NextResponse.json(
        {
          ok: false,
          nextPath: '/student/signin',
          reason: 'INVALID_SESSION',
        },
        { status: 200 }
      );
    }

    // ---- IMPORTANT PART: link existing student by email ----
    let studentId = session.studentId;
    let studentProfile = null;

    if (!studentId) {
      const existingStudent = await prisma.student.findUnique({
        where: { email: session.email },
      });

      if (existingStudent) {
        studentId = existingStudent.id;
        studentProfile = existingStudent;

        await prisma.studentSession.update({
          where: { id: session.id },
          data: { studentId },
        });
      }
    }

    // Agar abhi bhi studentId nahi ⇒ bilkul naya user, onboarding pe bhejo
    if (!studentId) {
      return NextResponse.json(
        {
          ok: true,
          nextPath: '/student/onboarding',
          isNewStudent: true,
          email: session.email,
        },
        { status: 200 }
      );
    }

    if (!studentProfile) {
      studentProfile = await prisma.student.findUnique({ where: { id: studentId } });
    }

    // studentId set hai ⇒ dashboard
    return NextResponse.json(
      {
        ok: true,
        nextPath: '/student/dashboard',
        linkedExistingStudent: !!session.studentId,
        email: session.email,
        student: studentProfile
          ? {
              id: studentProfile.id,
              email: studentProfile.email,
              name: studentProfile.name,
              hasCompletedOnboarding: true,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/student/auth/session-status:', error);
    return NextResponse.json(
      {
        ok: false,
        nextPath: '/student/signin',
        reason: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
