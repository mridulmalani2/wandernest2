// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

// Approve or reject a student
async function approveStudent(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    throw new AppError(401, 'Unauthorized', 'AUTH_FAILED')
  }

  const body = await request.json()
  const { studentId, action } = body

  if (!studentId || !action) {
    throw new AppError(400, 'Student ID and action are required', 'MISSING_FIELDS')
  }

  if (action !== 'approve' && action !== 'reject') {
    throw new AppError(400, 'Invalid action. Must be "approve" or "reject"', 'INVALID_ACTION')
  }

  if (typeof studentId !== 'string' || studentId.trim().length === 0) {
    throw new AppError(400, 'Invalid Student ID', 'INVALID_INPUT')
  }

  const db = requireDatabase()

  // Execute atomically to prevent race conditions
  const updatedStudent = await withDatabaseRetry(async () =>
    db.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new AppError(404, 'Student not found', 'STUDENT_NOT_FOUND')
      }

      if (student.status !== 'PENDING_APPROVAL') {
        throw new AppError(400, 'Student is not pending approval', 'INVALID_STATUS')
      }

      return tx.student.update({
        where: { id: studentId },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'SUSPENDED',
        },
      })
    })
  )

  return NextResponse.json({
    success: true,
    student: {
      id: updatedStudent.id,
      name: updatedStudent.name,
      status: updatedStudent.status,
    },
  })
}

export const POST = withErrorHandler(approveStudent, 'POST /api/admin/students/approve');
