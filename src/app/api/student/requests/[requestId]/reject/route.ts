// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'
import { enforceSameOrigin } from '@/lib/csrf'
import { cuidSchema } from '@/lib/schemas/common'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateInput, z } from '@/lib/validation/validate'
import { serializeSelectionPublic } from '@/lib/response/serialize'

async function rejectStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const db = requireDatabase();
  const { requestId } = validateInput<{ requestId: string }>(
    params,
    z.object({ requestId: cuidSchema }).strict()
  )

  const { verifyStudent } = await import('@/lib/api-auth')

  await rateLimitByIp(req, 60, 60, 'student-request-reject-id')

  const authResult = await verifyStudent(req)

  if (!authResult.authorized || !authResult.student?.id) {
    throw new AppError(401, 'Unauthorized or Invalid Session', 'UNAUTHORIZED')
  }

  const studentId = authResult.student.id;

  enforceSameOrigin(req)

  const selection = await withDatabaseRetry(async () =>
    db.requestSelection.findFirst({
      where: {
        requestId,
        studentId,
      },
    })
  )

  if (!selection) {
    throw new AppError(404, 'You were not matched with this request', 'NOT_MATCHED')
  }

  if (selection.status === 'rejected') {
    throw new AppError(400, 'You have already rejected this request', 'ALREADY_REJECTED')
  }

  if (selection.status === 'accepted') {
    throw new AppError(400, 'Cannot reject an already accepted request', 'ALREADY_ACCEPTED')
  }

  const updateResult = await withDatabaseRetry(async () =>
    db.requestSelection.updateMany({
      where: { id: selection.id, status: 'pending' },
      data: {
        status: 'rejected',
      },
    })
  )

  if (updateResult.count === 0) {
    throw new AppError(409, 'Request status changed. Please refresh.', 'STATUS_CHANGED')
  }

  const updatedSelection = await withDatabaseRetry(async () =>
    db.requestSelection.findUnique({
      where: { id: selection.id },
    })
  )

  if (!updatedSelection) {
    throw new AppError(500, 'Failed to update selection', 'SELECTION_UPDATE_FAILED')
  }

  return NextResponse.json({
    message: 'Request rejected successfully',
    selection: serializeSelectionPublic(updatedSelection),
  })
}

export const POST = withErrorHandler(rejectStudentRequest, 'POST /api/student/requests/[requestId]/reject')
