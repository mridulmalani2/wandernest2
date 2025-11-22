// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../accept-request'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId, studentEmail } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      )
    }

    // Find student by email
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
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
