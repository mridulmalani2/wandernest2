'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import with loading state to reduce initial bundle
const Navigation = dynamic(() => import('@/components/Navigation'), {
  loading: () => (
    <header className="border-b border-border/30 glass-card sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </header>
  ),
  ssr: false, // Don't render on server - navigation is interactive only
})

export function DynamicNavigation({ variant, showBackButton, backHref }: {
  variant?: 'default' | 'tourist' | 'student' | 'admin'
  showBackButton?: boolean
  backHref?: string
}) {
  return (
    <Suspense fallback={
      <header className="border-b border-border/30 glass-card sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </header>
    }>
      <Navigation variant={variant} showBackButton={showBackButton} backHref={backHref} />
    </Suspense>
  )
}
