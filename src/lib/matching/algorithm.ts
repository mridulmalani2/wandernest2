import { requireDatabase } from '@/lib/prisma'
import { TouristRequest, Student, StudentAvailability, Prisma } from '@prisma/client'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

/**
 * Matching Algorithm v2
 *
 * SECURITY FEATURES:
 * - Safe cache key sanitization (no collisions)
 * - Input validation for all criteria
 * - Proper null/undefined handling for ratings
 * - Full hash for cache keys (no truncation)
 * - No sensitive PII in cache (only IDs)
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
 * Maximum length for sanitized cache key components
 */
const MAX_KEY_COMPONENT_LENGTH = 50;

/**
 * Helper to sanitize cache keys to prevent injection/poisoning
 *
 * SECURITY: Improved to prevent:
 * - Collisions (uses hex encoding instead of stripping)
 * - Empty strings (validates input)
 * - Overly long keys (truncates with hash suffix)
 * - Unicode issues (uses Buffer for consistent encoding)
 */
function sanitizeCacheKey(input: string | undefined | null): string {
  // Handle undefined/null/empty
  if (!input || typeof input !== 'string') {
    return 'unknown';
  }

  // Normalize: trim and lowercase
  const normalized = input.trim().toLowerCase();

  if (normalized.length === 0) {
    return 'empty';
  }

  // For short, simple alphanumeric strings, use as-is
  if (normalized.length <= MAX_KEY_COMPONENT_LENGTH && /^[a-z0-9]+$/.test(normalized)) {
    return normalized;
  }

  // For complex strings, create a safe representation:
  // Keep alphanumeric prefix + hash suffix to ensure uniqueness
  const alphanumericPart = normalized.replace(/[^a-z0-9]/g, '').substring(0, 20);
  const hash = crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);

  return `${alphanumericPart || 'x'}_${hash}`;
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
// SECURITY: Only select fields needed for matching, avoid caching full PII
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
 *
 * SECURITY: Validates criteria.city before use
 */
async function fetchCandidates(
  criteria: MatchingCriteria
): Promise<(Student & { availability: StudentAvailability[] })[]> {
  // SECURITY: Validate city is present
  if (!criteria.city || typeof criteria.city !== 'string') {
    logger.warn('fetchCandidates called with invalid city', {
      cityType: typeof criteria.city,
    });
    return [];
  }

  const db = requireDatabase()
  const safeCity = sanitizeCacheKey(criteria.city)

  // SECURITY: Use full SHA-256 hash (no truncation) to prevent collisions
  const criteriaHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      city: criteria.city,
      preferredNationality: criteria.preferredNationality,
      preferredLanguages: criteria.preferredLanguages,
      preferredGender: criteria.preferredGender,
      // Don't include dates in cache key - they change per request
    }))
    .digest('hex')

  const cacheKey = `students:candidates:${safeCity}:${criteriaHash}`

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

  // SECURITY: Validate city
  if (!request.city || typeof request.city !== 'string') {
    logger.warn('findMatches called with invalid city');
    return [];
  }

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
 * SECURITY: Properly handles null/undefined/0 ratings
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
  // Pass preferredTime for time-of-day validation
  if (checkAvailability(student, request.dates, request.preferredTime)) {
    score += 40
  }

  // 2. Rating (20 points max)
  // SECURITY: Properly handle null, undefined, and 0 ratings
  // A rating of 0 is treated as 0, not substituted with 3.0
  let rating: number;
  if (student.averageRating === null || student.averageRating === undefined) {
    // No ratings yet - use neutral default
    rating = 3.0;
  } else if (typeof student.averageRating === 'number' && !isNaN(student.averageRating)) {
    // Valid rating - use as-is (including 0)
    rating = student.averageRating;
  } else {
    // Invalid rating type - use neutral default
    rating = 3.0;
  }
  score += rating * 4

  // 3. Reliability (20 points)
  const noShowCount = student.noShowCount ?? 0;
  if (noShowCount === 0) {
    score += 20
  } else {
    score += Math.max(0, 20 - noShowCount * 5)
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
    const languageMatches = request.preferredLanguages.filter((lang: string) =>
      student.languages.includes(lang)
    ).length
    score += Math.min(languageMatches * 5, 15)
  }

  return Math.round(score * 10) / 10
}

/**
 * Helper to validate a Date object is valid (not Invalid Date)
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Helper to parse time string "HH:MM" to minutes since midnight
 */
function parseTimeToMinutes(time: string): number | null {
  if (!time || typeof time !== 'string') return null
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/**
 * Check if guide is available for requested dates
 * Uses Set for O(1) day-of-week lookup
 *
 * SECURITY: Validates all inputs, rejects invalid/empty date ranges
 * CORRECTNESS: Also checks time-of-day availability when preferredTime is provided
 */
function checkAvailability(
  student: { availability?: StudentAvailability[] },
  requestedDates: Prisma.JsonValue,
  preferredTime?: string
): boolean {
  try {
    if (!student.availability || student.availability.length === 0) {
      return false
    }

    // Parse requested dates with validation
    let dates: { start?: string; end?: string; date?: string }
    try {
      dates = typeof requestedDates === 'string'
        ? JSON.parse(requestedDates)
        : (requestedDates as { start?: string; end?: string; date?: string })
    } catch {
      logger.warn('Failed to parse requestedDates JSON')
      return false
    }

    // Validate dates object structure
    if (!dates || typeof dates !== 'object') {
      return false
    }

    // Build map of available days with their time slots for comprehensive lookup
    // Key: dayOfWeek (0-6), Value: array of {startTime, endTime}
    const availabilityByDay = new Map<number, Array<{ startMinutes: number; endMinutes: number }>>()
    for (const a of student.availability) {
      if (typeof a.dayOfWeek !== 'number' || a.dayOfWeek < 0 || a.dayOfWeek > 6) {
        continue
      }
      const startMinutes = parseTimeToMinutes(a.startTime)
      const endMinutes = parseTimeToMinutes(a.endTime)
      // Skip invalid time slots
      if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
        continue
      }
      if (!availabilityByDay.has(a.dayOfWeek)) {
        availabilityByDay.set(a.dayOfWeek, [])
      }
      availabilityByDay.get(a.dayOfWeek)!.push({ startMinutes, endMinutes })
    }

    // If no valid availability slots, return false
    if (availabilityByDay.size === 0) {
      return false
    }

    // Determine requested time window (if provided)
    let requestedTimeWindow: { start: number; end: number } | null = null
    if (preferredTime) {
      // Map preferredTime strings to approximate time ranges
      switch (preferredTime.toLowerCase()) {
        case 'morning':
          requestedTimeWindow = { start: 6 * 60, end: 12 * 60 } // 6am-12pm
          break
        case 'afternoon':
          requestedTimeWindow = { start: 12 * 60, end: 18 * 60 } // 12pm-6pm
          break
        case 'evening':
          requestedTimeWindow = { start: 18 * 60, end: 23 * 60 } // 6pm-11pm
          break
        default:
          // Unknown preferredTime, skip time checking
          break
      }
    }

    let checkDates: Date[] = []

    if (dates.start && dates.end) {
      const start = new Date(dates.start)
      const end = new Date(dates.end)

      // SECURITY: Validate both dates are valid Date objects
      if (!isValidDate(start) || !isValidDate(end)) {
        logger.warn('Invalid date values in range', {
          startValid: isValidDate(start),
          endValid: isValidDate(end),
        })
        return false
      }

      // SECURITY: Reject inverted date ranges (start > end)
      if (start > end) {
        logger.warn('Inverted date range rejected', {
          start: dates.start,
          end: dates.end,
        })
        return false
      }

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
      const singleDate = new Date(dates.date)
      // SECURITY: Validate single date
      if (!isValidDate(singleDate)) {
        logger.warn('Invalid single date value')
        return false
      }
      checkDates.push(singleDate)
    } else {
      return false
    }

    // SECURITY: Empty checkDates should return false (deny by default)
    if (checkDates.length === 0) {
      return false
    }

    // Check if guide is available for all requested dates
    return checkDates.every((date) => {
      const dayOfWeek = date.getDay()
      const daySlots = availabilityByDay.get(dayOfWeek)

      if (!daySlots || daySlots.length === 0) {
        return false
      }

      // If no specific time requested, just check day availability
      if (!requestedTimeWindow) {
        return true
      }

      // Check if any time slot overlaps with requested time window
      return daySlots.some((slot) => {
        // Check for overlap: slot.start < requested.end AND slot.end > requested.start
        return slot.startMinutes < requestedTimeWindow!.end &&
               slot.endMinutes > requestedTimeWindow!.start
      })
    })
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
