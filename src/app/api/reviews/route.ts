// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createReview } from '@/lib/reviews/service'

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const review = await createReview(body)

    return NextResponse.json({
      success: true,
      data: review,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating review:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }, { status: 400 })
  }
}
