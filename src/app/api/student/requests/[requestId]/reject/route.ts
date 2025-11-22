// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function rejectStudentRequest(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params

  // Get token from cookie or header
  const token =
    req.cookies.get('student_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new AppError(401, 'Unauthorized - No token provided', 'NO_TOKEN')
  }

  // Find session
  const session = await withDatabaseRetry(async () =>
    prisma.studentSession.findUnique({
      where: { token },
    })
  )

  if (!session || !session.studentId) {
    throw new AppError(401, 'Invalid or expired session', 'INVALID_SESSION')
  }

  const studentId = session.studentId

  // Get the RequestSelection for this student
  const selection = await withDatabaseRetry(async () =>
    prisma.requestSelection.findFirst({
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
    prisma.requestSelection.update({
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
