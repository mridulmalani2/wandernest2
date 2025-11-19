// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { acceptRequest } from '../../accept-request'

export async function POST(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params
    const body = await req.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Call the shared acceptRequest helper
    const result = await acceptRequest(requestId, studentId)

    return NextResponse.json({
      success: true,
      message: 'Request accepted successfully',
      touristEmail: result.touristRequest.email,
      touristPhone: result.touristRequest.phone,
      touristWhatsapp: result.touristRequest.whatsapp,
    })
  } catch (error: any) {
    console.error('Error accepting request:', error)

    if (error.message.includes('already been accepted') || error.message.includes('already accepted')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'ALREADY_ACCEPTED',
        },
        { status: 409 }
      )
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }

    if (error.message.includes('expired') || error.message.includes('no longer available')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to accept request',
      },
      { status: 500 }
    )
  }
}
