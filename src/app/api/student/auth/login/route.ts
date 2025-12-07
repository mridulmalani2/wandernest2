
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { email, password, rememberMe } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // 1. Find Student
        const student = await prisma.student.findUnique({
            where: { email },
        })

        if (!student || !student.passwordHash) {
            // Generic error message for security (or specific if we want to guide them to OTP login)
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
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
        const sessionDuration = rememberMe
            ? 30 * 24 * 60 * 60 * 1000 // 30 days
            : 24 * 60 * 60 * 1000;     // 24 hours

        const expiresAt = new Date(Date.now() + sessionDuration)

        const session = await prisma.studentSession.create({
            data: {
                email,
                studentId: student.id,
                isVerified: true,
                expiresAt,
                token: crypto.randomUUID(),
            },
        })

        cookies().set('student_session_token', session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: sessionDuration / 1000,
        })

        return NextResponse.json({ success: true, studentId: student.id })
    } catch (err) {
        console.error('Error in login route:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
