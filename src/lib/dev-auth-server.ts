/**
 * ⚠️ SERVER-SIDE DEV AUTH BYPASS ⚠️
 *
 * Helper functions for bypassing authentication in API routes during development.
 * This allows local testing without Google OAuth.
 *
 * TO DISABLE FOR PRODUCTION:
 * Set environment variable: NEXT_PUBLIC_DEV_AUTH_BYPASS=false
 */

import { NextRequest } from 'next/server'
import { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const isDevelopment = process.env.NODE_ENV === 'development'
const isDevBypassEnabled =
  isDevelopment && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'false'

/**
 * Get session with dev bypass support
 * Checks for x-dev-user-type header in development mode
 */
export async function getSessionWithDevBypass(
  req: NextRequest
): Promise<Session | null> {
  // In production, always use real auth
  if (!isDevBypassEnabled) {
    return await getServerSession(authOptions)
  }

  // Check for dev bypass header
  const devUserType = req.headers.get('x-dev-user-type')

  if (devUserType === 'tourist' || devUserType === 'student') {
    // Return mock session for dev
    return {
      user: {
        id: devUserType === 'tourist' ? 'dev-tourist-123' : 'dev-student-456',
        email:
          devUserType === 'tourist'
            ? 'dev.tourist@gmail.com'
            : 'dev.student@university.edu',
        name: devUserType === 'tourist' ? 'Dev Tourist' : 'Dev Student',
        image:
          devUserType === 'tourist'
            ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=tourist'
            : 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
        userType: devUserType,
        ...(devUserType === 'tourist'
          ? {
              touristId: 'dev-tourist-profile-123',
            }
          : {
              studentId: 'dev-student-profile-456',
              studentStatus: 'approved' as const,
              hasCompletedOnboarding: true,
            }),
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    } as Session
  }

  // No dev bypass header, try real auth
  return await getServerSession(authOptions)
}
