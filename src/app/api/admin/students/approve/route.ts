// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, validateBody } from '@/lib/api-handler'
import { studentApprovalSchema, type StudentApprovalInput } from '@/lib/schemas'
import { AppError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'

/**
 * POST /api/admin/students/approve
 *
 * Approve or reject a student application.
 * Requires admin authentication.
 */
export const POST = createApiHandler<StudentApprovalInput>({
  bodySchema: studentApprovalSchema,
  auth: 'admin',
  route: 'POST /api/admin/students/approve',

  async handler({ body, db, req }) {
    await rateLimitByIp(req, 30, 60, 'admin-students-approve')
    const { studentId, action } = body

    // Execute atomically to prevent race conditions
    const updatedStudent = await db.$transaction(async (tx) => {
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
        select: {
          id: true,
          name: true,
          status: true,
        },
      })
    })

    return {
      student: updatedStudent,
    }
  },
})
