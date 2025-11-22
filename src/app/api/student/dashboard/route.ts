// Use ISR with 3-minute revalidation for dashboard
export const dynamic = 'force-dynamic'
export const revalidate = 180 // 3 minutes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    // Get student identifier from query parameters (email or ID)
    const { searchParams } = new URL(req.url)
    const studentEmail = searchParams.get('email')
    const studentId = searchParams.get('id')

    if (!studentEmail && !studentId) {
      return NextResponse.json(
        { error: 'Student email or ID required' },
        { status: 400 }
      )
    }

    // Cache key based on student identifier
    const cacheKey = studentId
      ? `dashboard:student:${studentId}`
      : `dashboard:student:email:${studentEmail}`

    // Get student dashboard data with caching
    const dashboardData = await cache.cached(
      cacheKey,
      async () => {
        // Get student with all related data
        const student = await prisma.student.findFirst({
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

        if (!student) {
          return null
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

        return {
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
        }
      },
      { ttl: CACHE_TTL.DASHBOARD }
    )

    if (!dashboardData) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
      },
    })
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
