'use client'

/**
 * ⚠️ DEVELOPER BYPASS AUTHENTICATION ⚠️
 *
 * This file provides a mock authentication system for local development only.
 * It bypasses Google OAuth to allow testing as different user types.
 *
 * TO DISABLE FOR PRODUCTION:
 * Set environment variable: NEXT_PUBLIC_DEV_AUTH_BYPASS=false
 * Or delete this file and remove imports in providers.tsx
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Session } from 'next-auth'

type DevUserType = 'tourist' | 'student' | null

interface DevAuthContextType {
  session: Session | null
  devUserType: DevUserType
  setDevUserType: (type: DevUserType) => void
  isDevBypassEnabled: boolean
}

const DevAuthContext = createContext<DevAuthContextType>({
  session: null,
  devUserType: null,
  setDevUserType: () => {},
  isDevBypassEnabled: false,
})

export function useDevAuth() {
  return useContext(DevAuthContext)
}

export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const [devUserType, setDevUserType] = useState<DevUserType>(null)
  const [mounted, setMounted] = useState(false)

  // Check if dev bypass is enabled
  const isDevBypassEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'false'

  useEffect(() => {
    setMounted(true)
    // Load saved dev user type from localStorage
    if (isDevBypassEnabled && typeof window !== 'undefined') {
      const saved = localStorage.getItem('dev_user_type') as DevUserType
      if (saved === 'tourist' || saved === 'student') {
        setDevUserType(saved)
      }
    }
  }, [isDevBypassEnabled])

  useEffect(() => {
    // Save to localStorage when changed
    if (isDevBypassEnabled && mounted && typeof window !== 'undefined') {
      if (devUserType) {
        localStorage.setItem('dev_user_type', devUserType)
      } else {
        localStorage.removeItem('dev_user_type')
      }
    }
  }, [devUserType, isDevBypassEnabled, mounted])

  // Create mock session based on dev user type
  const session: Session | null = devUserType
    ? {
        user: {
          id: devUserType === 'tourist' ? 'dev-tourist-123' : 'dev-student-456',
          email:
            devUserType === 'tourist'
              ? 'dev.tourist@gmail.com'
              : 'dev.student@university.edu',
          name: devUserType === 'tourist' ? 'Dev Tourist' : 'Dev Student',
          image: devUserType === 'tourist'
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
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }
    : null

  return (
    <DevAuthContext.Provider
      value={{
        session,
        devUserType,
        setDevUserType,
        isDevBypassEnabled,
      }}
    >
      {children}
    </DevAuthContext.Provider>
  )
}
