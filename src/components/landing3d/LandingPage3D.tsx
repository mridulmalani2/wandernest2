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
  PathwayCardsPhased,
  ScrollProgressIndicator,
} from './components'
import UserJourney3D from '@/components/landing3d/components/UserJourney3D'

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
          <a href="/tourist">I&apos;m a Tourist - Book a Guide</a>
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
      <Suspense fallback={null}>
        <PathwayCardsPhased
          currentPhase={currentPhase}
          phaseProgress={phaseProgress}
          pointerOffset={pointerOffset}
          isHijackComplete={isHijackComplete}
        />
      </Suspense>
      <Preload all />
    </>
  )
}

// "Discover More" indicator that appears after hero animation completes
function DiscoverMoreIndicator({ show }: { show: boolean }) {
  return (
    <div
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-700 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
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

// Transition popup between sections - "Learn how it works"
function SectionTransition() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenSeen, setHasBeenSeen] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenSeen) {
          // Delay popup appearance for dramatic effect
          setTimeout(() => {
            setIsVisible(true)
            setHasBeenSeen(true)
          }, 300)
        } else if (!entry.isIntersecting && hasBeenSeen) {
          setIsVisible(false)
        }
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasBeenSeen])

  // Collapse the section after popup has been seen and scrolled away
  const shouldCollapse = hasBeenSeen && !isVisible

  return (
    <div
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-out"
      style={{
        height: shouldCollapse ? '0px' : '50vh',
        opacity: shouldCollapse ? 0 : 1,
        background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d25 50%, #0a0a1a 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div
          className="absolute w-2 h-2 rounded-full bg-purple-500/30"
          style={{
            top: '20%',
            left: '15%',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-blue-500/20"
          style={{
            top: '60%',
            right: '20%',
            animation: 'float 8s ease-in-out infinite 1s',
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/25"
          style={{
            bottom: '30%',
            left: '30%',
            animation: 'float 7s ease-in-out infinite 0.5s',
          }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(107, 141, 214, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(107, 141, 214, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main popup card */}
      <div
        className={`relative z-10 transition-all duration-1000 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-12 scale-95'
        }`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect behind card */}
        <div
          className="absolute -inset-8 rounded-3xl opacity-60 blur-2xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(107, 141, 214, 0.3) 0%, rgba(155, 123, 214, 0.2) 40%, transparent 70%)',
          }}
        />

        {/* The card itself */}
        <div
          className="relative px-12 py-8 rounded-2xl border border-white/10 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 60px rgba(107, 141, 214, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            transform: isVisible ? 'rotateX(0deg)' : 'rotateX(-10deg)',
            transition: 'transform 1s ease-out',
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 141, 214, 0.3) 0%, rgba(155, 123, 214, 0.3) 100%)',
                boxShadow: '0 4px 20px rgba(107, 141, 214, 0.3)',
              }}
            >
              <svg
                className="w-6 h-6 text-white/90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
          </div>

          {/* Text */}
          <h2
            className="text-center text-2xl md:text-3xl font-serif font-light text-white mb-2"
            style={{
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            Learn How It Works
          </h2>
          <p className="text-center text-white/50 text-sm md:text-base font-light max-w-xs">
            Discover the journey from booking to experiencing your city
          </p>

          {/* Subtle animated border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{
              opacity: isVisible ? 0.3 : 0,
              transition: 'opacity 1.5s ease-out',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(107, 141, 214, 0.5), transparent)',
                animation: 'spin 8s linear infinite',
              }}
            />
          </div>
        </div>

        {/* Down arrow indicator */}
        <div
          className={`flex justify-center mt-6 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div
            className="flex flex-col items-center gap-1"
            style={{ animation: 'gentleFloat 3s ease-in-out infinite' }}
          >
            <svg
              className="w-5 h-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <svg
              className="w-5 h-5 text-white/20 -mt-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(3px);
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

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

        {/* Scroll Progress Indicator (during hijack) */}
        <ScrollProgressIndicator
          currentPhase={hijackState.currentPhase}
          totalProgress={hijackState.totalProgress}
          isComplete={hijackState.isComplete}
          isVisible={isVisible && isReady && hijackState.isLocked}
        />

        {/* "Discover More" indicator (after hijack completes) */}
        <DiscoverMoreIndicator show={hijackState.isComplete && !hijackState.isLocked} />
      </section>

      {/* Spacer when hero is fixed */}
      {hijackState.isLocked && <div className="h-screen" />}

      {/* ============================================ */}
      {/* TRANSITION: Learn How It Works Popup        */}
      {/* ============================================ */}
      <SectionTransition />

      {/* ============================================ */}
      {/* SECTION 2: Horizontal 3D Carousel           */}
      {/* ============================================ */}
      <section
        className="relative min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2f] to-[#0a0a1a]"
      >
        {/* The Horizontal Carousel */}
        <UserJourney3D />

        {/* Bottom padding */}
        <div className="h-20" />
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
