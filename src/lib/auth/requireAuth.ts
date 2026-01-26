import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, verifyStudent, verifyTourist } from '@/lib/api-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { requireDatabase } from '@/lib/prisma'

export type ActorType = 'admin' | 'student' | 'tourist'

export type AuthIdentity = {
  actorType: ActorType
  userId: string
  email?: string
  role?: string
}

async function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export async function requireAuth(request: NextRequest, actorType: ActorType): Promise<AuthIdentity> {
  if (actorType === 'admin') {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized || !authResult.admin) {
      throw await unauthorizedResponse()
    }

    return {
      actorType: 'admin',
      userId: authResult.admin.id,
      email: authResult.admin.email,
      role: authResult.admin.role,
    }
  }

  if (actorType === 'student') {
    const authResult = await verifyStudent(request)
    if (!authResult.authorized || !authResult.student) {
      throw await unauthorizedResponse('Unauthorized - Please sign in')
    }

    let studentId = authResult.student.id
    if (!studentId) {
      const db = requireDatabase()
      const student = await db.student.findUnique({
        where: { email: authResult.student.email },
        select: { id: true },
      })
      if (!student) {
        throw await unauthorizedResponse('Unauthorized - Student profile missing')
      }
      studentId = student.id
    }

    return {
      actorType: 'student',
      userId: studentId,
      email: authResult.student.email,
    }
  }

  // tourist
  const touristAuth = await verifyTourist(request)
  if (touristAuth.authorized && touristAuth.tourist) {
    return {
      actorType: 'tourist',
      userId: touristAuth.tourist.email,
      email: touristAuth.tourist.email,
    }
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.userType !== 'tourist') {
    throw await unauthorizedResponse('Unauthorized - Please sign in')
  }

  const touristId = (session.user as { touristId?: string | null }).touristId
  if (!touristId) {
    throw await unauthorizedResponse('Unauthorized - Tourist profile missing')
  }

  return {
    actorType: 'tourist',
    userId: touristId,
    email: session.user.email,
  }
}
