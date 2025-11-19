export interface CreateReviewInput {
  requestId: string
  studentId: string
  rating: number // 1-5, required
  text?: string // optional, max 500 chars
  attributes: string[] // from predefined list
  noShow: boolean
  pricePaid?: number // optional
  isAnonymous?: boolean // default false
}

export interface ReviewMetrics {
  averageRating: number
  completionRate: number
  reliabilityBadge: 'bronze' | 'silver' | 'gold'
  totalReviews: number
}

export type ReliabilityBadge = 'bronze' | 'silver' | 'gold'
