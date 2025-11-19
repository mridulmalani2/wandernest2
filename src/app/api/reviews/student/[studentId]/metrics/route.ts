// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStudentMetrics } from '@/lib/reviews/service'

/**
 * GET /api/reviews/student/:studentId/metrics
 * Get student metrics (average rating, completion rate, badge)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId
    const metrics = await getStudentMetrics(studentId)

    if (!metrics) {
      return NextResponse.json({
        success: false,
        error: 'Student not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error: any) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
