// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'

/**
 * POST /api/matches/select
 * Save tourist's guide selections
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = requireDatabase()

    const body = await request.json()
    const { requestId, selectedGuideIds } = body

    if (!requestId || !selectedGuideIds || !Array.isArray(selectedGuideIds)) {
      return NextResponse.json(
        { error: 'Request ID and selected guide IDs are required' },
        { status: 400 }
      )
    }

    // Verify the request exists
    const touristRequest = await db.touristRequest.findUnique({
      where: { id: requestId }
    })

    // Verify ownership
    if (touristRequest && (touristRequest.email !== session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!touristRequest) {
      return NextResponse.json(
        { error: 'Tourist request not found' },
        { status: 404 }
      )
    }

    // Delete existing selections
    await db.requestSelection.deleteMany({
      where: { requestId }
    })

    // Create new selections
    const selections = await Promise.all(
      selectedGuideIds.map((studentId: string) =>
        db.requestSelection.create({
          data: {
            requestId,
            studentId,
            status: 'pending'
          }
        })
      )
    )

    // Update request status to MATCHED
    await db.touristRequest.update({
      where: { id: requestId },
      data: { status: 'MATCHED' }
    })

    return NextResponse.json({
      success: true,
      selections,
      message: 'Guides selected successfully'
    })
  } catch (error) {
    console.error('Error saving selections:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to save guide selections' },
      { status: 500 }
    )
  }
}
