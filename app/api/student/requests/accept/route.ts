import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../accept-request'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get token from cookie or header
    const token =
      req.cookies.get('student_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Find session
    const session = await prisma.studentSession.findUnique({
      where: { token },
    })

    if (!session || !session.studentId) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const studentId = session.studentId

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
  } catch (error: any) {
    console.error('Error accepting request:', error)

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error.message.includes('no longer available') || error.message.includes('expired')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to accept request' },
      { status: 500 }
    )
  }
}
