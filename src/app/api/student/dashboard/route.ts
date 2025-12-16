// Use ISR with 3-minute revalidation for dashboard
export const dynamic = 'force-dynamic'
export const revalidate = 180 // 3 minutes

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import { withErrorHandler, AppError } from '@/lib/error-handler'
import { cookies } from 'next/headers'

async function getStudentDashboard(req: NextRequest) {
  const db = requireDatabase()

  // 1. Validate Session
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session_token')?.value

  if (!token) {
    throw new AppError(401, 'Unauthorized: No session token', 'UNAUTHORIZED')
  }

  const session = await db.studentSession.findUnique({
    where: { token },
  })

  if (!session || session.expiresAt < new Date()) {
    throw new AppError(401, 'Unauthorized: Invalid or expired session', 'UNAUTHORIZED')
  }

  // 2. Fetch Student Record
  let student;

  if (session.studentId) {
    // Strong binding: Use the ID linked to the session
    student = await db.student.findUnique({
      where: { id: session.studentId },
    })
  } else {
    // Weak binding (fallback): Use email
    student = await db.student.findUnique({
      where: { email: session.email },
    })
  }

  if (!student) {
    throw new AppError(404, 'Student not found', 'STUDENT_NOT_FOUND')
  }

  // Fetch bookings by status in parallel (filter at database level)
  const [acceptedBookings, pendingRequests, reviews, availability] = await Promise.all([
    db.requestSelection.findMany({
      where: {
        studentId: student.id,
        status: 'accepted',
      },
      include: {
        request: {
          select: {
            id: true,
            city: true,
            dates: true,
            numberOfGuests: true,
            groupType: true,
            serviceType: true,
            interests: true,
            preferredTime: true,
            tripNotes: true,
            email: true,
            phone: true,
            whatsapp: true,
            contactMethod: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.requestSelection.findMany({
      where: {
        studentId: student.id,
        status: 'pending',
      },
      include: {
        request: {
          select: {
            id: true,
            city: true,
            dates: true,
            numberOfGuests: true,
            groupType: true,
            serviceType: true,
            interests: true,
            preferredTime: true,
            tripNotes: true,
            budget: true,
            expiresAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.review.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        request: {
          select: {
            city: true,
            dates: true,
            serviceType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.studentAvailability.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    }),
  ])

  // Calculate stats
  const totalEarnings = acceptedBookings.reduce(
    (sum: number, booking: { pricePaid: number | null }) => sum + (booking.pricePaid || 0),
    0
  )

  return NextResponse.json({
    success: true,
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
      hasCompletedOnboarding: !!student.city, // City is required field in onboarding
    },
    stats: {
      totalBookings: acceptedBookings.length,
      pendingRequests: pendingRequests.length,
      totalEarnings,
      averageRating: student.averageRating || 0,
      tripsHosted: student.tripsHosted,
    },
    acceptedBookings: acceptedBookings.map((booking: any) => ({
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
    pendingRequests: pendingRequests.map((request: any) => ({
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
    reviews: reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      noShow: review.noShow,
      request: {
        city: review.request.city,
        dates: review.request.dates,
        serviceType: review.request.serviceType,
      },
    })),
    availability: availability,
  })
}

export const GET = withErrorHandler(getStudentDashboard, 'GET /api/student/dashboard');
