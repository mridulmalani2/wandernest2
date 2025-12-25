'use client'

import { useRef, useState, useEffect, Suspense, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import Image from 'next/image'
import { LandingPage3DProps, PointerState } from './types'
import { useScrollHijack, usePointerParallax, useDeviceCapabilities } from './hooks'
import { LandingFallback } from './LandingFallback'
import {
  AtmosphericBackground,
  HeroSectionPhased,
  ScrollProgressIndicator,
  FinalStepCards,
} from './components'
import UserJourney3D from '@/components/landing3d/components/UserJourney3D'
import { WarpTransition } from '@/components/transitions/WarpTransition'
import { useWarpNavigation } from '@/hooks/useWarpNavigation'

/**
 * LandingPage3D - Two-Section Landing Page
 *
 * SECTION 1 (Top - Hero):
 * - Scroll hijacking controls animation phases
 * - Scroll down: reveals title → subtitle → description → CTA cards
 * - Scroll up: reverses the animation
 * - After complete, shows "discover more" indicator
 *
 * SECTION 2 (Below - Carousel):
 * - Scroll down from Section 1 to reach this
 * - Horizontal 3D carousel with glassmorphic cards
 * - Swipe/drag/arrows to navigate horizontally
 */

// Error Boundary for WebGL failures
interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    console.warn('LandingPage3D: WebGL error, falling back to static version', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Loading placeholder
function LoadingPlaceholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0f0f2f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-white/60 text-sm font-light">Loading experience...</p>
      </div>
    </div>
  )
}

// Accessibility layer
function AccessibilityLayer({ is3DActive }: { is3DActive: boolean }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${is3DActive ? 'sr-only' : ''}`}
      aria-hidden={is3DActive}
    >
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

// The 3D scene for hero section
function HeroScene({
  currentPhase,
  phaseProgress,
  totalProgress,
  pointerState,
  isVisible,
  isHijackComplete,
}: {
  currentPhase: number
  phaseProgress: number
  totalProgress: number
  pointerState: PointerState
  isVisible: boolean
  isHijackComplete: boolean
}) {
  const pointerOffset = {
    x: pointerState.smoothX,
    y: pointerState.smoothY,
  }

  return (
    <>
      <AtmosphericBackground scrollProgress={0} pointerOffset={pointerOffset} />
      <Suspense fallback={null}>
        <HeroSectionPhased
          currentPhase={currentPhase}
          phaseProgress={phaseProgress}
          totalProgress={totalProgress}
          pointerOffset={pointerOffset}
          isVisible={isVisible}
          isHijackComplete={isHijackComplete}
        />
      </Suspense>
      {/* PathwayCardsPhased removed - replaced by FinalStepCards HTML overlay */}
      <Preload all />
    </>
  )
}

// Centered scroll indicator for initial state (Phase 0) - gamified experience
function ScrollToExploreIndicator({ show }: { show: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-30 transition-all duration-700 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Main text */}
        <h1
          className="text-white text-4xl md:text-6xl font-serif font-light text-center"
          style={{
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
            animation: 'fadeInUp 1s ease-out',
          }}
        >
          Scroll to Explore
        </h1>

        {/* Animated scroll indicator */}
        <div className="relative mt-4">
          {/* Glow effect */}
          <div
            className="absolute -inset-6 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(ellipse, rgba(107, 141, 214, 0.4) 0%, rgba(155, 123, 214, 0.3) 50%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Mouse/scroll icon */}
          <div
            className="relative w-8 h-14 rounded-full border-2 border-white/40 flex justify-center pt-2"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            {/* Scroll wheel dot */}
            <div
              className="w-1.5 h-3 rounded-full bg-white/70"
              style={{ animation: 'scrollWheel 1.5s ease-in-out infinite' }}
            />
          </div>

          {/* Down arrows */}
          <div
            className="flex flex-col items-center mt-4 gap-0"
            style={{ animation: 'bounceArrows 2s ease-in-out infinite' }}
          >
            <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-6 h-6 text-white/30 -mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes scrollWheel {
          0%, 100% {
            opacity: 0.7;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(6px);
          }
        }
        @keyframes bounceArrows {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(8px);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}

// "Discover More" indicator that appears after hero animation completes
function DiscoverMoreIndicator({ show }: { show: boolean }) {
  return (
    <div
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-light">
          Discover More
        </span>
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-full blur-xl scale-150" />
          {/* Arrow container */}
          <div
            className="relative w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm"
            style={{ animation: 'bounce 2s infinite' }}
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// SectionTransition removed - Discover tab in FinalStepCards provides this functionality

export function LandingPage3D({ className = '' }: LandingPage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Device capability detection
  const { canRender3D, isMobile, prefersReducedMotion, pixelRatio } = useDeviceCapabilities()

  // Scroll hijacking for hero animations
  const hijackState = useScrollHijack(canRender3D && !prefersReducedMotion && isReady)

  // Pointer tracking for parallax
  const pointerState = usePointerParallax(canRender3D && !isMobile)

  // Visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Mark as ready after hydration
  useEffect(() => {
    setIsReady(true)
  }, [])

  // Determine rendering mode
  const should3DRender = canRender3D && !prefersReducedMotion && isReady

  // Fallback for non-3D capable devices
  if (!should3DRender && isReady) {
    return <LandingFallback />
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ============================================ */}
      {/* SECTION 1: Hero with Scroll Hijacking       */}
      {/* ============================================ */}
      <section
        className="relative h-screen w-full"
        style={{
          position: hijackState.isLocked ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: hijackState.isLocked ? 20 : 1,
        }}
      >
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
          {/* Dark overlay gradient for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,26,0.7) 0%, rgba(10,10,26,0.4) 40%, rgba(10,10,26,0.8) 100%)',
            }}
          />
        </div>

        {/* 3D Canvas - transparent background to show Paris image */}
        {!isReady ? (
          <LoadingPlaceholder />
        ) : (
          <WebGLErrorBoundary fallback={<LandingFallback />}>
            <Suspense fallback={<LoadingPlaceholder />}>
              <Canvas
                camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                  failIfMajorPerformanceCaveat: true,
                }}
                dpr={[1, Math.min(pixelRatio, 2)]}
                frameloop="always"
                resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
                className="!absolute inset-0 z-10"
                style={{ background: 'transparent' }}
              >
                <HeroScene
                  currentPhase={hijackState.currentPhase}
                  phaseProgress={hijackState.phaseProgress}
                  totalProgress={hijackState.totalProgress}
                  pointerState={pointerState}
                  isVisible={isVisible}
                  isHijackComplete={hijackState.isComplete}
                />
              </Canvas>
            </Suspense>
          </WebGLErrorBoundary>
        )}

        {/* Phase 0: Centered scroll indicator - gamified experience */}
        <ScrollToExploreIndicator show={hijackState.currentPhase === 0 && isReady} />

        {/* Scroll Progress Indicator (during hijack, hidden in phase 0) */}
        <ScrollProgressIndicator
          currentPhase={hijackState.currentPhase}
          totalProgress={hijackState.totalProgress}
          isComplete={hijackState.isComplete}
          isVisible={isVisible && isReady && hijackState.isLocked && hijackState.currentPhase > 0}
        />

        {/* FinalStepCards - HTML overlay for Phase 2 (cards phase) */}
        {/* New phase system: Phase 0 = initial, Phase 1 = text, Phase 2 = cards (frozen) */}
        <FinalStepCards
          currentPhase={hijackState.currentPhase === 2 ? 4 : 0}
          phaseProgress={hijackState.currentPhase === 2 ? 1 : 0}
          isHijackComplete={hijackState.isComplete}
          onLearnMoreClick={() => {
            const carousel = document.getElementById('user-journey-carousel')
            if (carousel) {
              carousel.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        />

        {/* "Discover More" indicator (after hijack completes) */}
        <DiscoverMoreIndicator show={hijackState.isComplete && !hijackState.isLocked} />
      </section>

      {/* Spacer when hero is fixed */}
      {hijackState.isLocked && <div className="h-screen" />}

      {/* ============================================ */}
      {/* SECTION 2: Horizontal 3D Carousel           */}
      {/* ============================================ */}
      <section
        id="user-journey-carousel"
        className="relative min-h-screen overflow-hidden"
      >
        {/* Paris Night Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
            alt="Paris at night"
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.25) saturate(0.7)',
            }}
          />
          {/* Dark overlay gradient for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,26,0.85) 0%, rgba(10,10,26,0.6) 40%, rgba(10,10,26,0.85) 100%)',
            }}
          />
        </div>

        {/* CSS Star Field Animation */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {/* Layer 1: Small distant stars */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(1px 1px at 20px 30px, rgba(107, 141, 214, 0.8), transparent),
                radial-gradient(1px 1px at 40px 70px, rgba(155, 123, 214, 0.6), transparent),
                radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.7), transparent),
                radial-gradient(1px 1px at 90px 40px, rgba(107, 141, 214, 0.5), transparent),
                radial-gradient(1px 1px at 130px 80px, rgba(155, 123, 214, 0.7), transparent),
                radial-gradient(1px 1px at 160px 120px, rgba(255, 255, 255, 0.6), transparent),
                radial-gradient(1px 1px at 200px 20px, rgba(107, 141, 214, 0.6), transparent),
                radial-gradient(1px 1px at 250px 90px, rgba(155, 123, 214, 0.5), transparent),
                radial-gradient(1px 1px at 300px 150px, rgba(255, 255, 255, 0.8), transparent),
                radial-gradient(1px 1px at 350px 60px, rgba(107, 141, 214, 0.7), transparent),
                radial-gradient(1px 1px at 400px 130px, rgba(155, 123, 214, 0.6), transparent),
                radial-gradient(1px 1px at 450px 30px, rgba(255, 255, 255, 0.5), transparent),
                radial-gradient(1px 1px at 500px 100px, rgba(107, 141, 214, 0.8), transparent),
                radial-gradient(1px 1px at 550px 180px, rgba(155, 123, 214, 0.7), transparent),
                radial-gradient(1px 1px at 600px 50px, rgba(255, 255, 255, 0.6), transparent)
              `,
              backgroundSize: '650px 200px',
              animation: 'twinkle 8s ease-in-out infinite',
            }}
          />
          {/* Layer 2: Medium stars */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(2px 2px at 100px 50px, rgba(107, 141, 214, 0.9), transparent),
                radial-gradient(2px 2px at 220px 140px, rgba(155, 123, 214, 0.8), transparent),
                radial-gradient(2px 2px at 340px 80px, rgba(255, 255, 255, 0.7), transparent),
                radial-gradient(2px 2px at 480px 170px, rgba(107, 141, 214, 0.6), transparent),
                radial-gradient(2px 2px at 580px 110px, rgba(155, 123, 214, 0.8), transparent)
              `,
              backgroundSize: '700px 220px',
              animation: 'twinkle 6s ease-in-out infinite 1s',
            }}
          />
          {/* Layer 3: Floating particles */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/40"
            style={{
              top: '15%',
              left: '10%',
              animation: 'floatParticle 12s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(155, 123, 214, 0.5)',
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-blue-400/30"
            style={{
              top: '40%',
              right: '15%',
              animation: 'floatParticle 15s ease-in-out infinite 2s',
              boxShadow: '0 0 12px rgba(107, 141, 214, 0.4)',
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full bg-white/50"
            style={{
              top: '70%',
              left: '25%',
              animation: 'floatParticle 10s ease-in-out infinite 1s',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-300/35"
            style={{
              top: '25%',
              right: '30%',
              animation: 'floatParticle 14s ease-in-out infinite 3s',
              boxShadow: '0 0 10px rgba(155, 123, 214, 0.4)',
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full bg-blue-300/40"
            style={{
              top: '55%',
              left: '60%',
              animation: 'floatParticle 11s ease-in-out infinite 0.5s',
              boxShadow: '0 0 8px rgba(107, 141, 214, 0.3)',
            }}
          />
        </div>

        {/* The Horizontal Carousel */}
        <div className="relative z-10">
          <UserJourney3D />
        </div>

        {/* Bottom padding */}
        <div className="h-20" />

        {/* Star animation keyframes */}
        <style jsx>{`
          @keyframes twinkle {
            0%, 100% {
              opacity: 0.7;
            }
            50% {
              opacity: 1;
            }
          }
          @keyframes floatParticle {
            0%, 100% {
              transform: translateY(0) translateX(0);
              opacity: 0.4;
            }
            25% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-10px) translateX(-15px);
              opacity: 0.5;
            }
            75% {
              transform: translateY(-25px) translateX(5px);
              opacity: 0.8;
            }
          }
        `}</style>
      </section>

      {/* Accessibility layer */}
      <AccessibilityLayer is3DActive={should3DRender} />

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg z-50 font-mono space-y-1">
          <div>Phase: {hijackState.currentPhase} ({(hijackState.phaseProgress * 100).toFixed(0)}%)</div>
          <div>Total: {(hijackState.totalProgress * 100).toFixed(1)}%</div>
          <div>Locked: {hijackState.isLocked ? 'Yes' : 'No'} | Dir: {hijackState.direction}</div>
        </div>
      )}
    </div>
  )
}

export default LandingPage3D
