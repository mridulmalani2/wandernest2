import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'
import { createStudentSessionToken } from '@/lib/student-auth'
import { logger } from '@/lib/logger'
import { isZodError } from '@/lib/error-handler'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(8).max(128),
    rememberMe: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, rememberMe } = loginSchema.parse(body)
        const remember = rememberMe === true || rememberMe === 'true'
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

        const [emailLimit, ipLimit] = await Promise.all([
            checkRateLimit(`student-login:email:${hashIdentifier(email)}`, 5, 60 * 10),
            checkRateLimit(`student-login:ip:${hashIdentifier(ip)}`, 20, 60 * 10),
        ])

        if (!emailLimit.allowed || !ipLimit.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // 1. Find Student
        const student = await prisma.student.findUnique({
            where: { email },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, error: 'Account does not exist' },
                { status: 404 }
            )
        }

        if (!student.passwordHash) {
            return NextResponse.json(
                { success: false, error: 'Password not set. Please reset your password.' },
                { status: 401 }
            )
        }

        // 2. Verify Password
        const isValid = await bcrypt.compare(password, student.passwordHash)

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // 3. Create Session
        const sessionDuration = remember
            ? 30 * 24 * 60 * 60 * 1000 // 30 days
            : 24 * 60 * 60 * 1000;     // 24 hours

        const expiresAt = new Date(Date.now() + sessionDuration)
        const { token, tokenHash } = createStudentSessionToken()

        await prisma.studentSession.create({
            data: {
                email,
                studentId: student.id,
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
        if (isZodError(err)) {
            return NextResponse.json(
                { success: false, error: 'Invalid login payload' },
                { status: 400 }
            )
        }
        logger.error('Error in login route', {
            errorType: err instanceof Error ? err.name : 'unknown',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
        })
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
