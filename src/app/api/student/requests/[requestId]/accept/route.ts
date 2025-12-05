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
  // Use verifyStudent for standardized authentication (handles Session and Token)
  const { verifyStudent } = await import('@/lib/api-auth')

  // CSRF Protection: Strict Origin Check
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  const protocol = req.headers.get('x-forwarded-proto') || 'http'
  const expectedOrigin = `${protocol}://${host}`

  if (origin && origin !== expectedOrigin) {
    throw new AppError(403, 'Forbidden: Invalid Origin', 'CSRF_ERROR')
  }

  const authResult = await verifyStudent(req)

  if (!authResult.authorized || !authResult.student?.id) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
  }

  const authenticatedStudentId = authResult.student.id

  // Call the shared acceptRequest helper using the authenticated student ID
  // AppErrors from helper will be caught by withErrorHandler wrapper
  const result = await acceptRequest(params.requestId, authenticatedStudentId)

  return NextResponse.json({
    success: true,
    message: 'Request accepted successfully',
    touristEmail: result.touristRequest.email,
    touristPhone: result.touristRequest.phone,
    touristWhatsapp: result.touristRequest.whatsapp,
  })
}

export const POST = withErrorHandler(acceptStudentRequest, 'POST /api/student/requests/[requestId]/accept')
