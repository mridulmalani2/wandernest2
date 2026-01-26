import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getValidStudentSession } from '@/lib/student-auth';
import { logger } from '@/lib/logger';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await rateLimitByIp(request, 60, 60, 'student-session-status');
    const cookieStore = await cookies();
    const token = cookieStore.get('student_session_token')?.value;

    // 1. Check for Custom OTP Session
    if (token) {
      const session = await getValidStudentSession(token);

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
              displayName: null,
            },
            { status: 200 }
          );
        }

        let studentName = null;
        let profileCompleteness = null;

        if (studentId) {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { name: true, profileCompleteness: true, status: true }
          });
          studentName = student?.name;
          profileCompleteness = student?.profileCompleteness;
          // @ts-ignore - status exists on student model
          var studentStatus = student?.status;
        }

        // Check if onboarding is arguably complete (has name and completeness score)
        const hasCompletedOnboarding = !!(studentName && (profileCompleteness || 0) > 0);

        return NextResponse.json(
          {
            ok: true,
            nextPath: hasCompletedOnboarding ? '/student/dashboard' : '/student/onboarding',
            linkedExistingStudent: true,
            hasCompletedOnboarding,
            displayName: studentName,
            student: {
              name: studentName,
              profileCompleteness: profileCompleteness,
              status: studentStatus,
              hasCompletedOnboarding
            }
          },
          { status: 200 }
        );
      }
    }

    // 2. No valid session found
    const response = NextResponse.json(
      { ok: false, nextPath: '/student/signin', reason: 'NO_TOKEN' },
      { status: 401 }
    );

    if (token) {
      response.cookies.delete('student_session_token');
    }

    return response;
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    logger.error('Student session-status error', {
      errorType: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
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
