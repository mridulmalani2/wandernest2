'use client'

import Footer from '@/components/Footer'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import { LandingPage3D } from '@/components/landing3d'

/**
 * Main Landing Page Component
 *
 * NOW: Cards Only (Student | Discover | Tourist) + Carousel
 * Optimized for instant load (static import).
 */
export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()
  const toSafeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(organizationData) }}
      />

      {/* Landing Experience (Cards + Carousel) */}
      <main className="flex-1 relative">
        <LandingPage3D />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
