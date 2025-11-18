import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendTouristAcceptanceNotification,
  sendStudentConfirmation,
} from '@/lib/email'

export async function acceptRequest(requestId: string, studentId: string) {
  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Get the tourist request
    const touristRequest = await tx.touristRequest.findUnique({
      where: { id: requestId },
    })

    if (!touristRequest) {
      throw new Error('Request not found')
    }

    // Check if request is still available
    if (touristRequest.status !== 'PENDING') {
      throw new Error('Request is no longer available')
    }

    // Check if request has expired
    if (new Date() > touristRequest.expiresAt) {
      throw new Error('Request has expired')
    }

    // Get the RequestSelection for this student
    const selection = await tx.requestSelection.findFirst({
      where: {
        requestId,
        studentId,
      },
    })

    if (!selection) {
      throw new Error('You were not matched with this request')
    }

    if (selection.status === 'accepted') {
      throw new Error('You have already accepted this request')
    }

    // Get student details
    const student = await tx.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      throw new Error('Student not found')
    }

    if (student.status !== 'APPROVED') {
      throw new Error('Your account must be approved to accept requests')
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
  try {
    await Promise.all([
      sendTouristAcceptanceNotification(
        result.touristRequest.email,
        result.student,
        result.touristRequest
      ),
      sendStudentConfirmation(result.student, result.touristRequest),
    ])
  } catch (emailError) {
    console.error('Error sending notification emails:', emailError)
    // Don't fail the request if email fails
  }

  return result
}
