// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'

// Get all students with optional filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = requireDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)

    if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    const cappedLimit = Math.min(limit, 100)

    const where: any = {}

    if (status && ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'].includes(status)) {
      where.status = status as 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED'
    }

    // SECURITY: Validate city parameter to prevent enumeration and ensure clean input
    if (city && typeof city === 'string' && city.trim().length > 0) {
      where.city = city.trim()
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        skip: (page - 1) * cappedLimit,
        take: cappedLimit,
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
          city: true,
          status: true,
          tripsHosted: true,
          averageRating: true,
          noShowCount: true,
          acceptanceRate: true,
          reliabilityBadge: true,
          createdAt: true,
        },
      }),
      db.student.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit: cappedLimit,
        totalPages: Math.ceil(total / cappedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching students:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
