// Use ISR with 30-minute revalidation for metrics
export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30 minutes

import { NextRequest, NextResponse } from 'next/server'
import { getStudentMetrics } from '@/lib/reviews/service'
import { CACHE_TTL } from '@/lib/constants'

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
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.STUDENT_METRICS}, stale-while-revalidate=3600`,
      },
    })
  } catch (error: any) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
