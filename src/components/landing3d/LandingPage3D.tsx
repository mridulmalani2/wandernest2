'use client'

import { useRef, useState, useEffect, Suspense, lazy, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { LandingPage3DProps, PointerState } from './types'
import { useScrollHijack, usePointerParallax, useDeviceCapabilities } from './hooks'
import { LandingFallback } from './LandingFallback'
import {
  AtmosphericBackground,
  HeroSectionPhased,
  PathwayCardsPhased,
  ScrollProgressIndicator,
} from './components'
import WhyChooseCarousel from '@/components/WhyChooseCarousel'
import DestinationsCarousel from '@/components/landing3d/components/DestinationsCarousel'

/**
 * LandingPage3D - The main 3D landing page experience with scroll hijacking
 *
 * UX Flow:
 * 1. Page loads with scroll locked to hero section
 * 2. Scroll events progress through animation phases:
 *    - Phase 1: Title animates in
 *    - Phase 2: Subtitle animates in
 *    - Phase 3: Description appears
 *    - Phase 4: CTA cards animate into position
 *    - Phase 5: Animation complete
 * 3. After phase 5, scroll lock releases for normal page scrolling
 * 4. Below the hero, a carousel section appears
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

// Loading placeholder while 3D loads
function LoadingPlaceholder() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0f0f2f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-white/60 text-sm font-light">Loading experience...</p>
      </div>
    </div>
  )
}

// Accessibility HTML overlay
function AccessibilityLayer({ is3DActive }: { is3DActive: boolean }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${
        is3DActive ? 'sr-only' : ''
      }`}
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

// The 3D scene during scroll hijacking
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
      {/* Atmospheric background - always visible */}
      <AtmosphericBackground
        scrollProgress={0}
        pointerOffset={pointerOffset}
      />

      {/* Hero Section with phased animations */}
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

      {/* Pathway Cards with phased animations */}
      <Suspense fallback={null}>
        <PathwayCardsPhased
          currentPhase={currentPhase}
          phaseProgress={phaseProgress}
          pointerOffset={pointerOffset}
          isHijackComplete={isHijackComplete}
        />
      </Suspense>

      {/* Preload all assets */}
      <Preload all />
    </>
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
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Hero Section with 3D Canvas - Fixed during scroll hijack */}
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{
          position: hijackState.isLocked ? 'fixed' : 'relative',
          top: hijackState.isLocked ? 0 : 'auto',
          left: 0,
          zIndex: hijackState.isLocked ? 10 : 1,
        }}
      >
        {!isReady ? (
          <LoadingPlaceholder />
        ) : (
          <WebGLErrorBoundary fallback={<LandingFallback />}>
            <Suspense fallback={<LoadingPlaceholder />}>
              <Canvas
                camera={{
                  position: [0, 0, 10],
                  fov: 50,
                  near: 0.1,
                  far: 100,
                }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                  failIfMajorPerformanceCaveat: true,
                }}
                dpr={[1, Math.min(pixelRatio, 2)]}
                frameloop="always"
                resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
                onCreated={({ gl }) => {
                  gl.setClearColor(0x0a0a1a, 1)
                }}
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
      </div>

      {/* Spacer for when hero is fixed */}
      {hijackState.isLocked && <div className="h-screen" />}

      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator
        currentPhase={hijackState.currentPhase}
        totalProgress={hijackState.totalProgress}
        isComplete={hijackState.isComplete}
        isVisible={isVisible && isReady}
      />

      {/* Content below hero - appears after scroll hijack completes */}
      <div
        className={`relative bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2f] to-[#0a0a1a] transition-opacity duration-700 ${
          hijackState.isComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          marginTop: hijackState.isLocked ? 0 : '-100vh',
        }}
      >
        {/* Smooth transition gradient from hero */}
        <div className="h-32 bg-gradient-to-b from-[#0a0a1a] to-transparent" />

        {/* Destinations Carousel Section */}
        <section className="py-16 px-4">
          <DestinationsCarousel />
        </section>

        {/* Why Choose Us Carousel Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-transparent via-[#1a1a3a]/30 to-transparent">
          <WhyChooseCarousel />
        </section>

        {/* Bottom spacing */}
        <div className="h-32" />
      </div>

      {/* Accessibility layer */}
      <AccessibilityLayer is3DActive={should3DRender} />

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg z-50 font-mono space-y-1">
          <div>Phase: {hijackState.currentPhase} ({(hijackState.phaseProgress * 100).toFixed(0)}%)</div>
          <div>Total: {(hijackState.totalProgress * 100).toFixed(1)}%</div>
          <div>Locked: {hijackState.isLocked ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}

export default LandingPage3D
