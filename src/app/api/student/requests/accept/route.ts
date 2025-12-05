// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyStudent } from '@/lib/api-auth'
import { acceptRequest } from '../accept-request'
import { requireDatabase } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    const authResult = await verifyStudent(req)
    if (!authResult.authorized || !authResult.student) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    const { email: studentEmail } = authResult.student

    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

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

    // Call the acceptRequest helper
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
    console.error('Error accepting request:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to accept request'

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      )
    }

    if (error instanceof Error && (error.message.includes('no longer available') || error.message.includes('expired'))) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
