// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/matches/select
 * Save tourist's guide selections
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, selectedGuideIds } = body

    if (!requestId || !selectedGuideIds || !Array.isArray(selectedGuideIds)) {
      return NextResponse.json(
        { error: 'Request ID and selected guide IDs are required' },
        { status: 400 }
      )
    }

    // Verify the request exists
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId }
    })

    if (!touristRequest) {
      return NextResponse.json(
        { error: 'Tourist request not found' },
        { status: 404 }
      )
    }

    // Delete existing selections
    await prisma.requestSelection.deleteMany({
      where: { requestId }
    })

    // Create new selections
    const selections = await Promise.all(
      selectedGuideIds.map((studentId: string) =>
        prisma.requestSelection.create({
          data: {
            requestId,
            studentId,
            status: 'pending'
          }
        })
      )
    )

    // Update request status to MATCHED
    await prisma.touristRequest.update({
      where: { id: requestId },
      data: { status: 'MATCHED' }
    })

    return NextResponse.json({
      success: true,
      selections,
      message: 'Guides selected successfully'
    })
  } catch (error) {
    console.error('Error saving selections:', error)
    return NextResponse.json(
      { error: 'Failed to save guide selections' },
      { status: 500 }
    )
  }
}
