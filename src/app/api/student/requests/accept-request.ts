import { requireDatabase } from '@/lib/prisma'
import {
  sendTouristAcceptanceNotification,
  sendStudentConfirmation,
} from '@/lib/email'
import type { Prisma } from '@prisma/client'
import { AppError } from '@/lib/error-handler'
import { cuidSchema } from '@/lib/schemas/common'

export async function acceptRequest(requestId: string, studentId: string) {
  const parsedRequestId = cuidSchema.parse(requestId)
  // Ensure database is available
  const db = requireDatabase()

  // Start transaction
  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // Get the tourist request
    const touristRequest = await tx.touristRequest.findUnique({
      where: { id: parsedRequestId },
    })

    if (!touristRequest) {
      throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
    }

    // Check if request is still available
    if (touristRequest.status !== 'PENDING') {
      throw new AppError(400, 'Request is no longer available', 'REQUEST_UNAVAILABLE')
    }

    // Check if request has expired
    if (new Date() > touristRequest.expiresAt) {
      throw new AppError(400, 'Request has expired', 'REQUEST_EXPIRED')
    }

    // Get the RequestSelection for this student
    const selection = await tx.requestSelection.findFirst({
      where: {
        requestId: parsedRequestId,
        studentId,
      },
    })

    if (!selection) {
      throw new AppError(404, 'You were not matched with this request', 'NOT_MATCHED')
    }

    if (selection.status === 'accepted') {
      throw new AppError(400, 'You have already accepted this request', 'ALREADY_ACCEPTED')
    }
    if (selection.status === 'rejected') {
      throw new AppError(400, 'You have already rejected this request', 'ALREADY_REJECTED')
    }

    // Get student details
    const student = await tx.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      throw new AppError(404, 'Student not found', 'STUDENT_NOT_FOUND')
    }

    if (student.status !== 'APPROVED') {
      throw new AppError(403, 'Your account must be approved to accept requests', 'NOT_APPROVED')
    }

    // Update the selection to accepted
    const updatedSelectionResult = await tx.requestSelection.updateMany({
      where: { id: selection.id, status: 'pending' },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    })

    if (updatedSelectionResult.count === 0) {
      throw new AppError(409, 'Request status changed. Please refresh.', 'STATUS_CHANGED')
    }

    const updatedSelection = await tx.requestSelection.findUnique({
      where: { id: selection.id },
    })

    if (!updatedSelection) {
      throw new AppError(500, 'Failed to update selection', 'SELECTION_UPDATE_FAILED')
    }

    // Reject all other selections for this request
    await tx.requestSelection.updateMany({
      where: {
        requestId: parsedRequestId,
        id: { not: selection.id },
      },
      data: {
        status: 'rejected',
      },
    })

    // Atomic Update: Ensure request is still PENDING and not expired at the moment of update
    // This prevents race conditions where two students accept simultaneously
    const updateRequestResult = await tx.touristRequest.updateMany({
      where: {
        id: parsedRequestId,
        status: 'PENDING',
        expiresAt: { gt: new Date() }, // Ensure not expired
      },
      data: {
        status: 'ACCEPTED',
        assignedStudentId: studentId,
      },
    })

    if (updateRequestResult.count === 0) {
      throw new AppError(409, 'Request is no longer available', 'REQUEST_UNAVAILABLE')
    }

    const updatedRequest = await tx.touristRequest.findUnique({
      where: { id: parsedRequestId },
    })

    if (!updatedRequest) {
      throw new AppError(500, 'Failed to update request', 'REQUEST_UPDATE_FAILED')
    }

    // If update fails (e.g. record not found because status changed or expired), it throws P2025
    // We catch this implicitly via the transaction failure or explicit check if we used updateMany (but update throws on missing).


    // Update student metrics
    await tx.student.update({
      where: { id: studentId },
      data: {
        tripsHosted: { increment: 1 },
      },
    })

    return { student, touristRequest: updatedRequest, selection: updatedSelection }
  })

  // Send notification emails (outside transaction)
  // Emails are non-critical, so failures won't break the booking flow
  const emailResults = await Promise.allSettled([
    sendTouristAcceptanceNotification(
      result.touristRequest.email,
      result.student,
      result.touristRequest
    ),
    sendStudentConfirmation(result.student, result.touristRequest),
  ])

  // Log email send status
  const [touristEmailResult, studentEmailResult] = emailResults

  if (touristEmailResult.status === 'rejected') {
    console.error('❌ Failed to send acceptance email to tourist:', touristEmailResult.reason)
  } else if (!touristEmailResult.value.success) {
    console.error('❌ Failed to send acceptance email to tourist:', touristEmailResult.value.error)
  }

  if (studentEmailResult.status === 'rejected') {
    console.error('❌ Failed to send confirmation email to student:', studentEmailResult.reason)
  } else if (!studentEmailResult.value.success) {
    console.error('❌ Failed to send confirmation email to student:', studentEmailResult.value.error)
  }

  // Log success
  const successCount = emailResults.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length

  if (successCount === 2) {
    console.log('✅ Both notification emails sent successfully')
  } else if (successCount === 1) {
    console.warn('⚠️  One notification email failed to send')
  } else {
    console.warn('⚠️  Both notification emails failed to send')
  }

  return result
}
