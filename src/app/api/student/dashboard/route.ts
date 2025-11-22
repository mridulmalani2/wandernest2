// Use ISR with 3-minute revalidation for dashboard
export const dynamic = 'force-dynamic'
export const revalidate = 180 // 3 minutes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import { withErrorHandler, AppError } from '@/lib/error-handler'

async function getStudentDashboard(req: NextRequest) {
  // Get student identifier from query parameters (email or ID)
  const { searchParams } = new URL(req.url)
  const studentEmail = searchParams.get('email')
  const studentId = searchParams.get('id')

  // PHASE 2 NOTE: Support preview mode for demo purposes
  // Check if this is a preview mode request (no email/id or preview token)
  const authHeader = req.headers.get('authorization')
  const isPreviewMode = authHeader?.includes('preview-token') || (!studentEmail && !studentId)

  if (isPreviewMode) {
    // Return mock data for preview mode
    return NextResponse.json({
      student: {
        id: 'preview-student-id',
        name: 'Demo Student',
        email: 'student@example.edu',
        city: 'Paris',
        institute: 'Sorbonne University',
        averageRating: 4.8,
        tripsHosted: 12,
        status: 'approved',
        reliabilityBadge: 'Gold',
        languages: ['English', 'French', 'Spanish'],
        interests: ['History', 'Food Tours', 'Art'],
      },
      stats: {
        totalBookings: 12,
        pendingRequests: 2,
        totalEarnings: 1250.00,
        averageRating: 4.8,
        tripsHosted: 12,
      },
      acceptedBookings: [
        {
          id: 'demo-booking-1',
          requestId: 'demo-request-1',
          status: 'accepted',
          pricePaid: 150.00,
          acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            id: 'demo-request-1',
            city: 'Paris',
            dates: { start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString() },
            numberOfGuests: 2,
            groupType: 'couple',
            serviceType: 'local_guide',
            interests: ['Art', 'History'],
            preferredTime: 'afternoon',
            tripNotes: 'Looking for hidden gems in Montmartre',
            email: 'tourist@example.com',
            phone: '+1234567890',
            contactMethod: 'email',
            status: 'confirmed',
          },
        },
      ],
      pendingRequests: [
        {
          id: 'demo-pending-1',
          requestId: 'demo-request-2',
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            id: 'demo-request-2',
            city: 'Paris',
            dates: { start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString() },
            numberOfGuests: 4,
            groupType: 'family',
            serviceType: 'both',
            interests: ['Food', 'Culture'],
            preferredTime: 'morning',
            tripNotes: 'Family with two kids (ages 8 and 12)',
            budget: 200,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          },
        },
      ],
      reviews: [
        {
          id: 'demo-review-1',
          rating: 5,
          text: 'Amazing experience! Very knowledgeable guide.',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          noShow: false,
          request: {
            city: 'Paris',
            dates: { start: '2024-10-15', end: '2024-10-17' },
            serviceType: 'local_guide',
          },
        },
      ],
      availability: [],
    })
  }

  if (!studentEmail && !studentId) {
    throw new AppError(400, 'Student email or ID required', 'MISSING_IDENTIFIER')
  }

    // Get student basic info first
    const student = await prisma.student.findFirst({
      where: studentEmail ? { email: studentEmail } : { id: studentId! },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        institute: true,
        averageRating: true,
        tripsHosted: true,
        status: true,
        reliabilityBadge: true,
        languages: true,
        interests: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Fetch bookings by status in parallel (filter at database level)
    const [acceptedBookings, pendingRequests, reviews, availability] = await Promise.all([
      prisma.requestSelection.findMany({
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
      prisma.requestSelection.findMany({
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
      prisma.review.findMany({
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
      prisma.studentAvailability.findMany({
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
