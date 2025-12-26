// Force dynamic rendering for always-fresh admin data
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { requireDatabase } from '@/lib/prisma'
import { formatDateFromRange } from '@/lib/date-utils'

type BookingSummary = {
  id: string
  travelerName: string
  travelerEmail: string
  city: string
  serviceType: string
  status: string
  createdAt: string
  date: string
  assignedStudent?: {
    id: string
    name?: string | null
    email?: string | null
  }
  tripNotes?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = requireDatabase()
    const requests = await prisma.touristRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        city: true,
        serviceType: true,
        status: true,
        createdAt: true,
        dates: true,
        email: true,
        tripNotes: true,
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
    })

    const bookings: BookingSummary[] = requests.map((request) => {
      const assignedSelection = request.assignedStudentId
        ? request.selections.find((selection) => selection.studentId === request.assignedStudentId)
        : undefined

      return {
        id: request.id,
        travelerName: request.tourist?.name || request.tourist?.email || request.email,
        travelerEmail: request.tourist?.email || request.email,
        city: request.city,
        serviceType: request.serviceType,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        date: formatDateFromRange(request.dates as unknown),
        assignedStudent: assignedSelection
          ? {
              id: assignedSelection.studentId,
              name: assignedSelection.student?.name,
              email: assignedSelection.student?.email,
            }
          : undefined,
        tripNotes: request.tripNotes,
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[admin/bookings] Failed to load bookings', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
