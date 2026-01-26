// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyStudent } from '@/lib/api-auth'
import { enforceSameOrigin } from '@/lib/csrf'
import { cuidSchema } from '@/lib/schemas/common'
import { handleApiError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    await rateLimitByIp(req, 60, 60, 'student-request-reject')

    enforceSameOrigin(req)

    const authResult = await verifyStudent(req)
    if (!authResult.authorized || !authResult.student) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { email: studentEmail } = authResult.student

    const bodySchema = z.object({ requestId: cuidSchema }).strict()
    const { requestId } = await validateJson<{ requestId: string }>(req, bodySchema)

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
