import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('student_token')?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session token provided',
        },
        { status: 401 }
      )
    }

    // Find session in database
    const session = await prisma.studentSession.findUnique({
      where: { token },
    })

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session token',
        },
        { status: 401 }
      )
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await prisma.studentSession.delete({ where: { id: session.id } })

      return NextResponse.json(
        {
          success: false,
          error: 'Session expired',
        },
        { status: 401 }
      )
    }

    if (!session.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email not verified',
        },
        { status: 401 }
      )
    }

    // Find the student record
    const student = await prisma.student.findUnique({
      where: { id: session.studentId || undefined },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        status: true,
        institute: true,
        nationality: true,
        gender: true,
        coverLetter: true,
        emailVerified: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        },
        { status: 404 }
      )
    }

    // Check if student has completed onboarding
    const hasCompletedOnboarding = !!(
      student.name &&
      student.city &&
      student.institute &&
      student.nationality &&
      student.gender &&
      student.coverLetter
    )

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          email: session.email,
          expiresAt: session.expiresAt,
        },
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
          city: student.city,
          status: student.status,
          hasCompletedOnboarding,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error validating session:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate session',
      },
      { status: 500 }
    )
  }
}
