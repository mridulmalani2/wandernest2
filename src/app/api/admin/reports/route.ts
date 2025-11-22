// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'

// Get all reports with optional filtering
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: { status?: string } = {}

    if (status && ['pending', 'reviewed', 'resolved'].includes(status)) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
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
      prisma.report.count({ where }),
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
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
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

    const report = await prisma.report.update({
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
