// Optimized for Vercel serverless functions with caching
export const dynamic = 'force-dynamic'
export const maxDuration = 10
export const revalidate = 300 // 5 minutes

import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, parseQuery } from '@/lib/api-handler'
import { findMatchesSchema, type FindMatchesInput, uuidSchema, z } from '@/lib/schemas'
import { findMatches, generateAnonymousId } from '@/lib/matching/algorithm'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import { AppError } from '@/lib/error-handler'

// Query schema for GET endpoint
const matchesQuerySchema = z.object({
  requestId: uuidSchema,
})

// Helper to map student to anonymized match response
const mapToMatchResponse = (student: any, selectionStatus?: string) => ({
  id: student.id,
  anonymousId: generateAnonymousId(student.id),
  university: student.institute,
  languages: student.languages,
  tripsHosted: student.tripsHosted,
  rating: student.averageRating || 0,
  badge: student.reliabilityBadge || 'none',
  score: student.score,
  ...(selectionStatus && { selectionStatus })
})

/**
 * POST /api/matches
 * Find matching guides for a tourist request
 */
export const POST = createApiHandler<FindMatchesInput>({
  bodySchema: findMatchesSchema,
  auth: 'tourist',
  route: 'POST /api/matches',

  async handler({ body, db, auth }) {
    const { requestId } = body

    // Fetch the tourist request
    const touristRequest = await db.touristRequest.findUnique({
      where: { id: requestId }
    })

    if (!touristRequest) {
      throw new AppError(404, 'Tourist request not found', 'REQUEST_NOT_FOUND')
    }

    // Authorization check - tourist can only access their own requests
    if (auth.tourist && touristRequest.email !== auth.tourist.email) {
      throw new AppError(403, 'Access denied', 'FORBIDDEN')
    }

    // Find matches with caching
    const matches = await cache.cached(
      `matches:${requestId}`,
      async () => findMatches(touristRequest),
      { ttl: CACHE_TTL.MATCHES }
    )

    // Format response with anonymized data
    const anonymizedMatches = matches.map(student => mapToMatchResponse(student))

    return NextResponse.json({
      success: true,
      matches: anonymizedMatches,
      count: anonymizedMatches.length
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    })
  },
})

/**
 * GET /api/matches?requestId=xxx
 * Get existing matches for a request
 */
export const GET = createApiHandler({
  querySchema: matchesQuerySchema,
  auth: 'tourist',
  route: 'GET /api/matches',

  async handler({ query, db, auth }) {
    const { requestId } = query

    // Fetch the tourist request with selections
    const touristRequest = await db.touristRequest.findUnique({
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
      throw new AppError(404, 'Tourist request not found', 'REQUEST_NOT_FOUND')
    }

    // Authorization check
    if (auth.tourist && touristRequest.email !== auth.tourist.email) {
      throw new AppError(403, 'Access denied', 'FORBIDDEN')
    }

    // Return existing selections if any
    if (touristRequest.selections && touristRequest.selections.length > 0) {
      const selectedGuides = touristRequest.selections.map((selection: any) =>
        mapToMatchResponse(selection.student, selection.status)
      )

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

    const anonymizedMatches = matches.map(student => mapToMatchResponse(student))

    return NextResponse.json({
      success: true,
      matches: anonymizedMatches,
      count: anonymizedMatches.length
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    })
  },
})
