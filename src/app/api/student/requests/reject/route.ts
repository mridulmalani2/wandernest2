// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get token from cookie or header
    const token =
      req.cookies.get('student_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Find session
    const session = await prisma.studentSession.findUnique({
      where: { token },
    })

    if (!session || !session.studentId) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const studentId = session.studentId

    // Get the RequestSelection for this student
    const selection = await prisma.requestSelection.findFirst({
      where: {
        requestId,
        studentId,
      },
    })

    if (!selection) {
      return NextResponse.json(
        { error: 'You were not matched with this request' },
        { status: 404 }
      )
    }

    if (selection.status === 'rejected') {
      return NextResponse.json(
        { error: 'You have already rejected this request' },
        { status: 400 }
      )
    }

    if (selection.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot reject an already accepted request' },
        { status: 400 }
      )
    }

    // Update the RequestSelection status to rejected
    await prisma.requestSelection.update({
      where: { id: selection.id },
      data: {
        status: 'rejected',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Request rejected successfully',
    })
  } catch (error: unknown) {
    console.error('Error rejecting request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject request' },
      { status: 500 }
    )
  }
}
