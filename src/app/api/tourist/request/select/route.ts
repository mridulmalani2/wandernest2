// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, requireDatabase } from '@/lib/prisma'
import { sendStudentRequestNotification } from '@/lib/email'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

const selectSchema = z.object({
  requestId: z.string().min(1),
  selectedStudentIds: z.array(z.string()).min(1).max(4),
})

async function selectStudents(req: NextRequest) {
  // Ensure database is available
  const db = requireDatabase()

  const body = await req.json()
  const validatedData = selectSchema.parse(body)

  const { requestId, selectedStudentIds } = validatedData

  // Get the tourist request
  const touristRequest = await withDatabaseRetry(async () =>
    db.touristRequest.findUnique({
      where: { id: requestId },
    })
  )

  if (!touristRequest) {
    throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
  }

  // Check if request is still pending
  if (touristRequest.status !== 'PENDING') {
    throw new AppError(
      400,
      'This request has already been processed',
      'REQUEST_ALREADY_PROCESSED'
    )
  }

  // Verify all selected students exist and are approved (only fetch needed fields)
  const students = await withDatabaseRetry(async () =>
    db.student.findMany({
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
  )

  if (students.length !== selectedStudentIds.length) {
    throw new AppError(
      400,
      'One or more selected students are not available',
      'STUDENTS_NOT_AVAILABLE'
    )
  }

  // Create RequestSelection records for each selected student in a transaction
  const selections = await withDatabaseRetry(async () =>
    db.$transaction([
      ...selectedStudentIds.map((studentId) =>
        db.requestSelection.create({
          data: {
            requestId,
            studentId,
            status: 'pending',
          },
        })
      ),
      // Update tourist request status to MATCHED
      db.touristRequest.update({
        where: { id: requestId },
        data: { status: 'MATCHED' },
      }),
    ])
  )

  // Send notification emails to all selected students (outside transaction)
  // Emails are non-critical, so failures won't break the flow
  const notificationResults = await Promise.allSettled(
    students.map((student: any) =>
      sendStudentRequestNotification(student, touristRequest)
    )
  )

  // Count successful notifications
  const successfulNotifications = notificationResults.filter(
    (result) => result.status === 'fulfilled' && result.value.success
  ).length

  // Log any failed notifications (but don't fail the request)
  const failedNotifications = notificationResults.filter(
    (result) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
  )

  if (failedNotifications.length > 0) {
    console.warn(
      `⚠️  Failed to send ${failedNotifications.length} of ${students.length} student notification emails`
    )
    failedNotifications.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`   Student ${index + 1}:`, result.reason)
      } else if (result.status === 'fulfilled') {
        console.error(`   Student ${index + 1}:`, result.value.error)
      }
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Requests sent to selected students',
    selectionsCreated: selections.length - 1, // Subtract the update operation
    notificationsSent: successfulNotifications,
    notificationsFailed: failedNotifications.length,
  })
}

export const POST = withErrorHandler(selectStudents, 'POST /api/tourist/request/select')
