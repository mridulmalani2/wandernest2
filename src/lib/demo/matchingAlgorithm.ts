/**
 * DEMO MATCHING ALGORITHM
 * Matches tourists with student guides based on preferences
 *
 * This is a simplified version for the demo. Replace with real database
 * queries when moving to production.
 */

import { DummyStudent } from './dummyStudents'

export interface TouristRequest {
  city: string
  dates: { start: string; end?: string }
  preferredTime: 'morning' | 'afternoon' | 'evening' | ''
  numberOfGuests: number
  groupType: 'family' | 'friends' | 'solo' | 'business' | ''
  accessibilityNeeds?: string
  preferredNationality?: string
  preferredLanguages: string[]
  preferredGender?: 'male' | 'female' | 'no_preference'
  serviceType: 'itinerary_help' | 'guided_experience' | ''
  interests: string[]
  totalBudget?: number
  email: string
  phone?: string
  whatsapp?: string
  contactMethod: 'email' | 'phone' | 'whatsapp' | 'sms' | ''
  tripNotes?: string
}

export interface ScoredStudent extends DummyStudent {
  score: number
  matchReasons: string[]
}

export interface StudentMatch {
  studentId: string
  maskedId: string
  displayName: string
  nationality: string
  languages: string[]
  institute: string
  tripsHosted: number
  averageRating: number | null
  reviewCount: number
  noShowCount: number
  reliabilityBadge: string | null
  tags: string[]
  matchReasons: string[]
}

/**
 * Calculate match score between a student and tourist request
 */
export function calculateMatchScore(
  student: DummyStudent,
  request: TouristRequest
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // 1. City match (required)
  if (student.city.toLowerCase() !== request.city.toLowerCase()) {
    return { score: 0, reasons: [] } // No match if different city
  }
  score += 100 // Base score for city match

  // 2. Language match (high priority)
  const languageMatches = request.preferredLanguages.filter((lang) =>
    student.languages.some(
      (sLang) => sLang.toLowerCase() === lang.toLowerCase()
    )
  )
  if (languageMatches.length > 0) {
    score += languageMatches.length * 30
    reasons.push(`Speaks ${languageMatches.join(', ')}`)
  }

  // 3. Guest capacity
  if (student.maxGuests >= request.numberOfGuests) {
    score += 20
  } else {
    score -= 50 // Penalize if can't accommodate group
    reasons.push(`⚠️ Limited capacity (max ${student.maxGuests} guests)`)
  }

  // 4. Nationality preference
  if (
    request.preferredNationality &&
    student.homeCountry.toLowerCase() ===
      request.preferredNationality.toLowerCase()
  ) {
    score += 40
    reasons.push(`From ${student.homeCountry}`)
  }

  // 5. Gender preference
  if (
    request.preferredGender &&
    request.preferredGender !== 'no_preference' &&
    student.gender === request.preferredGender
  ) {
    score += 15
  }

  // 6. Interest overlap
  const interestMatches = request.interests.filter((interest) =>
    student.interests.some(
      (sInterest) => sInterest.toLowerCase() === interest.toLowerCase()
    )
  )
  if (interestMatches.length > 0) {
    score += interestMatches.length * 15
    const displayInterests = interestMatches.slice(0, 3).join(', ')
    reasons.push(`Interests: ${displayInterests}`)
  }

  // 7. Focus areas match
  const focusMatches = request.interests.filter((interest) =>
    student.focusAreas.some(
      (focus) => focus.toLowerCase().includes(interest.toLowerCase())
    )
  )
  if (focusMatches.length > 0) {
    score += focusMatches.length * 12
    if (!interestMatches.length) {
      // Only add if not already mentioned
      const displayFocus = focusMatches.slice(0, 2).join(', ')
      reasons.push(`Specializes in: ${displayFocus}`)
    }
  }

  // 8. Budget compatibility
  if (request.totalBudget && request.serviceType === 'guided_experience') {
    const estimatedHours = 3 // Assume average 3-hour tour
    const estimatedCost = student.hourlyRate * estimatedHours
    if (estimatedCost <= request.totalBudget) {
      score += 25
      reasons.push('Within your budget')
    } else {
      score -= 20
    }
  }

  // 9. Experience level
  if (student.tripsHosted > 20) {
    score += 35
    reasons.push('Highly experienced guide')
  } else if (student.tripsHosted > 10) {
    score += 20
    reasons.push('Experienced guide')
  } else if (student.tripsHosted > 5) {
    score += 10
  }

  // 10. Rating
  if (student.averageRating) {
    score += student.averageRating * 10
    if (student.averageRating >= 4.7) {
      reasons.push(`Excellent rating (${student.averageRating}/5)`)
    }
  }

  // 11. Reliability
  if (student.noShowCount === 0 && student.tripsHosted > 0) {
    score += 25
    reasons.push('Perfect attendance record')
  } else if (student.noShowCount > 2) {
    score -= 40
  }

  // 12. Reliability badge
  if (student.reliabilityBadge === 'gold') {
    score += 30
    reasons.push('🏅 Gold reliability badge')
  } else if (student.reliabilityBadge === 'silver') {
    score += 20
    reasons.push('🥈 Silver reliability badge')
  } else if (student.reliabilityBadge === 'bronze') {
    score += 10
  }

  // 13. Group type compatibility
  if (request.groupType === 'family' || request.groupType === 'friends') {
    if (
      student.focusAreas.includes('family') ||
      student.focusAreas.includes('kid-friendly')
    ) {
      score += 20
      reasons.push('Great for families')
    }
  }

  return { score, reasons: reasons.slice(0, 4) } // Return top 4 reasons
}

/**
 * Mask student identity for privacy
 */
function maskStudentIdentity(student: DummyStudent, index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = letters[index % letters.length]
  const numbers = student.id.split('-')[1] || '001'
  return `Guide #${letter}${numbers}`
}

/**
 * Mask student name (show first name + last initial)
 */
function maskName(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return parts[0]
  }
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

/**
 * Find matching students for a tourist request
 */
export function findMatchingStudents(
  students: DummyStudent[],
  request: TouristRequest,
  limit: number = 5
): StudentMatch[] {
  // Score all students
  const scoredStudents: ScoredStudent[] = students.map((student) => {
    const { score, reasons } = calculateMatchScore(student, request)
    return {
      ...student,
      score,
      matchReasons: reasons,
    }
  })

  // Filter out students with score 0 (wrong city, etc.)
  const validStudents = scoredStudents.filter((s) => s.score > 0)

  // Sort by score (descending)
  validStudents.sort((a, b) => b.score - a.score)

  // Take top matches (3-5)
  const topMatches = validStudents.slice(0, limit)

  // Convert to StudentMatch format
  return topMatches.map((student, index) => ({
    studentId: student.id,
    maskedId: maskStudentIdentity(student, index),
    displayName: maskName(student.name),
    nationality: student.homeCountry,
    languages: student.languages,
    institute: student.institute,
    tripsHosted: student.tripsHosted,
    averageRating: student.averageRating,
    reviewCount: student.tripsHosted, // Approximation
    noShowCount: student.noShowCount,
    reliabilityBadge: student.reliabilityBadge,
    tags: student.focusAreas.slice(0, 5),
    matchReasons: student.matchReasons,
  }))
}

/**
 * Calculate suggested price range based on city and service type
 */
export function calculateSuggestedPrice(
  city: string,
  serviceType: string
): {
  min: number
  max: number
  currency: string
  type: string
  note: string
} {
  const cityRates: Record<
    string,
    { min: number; max: number; currency: string }
  > = {
    Paris: { min: 20, max: 35, currency: '€' },
    London: { min: 20, max: 40, currency: '£' },
  }

  const baseRate = cityRates[city] || { min: 15, max: 30, currency: '€' }

  if (serviceType === 'itinerary_help') {
    // Online consultation, flat fee
    return {
      min: Math.round(baseRate.min * 1.5),
      max: Math.round(baseRate.max * 2),
      currency: baseRate.currency,
      type: 'session',
      note: 'For online itinerary planning session (typically 1-2 hours)',
    }
  } else {
    // Guided experience, hourly rate
    return {
      min: baseRate.min,
      max: baseRate.max,
      currency: baseRate.currency,
      type: 'hourly',
      note: 'Per hour for in-person guided experience',
    }
  }
}
