import 'server-only'
import { prisma } from '@/lib/prisma'
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
export async function createReview(input: CreateReviewInput) {
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

  // Check if review already exists for this request
  const existingReview = await prisma.review.findUnique({
    where: { requestId: input.requestId },
  })

  if (existingReview) {
    throw new Error('A review already exists for this request')
  }

  // Create the review
  const review = await prisma.review.create({
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

  // Update student metrics
  await updateStudentMetrics(input.studentId, review)

  // Invalidate student caches
  await cacheInvalidation.student(input.studentId)

  return review
}

/**
 * Updates student metrics based on all their reviews
 * Calculates average rating, completion rate, and reliability badge
 */
export async function updateStudentMetrics(
  studentId: string,
  newReview?: any
) {
  // Get only necessary review fields for calculations (optimized)
  const allReviews = await prisma.review.findMany({
    where: { studentId },
    select: {
      rating: true,
      noShow: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (allReviews.length === 0) {
    return
  }

  // Calculate new average rating
  const newAverage =
    allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length

  // Calculate completion rate (percentage of non-no-show experiences)
  const completedExperiences = allReviews.filter((r) => !r.noShow).length
  const completionRate = (completedExperiences / allReviews.length) * 100

  // Calculate no-show count
  const noShowCount = allReviews.filter((r) => r.noShow).length

  // Determine reliability badge
  let badge: ReliabilityBadge = 'bronze'
  if (completionRate >= 95 && allReviews.length >= 10) {
    badge = 'gold'
  } else if (completionRate >= 90 && allReviews.length >= 5) {
    badge = 'silver'
  }

  // Update student record
  await prisma.student.update({
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
  } as ReviewMetrics
}

/**
 * Get all reviews for a student (cached for 10 minutes)
 */
export async function getStudentReviews(studentId: string) {
  return cache.cached(
    `student:${studentId}:reviews`,
    async () => {
      return prisma.review.findMany({
        where: { studentId },
        include: {
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
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
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
