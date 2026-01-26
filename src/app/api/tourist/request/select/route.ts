// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'
import { requireDatabase } from '@/lib/prisma'
import { sendStudentRequestNotification } from '@/lib/email'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'
import { verifySelectionToken } from '@/lib/auth/tokens'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

const selectSchema = z.object({
  requestId: z.string().min(1),
  selectedStudentTokens: z.array(z.string().min(1)).min(1).max(4),
}).strict()

async function selectStudents(req: NextRequest) {
  await rateLimitByIp(req, 60, 60, 'tourist-request-select')
  // SECURITY: Verify authentication
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
  }

  // Verify user is a tourist
  if (session.user.userType !== 'tourist') {
    throw new AppError(403, 'Access denied. Tourist account required.', 'ACCESS_DENIED')
  }

  // Ensure database is available
  const db = requireDatabase()

  const validatedData = await validateJson<any>(req, selectSchema)

  const { requestId, selectedStudentTokens } = validatedData
  const selectedStudentIds = Array.from(new Set(
    selectedStudentTokens.map((token) => {
      const payload = verifySelectionToken(token)
      if (!payload || payload.requestId !== requestId) {
        throw new AppError(400, 'Invalid or expired selection token', 'INVALID_SELECTION_TOKEN')
      }
      return payload.studentId
    })
  ))

  // Get the tourist request
  const touristRequest = await withDatabaseRetry(async () =>
    db.touristRequest.findUnique({
      where: { id: requestId },
    })
  )

  if (!touristRequest) {
    throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
  }

  // SECURITY: Verify the tourist owns this request
  if (touristRequest.email !== session.user.email && touristRequest.touristId !== session.user.touristId) {
    throw new AppError(403, 'Access denied. You can only select students for your own requests.', 'ACCESS_DENIED')
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
        city: true,
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

  const invalidCity = students.find((student) => student.city !== touristRequest.city)
  if (invalidCity) {
    throw new AppError(
      400,
      'Selected students must be available in the same city as the request.',
      'STUDENT_CITY_MISMATCH'
    )
  }

  // Create RequestSelection records for each selected student in a transaction
  const selections = await withDatabaseRetry(async () =>
    db.$transaction(async (tx) => {
      const updateResult = await tx.touristRequest.updateMany({
        where: { id: requestId, status: 'PENDING' },
        data: { status: 'MATCHED' },
      })

      if (updateResult.count === 0) {
        throw new AppError(
          400,
          'This request has already been processed',
          'REQUEST_ALREADY_PROCESSED'
        )
      }

      const existingSelections = await tx.requestSelection.findMany({
        where: {
          requestId,
          studentId: { in: selectedStudentIds },
        },
        select: { studentId: true },
      })

      const existingStudentIds = new Set(existingSelections.map((selection) => selection.studentId))
      const newStudentIds = selectedStudentIds.filter((studentId) => !existingStudentIds.has(studentId))

      if (newStudentIds.length === 0) {
        throw new AppError(
          400,
          'Selected students have already been added for this request.',
          'SELECTIONS_ALREADY_EXIST'
        )
      }

      const createdSelections = await Promise.all(
        newStudentIds.map((studentId) =>
          tx.requestSelection.create({
            data: {
              requestId,
              studentId,
              status: 'PENDING',
            },
          })
        )
      )

      return createdSelections
    })
  )

  // Extract created selections (results match order of input map operations)
  // The last element is the update result, which we ignore for mapping
  const selectionResults = selections
  const studentSelectionMap: Record<string, string> = {}

  selectionResults.forEach((selection) => {
    const selectionId = selection.id
    const studentId = selection.studentId
    if (selection && selection.id) {
      studentSelectionMap[studentId] = selectionId
    }
  })

  // Send notification emails to all selected students (outside transaction)
  // Emails are non-critical, so failures won't break the flow
  const notificationResults = await Promise.allSettled(
    students.map((student: any) => {
      const selectionId = studentSelectionMap[student.id]
      if (!selectionId) {
        console.error(`Missing selection ID for student ${student.id}`)
        return Promise.reject(new Error('Missing selection ID'))
      }
      return sendStudentRequestNotification(student, touristRequest, selectionId)
    })
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
    selectionsCreated: selections.length,
    notificationsSent: successfulNotifications,
    notificationsFailed: failedNotifications.length,
  })
}

export const POST = withErrorHandler(selectStudents, 'POST /api/tourist/request/select')
