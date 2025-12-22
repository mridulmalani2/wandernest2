'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import dynamic from 'next/dynamic'

// Lazy load the 3D Hero - reduces initial bundle size significantly
// Falls back to static version on mobile/low-end devices
const Hero3D = dynamic(() => import('@/components/hero3d').then(mod => ({ default: mod.Hero3D })), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 animate-pulse" />
  ),
  ssr: false // 3D requires client-side rendering
})

// Lazy load WhyChooseCarousel - only when component is in view
const WhyChooseCarousel = dynamic(() => import('@/components/WhyChooseCarousel'), {
  loading: () => <div className="mt-14 lg:mt-20 h-[500px] animate-pulse bg-white/10 rounded-3xl" />,
  ssr: false
})

/**
 * Main Landing Page Component
 *
 * Features a depth-based 3D hero section with:
 * - Real 3D image planes via Three.js
 * - Mouse-responsive parallax
 * - Scroll-triggered depth transitions
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

      {/* 3D Hero Section - starts at viewport top, navigation overlays it */}
      <main className="flex-1 relative">
        <Hero3D />

        {/* Why Choose Carousel - Below Hero */}
        <section className="relative z-10 bg-gradient-to-b from-transparent via-black/80 to-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="max-w-6xl mx-auto">
              <WhyChooseCarousel />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
