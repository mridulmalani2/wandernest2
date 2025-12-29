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
  FinalStepCards,
} from './components'
import UserJourney3D from '@/components/landing3d/components/UserJourney3D'

/**
 * LandingPage3D - Simple 3-phase flow:
 * Phase 0: "TourWiseCo" title
 * Phase 1: Hero text (with 1s delay before next scroll)
 * Phase 2: 3-card panel (frozen)
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

// Scroll indicator
function ScrollIndicator({ show, label = 'Scroll', onClick }: { show: boolean; label?: string; onClick?: () => void }) {
  if (!show) return null

  return (
    <div
      className="absolute bottom-12 inset-x-0 flex justify-center z-30 animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-light">
          {label}
        </span>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-full blur-xl scale-150" />
          <div
            className="relative w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
            style={{ animation: 'bounce 2s infinite' }}
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pre-calculated drift directions for crumble effect
const CRUMBLE_EFFECTS = 'TourWiseCo'.split('').map((_, i) => ({
  x: (Math.sin(i * 1.3) * 40) + (i % 2 === 0 ? -15 : 15),
  y: 30 + (i * 8),
  rotate: (i % 2 === 0 ? -1 : 1) * (10 + i * 3),
  delay: i * 0.04,
}))

// TourWiseCo with crumble fade effect
function CrumbleTitle({ isLeaving }: { isLeaving: boolean }) {
  const letters = 'TourWiseCo'.split('')

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <h1 className="relative">
        {letters.map((letter, i) => {
          const effect = CRUMBLE_EFFECTS[i]
          return (
            <span
              key={i}
              className="inline-block text-white font-serif font-light"
              style={{
                fontSize: 'clamp(3rem, 10vw, 6rem)',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
                transition: `all 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${effect.delay}s`,
                transform: isLeaving
                  ? `translate(${effect.x}px, ${effect.y}px) rotate(${effect.rotate}deg) scale(0.5)`
                  : 'translate(0, 0) rotate(0) scale(1)',
                opacity: isLeaving ? 0 : 1,
                filter: isLeaving ? 'blur(8px)' : 'blur(0)',
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

// Creative tagline display
function Tagline({ show }: { show: boolean }) {
  const words = ['Authentic', 'Travel.', 'Local', 'Students.']

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.8s ease-out 0.4s',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-baseline gap-4">
          {words.slice(0, 2).map((word, i) => (
            <span
              key={i}
              className="text-white font-serif"
              style={{
                fontSize: i === 0 ? 'clamp(2rem, 6vw, 4rem)' : 'clamp(2rem, 6vw, 4rem)',
                fontWeight: i === 0 ? 300 : 200,
                fontStyle: i === 1 ? 'italic' : 'normal',
                textShadow: '0 2px 40px rgba(107, 141, 214, 0.4)',
                transform: show ? 'translateY(0)' : 'translateY(20px)',
                opacity: show ? 1 : 0,
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + i * 0.15}s`,
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="flex items-baseline gap-4">
          {words.slice(2).map((word, i) => (
            <span
              key={i}
              className="text-white/80 font-serif"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 300,
                letterSpacing: '0.05em',
                textShadow: '0 2px 30px rgba(155, 123, 214, 0.3)',
                transform: show ? 'translateY(0)' : 'translateY(20px)',
                opacity: show ? 1 : 0,
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.7 + i * 0.15}s`,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingPage3D({ className = '' }: LandingPage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const [cardsEntranceProgress, setCardsEntranceProgress] = useState(0)

  const { canRender3D, isMobile, prefersReducedMotion, pixelRatio } = useDeviceCapabilities()

  // Block phase 1→2 for 1 second
  const canAdvancePhase = useCallback((currentPhase: number) => {
    return true
  }, [])

  const hijackState = useScrollHijack({
    enabled: canRender3D && !prefersReducedMotion && isReady,
    canAdvance: canAdvancePhase,
  })

  const pointerState = usePointerParallax(canRender3D && !isMobile)

  // Mark when we enter phase 1 and show continue after delay


  // Animate cards entrance when entering phase 2
  useEffect(() => {
    if (hijackState.currentPhase === 2) {
      // Animate progress from 0 to 1 over 800ms
      const startTime = performance.now()
      const duration = 800

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(1, elapsed / duration)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCardsEntranceProgress(eased)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      setCardsEntranceProgress(0)
    }
  }, [hijackState.currentPhase])

  // Mark as ready after mount
  useEffect(() => {
    setIsReady(true)
  }, [])

  const should3DRender = canRender3D && !prefersReducedMotion && isReady

  if (!should3DRender && isReady) {
    return <LandingFallback />
  }

  const { currentPhase } = hijackState
  const isLeavingPhase0 = currentPhase >= 1

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hero Section */}
      <section
        className="relative h-screen w-full"
        style={{
          position: hijackState.isLocked ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: hijackState.isLocked ? 20 : 1,
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/cafe-ambiance.jpg"
            alt="Paris at night"
            fill
            priority
            className="object-cover"
            style={{ filter: 'brightness(0.3) saturate(0.8)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(10,10,26,0.7) 0%, rgba(10,10,26,0.4) 40%, rgba(10,10,26,0.8) 100%)',
          }} />
        </div>

        {/* 3D Canvas */}
        {isReady && (
          <WebGLErrorBoundary fallback={<LandingFallback />}>
            <Suspense fallback={<LoadingPlaceholder />}>
              <Canvas
                camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }}
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

        {/* Phase 0 & 1: Title with crumble effect */}
        <CrumbleTitle isLeaving={isLeavingPhase0} />

        {/* Phase 1: Tagline fades in as title crumbles, fades out for cards */}
        <Tagline show={currentPhase === 1 || (currentPhase === 2 && cardsEntranceProgress < 0.5)} />

        {/* Phase 2: Cards with smooth entrance animation */}
        <FinalStepCards
          currentPhase={currentPhase === 2 ? 4 : 0}
          phaseProgress={cardsEntranceProgress}
          isHijackComplete={hijackState.isComplete && cardsEntranceProgress >= 1}
          onLearnMoreClick={() => {
            document.getElementById('user-journey-carousel')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* Scroll indicators */}
        <ScrollIndicator
          show={currentPhase === 0 && isReady}
          label="Scroll to Explore"
          onClick={hijackState.advancePhase}
        />
        <ScrollIndicator
          show={currentPhase === 1}
          label="Scroll to Explore"
          onClick={hijackState.advancePhase}
        />
      </section>

      {/* Spacer when hero is fixed */}
      {hijackState.isLocked && <div className="h-screen" />}

      {/* Carousel Section */}
      <section id="user-journey-carousel" className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/cafe-ambiance.jpg"
            alt="Paris at night"
            fill
            className="object-cover"
            style={{ filter: 'brightness(0.25) saturate(0.7)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(10,10,26,0.85) 0%, rgba(10,10,26,0.6) 40%, rgba(10,10,26,0.85) 100%)',
          }} />
        </div>

        {/* Stars */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(1px 1px at 20px 30px, rgba(107, 141, 214, 0.8), transparent),
              radial-gradient(1px 1px at 40px 70px, rgba(155, 123, 214, 0.6), transparent),
              radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.7), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(107, 141, 214, 0.5), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(155, 123, 214, 0.7), transparent),
              radial-gradient(2px 2px at 200px 100px, rgba(255, 255, 255, 0.8), transparent),
              radial-gradient(1px 1px at 300px 150px, rgba(107, 141, 214, 0.6), transparent)
            `,
            backgroundSize: '400px 200px',
            animation: 'twinkle 8s ease-in-out infinite',
          }} />
        </div>

        <div className="relative z-10">
          <UserJourney3D />
        </div>
        <div className="h-20" />

        <style jsx>{`
          @keyframes twinkle { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        `}</style>
      </section>

      <AccessibilityLayer is3DActive={should3DRender} />

      {/* Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg z-50 font-mono">
          Phase: {currentPhase} | Locked: {hijackState.isLocked ? 'Y' : 'N'}
        </div>
      )}
    </div>
  )
}

export default LandingPage3D
