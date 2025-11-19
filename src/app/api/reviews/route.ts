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
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 400 })
  }
}
