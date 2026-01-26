// Force dynamic rendering so admin data is always fresh
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { requireDatabase } from '@/lib/prisma'
import { formatDateFromRange } from '@/lib/date-utils'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'

type DashboardBooking = {
  id: string
  travelerName: string
  city: string
  date: string
  service: string
  assignment: {
    studentName?: string
    status: 'Assigned' | 'Unassigned'
  }
  approval: 'Approved' | 'Pending' | 'Needs Attention'
  notes?: string
}

export async function GET(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-dashboard')
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const prisma = requireDatabase()
    const [
      totalBookings,
      totalStudents,
      approvedBookings,
      pendingApprovals,
      upcomingRequests,
    ] = await Promise.all([
      prisma.touristRequest.count(),
      prisma.student.count(),
      prisma.touristRequest.count({ where: { status: 'ACCEPTED' } }),
      prisma.touristRequest.count({ where: { status: { in: ['PENDING', 'MATCHED'] } } }),
      prisma.touristRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          city: true,
          serviceType: true,
          status: true,
          dates: true,
          tripNotes: true,
          email: true,
          assignedStudentId: true,
          tourist: {
            select: {
              name: true,
              email: true,
            },
          },
          selections: {
            select: {
              studentId: true,
              student: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ])

    const upcomingBookings: DashboardBooking[] = upcomingRequests.map((request) => {
      const assignedSelection = request.assignedStudentId
        ? request.selections.find((selection) => selection.studentId === request.assignedStudentId)
        : undefined

      const approval: DashboardBooking['approval'] =
        request.status === 'ACCEPTED'
          ? 'Approved'
          : request.status === 'PENDING' || request.status === 'MATCHED'
            ? 'Pending'
            : 'Needs Attention'

      const travelerName = request.tourist?.name || request.tourist?.email || request.email

      return {
        id: request.id,
        travelerName,
        city: request.city,
        date: formatDateFromRange(request.dates as unknown),
        service: request.serviceType,
        assignment: assignedSelection
          ? { status: 'Assigned', studentName: assignedSelection.student?.name || assignedSelection.student?.email }
          : { status: 'Unassigned' },
        approval,
        notes: request.tripNotes || undefined,
      }
    })

    return NextResponse.json({
      totalBookings,
      totalStudents,
      approvedBookings,
      pendingApprovals,
      upcomingBookings,
    })
  } catch (error) {
    console.error('Error loading admin dashboard data', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
