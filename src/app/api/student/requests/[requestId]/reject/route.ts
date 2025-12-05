// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function rejectStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const db = requireDatabase();
  const { requestId } = params

  // Use verifyStudent for standardized authentication
  const { verifyStudent } = await import('@/lib/api-auth')
  const authResult = await verifyStudent(req)

  if (!authResult.authorized || !authResult.student?.id) {
    throw new AppError(401, 'Unauthorized or Invalid Session', 'UNAUTHORIZED')
  }

  const studentId = authResult.student.id;



  // Get the RequestSelection for this student
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

  // Update the selection to rejected
  const updatedSelection = await withDatabaseRetry(async () =>
    db.requestSelection.update({
      where: { id: selection.id },
      data: {
        status: 'rejected',
      },
    })
  )

  return NextResponse.json({
    message: 'Request rejected successfully',
    selection: updatedSelection,
  })
}

export const POST = withErrorHandler(rejectStudentRequest, 'POST /api/student/requests/[requestId]/reject')
