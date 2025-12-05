// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'

// Bulk approve or reject students
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }



  try {
    const db = requireDatabase()

    const { studentIds, action } = await request.json()

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Update all students in bulk
    const result = await db.student.updateMany({
      where: {
        id: { in: studentIds },
        status: 'PENDING_APPROVAL',
      },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'SUSPENDED',
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} student(s) ${action === 'approve' ? 'approved' : 'rejected'}`,
    })
  } catch (error) {
    console.error('Error bulk approving/rejecting students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
