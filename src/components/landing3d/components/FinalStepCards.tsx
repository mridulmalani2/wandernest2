'use client'

import { useRef, useCallback } from 'react'
import Image from 'next/image'

/**
 * FinalStepCards - Land Rover-style three-panel section
 *
 * Displays at the end of the 3D scroll sequence:
 * - Three full-viewport cards side by side
 * - Bold, premium typography (locally scoped)
 * - High-quality background images
 * - "Learn More" card scrolls to carousel section
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
}

const CARDS: CardData[] = [
  {
    id: 'tourist',
    title: 'TOURIST',
    subtitle: 'Find Your Guide',
    href: '/tourist',
    // Atmospheric Tokyo cityscape at dusk - aspirational travel imagery
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=85',
    imageAlt: 'Tokyo cityscape at dusk with neon lights',
  },
  {
    id: 'student',
    title: 'STUDENT',
    subtitle: 'Become a Guide',
    href: '/student',
    // Confident young professional in urban setting - not a classroom
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=85',
    imageAlt: 'Confident young professional in urban environment',
  },
  {
    id: 'learn-more',
    title: 'DISCOVER',
    subtitle: 'Explore More Destinations',
    // London architectural - Tower Bridge at twilight, calm and premium
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=85',
    imageAlt: 'London Tower Bridge at twilight',
  },
]

interface FinalStepCardProps {
  card: CardData
  onLearnMoreClick?: () => void
}

function FinalStepCard({ card, onLearnMoreClick }: FinalStepCardProps) {
  const isLearnMore = card.id === 'learn-more'

  const handleClick = useCallback(() => {
    if (isLearnMore && onLearnMoreClick) {
      onLearnMoreClick()
    } else if (card.href) {
      window.location.href = card.href
    }
  }, [isLearnMore, onLearnMoreClick, card.href])

  return (
    <div
      className="final-step-card relative h-screen cursor-pointer overflow-hidden group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`${card.title} - ${card.subtitle}`}
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
        {/* Subtle dark overlay for text readability - minimal, not heavy */}
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
          className="final-step-title text-white text-center mb-4 transition-transform duration-500 group-hover:scale-105"
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

        {/* Subtitle - Relegated to supporting text */}
        <p
          className="text-white/80 text-center mb-8 font-light tracking-wide"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            letterSpacing: '0.05em',
          }}
        >
          {card.subtitle}
        </p>

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
  isVisible: boolean
  onLearnMoreClick?: () => void
}

export function FinalStepCards({ isVisible, onLearnMoreClick }: FinalStepCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle scroll to carousel section
  const handleLearnMoreClick = useCallback(() => {
    if (onLearnMoreClick) {
      onLearnMoreClick()
      return
    }

    // Default behavior: scroll to the carousel section
    const carouselSection = document.getElementById('user-journey-carousel')
    if (carouselSection) {
      carouselSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [onLearnMoreClick])

  return (
    <>
      {/* Load premium font - locally scoped */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={PREMIUM_FONT_URL} />

      <div
        ref={containerRef}
        className={`final-step-cards-container w-full transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          height: '100vh',
        }}
      >
        {/* Three-panel grid - Desktop: side by side, Mobile: stacked */}
        <div className="h-full flex flex-col md:flex-row">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="flex-1 min-h-[33.33vh] md:min-h-0"
            >
              <FinalStepCard
                card={card}
                onLearnMoreClick={card.id === 'learn-more' ? handleLearnMoreClick : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scoped styles for this section only */}
      <style jsx global>{`
        /* Premium font fallback chain */
        .final-step-title {
          font-family: 'Bebas Neue', Impact, 'Arial Black', sans-serif;
          font-weight: 400;
        }

        .final-step-cta {
          font-family: 'Bebas Neue', Impact, sans-serif;
          font-weight: 400;
        }

        /* Card hover effects */
        .final-step-card {
          flex: 1;
        }

        /* Ensure cards fill viewport properly */
        @media (max-width: 768px) {
          .final-step-cards-container {
            height: auto !important;
            min-height: 100vh;
          }

          .final-step-card {
            height: 100vh;
            min-height: 100vh;
          }
        }
      `}</style>
    </>
  )
}

export default FinalStepCards
