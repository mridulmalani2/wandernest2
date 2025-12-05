// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { createReview } from '@/lib/reviews/service'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/reviews
 * Create a new review (must be authenticated tourist who made the booking)
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Verify user is a tourist
    if (session.user.userType !== 'tourist') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only tourists can create reviews.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // SECURITY: Verify the tourist owns the request being reviewed
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: body.requestId },
      select: { email: true, touristId: true }
    })

    if (!touristRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // Verify the tourist owns this request
    if (touristRequest.email !== session.user.email && touristRequest.touristId !== session.user.touristId) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You can only review your own bookings.' },
        { status: 403 }
      )
    }

    const review = await createReview(body)

    return NextResponse.json({
      success: true,
      data: review,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating review:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }, { status: 400 })
  }
}
