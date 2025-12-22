'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import dynamic from 'next/dynamic'

// Lazy load the 3D Landing Page - reduces initial bundle size significantly
// Falls back to static version on mobile/low-end devices
const LandingPage3D = dynamic(
  () => import('@/components/landing3d').then(mod => ({ default: mod.LandingPage3D })),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0f0f2f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-white/60 text-sm font-light">Loading experience...</p>
        </div>
      </div>
    ),
    ssr: false // 3D requires client-side rendering
  }
)

/**
 * Main Landing Page Component
 *
 * Features a spatial 3D journey experience:
 * - Scroll-driven camera movement through 3D space
 * - Three distinct zones: Gateway (hero), Crossroads (CTAs), Constellation (features)
 * - Mouse/touch parallax for depth feel
 * - Automatic fallback for mobile/low-end devices
 *
 * Includes SEO structured data and lazy-loaded components for performance.
 */
export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* Fixed Navigation - overlays the 3D scene */}
      <Navigation variant="default" />

      {/* 3D Spatial Landing Experience */}
      <main className="flex-1 relative">
        <LandingPage3D />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
