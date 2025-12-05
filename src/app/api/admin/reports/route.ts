// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'

// Get all reports with optional filtering
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }



  try {
    const db = requireDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')))

    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    const where: { status?: string } = {}

    if (status && ['pending', 'reviewed', 'resolved'].includes(status)) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              status: true,
            },
          },
        },
      }),
      db.report.count({ where }),
    ])

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update report status
export async function PATCH(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }



  try {
    const db = requireDatabase()

    const { reportId, status } = await request.json()

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'Report ID and status are required' },
        { status: 400 }
      )
    }

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const report = await db.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
