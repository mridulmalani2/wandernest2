import { NextRequest } from 'next/server'
import { verifyAdmin, verifyStudent, verifyTourist } from '@/lib/api-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { requireDatabase } from '@/lib/prisma'
import { AppError } from '@/lib/error-handler'

export type ActorType = 'admin' | 'student' | 'tourist'

export type AuthIdentity = {
  actorType: ActorType
  userId: string
  email?: string
  role?: string
}

function unauthorized(message = 'Unauthorized') {
  throw new AppError(401, message, 'UNAUTHORIZED')
}

export async function requireAuth(request: NextRequest, actorType: ActorType): Promise<AuthIdentity> {
  if (actorType === 'admin') {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized || !authResult.admin) {
      unauthorized()
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
      unauthorized('Unauthorized - Please sign in')
    }

    let studentId = authResult.student.id
    if (!studentId) {
      const db = requireDatabase()
      const student = await db.student.findUnique({
        where: { email: authResult.student.email },
        select: { id: true },
      })
      if (!student) {
        unauthorized('Unauthorized - Student profile missing')
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
    const db = requireDatabase()
    const tourist = await db.tourist.findUnique({
      where: { email: touristAuth.tourist.email },
      select: { id: true },
    })
    if (!tourist) {
      unauthorized('Unauthorized - Tourist profile missing')
    }

    return {
      actorType: 'tourist',
      userId: tourist.id,
      email: touristAuth.tourist.email,
    }
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.userType !== 'tourist') {
    unauthorized('Unauthorized - Please sign in')
  }

  const touristId = (session.user as { touristId?: string | null }).touristId
  if (!touristId) {
    unauthorized('Unauthorized - Tourist profile missing')
  }

  return {
    actorType: 'tourist',
    userId: touristId,
    email: session.user.email,
  }
}
