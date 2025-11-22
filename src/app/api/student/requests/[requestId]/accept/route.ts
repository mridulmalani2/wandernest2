// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../../accept-request'
import { withErrorHandler, AppError } from '@/lib/error-handler'

async function acceptStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params
  const body = await req.json()
  const { studentId } = body

  if (!studentId) {
    throw new AppError(400, 'Student ID is required', 'MISSING_STUDENT_ID')
  }

  try {
    // Call the shared acceptRequest helper
    const result = await acceptRequest(requestId, studentId)

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
