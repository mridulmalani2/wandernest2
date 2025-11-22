// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'

// Get all students with optional filtering
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: { status?: string; city?: string } = {}

    if (status && ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'].includes(status)) {
      where.status = status
    }

    if (city) {
      where.city = city
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      prisma.student.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
