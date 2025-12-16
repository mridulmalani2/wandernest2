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

export async function readStudentTokenFromRequest(req: Request): Promise<string | undefined> {
  // Route handlers in Next 14 expose request.cookies on NextRequest; fall back to headers
  // when only the standard Request object is available.
  const requestWithCookies = req as {
    cookies?: { get?: (name: string) => { value?: string } | undefined }
  }

  if (typeof requestWithCookies.cookies?.get === 'function') {
    return requestWithCookies.cookies.get('student_session_token')?.value
  }

  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) {
    const cookieStore = await cookies()
    return cookieStore.get('student_session_token')?.value
  }

  const token = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('student_session_token='))
    ?.split('=')[1]

  if (token) return token
  const cookieStoreForFallback = await cookies()
  return cookieStoreForFallback.get('student_session_token')?.value
}
