'use client'

import { useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'

/**
 * FinalStepCards - Land Rover-style three-panel section
 *
 * Replaces the two CTA cards in Phase 4 of the 3D scroll sequence.
 * Uses the same animation timing and easing as PathwayCardsPhased.
 */

// Premium font loaded via Google Fonts - locally scoped to this component
const PREMIUM_FONT_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'

interface CardData {
  id: 'tourist' | 'student' | 'learn-more'
  title: string
  subtitle: string
  href?: string
  image: string
  imageAlt: string
  delay: number // Stagger delay matching PathwayCardsPhased timing
}

const CARDS: CardData[] = [
  {
    id: 'student',
    title: 'STUDENT',
    subtitle: '',
    href: '/student',
    image: 'https://m.media-amazon.com/images/I/71B-wgg3DtL._AC_SX679_.jpg',
    imageAlt: 'University campus with students in an urban setting',
    delay: 0,
  },
  {
    id: 'learn-more',
    title: 'DISCOVER',
    subtitle: 'Learn more about what we do',
    image: '/images/backgrounds/Van_gogh.jpg',
    imageAlt: 'London Tower Bridge at twilight',
    delay: 0.1,
  },
  {
    id: 'tourist',
    title: 'TOURIST',
    subtitle: '',
    href: '/tourist',
    image: 'https://images.squarespace-cdn.com/content/v1/5a08d022fe54ef52c475ff8c/1737679063696-IJT7YCMJ55WZKKIC97O9/image-asset.jpg?format=2500w',
    imageAlt: 'Tokyo cityscape at dusk with neon lights',
    delay: 0.2,
  },
]

interface FinalStepCardProps {
  card: CardData
  entranceProgress: number
  onLearnMoreClick?: () => void
}

function FinalStepCard({ card, entranceProgress, onLearnMoreClick }: FinalStepCardProps) {
  const isLearnMore = card.id === 'learn-more'

  const handleClick = useCallback(() => {
    if (entranceProgress < 0.5) return // Prevent clicks during animation
    if (isLearnMore && onLearnMoreClick) {
      onLearnMoreClick()
    } else if (card.href) {
      window.location.href = card.href
    }
  }, [isLearnMore, onLearnMoreClick, card.href, entranceProgress])

  // Animation values matching PathwayCardsPhased
  const slideY = (1 - entranceProgress) * 100 // Slide up from bottom (percentage)
  const scale = 0.85 + entranceProgress * 0.15 // Scale from 0.85 to 1.0
  const opacity = entranceProgress

  return (
    <div
      className="final-step-card relative h-full cursor-pointer overflow-hidden group"
      onClick={handleClick}
      role="button"
      tabIndex={entranceProgress > 0.5 ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`${card.title} - ${card.subtitle}`}
      style={{
        opacity,
        transform: `translateY(${slideY}px) scale(${scale})`,
        transition: 'none', // Animation driven by scroll, not CSS transitions
        pointerEvents: entranceProgress > 0.5 ? 'auto' : 'none',
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Subtle dark overlay for text readability */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Title - Bold premium typography */}
        <h2
          className={`final-step-title text-white text-center transition-transform duration-500 group-hover:scale-105 ${card.subtitle ? 'mb-4' : 'mb-8'}`}
          style={{
            fontFamily: '"Bebas Neue", Impact, "Arial Black", sans-serif',
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            letterSpacing: '0.15em',
            lineHeight: 1,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}
        >
          {card.id === 'tourist' && "I'M A "}
          {card.id === 'student' && "I'M A "}
          {card.title}
        </h2>

        {/* Subtitle - only show if not empty */}
        {card.subtitle && (
          <p
            className="text-white/90 text-center mb-8 font-medium tracking-wide"
            style={{
              fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
              fontSize: 'clamp(0.9rem, 2.2vw, 1.2rem)',
              letterSpacing: '0.08em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {card.subtitle}
          </p>
        )}

        {/* CTA Button */}
        <button
          className="final-step-cta px-8 py-3 border border-white/80 text-white uppercase tracking-widest text-sm
                     bg-transparent transition-all duration-300
                     hover:bg-white hover:text-black"
          style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            letterSpacing: '0.2em',
          }}
        >
          ENTER
        </button>
      </div>

      {/* Hover border accent */}
      <div
        className="absolute inset-0 border-2 border-transparent transition-colors duration-300 pointer-events-none
                   group-hover:border-white/20"
      />
    </div>
  )
}

interface FinalStepCardsProps {
  currentPhase: number
  phaseProgress: number
  isHijackComplete: boolean
  onLearnMoreClick?: () => void
}

export function FinalStepCards({
  currentPhase,
  phaseProgress,
  isHijackComplete,
  onLearnMoreClick,
}: FinalStepCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Cards appear in phase 4 (same as PathwayCardsPhased)
  const cardPhase = 4

  // Calculate entrance progress for each card with stagger
  const cardProgresses = useMemo(() => {
    return CARDS.map((card) => {
      if (currentPhase < cardPhase) return 0
      if (currentPhase === cardPhase) {
        // Apply stagger delay (same logic as PathwayCardsPhased)
        const adjustedProgress = Math.max(0, phaseProgress - card.delay)
        return Math.min(1, adjustedProgress / (1 - card.delay))
      }
      return 1
    })
  }, [currentPhase, phaseProgress])

  // Overall visibility - show container when any card has progress
  const containerVisibility = useMemo(() => {
    if (isHijackComplete) return 1
    return Math.max(...cardProgresses)
  }, [cardProgresses, isHijackComplete])

  // Handle scroll to carousel section
  const handleLearnMoreClick = useCallback(() => {
    if (onLearnMoreClick) {
      onLearnMoreClick()
      return
    }
    const carouselSection = document.getElementById('user-journey-carousel')
    if (carouselSection) {
      carouselSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [onLearnMoreClick])

  // Don't render if not visible at all
  if (containerVisibility < 0.01) return null

  return (
    <>
      {/* Load premium font - locally scoped */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={PREMIUM_FONT_URL} />

      <div
        ref={containerRef}
        className="final-step-cards-container absolute inset-0 w-full h-full z-20"
        style={{
          opacity: containerVisibility,
          pointerEvents: containerVisibility > 0.5 ? 'auto' : 'none',
        }}
      >
        {/* Three-panel grid - Desktop: side by side, Mobile: stacked */}
        <div className="h-full flex flex-col md:flex-row">
          {CARDS.map((card, index) => (
            <div
              key={card.id}
              className="flex-1 min-h-[33.33vh] md:min-h-0 h-full"
            >
              <FinalStepCard
                card={card}
                entranceProgress={isHijackComplete ? 1 : cardProgresses[index]}
                onLearnMoreClick={card.id === 'learn-more' ? handleLearnMoreClick : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scoped styles for this section only */}
      <style jsx global>{`
        .final-step-title {
          font-family: 'Bebas Neue', Impact, 'Arial Black', sans-serif;
          font-weight: 400;
        }

        .final-step-cta {
          font-family: 'Bebas Neue', Impact, sans-serif;
          font-weight: 400;
        }

        .final-step-card {
          flex: 1;
        }

        @media (max-width: 768px) {
          .final-step-cards-container {
            overflow-y: auto;
          }

          .final-step-card {
            min-height: 33.33vh;
          }
        }
      `}</style>
    </>
  )
}

export default FinalStepCards
