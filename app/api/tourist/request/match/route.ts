import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface MatchingCriteria {
  city: string
  preferredNationality?: string
  preferredLanguages: string[]
  preferredGender?: string
  serviceType: string
  interests: string[]
  dates: { start: string; end?: string }
  preferredTime: string
}

interface ScoredStudent {
  id: string
  maskedId: string
  name: string // Will be masked for display
  nationality: string
  languages: string[]
  institute: string
  gender: string
  tripsHosted: number
  averageRating: number | null
  noShowCount: number
  reliabilityBadge: string | null
  interests: string[]
  priceRange: any
  bio: string | null
  coverLetter: string
  score: number
  matchReasons: string[]
}

function calculateMatchScore(
  student: any,
  criteria: MatchingCriteria
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // 1. Nationality match (high priority)
  if (criteria.preferredNationality && student.nationality === criteria.preferredNationality) {
    score += 50
    reasons.push('Matches your preferred nationality')
  }

  // 2. Language match (high priority)
  const languageMatches = criteria.preferredLanguages.filter((lang) =>
    student.languages.includes(lang)
  )
  if (languageMatches.length > 0) {
    score += languageMatches.length * 20
    reasons.push(`Speaks ${languageMatches.join(', ')}`)
  }

  // 3. Interest overlap
  const interestMatches = criteria.interests.filter((interest) =>
    student.interests.includes(interest)
  )
  if (interestMatches.length > 0) {
    score += interestMatches.length * 10
    reasons.push(`Shares interests: ${interestMatches.slice(0, 3).join(', ')}`)
  }

  // 4. Rating (if exists)
  if (student.averageRating) {
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
  if (student.acceptanceRate && student.acceptanceRate >= 0.8) {
    score += 10
  }

  return { score, reasons }
}

function maskStudentIdentity(student: any, index: number): string {
  // Create a masked identifier like "Guide #A73F"
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = letters[index % letters.length]
  const numbers = student.id.slice(-3).toUpperCase()
  return `Guide #${letter}${numbers}`
}

function extractTags(student: any): string[] {
  const tags: string[] = []

  // Extract from cover letter and bio (simple keyword extraction)
  const text = `${student.coverLetter} ${student.bio || ''}`.toLowerCase()

  const tagKeywords = [
    'food', 'cafes', 'restaurants', 'first-time', 'kids', 'kid-friendly',
    'family', 'budget', 'budget-friendly', 'luxury', 'adventure',
    'history', 'culture', 'art', 'music', 'nightlife', 'shopping',
    'nature', 'photography', 'local', 'hidden gems'
  ]

  tagKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      tags.push(keyword)
    }
  })

  return Array.from(new Set(tags)).slice(0, 5) // Unique tags, max 5
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get the tourist request
    const touristRequest = await prisma.touristRequest.findUnique({
      where: { id: requestId },
    })

    if (!touristRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    const criteria: MatchingCriteria = {
      city: touristRequest.city,
      preferredNationality: touristRequest.preferredNationality || undefined,
      preferredLanguages: touristRequest.preferredLanguages,
      preferredGender: touristRequest.preferredGender || undefined,
      serviceType: touristRequest.serviceType,
      interests: touristRequest.interests,
      dates: touristRequest.dates as { start: string; end?: string },
      preferredTime: touristRequest.preferredTime,
    }

    // STEP 1: Filter students by city and approval status
    let students = await prisma.student.findMany({
      where: {
        city: criteria.city,
        status: 'APPROVED',
      },
      include: {
        availability: true,
      },
    })

    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No approved students found in this city',
      })
    }

    // STEP 2: Apply gender preference filter
    if (criteria.preferredGender && criteria.preferredGender !== 'no_preference') {
      students = students.filter((s) => s.gender === criteria.preferredGender)
    }

    // STEP 3: Filter by availability (students must have some availability set)
    students = students.filter((s) => s.availability && s.availability.length > 0)

    // STEP 4: Filter by nationality (primary), expand to language if needed
    let nationalityMatches = students.filter(
      (s) => criteria.preferredNationality && s.nationality === criteria.preferredNationality
    )

    let languageMatches = students.filter((s) =>
      criteria.preferredLanguages.some((lang) => s.languages.includes(lang))
    )

    // If we have nationality matches, prioritize them, otherwise use language matches
    let candidatePool = nationalityMatches.length >= 3 ? nationalityMatches : students

    // If still too few candidates, expand to all students in city
    if (candidatePool.length < 3) {
      candidatePool = students
    }

    // STEP 5: Score and sort candidates
    const scoredStudents: ScoredStudent[] = candidatePool.map((student, index) => {
      const { score, reasons } = calculateMatchScore(student, criteria)
      const tags = extractTags(student)

      return {
        id: student.id,
        maskedId: maskStudentIdentity(student, index),
        name: student.name,
        nationality: student.nationality,
        languages: student.languages,
        institute: student.institute,
        gender: student.gender,
        tripsHosted: student.tripsHosted,
        averageRating: student.averageRating,
        noShowCount: student.noShowCount,
        reliabilityBadge: student.reliabilityBadge,
        interests: student.interests,
        priceRange: student.priceRange,
        bio: student.bio,
        coverLetter: student.coverLetter,
        score,
        matchReasons: reasons,
      }
    })

    // Sort by score (descending)
    scoredStudents.sort((a, b) => b.score - a.score)

    // STEP 6: Select top 3-4 candidates
    const topCandidates = scoredStudents.slice(0, 4)

    // Calculate suggested price range based on city
    const suggestedPriceRange = calculateSuggestedPrice(criteria.city, criteria.serviceType)

    return NextResponse.json({
      success: true,
      matches: topCandidates.map((student) => ({
        studentId: student.id,
        maskedId: student.maskedId,
        // Partially mask name (show first name + initial)
        displayName: maskName(student.name),
        nationality: student.nationality,
        languages: student.languages,
        institute: student.institute,
        tripsHosted: student.tripsHosted,
        averageRating: student.averageRating,
        reviewCount: student.tripsHosted, // Approximation
        noShowCount: student.noShowCount,
        reliabilityBadge: student.reliabilityBadge,
        tags: extractTags(student),
        matchReasons: student.matchReasons,
      })),
      suggestedPriceRange,
      requestId: touristRequest.id,
    })
  } catch (error) {
    console.error('Error matching students:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find matching students',
      },
      { status: 500 }
    )
  }
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return parts[0]
  }
  // Show first name + last initial
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function calculateSuggestedPrice(city: string, serviceType: string): any {
  // Base hourly rates by city (in local currency or EUR)
  const cityRates: Record<string, { min: number; max: number }> = {
    'Paris': { min: 20, max: 35 },
    'London': { min: 20, max: 40 },
    'Barcelona': { min: 15, max: 30 },
    'Berlin': { min: 15, max: 28 },
    'Amsterdam': { min: 18, max: 32 },
    'Rome': { min: 15, max: 30 },
    'Prague': { min: 12, max: 25 },
    'Vienna': { min: 15, max: 28 },
    'default': { min: 15, max: 30 },
  }

  const baseRate = cityRates[city] || cityRates['default']

  if (serviceType === 'itinerary_help') {
    // Online consultation, flat fee
    return {
      type: 'flat',
      min: Math.round(baseRate.min * 1.5),
      max: Math.round(baseRate.max * 2),
      currency: 'EUR',
      note: 'Suggested fee for online itinerary consultation',
    }
  } else {
    // Guided experience, hourly rate
    return {
      type: 'hourly',
      min: baseRate.min,
      max: baseRate.max,
      currency: 'EUR',
      note: 'Suggested hourly rate for 3-4 hours guided experience',
    }
  }
}
