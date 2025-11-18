import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/middleware'

// Approve or reject a student
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { studentId, action } = await request.json()

    if (!studentId || !action) {
      return NextResponse.json(
        { error: 'Student ID and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    if (student.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Student is not pending approval' },
        { status: 400 }
      )
    }

    // Update student status
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'SUSPENDED',
      },
    })

    return NextResponse.json({
      success: true,
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        status: updatedStudent.status,
      },
    })
  } catch (error) {
    console.error('Error approving/rejecting student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
