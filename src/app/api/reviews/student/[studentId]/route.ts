// Use ISR with 10-minute revalidation for reviews
export const dynamic = 'force-dynamic'
export const revalidate = 600 // 10 minutes

import { NextRequest, NextResponse } from 'next/server'
import { getStudentReviews } from '@/lib/reviews/service'
import { CACHE_TTL } from '@/lib/constants'

/**
 * GET /api/reviews/student/:studentId
 * Get all reviews for a student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId
    const reviews = await getStudentReviews(studentId)

    return NextResponse.json({
      success: true,
      data: reviews,
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.REVIEWS}, stale-while-revalidate=1200`,
      },
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
