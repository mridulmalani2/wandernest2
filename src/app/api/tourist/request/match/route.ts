// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
export const maxDuration = 10
// Explicitly use Node.js runtime (required for Prisma)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { AppError } from '@/lib/error-handler'
import { generateSelectionToken } from '@/lib/auth/tokens'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson, z } from '@/lib/validation/validate'
import { requireAuth } from '@/lib/auth/requireAuth'

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

  if (criteria.preferredNationality && student.nationality === criteria.preferredNationality) {
    score += 50
    reasons.push('Matches your preferred nationality')
  }

  const preferredLanguages = Array.isArray(criteria.preferredLanguages) ? criteria.preferredLanguages : []
  const interests = Array.isArray(criteria.interests) ? criteria.interests : []

  const languageMatches = preferredLanguages.filter((lang) =>
    student.languages.includes(lang)
  )
  if (languageMatches.length > 0) {
    score += languageMatches.length * 20
    reasons.push(`Speaks ${languageMatches.join(', ')}`)
  }

  const interestMatches = interests.filter((interest) =>
    student.interests.includes(interest)
  )
  if (interestMatches.length > 0) {
    score += interestMatches.length * 10
    reasons.push(`Shares interests: ${interestMatches.slice(0, 3).join(', ')}`)
  }

  if (student.averageRating !== null) {
    score += student.averageRating * 10
    if (student.averageRating >= 4.5) {
      reasons.push('Highly rated guide')
    }
  }

  if (student.tripsHosted > 10) {
    score += 30
    reasons.push('Experienced guide')
  } else if (student.tripsHosted > 5) {
    score += 15
  } else if (student.tripsHosted > 0) {
    score += 5
  }

  if (student.noShowCount === 0 && student.tripsHosted > 0) {
    score += 20
    reasons.push('Perfect attendance record')
  } else if (student.noShowCount > 2) {
    score -= 30
  }

  if (student.reliabilityBadge === 'gold') {
    score += 25
    reasons.push('Gold reliability badge')
  } else if (student.reliabilityBadge === 'silver') {
    score += 15
    reasons.push('Silver reliability badge')
  } else if (student.reliabilityBadge === 'bronze') {
    score += 5
  }

  if (student.acceptanceRate !== null && student.acceptanceRate >= 0.8) {
    score += 10
  }

  return { score, reasons }
}

function maskStudentIdentity(student: { id: string }, index: number): string {
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

  return Array.from(new Set(tags)).slice(0, 5)
}

const matchSchema = z.object({
  requestId: z.string().min(1),
}).strict()

async function matchStudents(req: NextRequest) {
  try {
    await rateLimitByIp(req, 60, 60, 'tourist-request-match')
    const identity = await requireAuth(req, 'tourist')

    const { requestId } = await validateJson<{ requestId: string }>(req, matchSchema)

    const prisma = requireDatabase()

    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
    });

    if (!touristRequest) {
      throw new AppError(404, 'Request not found', 'REQUEST_NOT_FOUND')
    }

    if (touristRequest.email !== identity.email && touristRequest.touristId !== identity.userId) {
      throw new AppError(403, 'Access denied', 'FORBIDDEN')
    }

    const criteria: MatchingCriteria = {
      city: touristRequest.city,
      preferredNationality: touristRequest.preferredNationality || undefined,
      preferredLanguages: Array.isArray(touristRequest.preferredLanguages) ? touristRequest.preferredLanguages : [],
      serviceType: touristRequest.serviceType,
      interests: Array.isArray(touristRequest.interests) ? touristRequest.interests : [],
      dates: touristRequest.dates as { start: string; end?: string },
      preferredTime: touristRequest.preferredTime,
    }

    const whereClause: any = {
      city: criteria.city,
      status: 'APPROVED',
      availability: {
        some: {},
      },
    }

    let candidatePool: any[] = []

    if (criteria.preferredNationality) {
      const nationalityMatches = await prisma.student.findMany({
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

    if (candidatePool.length < 3 && criteria.preferredLanguages.length > 0) {
      const languageMatches = await prisma.student.findMany({
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

    if (candidatePool.length < 3) {
      candidatePool = await prisma.student.findMany({
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

    if (candidatePool.length === 0) {
      console.log(`[matchStudents] No matches found for request ${requestId} in ${criteria.city}`)
      return NextResponse.json({
        success: true,
        matches: [],
        hasMatches: false,
        message: 'No matching guides found yet - request is saved and tourist will be notified when guides become available',
      })
    }

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

    scoredStudents.sort((a, b) => b.score - a.score)

    const topCandidates = scoredStudents.slice(0, 4)

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
    if (error instanceof NextResponse) {
      return error
    }
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

export const POST = matchStudents
