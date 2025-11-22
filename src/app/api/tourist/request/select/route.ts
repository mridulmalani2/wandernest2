// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendStudentRequestNotification } from '@/lib/email'

const selectSchema = z.object({
  requestId: z.string().min(1),
  selectedStudentIds: z.array(z.string()).min(1).max(4),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = selectSchema.parse(body)

    const { requestId, selectedStudentIds } = validatedData

    // Get the tourist request
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
    })

    if (!touristRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if request is still pending
    if (touristRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: 'This request has already been processed'
        },
        { status: 400 }
      )
    }

    // Verify all selected students exist and are approved (only fetch needed fields)
    const students = await prisma.student.findMany({
      where: {
        id: { in: selectedStudentIds },
        status: 'APPROVED',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (students.length !== selectedStudentIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more selected students are not available'
        },
        { status: 400 }
      )
    }

    // Create RequestSelection records for each selected student
    const selections = await Promise.all(
      selectedStudentIds.map((studentId) =>
        prisma.requestSelection.create({
          data: {
            requestId,
            studentId,
            status: 'pending',
          },
        })
      )
    )

    // Update tourist request status to MATCHED
    await prisma.touristRequest.update({
      where: { id: requestId },
      data: { status: 'MATCHED' },
    })

    // Send notification emails to all selected students
    const notificationResults = await Promise.allSettled(
      students.map((student) =>
        sendStudentRequestNotification(student, touristRequest)
      )
    )

    // Log any failed notifications (but don't fail the request)
    const failedNotifications = notificationResults.filter(
      (result) => result.status === 'rejected'
    )
    if (failedNotifications.length > 0) {
      console.error(
        `Failed to send ${failedNotifications.length} notification(s)`,
        failedNotifications
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Requests sent to selected students',
      selectionsCreated: selections.length,
      notificationsSent: notificationResults.filter((r) => r.status === 'fulfilled').length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error selecting students:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process student selection',
      },
      { status: 500 }
    )
  }
}
