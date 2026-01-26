import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashStudentSessionToken } from '@/lib/student-auth';
import { logger } from '@/lib/logger';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';
import { requireAuth } from '@/lib/auth/requireAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'student-signout');
    await requireAuth(request, 'student');

    const cookieStore = await cookies();
    const token = cookieStore.get('student_session_token')?.value;

    if (token) {
      const tokenHash = hashStudentSessionToken(token);
      await prisma.studentSession.deleteMany({
        where: { token: { in: [tokenHash, token] } },
      });
    }

    cookieStore.delete({
      name: 'student_session_token',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    logger.error('Error in student signout', {
      errorType: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
