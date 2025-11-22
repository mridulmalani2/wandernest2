// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'

// Get pending student approvals
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request)
  const prisma = requireDatabase()


  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {

    const students = await prisma.student.findMany({
      where: {
        status: 'PENDING_APPROVAL',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        nationality: true,
        institute: true,
        idCardUrl: true,
        coverLetter: true,
        languages: true,
        interests: true,
        bio: true,
        city: true,
        priceRange: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching pending students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
