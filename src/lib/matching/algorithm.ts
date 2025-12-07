import { requireDatabase } from '@/lib/prisma'
import { TouristRequest, Student, StudentAvailability, Prisma } from '@prisma/client'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

/**
 * Matching Algorithm v2
 *
 * This module implements an optimized matching algorithm that:
 * 1. Pushes filtering into Prisma queries (database-level filtering)
 * 2. Uses a single query with OR conditions instead of cascading queries
 * 3. Limits result sets at the database level
 * 4. Minimizes in-memory processing
 *
 * Performance improvements:
 * - Reduced memory usage (no full table scans)
 * - Faster response times (database does the heavy lifting)
 * - Better scalability for large datasets
 */

/**
 * Helper to sanitize cache keys to prevent injection/poisoning
 */
function sanitizeCacheKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '')
}

interface StudentWithScore {
  id: string
  name: string | null
  nationality: string | null
  languages: string[]
  institute: string | null
  gender: string | null
  city: string | null
  tripsHosted: number
  averageRating: number | null
  noShowCount: number
  reliabilityBadge: string | null
  interests: string[]
  acceptanceRate: number | null
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  score: number
}

interface MatchingCriteria {
  city: string
  preferredNationality?: string | null
  preferredLanguages?: string[]
  preferredGender?: string | null
  interests?: string[]
  dates: Prisma.JsonValue
}

// Maximum candidates to fetch from database
const MAX_CANDIDATES = 50

// Maximum matches to return
const MAX_MATCHES = 4

// Student select fields for queries
const studentSelectFields = {
  id: true,
  name: true,
  nationality: true,
  languages: true,
  institute: true,
  gender: true,
  city: true,
  tripsHosted: true,
  averageRating: true,
  noShowCount: true,
  reliabilityBadge: true,
  interests: true,
  acceptanceRate: true,
  availability: {
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
    },
  },
} as const

/**
 * Build Prisma where clause with database-level filtering
 */
function buildWhereClause(criteria: MatchingCriteria): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {
    city: criteria.city,
    status: 'APPROVED',
    // Only get students with at least one availability slot
    availability: {
      some: {},
    },
  }

  // Build OR conditions for preferences (students matching ANY preference are included)
  const orConditions: Prisma.StudentWhereInput[] = []

  // Nationality preference
  if (criteria.preferredNationality) {
    orConditions.push({ nationality: criteria.preferredNationality })
  }

  // Language preferences - hasSome matches any language in the array
  if (criteria.preferredLanguages && criteria.preferredLanguages.length > 0) {
    orConditions.push({
      languages: { hasSome: criteria.preferredLanguages },
    })
  }

  // Gender preference
  if (criteria.preferredGender) {
    orConditions.push({ gender: criteria.preferredGender })
  }

  // If we have preferences, add them as OR conditions
  // This allows us to get students matching ANY preference
  if (orConditions.length > 0) {
    where.OR = orConditions
  }

  return where
}

/**
 * Fetch matching candidates from database with optimized query
 */
async function fetchCandidates(
  criteria: MatchingCriteria
): Promise<(Student & { availability: StudentAvailability[] })[]> {
  const db = requireDatabase()
  const safeCity = sanitizeCacheKey(criteria.city)
  const cacheKey = `students:candidates:${safeCity}:${crypto
    .createHash('md5')
    .update(JSON.stringify(criteria))
    .digest('hex')
    .slice(0, 8)}`

  return cache.cached(
    cacheKey,
    async () => {
      const startTime = Date.now()

      // First try with preferences
      const whereWithPrefs = buildWhereClause(criteria)
      let candidates = await db.student.findMany({
        where: whereWithPrefs,
        select: studentSelectFields,
        orderBy: [
          { averageRating: 'desc' },
          { tripsHosted: 'desc' },
        ],
        take: MAX_CANDIDATES,
      })

      // If we don't have enough candidates, fall back to all approved students in city
      if (candidates.length < MAX_MATCHES) {
        logger.debug('Not enough candidates with preferences, fetching all in city', {
          city: criteria.city,
          foundWithPrefs: candidates.length,
        })

        candidates = await db.student.findMany({
          where: {
            city: criteria.city,
            status: 'APPROVED',
            availability: { some: {} },
          },
          select: studentSelectFields,
          orderBy: [
            { averageRating: 'desc' },
            { tripsHosted: 'desc' },
          ],
          take: MAX_CANDIDATES,
        })
      }

      logger.debug('Fetched candidates', {
        city: criteria.city,
        count: candidates.length,
        duration: Date.now() - startTime,
      })

      return candidates as (Student & { availability: StudentAvailability[] })[]
    },
    { ttl: CACHE_TTL.APPROVED_STUDENTS }
  )
}

/**
 * Find matching guides for a tourist request
 * Returns top matches based on scoring algorithm
 */
export async function findMatches(request: TouristRequest): Promise<StudentWithScore[]> {
  const startTime = Date.now()

  const criteria: MatchingCriteria = {
    city: request.city,
    preferredNationality: request.preferredNationality,
    preferredLanguages: request.preferredLanguages || [],
    preferredGender: request.preferredGender,
    interests: request.interests || [],
    dates: request.dates,
  }

  // Fetch candidates with database-level filtering
  const candidates = await fetchCandidates(criteria)

  if (candidates.length === 0) {
    logger.info('No candidates found for request', { city: request.city })
    return []
  }

  // Score each candidate
  const scored: StudentWithScore[] = candidates.map((student) => ({
    id: student.id,
    name: student.name,
    nationality: student.nationality,
    languages: student.languages,
    institute: student.institute,
    gender: student.gender,
    city: student.city,
    tripsHosted: student.tripsHosted,
    averageRating: student.averageRating,
    noShowCount: student.noShowCount,
    reliabilityBadge: student.reliabilityBadge,
    interests: student.interests,
    acceptanceRate: student.acceptanceRate,
    availability: student.availability,
    score: calculateScore(student, request),
  }))

  // Sort by score and return top matches
  const matches = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES)

  logger.info('Matching completed', {
    city: request.city,
    candidatesScored: candidates.length,
    matchesReturned: matches.length,
    topScore: matches[0]?.score,
    duration: Date.now() - startTime,
  })

  return matches
}

/**
 * Calculate matching score for a guide
 *
 * Scoring breakdown (100 points total):
 * - Availability match: 40 points
 * - Rating: 20 points (4 points per star)
 * - Reliability: 20 points (decreases 5 per no-show)
 * - Interest overlap: 20 points
 *
 * Bonus points:
 * - Nationality match: +10 points
 * - Language match: +5 points per matching language (max +15)
 */
function calculateScore(
  student: Student & { availability?: StudentAvailability[] },
  request: TouristRequest
): number {
  let score = 0

  // 1. Availability match (40 points)
  if (checkAvailability(student, request.dates)) {
    score += 40
  }

  // 2. Rating (20 points max)
  const rating = student.averageRating || 3.0
  score += rating * 4

  // 3. Reliability (20 points)
  if (student.noShowCount === 0) {
    score += 20
  } else {
    score += Math.max(0, 20 - student.noShowCount * 5)
  }

  // 4. Interest overlap (20 points)
  if (request.interests && request.interests.length > 0) {
    const overlap = request.interests.filter((interest: string) =>
      student.interests.includes(interest)
    ).length
    score += (overlap / request.interests.length) * 20
  }

  // BONUS: Nationality match (+10 points)
  if (request.preferredNationality && student.nationality === request.preferredNationality) {
    score += 10
  }

  // BONUS: Language match (+5 per language, max +15)
  if (request.preferredLanguages && request.preferredLanguages.length > 0) {
    const languageMatches = request.preferredLanguages.filter((lang) =>
      student.languages.includes(lang)
    ).length
    score += Math.min(languageMatches * 5, 15)
  }

  return Math.round(score * 10) / 10
}

/**
 * Check if guide is available for requested dates
 * Uses Set for O(1) day-of-week lookup
 */
function checkAvailability(
  student: { availability?: StudentAvailability[] },
  requestedDates: Prisma.JsonValue
): boolean {
  try {
    if (!student.availability || student.availability.length === 0) {
      return false
    }

    // Parse requested dates
    const dates = typeof requestedDates === 'string'
      ? JSON.parse(requestedDates)
      : requestedDates

    // Build set of available days for O(1) lookup
    const availableDays = new Set(
      student.availability.map((a) => a.dayOfWeek)
    )

    let checkDates: Date[] = []

    if (dates.start && dates.end) {
      const start = new Date(dates.start)
      const end = new Date(dates.end)
      const current = new Date(start)

      // Limit to reasonable date range (30 days max)
      const maxDays = 30
      let dayCount = 0

      while (current <= end && dayCount < maxDays) {
        checkDates.push(new Date(current))
        current.setDate(current.getDate() + 1)
        dayCount++
      }
    } else if (dates.date) {
      checkDates.push(new Date(dates.date))
    } else {
      return false
    }

    // Check if guide is available for all requested dates using Set lookup
    return checkDates.every((date) => availableDays.has(date.getDay()))
  } catch (error) {
    logger.warn('Error checking availability', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return false
  }
}

/**
 * Generate anonymized guide ID for display
 */
export function generateAnonymousId(studentId: string): string {
  const hash = crypto.createHash('sha256').update(studentId).digest('hex')
  const shortHash = parseInt(hash.substring(0, 8), 16) % 10000
  return `Guide #${shortHash.toString().padStart(4, '0')}`
}

export type { StudentWithScore, MatchingCriteria }
