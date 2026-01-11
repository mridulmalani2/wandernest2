import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { randomInt } from 'crypto';
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';
import { emailSchema } from '@/lib/schemas/common';
import { logger } from '@/lib/logger';
import { isZodError } from '@/lib/error-handler';

const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);
        const normalizedEmail = email.toLowerCase().trim();
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

        const emailKey = `password-reset:email:${hashIdentifier(normalizedEmail)}`;
        const ipKey = `password-reset:ip:${hashIdentifier(ip)}`;

        const [emailLimit, ipLimit] = await Promise.all([
            checkRateLimit(emailKey, 3, 60 * 10),
            checkRateLimit(ipKey, 10, 60 * 10),
        ]);

        if (!emailLimit.allowed || !ipLimit.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please wait before trying again.' },
                { status: 429 }
            );
        }

        // 1. Check if user exists
        const student = await prisma.student.findUnique({
            where: { email: normalizedEmail },
        });

        if (!student) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists, a verification code has been sent.',
            });
        }

        // 2. Generate OTP
        const code = randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Save OTP (reuse StudentOtp table)
        await prisma.$transaction([
            prisma.studentOtp.updateMany({
                where: { email: normalizedEmail, used: false },
                data: { used: true },
            }),
            prisma.studentOtp.create({
                data: {
                    email: normalizedEmail,
                    code,
                    expiresAt,
                },
            }),
        ]);

        // 4. Send Email
        // We can reuse the verification email or create a specific one. 
        // sending 'Verification Email' context might say "Verify your email". 
        // Ideally we'd have a specific template, but for now reuse existing to ensure it works.
        const emailResult = await sendVerificationEmail(normalizedEmail, code);

        if (!emailResult.success) {
            await prisma.studentOtp.deleteMany({
                where: {
                    email: normalizedEmail,
                    code,
                    used: false,
                },
            });
            return NextResponse.json(
                { success: false, error: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists, a verification code has been sent.',
        });

    } catch (error) {
        if (isZodError(error)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }
        logger.error('Password reset request error', {
            errorType: error instanceof Error ? error.name : 'unknown',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
