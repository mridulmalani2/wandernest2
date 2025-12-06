import { requireDatabase } from '@/lib/prisma'
import { TouristRequest, Student, StudentAvailability, Prisma } from '@prisma/client'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import crypto from 'crypto'

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

interface MatchingFilters {
  city: string
  status: 'APPROVED'
  nationality?: string
  languages?: {
    hasSome: string[]
  }
}

/**
 * Get all approved students in a city (cached for 15 minutes)
 */
async function getApprovedStudentsByCity(city: string) {
  const db = requireDatabase()
  const safeCity = sanitizeCacheKey(city)

  return cache.cached(
    `students:approved:${safeCity}`,
    async () => {
      // SECURITY: Select only necessary fields to minimize data exposure in cache
      return db.student.findMany({
        where: {
          city, // Use original city for DB query
          status: 'APPROVED',
        },
        select: {
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
          // We need availability for matching
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true
            }
          }
        }
      })
    },
    { ttl: CACHE_TTL.APPROVED_STUDENTS }
  )
}

/**
 * Find matching guides for a tourist request
 * Returns top 4 matches based on scoring algorithm
 */
export async function findMatches(request: TouristRequest): Promise<StudentWithScore[]> {
  // Fetch all approved students in the city (cached)
  const allCandidates = await getApprovedStudentsByCity(request.city)

  // Filter candidates based on preferences (in-memory filtering)
  let candidates = allCandidates

  if (request.preferredNationality) {
    candidates = candidates.filter((s: any) => s.nationality === request.preferredNationality)
  }

  if (request.preferredLanguages && request.preferredLanguages.length > 0) {
    candidates = candidates.filter((s: any) =>
      request.preferredLanguages!.some(lang => s.languages.includes(lang))
    )
  }

  // Score each candidate
  const scored: StudentWithScore[] = candidates.map((student: any) => ({
    ...student,
    score: calculateScore(student, request)
  }))

  // Sort by score (descending) and return top 4
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

/**
 * Calculate matching score for a guide
 * Total: 100 points
 * - Availability: 40 points
 * - Rating: 20 points
 * - Reliability: 20 points
 * - Interest overlap: 20 points
 */
function calculateScore(student: Student & { availability?: StudentAvailability[] }, request: TouristRequest): number {
  let score = 0

  // 1. Availability match (40 points)
  if (checkAvailability(student, request.dates)) {
    score += 40
  }

  // 2. Rating (20 points max)
  // Default to 3.0 if no rating yet
  const rating = student.averageRating || 3.0
  score += rating * 4 // 5-star rating * 4 = 20 points max

  // 3. Reliability (20 points)
  // Perfect reliability (no no-shows) = 20 points
  // Each no-show reduces score by 5 points
  if (student.noShowCount === 0) {
    score += 20
  } else {
    score += Math.max(0, 20 - (student.noShowCount * 5))
  }

  // 4. Interest overlap (20 points)
  if (request.interests && request.interests.length > 0) {
    const overlap = request.interests.filter((interest: string) =>
      student.interests.includes(interest)
    ).length
    score += (overlap / request.interests.length) * 20
  }

  return Math.round(score * 10) / 10 // Round to 1 decimal place
}

/**
 * Check if guide is available for requested dates
 */
function checkAvailability(student: { availability?: StudentAvailability[] }, requestedDates: Prisma.JsonValue): boolean {
  try {
    if (!student.availability || student.availability.length === 0) {
      return false
    }

    // Parse requested dates
    const dates = typeof requestedDates === 'string'
      ? JSON.parse(requestedDates)
      : requestedDates

    let checkDates: Date[] = []

    if (dates.start && dates.end) {
      // Date range - check all days
      const start = new Date(dates.start)
      const end = new Date(dates.end)
      const current = new Date(start)

      while (current <= end) {
        checkDates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    } else if (dates.date) {
      // Single date
      checkDates.push(new Date(dates.date))
    } else {
      return false
    }

    // Check if guide is available for all requested dates
    return checkDates.every(date => {
      const dayOfWeek = date.getDay()
      return student.availability?.some((avail: StudentAvailability) => avail.dayOfWeek === dayOfWeek) ?? false
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return false
  }
}

/**
 * Generate anonymized guide ID for display
 */
export function generateAnonymousId(studentId: string): string {
  // SECURITY: Use SHA-256 for predictable but secure collision-resistant hashing
  const hash = crypto.createHash('sha256').update(studentId).digest('hex')

  // Take first 8 chars and convert to integer mod 10000
  const shortHash = parseInt(hash.substring(0, 8), 16) % 10000

  // Format: "Guide #0001"
  return `Guide #${shortHash.toString().padStart(4, '0')}`
}
