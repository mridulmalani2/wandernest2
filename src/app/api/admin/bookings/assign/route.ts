// Force dynamic rendering for admin actions
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-auth'
import { requireDatabase } from '@/lib/prisma'
import { sendStudentConfirmation, sendTouristAcceptanceNotification } from '@/lib/email'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'

const assignSchema = z.object({
  requestId: z.string().min(1),
  studentId: z.string().min(1),
}).strict()

export async function POST(request: NextRequest) {
  try {
    await rateLimitByIp(request, 30, 60, 'admin-bookings-assign')
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = requireDatabase()
    const { requestId, studentId } = await validateJson<{ requestId: string; studentId: string }>(request, assignSchema)

    if (!requestId || !studentId) {
      return NextResponse.json({ error: 'requestId and studentId are required' }, { status: 400 })
    }

    const [booking, student] = await Promise.all([
      prisma.touristRequest.findUnique({
        where: { id: requestId },
        include: {
          selections: true,
        },
      }),
      prisma.student.findUnique({ where: { id: studentId } }),
    ])

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!student || student.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Student must be approved before assignment' }, { status: 400 })
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      return NextResponse.json({ error: 'Cannot assign students to cancelled or expired bookings' }, { status: 400 })
    }

    const previousAssignmentId = booking.assignedStudentId
    const wasAccepted = booking.status === 'ACCEPTED'

    const selection = await prisma.$transaction(async (tx) => {
      const existingSelection = await tx.requestSelection.findFirst({
        where: {
          requestId,
          studentId,
        },
      })

      const updatedSelection = existingSelection
        ? await tx.requestSelection.update({
          where: { id: existingSelection.id },
          data: { status: 'accepted', acceptedAt: new Date() },
        })
        : await tx.requestSelection.create({
          data: {
            requestId,
            studentId,
            status: 'accepted',
            acceptedAt: new Date(),
          },
        })

      await tx.requestSelection.updateMany({
        where: {
          requestId,
          id: { not: updatedSelection.id },
          status: { in: ['pending', 'accepted'] },
        },
        data: { status: 'rejected' },
      })

      await tx.touristRequest.update({
        where: { id: requestId },
        data: {
          assignedStudentId: studentId,
          status: 'ACCEPTED',
        },
      })

      if (!wasAccepted || previousAssignmentId !== studentId) {
        await tx.student.update({
          where: { id: studentId },
          data: {
            tripsHosted: { increment: 1 },
          },
        })

        if (wasAccepted && previousAssignmentId && previousAssignmentId !== studentId) {
          await tx.student.update({
            where: { id: previousAssignmentId },
            data: {
              tripsHosted: { decrement: 1 },
            },
          })
        }
      }

      return updatedSelection
    })

    const [studentRecord, bookingRecord] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.touristRequest.findUnique({
        where: { id: requestId },
        include: { tourist: true }
      }),
    ])

    if (studentRecord && bookingRecord) {
      const touristEmail = bookingRecord.email
      // @ts-ignore - tourist relation is included but not in default type
      const touristName = bookingRecord.tourist?.name || 'Tourist'

      await Promise.all([
        sendTouristAcceptanceNotification(touristEmail, studentRecord, bookingRecord, touristName),
        sendStudentConfirmation(studentRecord, bookingRecord, touristName),
      ])
    }

    return NextResponse.json({ success: true, selectionId: selection.id })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('[admin/bookings/assign] Failed to assign student', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
