// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function getStudentDashboard(req: NextRequest) {
  // Get student identifier from query parameters (email or ID)
  const { searchParams } = new URL(req.url)
  const studentEmail = searchParams.get('email')
  const studentId = searchParams.get('id')

  if (!studentEmail && !studentId) {
    throw new AppError(400, 'Student email or ID required', 'MISSING_IDENTIFIER')
  }

  // Get student with all related data with retry logic
  const student = await withDatabaseRetry(async () =>
    prisma.student.findFirst({
      where: studentEmail ? { email: studentEmail } : { id: studentId! },
      include: {
        requestSelections: {
          include: {
            request: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        reviews: {
          include: {
            request: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        availability: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    })
  )

  if (!student) {
    throw new AppError(404, 'Student not found', 'STUDENT_NOT_FOUND')
  }

    // Separate bookings by status
    const acceptedBookings = student.requestSelections.filter(
      (sel) => sel.status === 'accepted'
    )
    const pendingRequests = student.requestSelections.filter(
      (sel) => sel.status === 'pending'
    )
    const rejectedBookings = student.requestSelections.filter(
      (sel) => sel.status === 'rejected'
    )

    // Calculate stats
    const totalEarnings = acceptedBookings.reduce(
      (sum, booking) => sum + (booking.pricePaid || 0),
      0
    )

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      city: student.city,
      institute: student.institute,
      averageRating: student.averageRating,
      tripsHosted: student.tripsHosted,
      status: student.status,
      reliabilityBadge: student.reliabilityBadge,
      languages: student.languages,
      interests: student.interests,
    },
    stats: {
      totalBookings: acceptedBookings.length,
      pendingRequests: pendingRequests.length,
      totalEarnings,
      averageRating: student.averageRating || 0,
      tripsHosted: student.tripsHosted,
    },
    acceptedBookings: acceptedBookings.map((booking) => ({
      id: booking.id,
      requestId: booking.requestId,
      status: booking.status,
      pricePaid: booking.pricePaid,
      acceptedAt: booking.acceptedAt,
      request: {
        id: booking.request.id,
        city: booking.request.city,
        dates: booking.request.dates,
        numberOfGuests: booking.request.numberOfGuests,
        groupType: booking.request.groupType,
        serviceType: booking.request.serviceType,
        interests: booking.request.interests,
        preferredTime: booking.request.preferredTime,
        tripNotes: booking.request.tripNotes,
        email: booking.request.email,
        phone: booking.request.phone,
        whatsapp: booking.request.whatsapp,
        contactMethod: booking.request.contactMethod,
        status: booking.request.status,
      },
    })),
    pendingRequests: pendingRequests.map((request) => ({
      id: request.id,
      requestId: request.requestId,
      status: request.status,
      createdAt: request.createdAt,
      request: {
        id: request.request.id,
        city: request.request.city,
        dates: request.request.dates,
        numberOfGuests: request.request.numberOfGuests,
        groupType: request.request.groupType,
        serviceType: request.request.serviceType,
        interests: request.request.interests,
        preferredTime: request.request.preferredTime,
        tripNotes: request.request.tripNotes,
        budget: request.request.budget,
        expiresAt: request.request.expiresAt,
      },
    })),
    reviews: student.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      wasNoShow: review.wasNoShow,
      request: {
        city: review.request.city,
        dates: review.request.dates,
        serviceType: review.request.serviceType,
      },
    })),
    availability: student.availability,
  })
}

export const GET = withErrorHandler(getStudentDashboard, 'GET /api/student/dashboard');
