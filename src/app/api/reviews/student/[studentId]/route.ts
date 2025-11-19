// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStudentReviews } from '@/lib/reviews/service'

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
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
