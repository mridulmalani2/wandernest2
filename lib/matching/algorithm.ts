import { prisma } from '@/lib/prisma'
import { Student, TouristRequest } from '@prisma/client'

interface StudentWithScore extends Student {
  score: number
}

interface MatchingFilters {
  city: string
  status: 'APPROVED'
  nationality?: string
  languages?: {
    hasSome: string[]
  }
  gender?: string
}

/**
 * Find matching guides for a tourist request
 * Returns top 4 matches based on scoring algorithm
 */
export async function findMatches(request: TouristRequest): Promise<StudentWithScore[]> {
  // Build the filtering criteria
  const filters: MatchingFilters = {
    city: request.city,
    status: 'APPROVED',
  }

  // Optional filters
  if (request.preferredNationality) {
    filters.nationality = request.preferredNationality
  }

  if (request.preferredLanguages && request.preferredLanguages.length > 0) {
    filters.languages = {
      hasSome: request.preferredLanguages
    }
  }

  if (request.preferredGender && request.preferredGender !== 'no_preference') {
    filters.gender = request.preferredGender
  }

  // Fetch candidate guides
  const candidates = await prisma.student.findMany({
    where: filters,
    include: {
      availability: true
    }
  })

  // Score each candidate
  const scored: StudentWithScore[] = candidates.map(student => ({
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
function calculateScore(student: any, request: TouristRequest): number {
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
function checkAvailability(student: any, requestedDates: any): boolean {
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
    return student.availability.some((avail: any) => avail.dayOfWeek === dayOfWeek)
  })
}

/**
 * Generate anonymized guide ID for display
 */
export function generateAnonymousId(studentId: string): string {
  // Create a consistent hash-based ID
  const hash = studentId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)
  return `Guide #${Math.abs(hash) % 10000}`.padStart(10, '0')
}
