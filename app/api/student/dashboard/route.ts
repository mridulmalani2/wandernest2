import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
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

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Get student with all related data
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
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

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
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
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
