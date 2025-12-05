// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyTourist } from '@/lib/api-auth'

// Get tourist's past requests
export async function GET(request: NextRequest) {
  const authResult = await verifyTourist(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const db = requireDatabase()

  try {
    const email = authResult.tourist?.email

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found in session' },
        { status: 401 }
      )
    }

    const requests = await db.touristRequest.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        selections: {
          where: {
            status: 'accepted',
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                averageRating: true,
              },
            },
          },
        },
        review: true,
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching tourist requests:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
