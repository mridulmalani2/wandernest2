// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
export const maxDuration = 10
// Explicitly use Node.js runtime (required for Prisma)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { AppError } from '@/lib/error-handler'
import { generateSelectionToken } from '@/lib/auth/tokens'

// Helper function to calculate suggested price range
function calculateSuggestedPrice(city: string, serviceType: string): { min: number; max: number } {
  const cityRates: Record<string, { min: number; max: number }> = {
    paris: { min: 25, max: 50 },
    london: { min: 30, max: 60 },
    barcelona: { min: 20, max: 40 },
    berlin: { min: 20, max: 45 },
  }

  const normalizedCity = typeof city === 'string' ? city.trim().toLowerCase() : ''
  const baseRate = cityRates[normalizedCity] || { min: 20, max: 40 }
  const normalizedServiceType = typeof serviceType === 'string' ? serviceType.trim().toLowerCase() : ''

  // Adjust for service type
  if (normalizedServiceType === 'guided_experience') {
    return {
      min: Math.round(baseRate.min * 1.2),
      max: Math.round(baseRate.max * 1.2),
    }
  }

  return baseRate
}


interface MatchingCriteria {
  city: string
  preferredNationality?: string
  preferredLanguages: string[]
  serviceType: string
  interests: string[]
  dates: { start: string; end?: string }
  preferredTime: string
}

interface ScoredStudent {
  id: string
  maskedId: string
  displayName: string
  nationality: string | null
  languages: string[]
  institute: string | null
  gender: string | null
  tripsHosted: number
  averageRating: number | null
  reviewCount: number
  noShowCount: number
  reliabilityBadge: string | null
  interests: string[]
  priceRange: { min: number; max: number } | null
  score: number

  matchReasons: string[]
  tags: string[]
}

function calculateMatchScore(
  student: { nationality: string | null; languages: string[]; interests: string[]; averageRating: number | null; tripsHosted: number; noShowCount: number; reliabilityBadge: string | null; acceptanceRate: number | null },
  criteria: MatchingCriteria
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // 1. Nationality match (high priority)
  if (criteria.preferredNationality && student.nationality === criteria.preferredNationality) {
    score += 50
    reasons.push('Matches your preferred nationality')
  }

  const preferredLanguages = Array.isArray(criteria.preferredLanguages) ? criteria.preferredLanguages : []
  const interests = Array.isArray(criteria.interests) ? criteria.interests : []

  // 2. Language match (high priority)
  const languageMatches = preferredLanguages.filter((lang) =>
    student.languages.includes(lang)
  )
  if (languageMatches.length > 0) {
    score += languageMatches.length * 20
    reasons.push(`Speaks ${languageMatches.join(', ')}`)
  }

  // 3. Interest overlap
  const interestMatches = interests.filter((interest) =>
    student.interests.includes(interest)
  )
  if (interestMatches.length > 0) {
    score += interestMatches.length * 10
    reasons.push(`Shares interests: ${interestMatches.slice(0, 3).join(', ')}`)
  }

  // 4. Rating (if exists)
  if (student.averageRating !== null) {
    score += student.averageRating * 10
    if (student.averageRating >= 4.5) {
      reasons.push('Highly rated guide')
    }
  }

  // 5. Experience (trips hosted)
  if (student.tripsHosted > 10) {
    score += 30
    reasons.push('Experienced guide')
  } else if (student.tripsHosted > 5) {
    score += 15
  } else if (student.tripsHosted > 0) {
    score += 5
  }

  // 6. Reliability (no-shows)
  if (student.noShowCount === 0 && student.tripsHosted > 0) {
    score += 20
    reasons.push('Perfect attendance record')
  } else if (student.noShowCount > 2) {
    score -= 30
  }

  // 7. Reliability badge
  if (student.reliabilityBadge === 'gold') {
    score += 25
    reasons.push('Gold reliability badge')
  } else if (student.reliabilityBadge === 'silver') {
    score += 15
    reasons.push('Silver reliability badge')
  } else if (student.reliabilityBadge === 'bronze') {
    score += 5
  }

  // 8. Acceptance rate
  if (student.acceptanceRate !== null && student.acceptanceRate >= 0.8) {
    score += 10
  }

  return { score, reasons }
}

function maskStudentIdentity(student: { id: string }, index: number): string {
  // Use index to create a deterministic but anonymous alias for this list
  return `Guide #${(index + 101).toString()}`
}

function extractTags(student: { coverLetter: string | null; bio: string | null }): string[] {
  const tags: string[] = []

  const MAX_TAG_TEXT_LENGTH = 2000
  const MAX_FIELD_LENGTH = 1000

  const coverLetter = typeof student.coverLetter === 'string'
    ? student.coverLetter.slice(0, MAX_FIELD_LENGTH)
    : ''
  const bio = typeof student.bio === 'string'
    ? student.bio.slice(0, MAX_FIELD_LENGTH)
    : ''

  const combined = `${coverLetter} ${bio}`.slice(0, MAX_TAG_TEXT_LENGTH)
  const normalizedText = combined
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const tagKeywords = [
    'food', 'cafes', 'restaurants', 'first-time', 'kids', 'kid-friendly',
    'family', 'budget', 'budget-friendly', 'luxury', 'adventure',
    'history', 'culture', 'art', 'music', 'nightlife', 'shopping',
    'nature', 'photography', 'local', 'hidden gems'
  ]

  tagKeywords.forEach((keyword) => {
    const normalizedKeyword = keyword.replace(/-/g, ' ').trim()
    if (!normalizedKeyword) return

    const escaped = normalizedKeyword
      .split(/\s+/)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .map((word) => `\\b${word}\\b`)
      .join('\\s+')

    const regex = new RegExp(escaped)
    if (regex.test(normalizedText)) {
      tags.push(keyword)
    }
  })

  return Array.from(new Set(tags)).slice(0, 5) // Unique tags, max 5
}

async function matchStudents(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      throw new AppError(400, 'Request ID is required', 'MISSING_REQUEST_ID')
    }

    // Ensure database is available
    const prisma = requireDatabase()

    // Get the tourist request from database
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
    });

    if (!touristRequest) {
      throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
    }

    const db = prisma

    const criteria: MatchingCriteria = {
      city: touristRequest.city,
      preferredNationality: touristRequest.preferredNationality || undefined,
      preferredLanguages: Array.isArray(touristRequest.preferredLanguages) ? touristRequest.preferredLanguages : [],
      serviceType: touristRequest.serviceType,
      interests: Array.isArray(touristRequest.interests) ? touristRequest.interests : [],
      dates: touristRequest.dates as { start: string; end?: string },
      preferredTime: touristRequest.preferredTime,
    }

    // STEP 1: Build optimized WHERE clause for database-level filtering
    const whereClause: any = {
      city: criteria.city,
      status: 'APPROVED',
      // Only include students with availability set
      availability: {
        some: {},
      },
    }

    // Try to fetch students matching nationality first
    let candidatePool: any[] = []

    if (criteria.preferredNationality) {
      const nationalityMatches = await db.student.findMany({
        where: {
          ...whereClause,
          nationality: criteria.preferredNationality,
        },
        select: {
          id: true,
          name: true,
          nationality: true,
          languages: true,
          institute: true,
          gender: true,
          tripsHosted: true,
          averageRating: true,
          noShowCount: true,
          reliabilityBadge: true,
          interests: true,
          priceRange: true,
          bio: true,
          coverLetter: true,
          acceptanceRate: true,
          _count: {
            select: {
              reviews: true,
            },
          },
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      })

      if (nationalityMatches.length >= 3) {
        candidatePool = nationalityMatches
      }
    }

    // If not enough nationality matches, try language matches
    if (candidatePool.length < 3 && criteria.preferredLanguages.length > 0) {
      const languageMatches = await db.student.findMany({
        where: {
          ...whereClause,
          languages: {
            hasSome: criteria.preferredLanguages,
          },
        },
        select: {
          id: true,
          name: true,
          nationality: true,
          languages: true,
          institute: true,
          gender: true,
          tripsHosted: true,
          averageRating: true,
          noShowCount: true,
          reliabilityBadge: true,
          interests: true,
          priceRange: true,
          bio: true,
          coverLetter: true,
          acceptanceRate: true,
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      })

      candidatePool = languageMatches
    }

    // If still not enough, expand to all approved students in city
    if (candidatePool.length < 3) {
      candidatePool = await db.student.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          nationality: true,
          languages: true,
          institute: true,
          gender: true,
          tripsHosted: true,
          averageRating: true,
          noShowCount: true,
          reliabilityBadge: true,
          interests: true,
          priceRange: true,
          bio: true,
          coverLetter: true,
          acceptanceRate: true,
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      })
    }

    // Zero matches is a valid success state - booking was created successfully
    if (candidatePool.length === 0) {
      console.log(`[matchStudents] No matches found for request ${requestId} in ${criteria.city}`)
      return NextResponse.json({
        success: true,
        matches: [],
        hasMatches: false,
        message: 'No matching guides found yet - request is saved and tourist will be notified when guides become available',
      })
    }

    // STEP 5: Score and sort candidates
    const scoredStudents: ScoredStudent[] = candidatePool.map((student, index) => {
      const { score, reasons } = calculateMatchScore(student, criteria)
      const tags = extractTags(student)

      return {
        id: student.id,
        maskedId: maskStudentIdentity(student, index),
        displayName: maskName(student.name),
        nationality: student.nationality,
        languages: student.languages,
        institute: student.institute,
        gender: student.gender,
        tripsHosted: student.tripsHosted,
        averageRating: student.averageRating,
        reviewCount: student._count?.reviews ?? 0,
        noShowCount: student.noShowCount,
        reliabilityBadge: student.reliabilityBadge,
        interests: student.interests,
        priceRange: student.priceRange,
        score,
        matchReasons: reasons,
        tags,
      }
    })

    // Sort by score (descending)
    scoredStudents.sort((a, b) => b.score - a.score)

    // STEP 6: Select top 3-4 candidates
    const topCandidates = scoredStudents.slice(0, 4)

    // Calculate suggested price range based on city
    const suggestedPriceRange = calculateSuggestedPrice(criteria.city, criteria.serviceType)

    console.log(`[matchStudents] Found ${topCandidates.length} matches for request ${requestId}`)

    return NextResponse.json({
      success: true,
      hasMatches: true,
      matches: topCandidates.map((student) => ({
        selectionToken: generateSelectionToken({
          requestId: touristRequest.id,
          studentId: student.id,
        }),
        maskedId: student.maskedId,
        // Partially mask name (show first name + initial)
        displayName: student.displayName,
        nationality: student.nationality,
        languages: student.languages,
        institute: student.institute,
        tripsHosted: student.tripsHosted,
        averageRating: student.averageRating,
        reviewCount: student.reviewCount,
        noShowCount: student.noShowCount,
        reliabilityBadge: student.reliabilityBadge,
        tags: student.tags,
        matchReasons: student.matchReasons,
      })),
      suggestedPriceRange,
      requestId: touristRequest.id,
      preferredNationality: touristRequest.preferredNationality,
      preferredLanguages: touristRequest.preferredLanguages,
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('Error matching students:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function maskName(fullName: string | null): string {
  if (!fullName) return 'Anonymous'
  const trimmed = fullName.trim()
  if (!trimmed) return 'Anonymous'
  const parts = trimmed.split(/\s+/)
  return parts[0] || 'Anonymous'
}

// Export the POST handler (this was missing, causing 404 errors in production)
export const POST = matchStudents
