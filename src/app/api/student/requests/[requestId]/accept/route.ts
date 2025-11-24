// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { acceptRequest } from '../../accept-request'
import { withErrorHandler, AppError } from '@/lib/error-handler'

async function acceptStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  // SECURITY: Verify authentication
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
  }

  // Verify user is a student
  const body = await req.json()
  const { studentId } = body

  // SECURITY: Ensure student can only accept requests for themselves
  // Get the actual student ID from the session
  const student = await prisma.student.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!student) {
    throw new AppError(404, 'Student profile not found', 'STUDENT_NOT_FOUND')
  }

  // If studentId is provided, it must match the authenticated student
  if (studentId && studentId !== student.id) {
    throw new AppError(403, 'Access denied. You can only accept requests for yourself.', 'ACCESS_DENIED')
  }

  // Use the authenticated student's ID
  const authenticatedStudentId = student.id

  try {
    // Call the shared acceptRequest helper using the authenticated student ID
    const result = await acceptRequest(params.requestId, authenticatedStudentId)

    return NextResponse.json({
      success: true,
      message: 'Request accepted successfully',
      touristEmail: result.touristRequest.email,
      touristPhone: result.touristRequest.phone,
      touristWhatsapp: result.touristRequest.whatsapp,
    })
  } catch (error: any) {
    // Convert helper errors to AppErrors with appropriate status codes
    if (error.message.includes('already been accepted') || error.message.includes('already accepted')) {
      throw new AppError(409, error.message, 'ALREADY_ACCEPTED')
    }

    if (error.message.includes('not found')) {
      throw new AppError(404, error.message, 'NOT_FOUND')
    }

    if (error.message.includes('expired') || error.message.includes('no longer available')) {
      throw new AppError(409, error.message, 'REQUEST_EXPIRED')
    }

    if (error.message.includes('must be approved')) {
      throw new AppError(403, error.message, 'ACCOUNT_NOT_APPROVED')
    }

    // Re-throw if it's already an AppError or other error
    throw error
  }
}

export const POST = withErrorHandler(acceptStudentRequest, 'POST /api/student/requests/[requestId]/accept')
