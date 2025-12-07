// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-handler'
import { reviewCreateSchema, type ReviewCreateInput } from '@/lib/schemas'
import { createReview } from '@/lib/reviews/service'
import { AppError } from '@/lib/error-handler'

/**
 * POST /api/reviews
 * Create a new review (must be authenticated tourist who made the booking)
 */
export const POST = createApiHandler<ReviewCreateInput>({
  bodySchema: reviewCreateSchema,
  auth: 'tourist',
  route: 'POST /api/reviews',

  async handler({ body, db, auth }) {
    // Ensure tourist is authenticated
    if (!auth.tourist?.email) {
      throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED')
    }

    // SECURITY: Verify the tourist owns the request being reviewed
    if (body.requestId) {
      const touristRequest = await db.touristRequest.findUnique({
        where: { id: body.requestId },
        select: { email: true }
      })

      if (!touristRequest) {
        throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
      }

      // Verify the tourist owns this request
      if (touristRequest.email !== auth.tourist.email) {
        throw new AppError(403, 'Access denied. You can only review your own bookings.', 'FORBIDDEN')
      }
    }

    // Create the review with validated and sanitized data
    const review = await createReview({
      ...body,
      touristEmail: auth.tourist.email,
    })

    return NextResponse.json({
      success: true,
      data: review,
    }, { status: 201 })
  },
})
