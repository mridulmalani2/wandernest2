// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { requireDatabase } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  let payload: { userType?: 'student' | 'tourist' }
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
  }

  const { userType } = payload
  if (userType !== 'student' && userType !== 'tourist') {
    return NextResponse.json({ success: false, message: 'Invalid userType' }, { status: 400 })
  }

  const db = requireDatabase()

  await db.user.update({
    where: { id: session.user.id },
    data: { userType },
  })

  if (userType === 'student') {
    await db.student.upsert({
      where: { email: session.user.email },
      create: {
        email: session.user.email,
        name: session.user.name || undefined,
        googleId: null,
        emailVerified: true,
        profilePhotoUrl: (session.user as { image?: string }).image,
        status: 'PENDING_APPROVAL',
        profileCompleteness: 0,
      },
      update: {
        name: session.user.name || undefined,
        profilePhotoUrl: (session.user as { image?: string }).image || undefined,
        emailVerified: true,
      },
    })
  } else {
    await db.tourist.upsert({
      where: { email: session.user.email },
      create: {
        email: session.user.email,
        name: session.user.name || undefined,
        image: (session.user as { image?: string }).image,
        googleId: null,
      },
      update: {
        name: session.user.name || undefined,
        image: (session.user as { image?: string }).image || undefined,
      },
    })
  }

  return NextResponse.json({ success: true, userType })
}
