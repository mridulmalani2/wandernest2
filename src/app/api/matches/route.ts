// Optimized for Vercel serverless functions with caching
export const dynamic = 'force-dynamic'
export const maxDuration = 10
export const revalidate = 300 // 5 minutes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findMatches, generateAnonymousId } from '@/lib/matching/algorithm'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'

/**
 * POST /api/matches
 * Find matching guides for a tourist request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Fetch the tourist request
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId }
    })

    if (!touristRequest) {
      return NextResponse.json(
        { error: 'Tourist request not found' },
        { status: 404 }
      )
    }

    // Find matches with caching
    const matches = await cache.cached(
      `matches:${requestId}`,
      async () => findMatches(touristRequest),
      { ttl: CACHE_TTL.MATCHES }
    )

    // Format response with anonymized data
    const anonymizedMatches = matches.map(student => ({
      id: student.id,
      anonymousId: generateAnonymousId(student.id),
      university: student.institute,
      languages: student.languages,
      tripsHosted: student.tripsHosted,
      rating: student.averageRating || 0,
      badge: student.reliabilityBadge || 'none',
      score: student.score
    }))

    return NextResponse.json({
      success: true,
      matches: anonymizedMatches,
      count: anonymizedMatches.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error finding matches:', error)
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/matches?requestId=xxx
 * Get existing matches for a request
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Fetch the tourist request with selections
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
      include: {
        selections: {
          include: {
            student: true
          }
        }
      }
    })

    if (!touristRequest) {
      return NextResponse.json(
        { error: 'Tourist request not found' },
        { status: 404 }
      )
    }

    // Return existing selections if any
    if (touristRequest.selections && touristRequest.selections.length > 0) {
      const selectedGuides = touristRequest.selections.map(selection => ({
        id: selection.student.id,
        anonymousId: generateAnonymousId(selection.student.id),
        university: selection.student.institute,
        languages: selection.student.languages,
        tripsHosted: selection.student.tripsHosted,
        rating: selection.student.averageRating || 0,
        badge: selection.student.reliabilityBadge || 'none',
        selectionStatus: selection.status
      }))

      return NextResponse.json({
        success: true,
        matches: selectedGuides,
        count: selectedGuides.length
      })
    }

    // If no selections, find fresh matches with caching
    const matches = await cache.cached(
      `matches:${requestId}`,
      async () => findMatches(touristRequest),
      { ttl: CACHE_TTL.MATCHES }
    )

    const anonymizedMatches = matches.map(student => ({
      id: student.id,
      anonymousId: generateAnonymousId(student.id),
      university: student.institute,
      languages: student.languages,
      tripsHosted: student.tripsHosted,
      rating: student.averageRating || 0,
      badge: student.reliabilityBadge || 'none',
      score: student.score
    }))

    return NextResponse.json({
      success: true,
      matches: anonymizedMatches,
      count: anonymizedMatches.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
