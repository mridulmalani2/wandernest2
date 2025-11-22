import { requireDatabase } from '@/lib/prisma'
import {
  sendTouristAcceptanceNotification,
  sendStudentConfirmation,
} from '@/lib/email'
import type { Prisma } from '@prisma/client'
import { AppError } from '@/lib/error-handler'

export async function acceptRequest(requestId: string, studentId: string) {
  // Ensure database is available
  const db = requireDatabase()

  // Start transaction
  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // Get the tourist request
    const touristRequest = await tx.touristRequest.findUnique({
      where: { id: requestId },
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
        requestId,
        studentId,
      },
    })

    if (!selection) {
      throw new AppError(404, 'You were not matched with this request', 'NOT_MATCHED')
    }

    if (selection.status === 'accepted') {
      throw new AppError(400, 'You have already accepted this request', 'ALREADY_ACCEPTED')
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
    const updatedSelection = await tx.requestSelection.update({
      where: { id: selection.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    })

    // Reject all other selections for this request
    await tx.requestSelection.updateMany({
      where: {
        requestId,
        id: { not: selection.id },
      },
      data: {
        status: 'rejected',
      },
    })

    // Update the tourist request
    await tx.touristRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        assignedStudentId: studentId,
      },
    })

    // Update student metrics
    await tx.student.update({
      where: { id: studentId },
      data: {
        tripsHosted: { increment: 1 },
      },
    })

    return { student, touristRequest, selection: updatedSelection }
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
