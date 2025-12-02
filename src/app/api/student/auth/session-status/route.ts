import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const cookieStore = cookies();
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

        return NextResponse.json(
          {
            ok: true,
            nextPath: '/student/dashboard',
            linkedExistingStudent: true,
            email: session.email,
          },
          { status: 200 }
        );
      }
    }

    // 2. Check for NextAuth Session (Magic Link)
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      // Check if user is a student
      if (session.user.userType === 'student') {
        const student = await prisma.student.findUnique({
          where: { email: session.user.email },
        });

        if (student) {
          // Check if onboarding is complete (e.g. has name and city)
          if (student.name && student.city) {
            return NextResponse.json(
              {
                ok: true,
                nextPath: '/student/dashboard',
                linkedExistingStudent: true,
                email: session.user.email,
              },
              { status: 200 }
            );
          } else {
            // Profile exists but incomplete? Or maybe just treat as onboarding if critical fields missing
            // User said: "if they have already filled this out once... that should be displayed"
            // If record exists, they likely started. Let's send to dashboard if basic info is there, or onboarding if not.
            // Actually, if they have a record, let's assume they are good or the dashboard handles "finish profile".
            // But the user said "if new user -> create profile... if existing -> dashboard".
            // Let's stick to: if record exists -> dashboard.
            return NextResponse.json(
              {
                ok: true,
                nextPath: '/student/dashboard',
                linkedExistingStudent: true,
                email: session.user.email,
              },
              { status: 200 }
            );
          }
        } else {
          // No student record -> Onboarding
          return NextResponse.json(
            {
              ok: true,
              nextPath: '/student/onboarding',
              isNewStudent: true,
              email: session.user.email,
            },
            { status: 200 }
          );
        }
      } else {
        // User is tourist but trying to access student flow?
        // Redirect to tourist dashboard/booking
        return NextResponse.json(
          {
            ok: false,
            nextPath: '/booking', // or /tourist/dashboard
            reason: 'WRONG_ROLE',
          },
          { status: 200 }
        );
      }
    }

    // No valid session found
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
