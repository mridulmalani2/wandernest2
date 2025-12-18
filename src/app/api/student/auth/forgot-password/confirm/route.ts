import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // 1. Verify OTP
        const otpRecord = await prisma.studentOtp.findFirst({
            where: {
                email,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired code' },
                { status: 400 }
            );
        }

        // 2. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            // Mark OTP as used
            prisma.studentOtp.update({
                where: { id: otpRecord.id },
                data: { used: true },
            }),
            // Update User Password
            prisma.student.update({
                where: { email },
                data: { passwordHash: hashedPassword },
            }),
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Password reset confirmation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
