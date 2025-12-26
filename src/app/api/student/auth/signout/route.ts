import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashStudentSessionToken } from '@/lib/student-auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('student_session_token')?.value;

        if (token) {
            const tokenHash = hashStudentSessionToken(token);
            // Invalidate the session in the database
            await prisma.studentSession.deleteMany({
                where: { token: { in: [tokenHash, token] } },
            });
        }

        // Delete the cookie with valid options
        cookieStore.delete({
            name: 'student_session_token',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
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
