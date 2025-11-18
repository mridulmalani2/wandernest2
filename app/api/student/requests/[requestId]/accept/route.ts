// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendTouristAcceptanceNotification,
  sendStudentConfirmation,
} from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params
    const body = await req.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get the tourist request with a lock
      const touristRequest = await tx.touristRequest.findUnique({
        where: { id: requestId },
      })

      if (!touristRequest) {
        throw new Error('Request not found')
      }

      // Check if request is expired
      if (new Date() > touristRequest.expiresAt) {
        throw new Error('This request has expired')
      }

      // Check if request is still available (not already accepted)
      if (touristRequest.status === 'ACCEPTED') {
        throw new Error('This request has already been accepted by another guide')
      }

      if (touristRequest.status === 'CANCELLED') {
        throw new Error('This request has been cancelled')
      }

      // Get the RequestSelection for this student
      const selection = await tx.requestSelection.findFirst({
        where: {
          requestId,
          studentId,
        },
      })

      if (!selection) {
        throw new Error('You were not selected for this request')
      }

      if (selection.status === 'accepted') {
        throw new Error('You have already accepted this request')
      }

      if (selection.status === 'rejected') {
        throw new Error('You have already rejected this request')
      }

      // Get student details
      const student = await tx.student.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new Error('Student not found')
      }

      if (student.status !== 'APPROVED') {
        throw new Error('Your account is not approved to accept requests')
      }

      // Update the specific RequestSelection to accepted
      await tx.requestSelection.update({
        where: { id: selection.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
        },
      })

      // Update all other RequestSelections for this request to rejected
      await tx.requestSelection.updateMany({
        where: {
          requestId,
          id: { not: selection.id },
        },
        data: {
          status: 'rejected',
        },
      })

      // Update tourist request status and assign student
      await tx.touristRequest.update({
        where: { id: requestId },
        data: {
          status: 'ACCEPTED',
          assignedStudentId: studentId,
        },
      })

      return { touristRequest, student }
    })

    // Send notification emails (outside transaction to avoid delays)
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
      console.error('Error sending acceptance emails:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Request accepted successfully',
      touristEmail: result.touristRequest.email,
      touristPhone: result.touristRequest.phone,
      touristWhatsapp: result.touristRequest.whatsapp,
    })
  } catch (error: any) {
    console.error('Error accepting request:', error)

    if (error.message.includes('already been accepted')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'ALREADY_ACCEPTED',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to accept request',
      },
      { status: 500 }
    )
  }
}
