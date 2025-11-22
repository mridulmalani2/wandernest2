// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
      include: {
        selections: {
          include: {
            student: true,
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

    // Check if request is expired
    if (new Date() > touristRequest.expiresAt && touristRequest.status === 'PENDING') {
      // Auto-expire the request
      await prisma.touristRequest.update({
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
        (s) => s.studentId === touristRequest.assignedStudentId && s.status === 'accepted'
      )

      if (assignedStudent && assignedStudent.student) {
        response.assignedStudent = {
          name: assignedStudent.student.name,
          email: assignedStudent.student.email,
          phone: assignedStudent.student.bio, // Assuming phone is stored in bio or another field
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
