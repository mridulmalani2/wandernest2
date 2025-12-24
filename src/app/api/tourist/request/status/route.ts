// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { requireDatabase } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const db = requireDatabase()
    const searchParams = req.nextUrl.searchParams
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const touristRequest = await db.touristRequest.findUnique({
      where: { id: requestId },
      include: {
        selections: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                institute: true,
                nationality: true,
                languages: true,
                averageRating: true,
                tripsHosted: true,
              },
            },
          },
        },
      },
    })

    if (!touristRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    // SECURITY: Authorize access
    // Only the creator (Tourist) or an Admin should see full status
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    // Note: session.user.email is reliable.
    // If we wanted to be stricter, we'd check touristId if available in schema vs session.
    const userType = session.user.userType as string | undefined
    const isAdmin = userType === 'admin'
    if (touristRequest.email !== session.user.email && !isAdmin) {
      // Allow admins or maybe the assigned student?
      // For now, strictly restrict to owner to fix IDOR.
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if request is expired
    if (new Date() > touristRequest.expiresAt && touristRequest.status === 'PENDING') {
      // Auto-expire the request
      await db.touristRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      })
      touristRequest.status = 'EXPIRED'
    }

    // Build response based on status
    const response: {
      status: string;
      city: string;
      dates: unknown;
      numberOfGuests: number;
      expiresAt: Date;
      selectionsCount: number;
      assignedStudent: {
        name: string | null;
        email: string;
        phone: string | null;
        whatsapp: null;
        institute: string | null;
        nationality: string | null;
        languages: string[];
        averageRating: number | null;
        tripsHosted: number;
      } | null;
    } = {
      status: touristRequest.status,
      city: touristRequest.city,
      dates: touristRequest.dates,
      numberOfGuests: touristRequest.numberOfGuests,
      expiresAt: touristRequest.expiresAt,
      selectionsCount: touristRequest.selections.length,
      assignedStudent: null,
    }

    // If accepted, include student details
    if (touristRequest.status === 'ACCEPTED' && touristRequest.assignedStudentId) {
      const assignedStudent = touristRequest.selections.find(
        (s: any) => s.studentId === touristRequest.assignedStudentId && s.status === 'accepted'
      )

      if (assignedStudent && assignedStudent.student) {
        response.assignedStudent = {
          name: assignedStudent.student.name,
          email: assignedStudent.student.email,
          phone: assignedStudent.student.phoneNumber,
          whatsapp: null, // Add if stored
          institute: assignedStudent.student.institute,
          nationality: assignedStudent.student.nationality,
          languages: assignedStudent.student.languages,
          averageRating: assignedStudent.student.averageRating,
          tripsHosted: assignedStudent.student.tripsHosted,
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: response,
    })
  } catch (error) {
    console.error('Error fetching request status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch request status',
      },
      { status: 500 }
    )
  }
}
