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
 * Creates a new review and updates student metrics
 */
export async function createReview(input: CreateReviewInput & { authorizedStudentId?: string }) {
  const db = requireDatabase()

  // Authorization check: Ensure the caller is authorized for this studentId
  if (input.authorizedStudentId && input.authorizedStudentId !== input.studentId) {
    throw new Error('Unauthorized: You can only create reviews for your own profile')
  }

  if (!input.studentId || typeof input.studentId !== 'string') {
    throw new Error('Invalid student ID')
  }

  // Validate rating
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Validate text length
  if (input.text && input.text.length > MAX_REVIEW_TEXT_LENGTH) {
    throw new Error(`Review text must not exceed ${MAX_REVIEW_TEXT_LENGTH} characters`)
  }

  // Validate attributes
  for (const attribute of input.attributes) {
    if (!isValidAttribute(attribute)) {
      throw new Error(`Invalid attribute: ${attribute}`)
    }
  }

  // Use transaction to ensure atomicity of review creation and metrics update
  return await db.$transaction(async (tx) => {
    // Check if review already exists for this request
    const existingReview = await tx.review.findUnique({
      where: { requestId: input.requestId },
    })

    if (existingReview) {
      throw new Error('A review already exists for this request')
    }

    // Create the review
    const review = await tx.review.create({
      data: {
        requestId: input.requestId,
        studentId: input.studentId,
        rating: input.rating,
        text: input.text,
        attributes: input.attributes,
        noShow: input.noShow,
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
 */
/**
 * Internal helper to update student metrics (transaction-aware)
 */
async function updateStudentMetricsInternal(tx: any, studentId: string) {
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

  // Calculate new average rating
  const totalRating = allReviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0)
  const newAverage = totalRating / allReviews.length

  // Calculate completion rate (percentage of non-no-show experiences)
  const completedExperiences = allReviews.filter((r: { noShow: boolean }) => !r.noShow).length
  const completionRate = (completedExperiences / allReviews.length) * 100

  // Calculate no-show count
  const noShowCount = allReviews.filter((r: { noShow: boolean }) => r.noShow).length

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
 */
export async function updateStudentMetrics(studentId: string) {
  const db = requireDatabase()
  return await updateStudentMetricsInternal(db, studentId)
}



/**
 * Get all reviews for a student (cached for 10 minutes)
 */
export async function getStudentReviews(studentId: string) {
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
          pricePaid: true,
          isAnonymous: true,
          request: {
            select: {
              city: true,
              dates: true,
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
    ? ((totalReviews - student.noShowCount) / totalReviews) * 100
    : 0

  return {
    averageRating: student.averageRating ?? 0,
    completionRate,
    reliabilityBadge: (student.reliabilityBadge as ReliabilityBadge) ?? 'bronze',
    totalReviews,
  }
}
