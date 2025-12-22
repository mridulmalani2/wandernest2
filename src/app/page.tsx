'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import dynamic from 'next/dynamic'

// Lazy load the Spatial 3D Landing Page - reduces initial bundle size significantly
// Falls back to static version on mobile/low-end devices
const LandingPage3D = dynamic(
  () => import('@/components/spatial-landing').then(mod => ({ default: mod.LandingPage3D })),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 animate-pulse" />
    ),
    ssr: false // 3D requires client-side rendering
  }
)

/**
 * Main Landing Page Component
 *
 * Features a fully spatial, 3D-native landing page experience:
 * - Single persistent Three.js canvas for entire experience
 * - Scroll drives camera movement through Z-space
 * - Sections are positioned in real 3D depth
 * - Text and UI exist as physical objects in 3D
 * - Mouse parallax for depth perception
 * - Cinematic section transitions
 * - Automatic fallback for mobile/low-end devices
 *
 * The page feels like the user is moving through a 3D scene,
 * not scrolling a document. Spatial storytelling with UI.
 *
 * Includes SEO structured data and lazy-loaded components for performance.
 */
export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* Fixed Navigation - overlays the 3D scene at z-index 50 */}
      <Navigation variant="default" />

      {/* Spatial 3D Landing Experience */}
      <main className="flex-1 relative">
        <LandingPage3D />
      </main>

      {/* Footer - positioned at end of scroll */}
      <Footer />
    </div>
  )
}
