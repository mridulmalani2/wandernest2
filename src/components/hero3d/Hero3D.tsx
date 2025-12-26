'use client'

import { useRef, useState, useEffect, Suspense, lazy } from 'react'
import Image from 'next/image'
import { HeroContent } from './HeroContent'
import { HeroFallback } from './HeroFallback'
import { useMouseParallax, useScrollProgress, useDeviceCapabilities } from './hooks'
import { Hero3DProps } from './types'

// Lazy load the 3D scene to reduce initial bundle size
// The 3D components are only loaded when needed
const Scene3DCanvas = lazy(() =>
  import('./Scene3D').then((mod) => ({ default: mod.Scene3DCanvas }))
)

/**
 * Hero3D - Immersive 3D Hero Section
 *
 * Architecture:
 * ┌─────────────────────────────────────────────┐
 * │ Background (CSS - Parallax Image)          │ z-index: 0
 * ├─────────────────────────────────────────────┤
 * │ 3D Canvas (Three.js - Image Planes)        │ z-index: 1
 * ├─────────────────────────────────────────────┤
 * │ HTML Overlay (Text + CTAs)                 │ z-index: 2
 * └─────────────────────────────────────────────┘
 *
 * Depth is achieved through:
 * 1. Real Z-positions in Three.js scene
 * 2. Parallax movement proportional to depth
 * 3. Subtle rotation responses to mouse
 * 4. Scroll-based depth transitions
 *
 * Performance safeguards:
 * - Lazy-loaded 3D components
 * - Device capability detection
 * - Static fallback for mobile/low-end
 * - Reduced motion respects user preference
 * - No heavy shaders or postprocessing
 */
export function Hero3D({ className = '' }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Detect device capabilities
  const { canRender3D, isMobile, prefersReducedMotion } = useDeviceCapabilities()

  // Mouse tracking for parallax (disabled on mobile)
  const mousePosition = useMouseParallax(canRender3D && !isMobile)

  // Scroll progress for depth transitions
  const scrollProgress = useScrollProgress(containerRef as React.RefObject<HTMLElement>)

  // Visibility detection for entrance animations
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

  // Error boundary for 3D canvas
  const handleCanvasError = () => {
    console.warn('Hero3D: WebGL canvas failed to initialize, falling back to static version')
    setHasError(true)
  }

  // Determine if we should render 3D
  const shouldRender3D = canRender3D && !hasError && !prefersReducedMotion

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* ===== LAYER 0: Background ===== */}
      {/* Parallax background with blur - CSS handled, performant */}
      <div className="absolute inset-0">
        <Image
          src="/images/backgrounds/cafe-ambiance.jpg"
          alt="Beautiful Paris cityscape with Eiffel Tower"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
        {/* Gradient overlay for brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/15 via-ui-purple-accent/10 to-ui-purple-primary/15" />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 pattern-dots opacity-20" />

      {/* ===== LAYER 1: 3D Scene OR Static Fallback ===== */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 lg:pr-0">
        <div className="w-full lg:w-1/2 h-[400px] md:h-[480px] lg:h-[560px] relative">
          {shouldRender3D ? (
            <Suspense
              fallback={
                // Show static fallback while 3D loads
                <HeroFallback />
              }
            >
              <ErrorBoundary onError={handleCanvasError}>
                <Scene3DCanvas
                  mousePosition={mousePosition}
                  scrollProgress={scrollProgress}
                  isVisible={isVisible}
                />
              </ErrorBoundary>
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </div>
      </div>

      {/* ===== LAYER 2: HTML Content Overlay ===== */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-24 md:pb-12 lg:pt-28 lg:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-7 lg:gap-14 items-center min-h-[calc(100vh-14rem)]">
            {/* Left Column - Text Content */}
            <div className="relative z-20">
              <HeroContent is3DEnabled={shouldRender3D} />
            </div>

            {/* Right Column - Spacer for 3D content (actual content is absolutely positioned) */}
            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple Error Boundary for 3D Canvas
 * Falls back gracefully if WebGL fails
 */
import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  onError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(): void {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) {
      return <HeroFallback />
    }
    return this.props.children
  }
}

export default Hero3D
