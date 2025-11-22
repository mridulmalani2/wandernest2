'use client'

/**
 * Custom useAuth hook that uses dev bypass in development
 * or real NextAuth session in production
 */

import { useSession as useNextAuthSession } from 'next-auth/react'
import { useDevAuth } from './dev-auth-bypass'

export function useAuth() {
  const realSession = useNextAuthSession()
  const devAuth = useDevAuth()

  // In development with bypass enabled, use dev session
  if (devAuth.isDevBypassEnabled && devAuth.session) {
    return {
      data: devAuth.session,
      status: 'authenticated' as const,
    }
  }

  // In development with bypass enabled but no dev user selected
  if (devAuth.isDevBypassEnabled && !devAuth.session) {
    return {
      data: null,
      status: 'unauthenticated' as const,
    }
  }

  // Otherwise use real NextAuth session
  return realSession
}
