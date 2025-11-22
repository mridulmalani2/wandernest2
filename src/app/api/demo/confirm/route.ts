/**
 * DEMO API ROUTE - Confirm Student Selection
 * This endpoint handles when a tourist confirms their student selection.
 *
 * To replace with production:
 * 1. Use /api/tourist/request/select instead
 * 2. Save selection to database
 * 3. Send actual emails to students
 * 4. Create booking records
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStudentById } from '@/lib/demo/dummyStudents'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId, studentId } = body

    if (!requestId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Request ID and Student ID are required' },
        { status: 400 }
      )
    }

    // Get the selected student
    const selectedStudent = getStudentById(studentId)

    if (!selectedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // In production, this would:
    // 1. Save the selection to database
    // 2. Send email notification to the student
    // 3. Send confirmation to the tourist
    // 4. Create a booking record

    // For demo, we'll just return success with the student info
    console.log('[DEMO] Student selected:', {
      requestId,
      studentId,
      studentName: selectedStudent.name,
      studentEmail: selectedStudent.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Selection confirmed! In production, we would now send emails to the student and tourist.',
      selection: {
        requestId,
        studentId,
        studentName: selectedStudent.name,
        studentEmail: selectedStudent.email,
        studentInstitute: selectedStudent.institute,
        nextSteps:
          'The student would be notified via email and can accept or decline. You would receive updates via email.',
      },
    })
  } catch (error) {
    console.error('Error confirming selection:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to confirm selection',
      },
      { status: 500 }
    )
  }
}
