import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'
import { emailSchema, phoneSchema } from '@/lib/schemas/common'
import { sanitizeText } from '@/lib/sanitization'
import { createStudentSessionToken } from '@/lib/student-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
    email: emailSchema,
    code: z.string().min(1).max(12),
    name: z.string().trim().min(1).max(100).optional(),
    phone: phoneSchema.optional(),
    city: z.string().trim().min(1).max(100).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, code, name, phone, city } = signupSchema.parse(body)
        const sanitizedName = name ? sanitizeText(name, 100) : undefined
        const sanitizedCity = city ? sanitizeText(city, 100) : undefined

        // 1. Verify OTP
        const now = new Date()
        const updateResult = await prisma.studentOtp.updateMany({
            where: {
                email,
                code,
                used: false,
                expiresAt: { gt: now },
            },
            data: {
                used: true,
            },
        })

        if (updateResult.count === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired code' },
                { status: 400 }
            )
        }

        // 2. Create or Update Student Record
        // We treat this as "Frictionless Signup" - create if new, or potentially update if exists (though usually signup is for new)
        // To be safe, we upsert, or findFirst then create.
        // The requirement says "create the user account immediately...".

        let student = await prisma.student.findUnique({
            where: { email },
        })

        if (!student) {
            // Create new student with PENDING_APPROVAL status
            student = await prisma.student.create({
                data: {
                    email,
                    name: sanitizedName,
                    phoneNumber: phone || undefined,
                    city: sanitizedCity,
                    status: 'PENDING_APPROVAL',
                    emailVerified: true, // OTP verified ownership
                    profileCompleteness: 10, // Arbitrary starting value
                },
            })

            // Send Welcome Email for new signups
            try {
                await sendWelcomeEmail(email);
            } catch (emailErr) {
                logger.warn('Failed to send welcome email', {
                    errorType: emailErr instanceof Error ? emailErr.name : 'unknown',
                    errorMessage: emailErr instanceof Error ? emailErr.message : 'Unknown error',
                });
            }
        } else {
            // If student exists, we might just update the basic info if it's missing?
            // Or just log them in. For "Signup" route, usually implies creating or updating.
            // user said: "Keep OTP signup unchanged... except for a minimal second-step".
            // Let's update basic fields if provided.
            student = await prisma.student.update({
                where: { id: student.id },
                data: {
                    name: sanitizedName || student.name,
                    phoneNumber: phone || student.phoneNumber,
                    city: sanitizedCity || student.city,
                    emailVerified: true,
                }
            })
        }

        // 3. Create Session
        const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
        const expiresAt = new Date(Date.now() + sessionDuration)

        const { token, tokenHash } = createStudentSessionToken()
        await prisma.studentSession.create({
            data: {
                email,
                studentId: student.id, // Link to the student record
                isVerified: true,
                expiresAt,
                token: tokenHash,
            },
        })

        const cookieStore = await cookies()
        cookieStore.set('student_session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: sessionDuration / 1000,
        })

        return NextResponse.json({ success: true, studentId: student.id })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid signup payload' },
                { status: 400 }
            )
        }
        logger.error('Error in signup route', {
            errorType: err instanceof Error ? err.name : 'unknown',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
        })
        return NextResponse.json(
            { success: false, error: 'Something went wrong processing signup' },
            { status: 500 }
        )
    }
}
