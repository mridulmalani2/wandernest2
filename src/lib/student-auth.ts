import { prisma } from '@/lib/prisma'
import type { StudentSession } from '@prisma/client'

/**
 * Safe subset of Student fields returned by getStudentFromSession
 * SECURITY: Excludes sensitive fields like passwordHash, identity document URLs
 */
export interface SafeStudent {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  dateOfBirth: Date | null
  gender: string | null
  nationality: string | null
  phoneNumber: string | null
  city: string | null
  campus: string | null
  institute: string | null
  programDegree: string | null
  yearOfStudy: string | null
  expectedGraduation: string | null
  bio: string | null
  skills: string[]
  preferredGuideStyle: string | null
  coverLetter: string | null
  languages: string[]
  interests: string[]
  servicesOffered: string[]
  hourlyRate: number | null
  onlineServicesAvailable: boolean
  timezone: string | null
  preferredDurations: string[]
  termsAccepted: boolean
  safetyGuidelinesAccepted: boolean
  independentGuideAcknowledged: boolean
  status: string
  profileCompleteness: number | null
  tripsHosted: number
  averageRating: number | null
  noShowCount: number
  acceptanceRate: number | null
  reliabilityBadge: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Fields to select from Student table - excludes sensitive data
 * SECURITY: Never include passwordHash, governmentIdUrl, studentIdUrl, selfieUrl, etc.
 */
const SAFE_STUDENT_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  dateOfBirth: true,
  gender: true,
  nationality: true,
  phoneNumber: true,
  city: true,
  campus: true,
  institute: true,
  programDegree: true,
  yearOfStudy: true,
  expectedGraduation: true,
  bio: true,
  skills: true,
  preferredGuideStyle: true,
  coverLetter: true,
  languages: true,
  interests: true,
  servicesOffered: true,
  hourlyRate: true,
  onlineServicesAvailable: true,
  timezone: true,
  preferredDurations: true,
  termsAccepted: true,
  safetyGuidelinesAccepted: true,
  independentGuideAcknowledged: true,
  status: true,
  profileCompleteness: true,
  tripsHosted: true,
  averageRating: true,
  noShowCount: true,
  acceptanceRate: true,
  reliabilityBadge: true,
  createdAt: true,
  updatedAt: true,
  // SECURITY: Explicitly NOT including:
  // - passwordHash
  // - googleId
  // - studentIdUrl, studentIdExpiry
  // - governmentIdUrl, governmentIdExpiry
  // - selfieUrl, profilePhotoUrl
  // - verificationConsent, documentsOwnedConfirmation
  // - idCardUrl
  // - emergencyContactName, emergencyContactPhone
  // - unavailableDates, priceRange
  // - approvalReminderSentAt, approvalFollowUpReminderSentAt
} as const

export async function getValidStudentSession(token?: string | null) {
  if (!token) return null

  // SECURITY: Validate token is a non-empty string
  if (typeof token !== 'string' || token.trim() === '') {
    return null
  }

  const session = await prisma.studentSession.findUnique({ where: { token } })
  if (!session) return null

  const now = new Date()
  if (!session.isVerified || session.expiresAt < now) {
    return null
  }

  return session
}

/**
 * Get student from session with ONLY safe fields
 * SECURITY: Never returns passwordHash or identity document URLs
 */
export async function getStudentFromSession(session: StudentSession): Promise<SafeStudent | null> {
  // SECURITY: Validate session has required identifiers
  if (!session) {
    return null
  }

  if (session.studentId) {
    return prisma.student.findUnique({
      where: { id: session.studentId },
      select: SAFE_STUDENT_SELECT,
    })
  }

  // SECURITY: Validate email before using in query
  if (!session.email || typeof session.email !== 'string' || session.email.trim() === '') {
    return null
  }

  return prisma.student.findUnique({
    where: { email: session.email },
    select: SAFE_STUDENT_SELECT,
  })
}

/**
 * Parse a single cookie from a cookie string, handling '=' in values correctly
 * SECURITY: Properly handles base64 and other tokens containing '=' characters
 */
function parseCookieValue(cookieString: string, cookieName: string): string | undefined {
  const prefix = `${cookieName}=`
  const entries = cookieString.split(';').map(e => e.trim())

  for (const entry of entries) {
    if (entry.startsWith(prefix)) {
      // SECURITY: Use substring instead of split to preserve '=' in value
      // e.g., "token=abc=def=ghi" -> "abc=def=ghi" (not just "abc")
      return entry.substring(prefix.length)
    }
  }
  return undefined
}

/**
 * Read student token from request
 * SECURITY: Only reads from the provided Request object, never falls back to server context
 */
export async function readStudentTokenFromRequest(req: Request): Promise<string | undefined> {
  const COOKIE_NAME = 'student_session_token'

  // Route handlers in Next 14 expose request.cookies on NextRequest
  const requestWithCookies = req as {
    cookies?: { get?: (name: string) => { value?: string } | undefined }
  }

  if (typeof requestWithCookies.cookies?.get === 'function') {
    const cookieValue = requestWithCookies.cookies.get(COOKIE_NAME)?.value
    if (cookieValue) {
      return cookieValue
    }
  }

  // Fall back to parsing the cookie header manually
  const cookieHeader = req.headers.get('cookie')
  if (cookieHeader) {
    const token = parseCookieValue(cookieHeader, COOKIE_NAME)
    if (token) {
      return token
    }
  }

  // SECURITY: Do NOT fall back to cookies() from next/headers
  // That reads from server-side context which may belong to a different request
  // If we reach here, the token simply wasn't provided in the request
  return undefined
}
