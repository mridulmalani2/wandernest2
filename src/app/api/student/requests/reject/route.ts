// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Verify user is a student
    if (session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student account required.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { requestId, studentEmail } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // SECURITY: Ensure student can only reject requests for themselves
    if (studentEmail && studentEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Access denied. You can only reject requests for yourself.' },
        { status: 403 }
      )
    }

    // Find student by session email (not body email)
    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const studentId = student.id

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
