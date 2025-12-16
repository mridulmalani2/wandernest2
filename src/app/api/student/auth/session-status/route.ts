import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('student_session_token')?.value;

    // 1. Check for Custom OTP Session
    if (token) {
      const session = await prisma.studentSession.findUnique({
        where: { token },
      });

      const now = new Date();

      if (session && session.isVerified && session.expiresAt >= now) {
        // Link existing student by email
        let studentId = session.studentId;

        if (!studentId) {
          const existingStudent = await prisma.student.findUnique({
            where: { email: session.email },
          });

          if (existingStudent) {
            studentId = existingStudent.id;
            await prisma.studentSession.update({
              where: { id: session.id },
              data: { studentId },
            });
          }
        }

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

        let studentName = null;
        let profileCompleteness = null;

        if (studentId) {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { name: true, profileCompleteness: true }
          });
          studentName = student?.name;
          profileCompleteness = student?.profileCompleteness;
        }

        return NextResponse.json(
          {
            ok: true,
            nextPath: '/student/dashboard',
            linkedExistingStudent: true,
            email: session.email,
            student: {
              name: studentName,
              profileCompleteness: profileCompleteness
            }
          },
          { status: 200 }
        );
      }
    }

    // 2. No valid session found
    return NextResponse.json(
      { ok: false, nextPath: '/student/signin', reason: 'NO_TOKEN' },
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
