import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { email, code, name, phone, city } = await req.json()

        if (!email || !code) {
            return NextResponse.json(
                { success: false, error: 'Email and code are required' },
                { status: 400 }
            )
        }

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
                    name: name || undefined,
                    phoneNumber: phone || undefined,
                    city: city || undefined,
                    status: 'PENDING_APPROVAL',
                    emailVerified: true, // OTP verified ownership
                    profileCompleteness: 10, // Arbitrary starting value
                },
            })

            // Send Welcome Email for new signups
            console.log(`✨ New user signed up: ${email}. Sending welcome email...`);
            try {
                await sendWelcomeEmail(email);
                console.log(`✅ Welcome email sent to ${email}`);
            } catch (emailErr) {
                console.error('❌ Failed to send welcome email:', emailErr);
            }
        } else {
            // If student exists, we might just update the basic info if it's missing?
            // Or just log them in. For "Signup" route, usually implies creating or updating.
            // user said: "Keep OTP signup unchanged... except for a minimal second-step".
            // Let's update basic fields if provided.
            student = await prisma.student.update({
                where: { id: student.id },
                data: {
                    name: name || student.name,
                    phoneNumber: phone || student.phoneNumber,
                    city: city || student.city,
                    emailVerified: true,
                }
            })
        }

        // 3. Create Session
        const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
        const expiresAt = new Date(Date.now() + sessionDuration)

        const session = await prisma.studentSession.create({
            data: {
                email,
                studentId: student.id, // Link to the student record
                isVerified: true,
                expiresAt,
                token: crypto.randomUUID(),
            },
        })

        const cookieStore = await cookies()
        cookieStore.set('student_session_token', session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: sessionDuration / 1000,
        })

        return NextResponse.json({ success: true, studentId: student.id })
    } catch (err) {
        console.error('Error in signup route:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong processing signup' },
            { status: 500 }
        )
    }
}
