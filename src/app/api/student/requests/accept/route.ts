// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { acceptRequest } from '../accept-request'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Verify user is a student
    if (session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student account required.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { requestId, studentEmail } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // SECURITY: Ensure student can only accept requests for themselves
    if (studentEmail && studentEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Access denied. You can only accept requests for yourself.' },
        { status: 403 }
      )
    }

    // Find student by session email (not body email)
    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
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
