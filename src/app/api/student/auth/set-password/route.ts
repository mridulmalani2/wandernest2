
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { password } = await req.json()

        // 1. Verify Session
        const cookieStore = cookies()
        const token = cookieStore.get('student_session_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const session = await prisma.studentSession.findUnique({
            where: { token }
        })

        if (!session || session.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Session expired' },
                { status: 401 }
            )
        }

        // In schema, StudentSession might not have logical relation mapped in Prisma schema strictly if I recall `schema.prisma`.
        // Let's check relation. The schema has `studentId` in StudentSession but relation `student`... 
        // Wait, checking schema defined earlier:
        // model StudentSession { ... studentId String? ... } 
        // It DOES NOT have a `@relation` field defined in the `StudentSession` model block in the file I viewed ?
        // Let me re-read schema content from step 386.
        // Line 327: studentId String? // Links to Student model after onboarding
        // There is NO `student Student @relation(...)` line in StudentSession.
        // So `include: { student: true }` will fail.

        // Manual fetch
        if (!session.studentId) {
            // If session is not linked to a student (e.g. old OTP session), we try to find student by email
            const student = await prisma.student.findUnique({ where: { email: session.email } })
            if (!student) {
                return NextResponse.json(
                    { success: false, error: 'Student profile found' },
                    { status: 404 }
                )
            }
            // Link it? Ideally yes, but for now just use it.
        }

        // 2. Validate Password Strength (Minimal)
        if (!password || password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. Update Student
        // Use session.email as the reliable identifier
        await prisma.student.update({
            where: { email: session.email },
            data: { passwordHash: hashedPassword }
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Error in set-password route:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
