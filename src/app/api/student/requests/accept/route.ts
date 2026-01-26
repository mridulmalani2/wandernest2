// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyStudent } from '@/lib/api-auth'
import { acceptRequest } from '../accept-request'
import { requireDatabase } from '@/lib/prisma'
import { enforceSameOrigin } from '@/lib/csrf'
import { cuidSchema } from '@/lib/schemas/common'
import { handleApiError } from '@/lib/error-handler'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    await rateLimitByIp(req, 60, 60, 'student-request-accept')

    // CSRF Protection: Strict Origin Check
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

    const result = await acceptRequest(requestId, studentId)

    return NextResponse.json({
      success: true,
      message: 'Request accepted successfully',
      touristContact: {
        email: result.touristRequest.email,
        phone: result.touristRequest.phone,
        whatsapp: result.touristRequest.whatsapp,
        contactMethod: result.touristRequest.contactMethod,
      },
    })
  } catch (error: unknown) {
    return handleApiError(error, 'POST /api/student/requests/accept')
  }
}
