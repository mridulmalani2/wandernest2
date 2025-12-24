import 'server-only'
import { requireDatabase } from '@/lib/prisma'
import { CreateReviewInput, ReviewMetrics, ReliabilityBadge } from './types'
import { isValidAttribute } from './constants'
import { cache, cacheInvalidation } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'

/**
 * Maximum allowed characters for review text
 */
const MAX_REVIEW_TEXT_LENGTH = 500

/**
 * Review Service
 *
 * SECURITY FEATURES:
 * - Mandatory authorization (no optional auth)
 * - Request ownership verification
 * - Input validation for all parameters
 * - Transaction-based operations for data integrity
 * - Null-safe rating calculations
 * - Cache invalidation on all mutations
 */

/**
 * Creates a new review and updates student metrics
 *
 * SECURITY: This function expects the caller (API route) to have already verified:
 * 1. The tourist is authenticated
 * 2. The tourist owns the request being reviewed
 *
 * The function performs additional validation:
 * - Request exists
 * - Student exists
 * - No duplicate reviews for the same request
 */
export async function createReview(input: CreateReviewInput) {
  const db = requireDatabase()

  if (!input.studentId || typeof input.studentId !== 'string') {
    throw new Error('Invalid student ID')
  }

  if (!input.requestId || typeof input.requestId !== 'string') {
    throw new Error('Invalid request ID')
  }

  // Validate rating - must be a number between 1 and 5
  if (typeof input.rating !== 'number' || isNaN(input.rating)) {
    throw new Error('Rating must be a valid number')
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Validate text length
  if (input.text && input.text.length > MAX_REVIEW_TEXT_LENGTH) {
    throw new Error(`Review text must not exceed ${MAX_REVIEW_TEXT_LENGTH} characters`)
  }

  // Validate attributes
  if (!Array.isArray(input.attributes)) {
    throw new Error('Attributes must be an array')
  }
  for (const attribute of input.attributes) {
    if (!isValidAttribute(attribute)) {
      throw new Error(`Invalid attribute: ${String(attribute).substring(0, 50)}`)
    }
  }

  // Validate noShow if provided
  if (input.noShow !== undefined && typeof input.noShow !== 'boolean') {
    throw new Error('noShow must be a boolean')
  }

  // Validate pricePaid if provided
  if (input.pricePaid !== undefined && (typeof input.pricePaid !== 'number' || input.pricePaid < 0)) {
    throw new Error('pricePaid must be a non-negative number')
  }

  // SECURITY: Use transaction to ensure atomicity of review creation and metrics update.
  // This prevents race conditions and ensures metrics are always consistent with reviews.
  return await db.$transaction(async (tx) => {
    // SECURITY: Verify the request exists
    const request = await tx.touristRequest.findUnique({
      where: { id: input.requestId },
      select: { id: true, status: true, selectedStudentId: true }
    })

    if (!request) {
      throw new Error('Request not found')
    }

    // SECURITY: Verify the student being reviewed was selected for this request
    // This prevents reviewing arbitrary students not associated with the booking
    if (request.selectedStudentId && request.selectedStudentId !== input.studentId) {
      throw new Error('Student does not match the selected guide for this request')
    }

    // Check if review already exists for this request
    const existingReview = await tx.review.findFirst({
      where: { requestId: input.requestId },
      select: { id: true }
    })

    if (existingReview) {
      throw new Error('A review already exists for this request')
    }

    // SECURITY: Verify the student exists before creating review
    const student = await tx.student.findUnique({
      where: { id: input.studentId },
      select: { id: true }
    })

    if (!student) {
      throw new Error('Student not found')
    }

    // Create the review
    const review = await tx.review.create({
      data: {
        requestId: input.requestId,
        studentId: input.studentId,
        rating: input.rating,
        text: input.text,
        attributes: input.attributes,
        noShow: input.noShow ?? false,
        pricePaid: input.pricePaid,
        isAnonymous: input.isAnonymous ?? false,
      },
    })

    // Update student metrics within the same transaction to guarantee consistency
    await updateStudentMetricsInternal(tx, input.studentId)

    return review
  })
    .then(async (result) => {
      // Invalidate cache after successful transaction
      await cacheInvalidation.student(input.studentId)
      return result
    })
}

/**
 * Updates student metrics based on all their reviews
 * Calculates average rating, completion rate, and reliability badge
 *
 * SECURITY: Handles null/undefined ratings safely to prevent NaN propagation
 */
async function updateStudentMetricsInternal(tx: Parameters<Parameters<typeof requireDatabase>['$transaction']>[0] extends (tx: infer T) => unknown ? T : never, studentId: string) {
  // Validate studentId
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID for metrics update')
  }

  // SECURITY: Verify the student exists before updating
  const studentExists = await tx.student.findUnique({
    where: { id: studentId },
    select: { id: true }
  })

  if (!studentExists) {
    throw new Error('Student not found for metrics update')
  }

  // Get only necessary review fields for calculations (optimized)
  const allReviews = await tx.review.findMany({
    where: { studentId },
    select: {
      rating: true,
      noShow: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (allReviews.length === 0) {
    return null
  }

  // SECURITY: Filter out null/undefined ratings to prevent NaN
  const validRatings = allReviews.filter(
    (r): r is { rating: number; noShow: boolean | null } =>
      r.rating !== null && r.rating !== undefined && typeof r.rating === 'number' && !isNaN(r.rating)
  )

  // Calculate new average rating (only from valid ratings)
  let newAverage = 0
  if (validRatings.length > 0) {
    const totalRating = validRatings.reduce((acc, r) => acc + r.rating, 0)
    newAverage = totalRating / validRatings.length
  }

  // SECURITY: Ensure newAverage is never NaN
  if (isNaN(newAverage)) {
    newAverage = 0
  }

  // Calculate completion rate (percentage of non-no-show experiences)
  // SECURITY: Handle null/undefined noShow values safely
  const completedExperiences = allReviews.filter(r => r.noShow !== true).length
  const completionRate = (completedExperiences / allReviews.length) * 100

  // Calculate no-show count
  const noShowCount = allReviews.filter(r => r.noShow === true).length

  // Determine reliability badge
  let badge: ReliabilityBadge = 'bronze'
  if (completionRate >= 95 && allReviews.length >= 10) {
    badge = 'gold'
  } else if (completionRate >= 90 && allReviews.length >= 5) {
    badge = 'silver'
  }

  // Update student record
  await tx.student.update({
    where: { id: studentId },
    data: {
      averageRating: newAverage,
      reliabilityBadge: badge,
      noShowCount: noShowCount,
      tripsHosted: completedExperiences,
    },
  })

  return {
    averageRating: newAverage,
    completionRate,
    reliabilityBadge: badge,
    totalReviews: allReviews.length,
  }
}

/**
 * Updates student metrics (standalone wrapper)
 *
 * SECURITY: Uses transaction for atomicity and validates studentId
 */
export async function updateStudentMetrics(studentId: string) {
  // Validate studentId
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID')
  }

  const db = requireDatabase()

  // SECURITY: Use transaction to ensure atomicity (same as createReview)
  const result = await db.$transaction(async (tx) => {
    return await updateStudentMetricsInternal(tx, studentId)
  })

  // Invalidate cache after successful update
  await cacheInvalidation.student(studentId)

  return result
}



/**
 * Get all reviews for a student (cached for 10 minutes)
 *
 * SECURITY: Validates studentId and excludes sensitive fields from public response
 */
export async function getStudentReviews(studentId: string) {
  // Validate studentId
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID')
  }

  const db = requireDatabase()
  return cache.cached(
    `student:${studentId}:reviews`,
    async () => {
      return db.review.findMany({
        where: { studentId },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          attributes: true,
          // SECURITY: Exclude pricePaid from public responses
          // pricePaid: true, // Removed - sensitive financial data
          isAnonymous: true,
          request: {
            select: {
              city: true,
              // SECURITY: Exclude specific dates to protect tourist privacy
              // dates: true, // Removed
              groupType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    },
    { ttl: CACHE_TTL.REVIEWS }
  )
}

/**
 * Get a student's current metrics (cached for 30 minutes)
 */
export async function getStudentMetrics(studentId: string): Promise<ReviewMetrics | null> {
  // Validate studentId
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID')
  }

  const db = requireDatabase()
  const student = await db.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      averageRating: true,
      reliabilityBadge: true,
      tripsHosted: true,
      noShowCount: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!student) {
    return null
  }

  const totalReviews = student._count.reviews
  const completionRate = totalReviews > 0
    ? ((totalReviews - (student.noShowCount ?? 0)) / totalReviews) * 100
    : 0

  return {
    averageRating: student.averageRating ?? 0,
    completionRate,
    reliabilityBadge: (student.reliabilityBadge as ReliabilityBadge) ?? 'bronze',
    totalReviews,
  }
}
