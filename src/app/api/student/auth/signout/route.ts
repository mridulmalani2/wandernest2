import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('student_session_token')?.value;

        if (token) {
            // Invalidate the session in the database
            await prisma.studentSession.deleteMany({
                where: { token },
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
        console.error('Error in student signout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to sign out' },
            { status: 500 }
        );
    }
}
