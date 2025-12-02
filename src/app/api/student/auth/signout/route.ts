import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('student_session_token')?.value;

        if (token) {
            // Optionally invalidate the session in the database
            await prisma.studentSession.deleteMany({
                where: { token },
            });
        }

        // Delete the cookie
        cookies().delete('student_session_token');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in student signout:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to sign out' },
            { status: 500 }
        );
    }
}
