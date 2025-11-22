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
  } catch (error: unknown) {
    console.error('Error accepting request:', error)

    if (error instanceof Error && (error.message.includes('already been accepted') || error.message.includes('already accepted'))) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "An error occurred",
          code: 'ALREADY_ACCEPTED',
        },
        { status: 409 }
      )
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "An error occurred" },
        { status: 404 }
      )
    }

    if (error instanceof Error && (error.message.includes('expired') || error.message.includes('no longer available'))) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "An error occurred" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : null) || 'Failed to accept request',
      },
      { status: 500 }
    )
  }
}
