'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

/**
 * UserJourney3D - Horizontal 3D Carousel
 *
 * A gamified horizontal carousel showing USPs:
 * - Current section is centered and fully visible
 * - Adjacent sections visible with glassmorphic blur
 * - Horizontal scroll/swipe to navigate
 */

interface JourneySection {
  id: string
  tagline: string
  headline: string
  subheadline: string
  description: string
  accentColor: string
  secondaryColor: string
  image: string
}

const journeySections: JourneySection[] = [
  {
    id: 'cultural',
    tagline: 'FEEL AT HOME',
    headline: 'Connect with',
    subheadline: 'Your Culture Abroad',
    description: 'Match with student guides from your home country who speak your language and understand your culture.',
    accentColor: '#6B8DD6',
    secondaryColor: '#9B7BD6',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  },
  {
    id: 'authentic',
    tagline: 'SKIP THE TOURIST TRAPS',
    headline: 'Real Experiences',
    subheadline: 'Not Reviews',
    description: 'Every recommendation comes from lived experience. The café where locals actually go. The viewpoint not on Instagram.',
    accentColor: '#9B7BD6',
    secondaryColor: '#D67B8D',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  },
  {
    id: 'concierge',
    tagline: 'YOUR PERSONAL GUIDE',
    headline: 'From Landing',
    subheadline: 'to Departure',
    description: 'Custom itineraries. Public transport mastered. Hidden gems discovered. Someone who actually shows you around.',
    accentColor: '#D67B8D',
    secondaryColor: '#6BD6C5',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  },
  {
    id: 'student',
    tagline: "WHAT'S MORE?",
    headline: 'Students Earn',
    subheadline: '2× Campus Jobs',
    description: 'Share your city. Meet travelers. Earn more than double what typical campus jobs pay. Flexible hours.',
    accentColor: '#6BD6C5',
    secondaryColor: '#6B8DD6',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
  },
]

interface CardProps {
  section: JourneySection
  isActive: boolean
  offset: number // -2, -1, 0, 1, 2
  onClick: () => void
  index: number
  totalCards: number
}

function JourneyCard({ section, isActive, offset, onClick, index, totalCards }: CardProps) {
  const isStudentCard = section.id === 'student'

  // Calculate visual properties based on offset
  const getCardStyle = () => {
    const absOffset = Math.abs(offset)

    // Position calculation
    const baseTranslate = offset * 380 // px between cards

    // Scale based on distance from center
    const scale = offset === 0 ? 1 : absOffset === 1 ? 0.88 : 0.75

    // Rotation for 3D effect
    const rotateY = offset === 0 ? 0 : offset > 0 ? -15 : 15

    // Opacity
    const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.7 : 0.4

    // Z-index (center card on top)
    const zIndex = 10 - absOffset

    // Blur for non-active cards
    const blur = offset === 0 ? 0 : absOffset === 1 ? 2 : 6

    return {
      transform: `translateX(${baseTranslate}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
    }
  }

  const style = getCardStyle()

  return (
    <div
      className={`absolute left-1/2 top-0 w-[340px] md:w-[380px] -ml-[170px] md:-ml-[190px] transition-all duration-500 ease-out ${
        isActive ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
      onClick={!isActive ? onClick : undefined}
    >
      {/* Card Container */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: isActive
            ? `linear-gradient(145deg, ${section.accentColor}20, ${section.secondaryColor}15, rgba(10,10,26,0.95))`
            : 'rgba(20, 20, 40, 0.8)',
          border: `1px solid ${isActive ? section.accentColor + '50' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isActive
            ? `0 25px 60px -15px rgba(0,0,0,0.5), 0 0 60px ${section.accentColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
            : '0 15px 40px -10px rgba(0,0,0,0.4)',
        }}
      >
        {/* Image Section */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <Image
            src={section.image}
            alt={section.headline}
            fill
            sizes="400px"
            className="object-cover transition-all duration-500"
            style={{
              filter: isActive ? 'saturate(1.1)' : 'saturate(0.7) brightness(0.8)',
            }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 20%, ${section.accentColor}30 60%, rgba(10,10,26,1) 100%)`,
            }}
          />

          {/* Card Index */}
          <div
            className="absolute top-4 right-4 font-mono text-sm transition-opacity duration-300"
            style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}
          >
            {String(index + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-6">
          {/* Tagline */}
          <div
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
            style={{
              background: `${section.accentColor}25`,
              color: section.accentColor,
              border: `1px solid ${section.accentColor}40`,
            }}
          >
            {section.tagline}
          </div>

          {/* Headlines - Funky style */}
          <h3 className="mb-3">
            <span
              className="block text-2xl md:text-3xl leading-tight"
              style={{
                fontFamily: '"Brush Script MT", "Segoe Script", "Bradley Hand", cursive',
                fontWeight: 400,
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                textShadow: isActive
                  ? `2px 2px 0 ${section.accentColor}60, -1px -1px 0 ${section.secondaryColor}40`
                  : 'none',
                letterSpacing: '0.02em',
                transform: isActive ? 'rotate(-1deg)' : 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease',
              }}
            >
              {section.headline}
            </span>
            <span
              className="block text-xl md:text-2xl mt-1"
              style={{
                fontFamily: '"Brush Script MT", "Segoe Script", "Bradley Hand", cursive',
                fontWeight: 400,
                color: isActive ? section.secondaryColor : 'rgba(155,123,214,0.5)',
                textShadow: isActive ? `1px 1px 0 ${section.accentColor}30` : 'none',
                transform: isActive ? 'rotate(0.5deg)' : 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease',
              }}
            >
              {section.subheadline}
            </span>
          </h3>

          {/* Description */}
          <p
            className="text-sm md:text-base leading-relaxed transition-colors duration-300"
            style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}
          >
            {section.description}
          </p>

          {/* CTA for student card */}
          {isStudentCard && isActive && (
            <a
              href="/student"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${section.accentColor}, ${section.secondaryColor})`,
                color: '#0a0a1a',
                boxShadow: `0 8px 24px ${section.accentColor}50`,
              }}
            >
              Become a Guide
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserJourney3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const lastWheelTime = useRef(0)

  const totalSections = journeySections.length

  // Navigate to specific index
  const goToIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalSections - 1, index))
    setCurrentIndex(clampedIndex)
  }, [totalSections])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setDragDelta(0)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setDragDelta(e.clientX - startX)
  }, [isDragging, startX])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragDelta < -60 && currentIndex < totalSections - 1) {
      goToIndex(currentIndex + 1)
    } else if (dragDelta > 60 && currentIndex > 0) {
      goToIndex(currentIndex - 1)
    }
    setDragDelta(0)
  }, [isDragging, dragDelta, currentIndex, totalSections, goToIndex])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setDragDelta(0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    setDragDelta(e.touches[0].clientX - startX)
  }, [isDragging, startX])

  const handleTouchEnd = useCallback(() => {
    handleMouseUp()
  }, [handleMouseUp])

  // Wheel handler REMOVED - vertical scroll should NOT change carousel
  // Only horizontal swipe/drag and arrow keys navigate the carousel

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToIndex(currentIndex + 1)
      if (e.key === 'ArrowLeft') goToIndex(currentIndex - 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, goToIndex])

  const currentSection = journeySections[currentIndex]

  return (
    <div className="relative py-16 md:py-20">
      {/* Background glow */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${currentSection.accentColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Section Title */}
      <div className="text-center mb-10 md:mb-12 px-4 relative z-10">
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
          Why TourWiseCo?
        </h2>
        <p className="text-white/50 text-sm md:text-base">
          Swipe to discover what makes us different
        </p>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={`relative h-[480px] md:h-[520px] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ perspective: '1000px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards Container */}
        <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
          {journeySections.map((section, index) => {
            const offset = index - currentIndex
            // Only render cards within range
            if (Math.abs(offset) > 2) return null

            return (
              <JourneyCard
                key={section.id}
                section={section}
                isActive={index === currentIndex}
                offset={offset}
                onClick={() => goToIndex(index)}
                index={index}
                totalCards={totalSections}
              />
            )
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center items-center gap-2 md:gap-3 mt-8">
        {journeySections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToIndex(index)}
            className={`relative h-2.5 md:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 md:w-10' : 'w-2.5 md:w-3'
            }`}
            style={{
              background: index === currentIndex
                ? `linear-gradient(90deg, ${section.accentColor}, ${section.secondaryColor})`
                : 'rgba(255,255,255,0.25)',
              boxShadow: index === currentIndex ? `0 0 15px ${section.accentColor}60` : 'none',
            }}
            aria-label={`Go to ${section.headline}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => goToIndex(currentIndex - 1)}
        disabled={currentIndex === 0}
        className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full transition-all duration-300 ${
          currentIndex === 0
            ? 'opacity-20 cursor-not-allowed'
            : 'opacity-60 hover:opacity-100 hover:scale-110'
        }`}
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => goToIndex(currentIndex + 1)}
        disabled={currentIndex === totalSections - 1}
        className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full transition-all duration-300 ${
          currentIndex === totalSections - 1
            ? 'opacity-20 cursor-not-allowed'
            : 'opacity-60 hover:opacity-100 hover:scale-110'
        }`}
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Mobile swipe hint */}
      <p className="text-center text-white/30 text-xs mt-4 md:hidden">
        ← Swipe to explore →
      </p>
    </div>
  )
}
