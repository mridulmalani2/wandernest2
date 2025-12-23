'use client'

import { useEffect, useState } from 'react'
import { ANIMATION_PHASES } from '../hooks'

interface ScrollProgressIndicatorProps {
  currentPhase: number
  totalProgress: number
  isComplete: boolean
  isVisible: boolean
}

/**
 * ScrollProgressIndicator - Shows scroll capture progress
 *
 * Features:
 * - Positioned at bottom center with adequate padding
 * - Subtle glow effect matching dark theme
 * - Gentle floating animation (not harsh bouncing)
 * - Fades out when animation begins or completes
 * - Shows phase progress dots
 * - Hides when user scrolls past section 1
 */
export function ScrollProgressIndicator({
  currentPhase,
  totalProgress,
  isComplete,
  isVisible,
}: ScrollProgressIndicatorProps) {
  const [opacity, setOpacity] = useState(0)
  const [shouldRender, setShouldRender] = useState(true)
  const [isScrolledPast, setIsScrolledPast] = useState(false)

  // Monitor scroll position to hide when scrolled past section 1
  useEffect(() => {
    const handleScroll = () => {
      // Hide if scrolled more than 50px past the hero section
      const scrolledPast = window.scrollY > 50
      setIsScrolledPast(scrolledPast)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fade in after mount, fade out when scrolling starts, completes, or scrolled past
  useEffect(() => {
    if (!isVisible || isComplete || isScrolledPast) {
      setOpacity(0)
      const timer = setTimeout(() => setShouldRender(false), 500)
      return () => clearTimeout(timer)
    }

    setShouldRender(true)

    // Delay initial fade in
    const timer = setTimeout(() => {
      // Only show if we haven't started scrolling yet and not scrolled past
      if (currentPhase <= 1 && !isScrolledPast) {
        setOpacity(1)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [isVisible, isComplete, currentPhase, isScrolledPast])

  // Fade out as user starts scrolling
  useEffect(() => {
    if (currentPhase > 0) {
      setOpacity(Math.max(0, 1 - totalProgress * 3))
    }
  }, [currentPhase, totalProgress])

  if (!shouldRender) return null

  const totalPhases = ANIMATION_PHASES.length - 1 // Exclude 'complete' phase

  return (
    <div
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{
        opacity,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPhases }).map((_, index) => (
            <div
              key={index}
              className="relative"
              style={{
                transition: 'all 0.4s ease-out',
                transform: index <= currentPhase ? 'scale(1)' : 'scale(0.8)',
              }}
            >
              {/* Glow effect for active dot */}
              {index === currentPhase && (
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: 'rgba(107, 141, 214, 0.4)',
                    filter: 'blur(6px)',
                    transform: 'scale(2)',
                  }}
                />
              )}
              <div
                className="w-2 h-2 rounded-full relative"
                style={{
                  background:
                    index < currentPhase
                      ? 'rgba(155, 123, 214, 0.9)'
                      : index === currentPhase
                      ? 'rgba(107, 141, 214, 1)'
                      : 'rgba(255, 255, 255, 0.3)',
                  boxShadow:
                    index <= currentPhase
                      ? '0 0 10px rgba(107, 141, 214, 0.5)'
                      : 'none',
                  transition: 'all 0.4s ease-out',
                }}
              />
            </div>
          ))}
        </div>

        {/* Scroll indicator with gentle float animation */}
        <div
          className="flex flex-col items-center gap-2"
          style={{
            animation: 'gentleFloat 3s ease-in-out infinite',
          }}
        >
          {/* Text label */}
          <span
            className="text-white/60 text-xs font-light uppercase tracking-[0.2em]"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Scroll to explore
          </span>

          {/* Animated arrow with glow */}
          <div className="relative">
            {/* Glow behind icon */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(107, 141, 214, 0.3) 0%, transparent 70%)',
                filter: 'blur(8px)',
                transform: 'scale(3)',
              }}
            />

            {/* Mouse/scroll icon */}
            <div
              className="relative w-6 h-9 rounded-full border-2 border-white/40 flex justify-center pt-2"
              style={{
                boxShadow: '0 0 15px rgba(107, 141, 214, 0.3)',
              }}
            >
              {/* Scroll wheel indicator */}
              <div
                className="w-1 h-2 rounded-full bg-white/60"
                style={{
                  animation: 'scrollWheel 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Chevrons */}
          <div className="flex flex-col items-center -mt-1 gap-0.5">
            <svg
              width="16"
              height="8"
              viewBox="0 0 16 8"
              fill="none"
              className="text-white/40"
              style={{ animation: 'chevronFade 2s ease-in-out infinite' }}
            >
              <path
                d="M1 1L8 7L15 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              width="16"
              height="8"
              viewBox="0 0 16 8"
              fill="none"
              className="text-white/25"
              style={{ animation: 'chevronFade 2s ease-in-out infinite 0.2s' }}
            >
              <path
                d="M1 1L8 7L15 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CSS Keyframes - must be global for inline animation styles to reference */}
      <style jsx global>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes scrollWheel {
          0%, 100% {
            opacity: 0.6;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(4px);
          }
        }

        @keyframes chevronFade {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
