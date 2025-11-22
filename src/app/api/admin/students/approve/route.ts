// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

// Approve or reject a student
async function approveStudent(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    throw new AppError(401, authResult.error || 'Unauthorized', 'AUTH_FAILED')
  }

  const body = await request.json()
  const { studentId, action } = body

  if (!studentId || !action) {
    throw new AppError(400, 'Student ID and action are required', 'MISSING_FIELDS')
  }

  if (action !== 'approve' && action !== 'reject') {
    throw new AppError(400, 'Invalid action. Must be "approve" or "reject"', 'INVALID_ACTION')
  }

  // Find student with retry logic
  const student = await withDatabaseRetry(async () =>
    prisma.student.findUnique({
      where: { id: studentId },
    })
  )

  if (!student) {
    throw new AppError(404, 'Student not found', 'STUDENT_NOT_FOUND')
  }

  if (student.status !== 'PENDING_APPROVAL') {
    throw new AppError(400, 'Student is not pending approval', 'INVALID_STATUS')
  }

  // Update student status with retry logic
  const updatedStudent = await withDatabaseRetry(async () =>
    prisma.student.update({
      where: { id: studentId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'SUSPENDED',
      },
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
