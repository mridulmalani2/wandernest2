import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params

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

    // Update the selection to rejected
    const updatedSelection = await prisma.requestSelection.update({
      where: { id: selection.id },
      data: {
        status: 'rejected',
      },
    })

    return NextResponse.json({
      message: 'Request rejected successfully',
      selection: updatedSelection,
    })
  } catch (error: any) {
    console.error('Error rejecting request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject request' },
      { status: 400 }
    )
  }
}
