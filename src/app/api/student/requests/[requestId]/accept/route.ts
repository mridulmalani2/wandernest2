// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../../accept-request'
import { withErrorHandler, AppError } from '@/lib/error-handler'
import { enforceSameOrigin } from '@/lib/csrf'
import { cuidSchema } from '@/lib/schemas/common'
import { z } from 'zod'
import { validateBody } from '@/lib/api-handler'

async function acceptStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  // Use verifyStudent for standardized authentication (handles Session and Token)
  const { verifyStudent } = await import('@/lib/api-auth')

  // CSRF Protection: Strict Origin Check
  enforceSameOrigin(req)

  const authResult = await verifyStudent(req)

  if (!authResult.authorized || !authResult.student?.id) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
  }

  const authenticatedStudentId = authResult.student.id

  // Call the shared acceptRequest helper using the authenticated student ID
  // AppErrors from helper will be caught by withErrorHandler wrapper
  const { requestId } = validateBody(z.object({ requestId: cuidSchema }), { requestId: params.requestId })
  const result = await acceptRequest(requestId, authenticatedStudentId)

  return NextResponse.json({
    success: true,
    message: 'Request accepted successfully',
    touristEmail: result.touristRequest.email,
    touristPhone: result.touristRequest.phone,
    touristWhatsapp: result.touristRequest.whatsapp,
  })
}

export const POST = withErrorHandler(acceptStudentRequest, 'POST /api/student/requests/[requestId]/accept')
