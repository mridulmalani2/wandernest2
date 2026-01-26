// Force dynamic rendering for admin data freshness
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { requireDatabase } from '@/lib/prisma'
import { formatDateFromRange } from '@/lib/date-utils'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-bookings-detail')
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = requireDatabase()
    const booking = await prisma.touristRequest.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        city: true,
        serviceType: true,
        status: true,
        createdAt: true,
        dates: true,
        email: true,
        preferredLanguages: true,
        preferredNationality: true,
        preferredGender: true,
        preferredTime: true,
        groupType: true,
        numberOfGuests: true,
        phone: true,
        whatsapp: true,
        contactMethod: true,
        meetingPreference: true,
        assignedStudentId: true,
        tripNotes: true,
        tourist: {
          select: {
            name: true,
            email: true,
          },
        },
        selections: {
          select: {
            id: true,
            studentId: true,
            status: true,
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const recommendedStudents = await prisma.student
      .findMany({
        where: {
          status: 'APPROVED',
        },
        orderBy: [
          { reliabilityBadge: 'desc' },
          { tripsHosted: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          languages: true,
          averageRating: true,
          reliabilityBadge: true,
          tripsHosted: true,
        },
      })
      .then((students) =>
        students.sort((a, b) => {
          const aMatch = a.city && a.city === booking.city ? 1 : 0
          const bMatch = b.city && b.city === booking.city ? 1 : 0

          if (aMatch !== bMatch) return bMatch - aMatch
          return 0
        })
      )

    const assignedSelection = booking.assignedStudentId
      ? booking.selections.find((selection) => selection.studentId === booking.assignedStudentId)
      : undefined

    const response = {
      booking: {
        id: booking.id,
        travelerName: booking.tourist?.name || booking.tourist?.email || booking.email,
        travelerEmail: booking.tourist?.email || booking.email,
        city: booking.city,
        serviceType: booking.serviceType,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        date: formatDateFromRange(booking.dates as unknown),
        preferredLanguages: booking.preferredLanguages,
        preferredNationality: booking.preferredNationality,
        preferredGender: booking.preferredGender,
        preferredTime: booking.preferredTime,
        groupType: booking.groupType,
        numberOfGuests: booking.numberOfGuests,
        contact: {
          phone: booking.phone,
          whatsapp: booking.whatsapp,
          contactMethod: booking.contactMethod,
          meetingPreference: booking.meetingPreference,
        },
        selections: booking.selections.map((selection) => ({
          id: selection.id,
          studentId: selection.studentId,
          status: selection.status,
          studentName: selection.student?.name,
          studentEmail: selection.student?.email,
        })),
        assignedStudent: assignedSelection
          ? {
              id: assignedSelection.studentId,
              name: assignedSelection.student?.name,
              email: assignedSelection.student?.email,
            }
          : undefined,
        recommendedStudents,
        tripNotes: booking.tripNotes,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error(`[admin/bookings/${params.id}] Failed to load booking`, error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
