import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getValidStudentSession, readStudentTokenFromRequest } from '@/lib/student-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { password } = await req.json()

        // 1. Verify Session
        const token = await readStudentTokenFromRequest(req)

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const session = await getValidStudentSession(token)

        if (!session) {
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
        let studentId = session.studentId
        if (!studentId) {
            if (!session.email) {
                return NextResponse.json(
                    { success: false, error: 'Student profile not found' },
                    { status: 404 }
                )
            }

            const student = await prisma.student.findUnique({ where: { email: session.email } })
            if (!student) {
                return NextResponse.json(
                    { success: false, error: 'Student profile not found' },
                    { status: 404 }
                )
            }
            studentId = student.id
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
            where: { id: studentId },
            data: { passwordHash: hashedPassword }
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        logger.error('Error in set-password route', {
            errorType: err instanceof Error ? err.name : 'unknown',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
        })
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
