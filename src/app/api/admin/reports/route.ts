// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'
import { z } from 'zod'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'
import { serializeReportPublic } from '@/lib/response/serialize'

const reportStatusSchema = z.object({
  reportId: z.string().cuid(),
  status: z.enum(['pending', 'reviewed', 'resolved']),
}).strict()

export async function GET(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-reports')
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
              city: true,
              status: true,
            },
          },
        },
      }),
      db.report.count({ where }),
    ])

    return NextResponse.json({
      reports: reports.map(serializeReportPublic),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error fetching reports:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-reports-update')
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = requireDatabase()

    const { reportId, status } = await validateJson<{ reportId: string; status: 'pending' | 'reviewed' | 'resolved' }>(
      request,
      reportStatusSchema
    )

    const existingReport = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
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
          },
        },
      },
    })

    return NextResponse.json({ success: true, report: serializeReportPublic(report) })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Error updating report:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
