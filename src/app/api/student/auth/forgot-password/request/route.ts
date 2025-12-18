import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { randomInt } from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // 1. Check if user exists
        const student = await prisma.student.findUnique({
            where: { email },
        });

        if (!student) {
            // Security: Don't reveal if user exists or not, but for UX we might want to tell them "If an account exists..."
            // However, specific requirement was to be like OTP reset.
            // Let's return success even if user doesn't exist to prevent enumeration, or return specific error if UX prefers.
            // Given the previous "Account already exists" feature, we seem to be okay with some information leakage for UX.
            // But for password reset, it's safer to say "If an account exists, we sent a code".
            // BUT, the client needs to know if they should show the OTP input. 
            // If we return success false, they might retry. 
            // Let's return success: false with a generic message or handle it gracefully.
            // actually, if we want to mimic the signup flow, we should probably be explicit for now as it's an MVP-ish/Student app.
            return NextResponse.json(
                { success: false, error: 'No account found with this email.' },
                { status: 404 }
            );
        }

        // 2. Generate OTP
        const code = randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Save OTP (reuse StudentOtp table)
        await prisma.$transaction([
            prisma.studentOtp.updateMany({
                where: { email, used: false },
                data: { used: true },
            }),
            prisma.studentOtp.create({
                data: {
                    email,
                    code,
                    expiresAt,
                },
            }),
        ]);

        // 4. Send Email
        // We can reuse the verification email or create a specific one. 
        // sending 'Verification Email' context might say "Verify your email". 
        // Ideally we'd have a specific template, but for now reuse existing to ensure it works.
        const emailResult = await sendVerificationEmail(email, code);

        if (!emailResult.success) {
            return NextResponse.json(
                { success: false, error: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
