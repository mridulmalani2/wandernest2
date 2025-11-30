import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { StudentSession, Student } from '@prisma/client'

export async function getValidStudentSession(token?: string | null) {
  if (!token) return null

  const session = await prisma.studentSession.findUnique({ where: { token } })
  if (!session) return null

  const now = new Date()
  if (!session.isVerified || session.expiresAt < now) {
    return null
  }

  return session
}

export async function getStudentFromSession(session: StudentSession): Promise<Student | null> {
  if (session.studentId) {
    return prisma.student.findUnique({ where: { id: session.studentId } })
  }

  return prisma.student.findUnique({ where: { email: session.email } })
}

export function readStudentTokenFromRequest(req: Request): string | undefined {
  // Route handlers in Next 14 expose request.cookies on NextRequest; fall back to headers
  // when only the standard Request object is available.
  // @ts-expect-error - cookies is available on NextRequest but not in the base type
  if (typeof (req as any).cookies?.get === 'function') {
    // @ts-expect-error - cookies is available on NextRequest but not in the base type
    return (req as any).cookies.get('student_session_token')?.value
  }

  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return cookies().get('student_session_token')?.value

  const token = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('student_session_token='))
    ?.split('=')[1]

  return token || cookies().get('student_session_token')?.value
}
