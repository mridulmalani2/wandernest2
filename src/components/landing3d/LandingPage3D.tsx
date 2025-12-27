'use client'

import Image from 'next/image'
import { FinalStepCards } from './components'
import UserJourney3D from '@/components/landing3d/components/UserJourney3D'
import { useDeviceCapabilities } from './hooks'

/**
 * LandingPage3D - Refactored for Immediate Cards View
 * 
 * SECTION 1 (Top - Hero):
 * - Displays FinalStepCards (Student | Discover | Tourist) immediately.
 * - No scroll hijacking or intro animations.
 * - Background is static Paris Night image.
 * 
 * SECTION 2 (Below):
 * - UserJourney3D Carousel.
 */

// Accessibility layer
function AccessibilityLayer() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 sr-only">
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-serif font-bold text-white sr-only">
          TourWise - Experience Authentic Travel with Local Student Guides
        </h1>
        <nav aria-label="Main navigation" className="sr-only">
          <a href="/tourist">I&apos;m a Tourist</a>
          <a href="/student">I&apos;m a Student - Become a Guide</a>
        </nav>
      </div>
    </div>
  )
}

// "Discover More" indicator
function DiscoverMoreIndicator({ onClick }: { onClick: () => void }) {
  return (
    // Fixed: Removed animate-fade-in which might cause layout shift. 
    // Uses standard centering transform.
    <button
      onClick={onClick}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer hover:scale-105 transition-transform duration-300"
      aria-label="Scroll to discover more"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-light">
          Discover More
        </span>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-full blur-xl scale-150" />
          <div
            className="relative w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm animate-bounce"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}

export function LandingPage3D({ className = '' }: { className?: string }) {
  // Device Check (Non-blocking)
  useDeviceCapabilities()

  const scrollToCarousel = () => {
    const carousel = document.getElementById('user-journey-carousel')
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* ============================================ */}
      {/* SECTION 1: Hero Cards (Immediate View)      */}
      {/* ============================================ */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Paris Night Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
            alt="Paris at night"
            fill
            priority
            className="object-cover"
            style={{
              filter: 'brightness(0.3) saturate(0.8)',
            }}
          />
          {/* Dark overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,26,0.7) 0%, rgba(10,10,26,0.4) 40%, rgba(10,10,26,0.8) 100%)',
            }}
          />
        </div>

        {/* FinalStepCards - Shown Immediately */}
        <FinalStepCards
          currentPhase={4}
          phaseProgress={1}
          isHijackComplete={true}
          onLearnMoreClick={scrollToCarousel}
        />

        {/* Discover More Indicator */}
        <DiscoverMoreIndicator onClick={scrollToCarousel} />
      </section>

      {/* ============================================ */}
      {/* SECTION 2: Horizontal 3D Carousel           */}
      {/* ============================================ */}
      <section
        id="user-journey-carousel"
        className="relative min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2f] to-[#0a0a1a]"
      >
        <UserJourney3D />
        <div className="h-20" />
      </section>

      {/* Accessibility layer */}
      <AccessibilityLayer />
    </div>
  )
}

export default LandingPage3D
