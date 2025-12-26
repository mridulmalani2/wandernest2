// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyStudent } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    const authResult = await verifyStudent(req)
    if (!authResult.authorized || !authResult.student) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { email: studentEmail } = authResult.student

    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // SECURITY: Ensure student can only reject requests for themselves
    // Find student by email
    const student = await db.student.findUnique({
      where: { email: studentEmail },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const studentId = student.id

    // Get the RequestSelection for this student
    const selection = await db.requestSelection.findFirst({
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
    await db.requestSelection.update({
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
