// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../../accept-request'
import { withErrorHandler, AppError } from '@/lib/error-handler'
import { enforceSameOrigin } from '@/lib/csrf'
import { cuidSchema } from '@/lib/schemas/common'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateInput, z } from '@/lib/validation/validate'

async function acceptStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const { verifyStudent } = await import('@/lib/api-auth')

  await rateLimitByIp(req, 60, 60, 'student-request-accept-id')

  enforceSameOrigin(req)

  const authResult = await verifyStudent(req)

  if (!authResult.authorized || !authResult.student?.id) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
  }

  const authenticatedStudentId = authResult.student.id

  const { requestId } = validateInput<{ requestId: string }>(
    { requestId: params.requestId },
    z.object({ requestId: cuidSchema }).strict()
  )
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
