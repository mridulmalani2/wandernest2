'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

/**
 * UserJourney3D - Horizontal 3D Carousel
 *
 * A gamified horizontal carousel showing USPs in a 3D space:
 * - Current section is centered and fully visible
 * - Adjacent sections are visible with glassmorphic blur
 * - Horizontal scroll/swipe to navigate
 * - 3D perspective with depth effect
 */

interface JourneySection {
  id: string
  tagline: string
  headline: string
  subheadline: string
  description: string
  accentColor: string
  secondaryColor: string
  icon: string
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
    icon: '🌍',
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
    icon: '✨',
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
    icon: '🗺️',
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
    icon: '🎓',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
  },
]

interface CardProps {
  section: JourneySection
  position: 'far-left' | 'left' | 'center' | 'right' | 'far-right'
  onClick: () => void
  index: number
  totalCards: number
}

function JourneyCard({ section, position, onClick, index, totalCards }: CardProps) {
  const isCenter = position === 'center'
  const isAdjacent = position === 'left' || position === 'right'
  const isFar = position === 'far-left' || position === 'far-right'
  const isStudentCard = section.id === 'student'

  // Position transforms for 3D carousel effect
  const transforms: Record<string, { x: string; z: string; rotateY: string; scale: string; opacity: number }> = {
    'far-left': { x: '-180%', z: '-300px', rotateY: '45deg', scale: '0.6', opacity: 0.3 },
    'left': { x: '-85%', z: '-150px', rotateY: '25deg', scale: '0.85', opacity: 0.7 },
    'center': { x: '0%', z: '0px', rotateY: '0deg', scale: '1', opacity: 1 },
    'right': { x: '85%', z: '-150px', rotateY: '-25deg', scale: '0.85', opacity: 0.7 },
    'far-right': { x: '180%', z: '-300px', rotateY: '-45deg', scale: '0.6', opacity: 0.3 },
  }

  const transform = transforms[position]

  return (
    <div
      className={`absolute left-1/2 top-1/2 w-[340px] md:w-[420px] transition-all duration-700 ease-out ${
        isCenter ? 'cursor-default z-30' : 'cursor-pointer z-10'
      }`}
      style={{
        transform: `
          translateX(calc(-50% + ${transform.x}))
          translateY(-50%)
          translateZ(${transform.z})
          rotateY(${transform.rotateY})
          scale(${transform.scale})
        `,
        opacity: transform.opacity,
        filter: isCenter ? 'none' : `blur(${isFar ? '8px' : '3px'})`,
        pointerEvents: isCenter ? 'auto' : isAdjacent ? 'auto' : 'none',
      }}
      onClick={!isCenter ? onClick : undefined}
    >
      {/* Card Container */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: isCenter
            ? `linear-gradient(135deg, ${section.accentColor}15, ${section.secondaryColor}10)`
            : 'rgba(255,255,255,0.05)',
          backdropFilter: isCenter ? 'blur(20px)' : 'blur(10px)',
          border: `1px solid ${isCenter ? section.accentColor + '40' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isCenter
            ? `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px ${section.accentColor}20`
            : '0 10px 30px -10px rgba(0,0,0,0.3)',
        }}
      >
        {/* Image Section */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <Image
            src={section.image}
            alt={section.headline}
            fill
            sizes="420px"
            className="object-cover"
            style={{
              filter: isCenter ? 'none' : 'grayscale(50%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${section.accentColor}40 50%, #0a0a1a 100%)`,
            }}
          />

          {/* Icon Badge */}
          <div
            className="absolute top-4 left-4 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, ${section.accentColor}60, ${section.secondaryColor}60)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${section.accentColor}40`,
              boxShadow: `0 8px 32px ${section.accentColor}40`,
            }}
          >
            {section.icon}
          </div>

          {/* Card Index */}
          <div className="absolute top-4 right-4 font-mono text-white/40 text-sm">
            {String(index + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {/* Tagline */}
          <div
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4"
            style={{
              background: `${section.accentColor}20`,
              color: section.accentColor,
              border: `1px solid ${section.accentColor}30`,
            }}
          >
            {section.tagline}
          </div>

          {/* Headlines */}
          <h3 className="mb-1">
            <span
              className="block text-2xl md:text-3xl font-serif font-bold"
              style={{
                background: `linear-gradient(135deg, #ffffff, ${section.accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {section.headline}
            </span>
            <span
              className="block text-xl md:text-2xl font-light"
              style={{ color: section.secondaryColor }}
            >
              {section.subheadline}
            </span>
          </h3>

          {/* Description */}
          <p className="text-white/60 text-sm md:text-base leading-relaxed mt-4">
            {section.description}
          </p>

          {/* CTA for student card */}
          {isStudentCard && isCenter && (
            <a
              href="/student"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${section.accentColor}, ${section.secondaryColor})`,
                color: '#0a0a1a',
                boxShadow: `0 8px 32px ${section.accentColor}40`,
              }}
            >
              Become a Guide
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>

        {/* Glassmorphic overlay for non-center cards */}
        {!isCenter && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(10, 10, 26, 0.3)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
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

  const totalSections = journeySections.length

  // Navigate to specific index
  const goToIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalSections - 1, index))
    setCurrentIndex(clampedIndex)
  }, [totalSections])

  // Get position for each card relative to current index
  const getPosition = (cardIndex: number): 'far-left' | 'left' | 'center' | 'right' | 'far-right' => {
    const diff = cardIndex - currentIndex
    if (diff === 0) return 'center'
    if (diff === -1) return 'left'
    if (diff === 1) return 'right'
    if (diff < -1) return 'far-left'
    return 'far-right'
  }

  // Mouse/Touch handlers
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setDragDelta(0)
  }, [])

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const delta = clientX - startX
    setDragDelta(delta)
  }, [isDragging, startX])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    // Threshold for navigation (50px)
    if (dragDelta < -50 && currentIndex < totalSections - 1) {
      goToIndex(currentIndex + 1)
    } else if (dragDelta > 50 && currentIndex > 0) {
      goToIndex(currentIndex - 1)
    }

    setDragDelta(0)
  }, [isDragging, dragDelta, currentIndex, totalSections, goToIndex])

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }, [handleDragStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }, [handleDragMove])

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  const handleMouseLeave = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }, [handleDragMove])

  const handleTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Wheel navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    // Use horizontal scroll or vertical scroll
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY

    if (delta > 30 && currentIndex < totalSections - 1) {
      goToIndex(currentIndex + 1)
    } else if (delta < -30 && currentIndex > 0) {
      goToIndex(currentIndex - 1)
    }
  }, [currentIndex, totalSections, goToIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToIndex(currentIndex + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToIndex(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, goToIndex])

  // Add wheel listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const currentSection = journeySections[currentIndex]

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background gradient based on current section */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${currentSection.accentColor}15 0%, transparent 60%)`,
        }}
      />

      {/* Section Title */}
      <div className="text-center mb-12 px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
          Why TourWiseCo?
        </h2>
        <p className="text-white/60 text-base md:text-lg">
          Swipe to discover what makes us different
        </p>
      </div>

      {/* 3D Carousel Container */}
      <div
        ref={containerRef}
        className={`relative h-[550px] md:h-[620px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {journeySections.map((section, index) => (
            <JourneyCard
              key={section.id}
              section={section}
              position={getPosition(index)}
              onClick={() => goToIndex(index)}
              index={index}
              totalCards={totalSections}
            />
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center items-center gap-3 mt-8">
        {journeySections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToIndex(index)}
            className={`relative transition-all duration-300 ${
              index === currentIndex ? 'w-10' : 'w-3'
            } h-3 rounded-full`}
            style={{
              background: index === currentIndex
                ? `linear-gradient(90deg, ${section.accentColor}, ${section.secondaryColor})`
                : 'rgba(255,255,255,0.3)',
              boxShadow: index === currentIndex ? `0 0 20px ${section.accentColor}60` : 'none',
            }}
            aria-label={`Go to ${section.headline}`}
          >
            {index === currentIndex && (
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: section.accentColor,
                  opacity: 0.3,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between pointer-events-none z-40">
        <button
          onClick={() => goToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={`pointer-events-auto p-3 md:p-4 rounded-full backdrop-blur-md transition-all duration-300 ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-70 hover:opacity-100 hover:scale-110'
          }`}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => goToIndex(currentIndex + 1)}
          disabled={currentIndex === totalSections - 1}
          className={`pointer-events-auto p-3 md:p-4 rounded-full backdrop-blur-md transition-all duration-300 ${
            currentIndex === totalSections - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-70 hover:opacity-100 hover:scale-110'
          }`}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-6 md:hidden">
        <span className="text-white/40 text-sm flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Swipe to explore
        </span>
      </div>
    </div>
  )
}
