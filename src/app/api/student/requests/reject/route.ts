// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyStudent } from '@/lib/api-auth'
import { enforceSameOrigin } from '@/lib/csrf'
import { z } from 'zod'
import { cuidSchema } from '@/lib/schemas/common'
import { validateBody } from '@/lib/api-handler'
import { handleApiError } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    enforceSameOrigin(req)

    const authResult = await verifyStudent(req)
    if (!authResult.authorized || !authResult.student) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { email: studentEmail } = authResult.student

    const bodySchema = z.object({ requestId: cuidSchema })
    const { requestId } = validateBody(bodySchema, await req.json())

    // SECURITY: Ensure student can only reject requests for themselves
    // Find student by email
    const student = await db.student.findUnique({
      where: { email: studentEmail },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const studentId = student.id

    // Get the RequestSelection for this student
    const selection = await db.requestSelection.findFirst({
      where: {
        requestId,
        studentId,
      },
    })

    if (!selection) {
      return NextResponse.json(
        { error: 'You were not matched with this request' },
        { status: 404 }
      )
    }

    if (selection.status === 'rejected') {
      return NextResponse.json(
        { error: 'You have already rejected this request' },
        { status: 400 }
      )
    }

    if (selection.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot reject an already accepted request' },
        { status: 400 }
      )
    }

    // Update the RequestSelection status to rejected
    const updateResult = await db.requestSelection.updateMany({
      where: { id: selection.id, status: 'pending' },
      data: {
        status: 'rejected',
      },
    })

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: 'Request status changed. Please refresh.' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request rejected successfully',
    })
  } catch (error: unknown) {
    return handleApiError(error, 'POST /api/student/requests/reject')
  }
}
