'use client'

import { useRef, useState, useEffect, Suspense, Component, ReactNode, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import Image from 'next/image'
import { LandingPage3DProps, PointerState } from './types'
import { useScrollHijack, usePointerParallax, useDeviceCapabilities } from './hooks'
import { LandingFallback } from './LandingFallback'
import {
  AtmosphericBackground,
  ScrollProgressIndicator,
  FinalStepCards,
} from './components'
import UserJourney3D from '@/components/landing3d/components/UserJourney3D'

/**
 * LandingPage3D - Immersive Landing Experience
 *
 * Flow:
 * 1. TourWiseCo title + elegant scroll indicator
 * 2. First scroll: Title shatters, karaoke text plays, scroll indicator returns
 * 3. Second scroll: Frozen 3-card panel
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

// The 3D scene for hero section - only atmospheric background
function HeroScene({ pointerState }: { pointerState: PointerState }) {
  const pointerOffset = {
    x: pointerState.smoothX,
    y: pointerState.smoothY,
  }

  return (
    <>
      <AtmosphericBackground scrollProgress={0} pointerOffset={pointerOffset} />
      <Preload all />
    </>
  )
}

// Elegant scroll indicator - minimal and sophisticated
function ElegantScrollIndicator({ show, label = 'Scroll to Explore' }: { show: boolean; label?: string }) {
  return (
    <div
      className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-light">
          {label}
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

// Pre-calculated explosion directions for each letter (stable across renders)
const LETTER_EXPLOSIONS = 'TourWiseCo'.split('').map((_, index) => {
  const angle = (index / 10) * 360 + (index * 17 % 60) - 30 // Deterministic pseudo-random
  const distance = 150 + (index * 31 % 200)
  const rotateZ = ((index * 47 % 100) - 50) * 7.2
  return {
    translateX: Math.cos(angle * Math.PI / 180) * distance,
    translateY: Math.sin(angle * Math.PI / 180) * distance,
    rotateZ,
    delay: index * 0.03,
  }
})

// TourWiseCo title with glass shatter animation
function TourWiseCoTitle({
  show,
  isExploding
}: {
  show: boolean
  isExploding: boolean
}) {
  const letters = 'TourWiseCo'.split('')

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <h1 className="relative">
        {letters.map((letter, index) => {
          const { translateX, translateY, rotateZ, delay } = LETTER_EXPLOSIONS[index]

          return (
            <span
              key={index}
              className="inline-block text-white font-serif font-light"
              style={{
                fontSize: 'clamp(3rem, 10vw, 6rem)',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
                transition: isExploding
                  ? `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`
                  : 'none',
                transform: isExploding
                  ? `translate(${translateX}px, ${translateY}px) rotate(${rotateZ}deg) scale(0)`
                  : 'translate(0, 0) rotate(0) scale(1)',
                opacity: isExploding ? 0 : 1,
              }}
            >
              {letter}
            </span>
          )
        })}
      </h1>
    </div>
  )
}

// Animated text with fade-in effect
const HERO_TEXT = "Experience authentic travel with local student guides. Connect with verified university students who will show you their city through a local's eyes."

function AnimatedText({ show }: { show: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-30 px-8"
      style={{ perspective: '1000px' }}
    >
      <p
        className="text-center max-w-3xl leading-relaxed text-white"
        style={{
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          textShadow: '0 2px 30px rgba(107, 141, 214, 0.5), 0 4px 60px rgba(0, 0, 0, 0.8)',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {HERO_TEXT}
      </p>
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

export function LandingPage3D({ className = '' }: LandingPage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Animation sub-states for Phase 1
  const [titleExploding, setTitleExploding] = useState(false)
  const [showText, setShowText] = useState(false)
  const [canProceedToCards, setCanProceedToCards] = useState(false)

  // Device capability detection
  const { canRender3D, isMobile, prefersReducedMotion, pixelRatio } = useDeviceCapabilities()

  // Callback to block phase 1→2 until minimum delay passes
  const canAdvancePhase = useCallback((currentPhase: number) => {
    // Phase 0→1: Always allowed (triggers title explosion + text)
    if (currentPhase === 0) return true
    // Phase 1→2: Only allowed after 1s delay
    if (currentPhase === 1) return canProceedToCards
    // Any other phase: allow
    return true
  }, [canProceedToCards])

  // Scroll hijacking for hero animations
  const hijackState = useScrollHijack({
    enabled: canRender3D && !prefersReducedMotion && isReady,
    canAdvance: canAdvancePhase,
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

  // Handle phase 1 animation sequence
  useEffect(() => {
    if (hijackState.currentPhase === 1 && !titleExploding) {
      // Start the title explosion
      setTitleExploding(true)

      // After title explosion animation, show text
      const textTimer = setTimeout(() => {
        setShowText(true)
      }, 800) // Wait for explosion animation

      // After 1s minimum delay, allow proceeding to cards
      const proceedTimer = setTimeout(() => {
        setCanProceedToCards(true)
      }, 1800) // 800ms for explosion + 1000ms minimum viewing time

      return () => {
        clearTimeout(textTimer)
        clearTimeout(proceedTimer)
      }
    }
  }, [hijackState.currentPhase, titleExploding])

  // Determine rendering mode
  const should3DRender = canRender3D && !prefersReducedMotion && isReady

  // Calculate what to show
  const showTitle = hijackState.currentPhase === 0 || (hijackState.currentPhase === 1 && !showText)
  const showPhase0Indicator = hijackState.currentPhase === 0 && isReady
  const showPhase1Indicator = hijackState.currentPhase === 1 && canProceedToCards
  const showCards = hijackState.currentPhase === 2

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

        {/* 3D Canvas - atmospheric background with stars */}
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
                <HeroScene pointerState={pointerState} />
              </Canvas>
            </Suspense>
          </WebGLErrorBoundary>
        )}

        {/* TourWiseCo Title with shatter effect */}
        <TourWiseCoTitle
          show={showTitle}
          isExploding={titleExploding && hijackState.currentPhase === 1}
        />

        {/* Animated hero text */}
        <AnimatedText show={showText && hijackState.currentPhase === 1} />

        {/* Phase 0: Elegant scroll indicator below title */}
        <ElegantScrollIndicator show={showPhase0Indicator} label="Scroll to Explore" />

        {/* Phase 1: Scroll indicator after delay */}
        <ElegantScrollIndicator show={showPhase1Indicator} label="Continue" />

        {/* Phase 2: FinalStepCards - frozen 3-card panel */}
        <FinalStepCards
          currentPhase={showCards ? 4 : 0}
          phaseProgress={showCards ? 1 : 0}
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
