export type StudentPublic = {
  id: string
  name: string | null
  city: string | null
  institute: string | null
  averageRating: number | null
  tripsHosted: number
  reliabilityBadge: string | null
}

export function serializeStudentPublic(student: any): StudentPublic {
  return {
    id: student.id,
    name: student.name ?? null,
    city: student.city ?? null,
    institute: student.institute ?? null,
    averageRating: student.averageRating ?? null,
    tripsHosted: student.tripsHosted ?? 0,
    reliabilityBadge: student.reliabilityBadge ?? null,
  }
}

export type ReviewPublic = {
  id: string
  rating: number
  text: string | null
  createdAt: Date
  attributes: string[]
  pricePaid: number | null
  isAnonymous: boolean
}

export function serializeReviewPublic(review: any): ReviewPublic {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text ?? null,
    createdAt: review.createdAt,
    attributes: review.attributes ?? [],
    pricePaid: review.pricePaid ?? null,
    isAnonymous: review.isAnonymous ?? false,
  }
}

export type ReportPublic = {
  id: string
  reason: string | null
  status: string
  createdAt: Date
  student?: {
    id: string
    name: string | null
    city: string | null
    status: string
  }
}

export function serializeReportPublic(report: any): ReportPublic {
  return {
    id: report.id,
    reason: report.reason ?? null,
    status: report.status,
    createdAt: report.createdAt,
    student: report.student
      ? {
          id: report.student.id,
          name: report.student.name ?? null,
          city: report.student.city ?? null,
          status: report.student.status,
        }
      : undefined,
  }
}

export type SelectionPublic = {
  id: string
  requestId: string
  studentId: string
  status: string
}

export function serializeSelectionPublic(selection: any): SelectionPublic {
  return {
    id: selection.id,
    requestId: selection.requestId,
    studentId: selection.studentId,
    status: selection.status,
  }
}
