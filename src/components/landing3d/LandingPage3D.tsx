'use client'

import { useRef, useState, useEffect, Suspense, lazy, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { LandingPage3DProps, ScrollState, PointerState } from './types'
import { useScrollProgress, usePointerParallax, useDeviceCapabilities } from './hooks'
import { LandingFallback } from './LandingFallback'

// Lazy load the 3D scene
const SpatialScene = lazy(() =>
  import('./SpatialScene').then((mod) => ({ default: mod.SpatialScene }))
)

/**
 * LandingPage3D - The main 3D landing page experience
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  LandingPage3D Container                                        │
 * │  ├── Scroll Container (height: 300vh)                          │
 * │  │   └── Fixed Canvas (sticky, full viewport)                  │
 * │  │       └── SpatialScene                                      │
 * │  │           ├── SpatialCamera (scroll-driven)                 │
 * │  │           ├── AtmosphericBackground                         │
 * │  │           ├── HeroSection3D                                 │
 * │  │           ├── PathwayCards3D                                │
 * │  │           └── FeatureConstellation                          │
 * │  └── HTML Accessibility Layer                                  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Scroll Model:
 * - Container is 300vh tall (provides scrollable area)
 * - Canvas is position: sticky at top
 * - Scroll progress (0-1) drives camera position
 * - All 3D content is spatially distributed along camera path
 *
 * Performance:
 * - Device capability detection for graceful degradation
 * - Lazy loading of 3D components
 * - Error boundary for WebGL failures
 * - Static fallback for unsupported devices
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

// Accessibility HTML overlay (always present, visually hidden when 3D is active)
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

export function LandingPage3D({ className = '' }: LandingPage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Device capability detection
  const { canRender3D, isMobile, prefersReducedMotion, pixelRatio } = useDeviceCapabilities()

  // Scroll tracking
  const scrollState = useScrollProgress(containerRef, {
    scrollHeight: 300, // 300vh total scroll area
  })

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
      style={{ height: '300vh' }} // Scroll area
    >
      {/* Fixed 3D Canvas */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {!isReady ? (
          <LoadingPlaceholder />
        ) : (
          <WebGLErrorBoundary fallback={<LandingFallback />}>
            <Suspense fallback={<LoadingPlaceholder />}>
              <Canvas
                camera={{
                  position: [0, 0, 15],
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
                <SpatialScene
                  scrollState={scrollState}
                  pointerState={pointerState}
                  isVisible={isVisible}
                />
              </Canvas>
            </Suspense>
          </WebGLErrorBoundary>
        )}
      </div>

      {/* Accessibility layer */}
      <AccessibilityLayer is3DActive={should3DRender} />

      {/* Scroll progress indicator (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full z-50 font-mono">
          Scroll: {(scrollState.progress * 100).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export default LandingPage3D
