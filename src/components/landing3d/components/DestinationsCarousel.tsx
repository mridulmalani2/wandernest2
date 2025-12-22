'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

/**
 * DestinationsCarousel - A gamified carousel showcasing destinations
 *
 * Features:
 * - Drag-to-scroll interaction with momentum
 * - 3D tilt effect on hover
 * - Cards that "lift" on hover with shadow changes
 * - Parallax depth effect as cards scroll
 * - Progress indicator
 * - Smooth animations matching the dark premium aesthetic
 */

interface Destination {
  id: string
  city: string
  country: string
  image: string
  guideCount: number
  rating: number
  tagline: string
}

const destinations: Destination[] = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    guideCount: 45,
    rating: 4.9,
    tagline: 'City of Lights',
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    guideCount: 62,
    rating: 4.8,
    tagline: 'Historic & Modern',
  },
  {
    id: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80',
    guideCount: 38,
    rating: 4.9,
    tagline: 'Art & Architecture',
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80',
    guideCount: 29,
    rating: 4.7,
    tagline: 'Canals & Culture',
  },
  {
    id: 'rome',
    city: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
    guideCount: 41,
    rating: 4.8,
    tagline: 'Eternal City',
  },
  {
    id: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80',
    guideCount: 35,
    rating: 4.7,
    tagline: 'History & Nightlife',
  },
]

interface CardProps {
  destination: Destination
  index: number
  scrollProgress: number
}

function DestinationCard({ destination, index, scrollProgress }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  // Calculate parallax offset based on scroll position and card index
  const parallaxOffset = (index - scrollProgress * destinations.length) * 0.05

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = (e.clientX - centerX) / (rect.width / 2)
    const y = (e.clientY - centerY) / (rect.height / 2)

    setTilt({ x: y * -8, y: x * 8 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-72 md:w-80 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transform: `translateY(${parallaxOffset * 20}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateY(-12px) scale(1.02)' : ''}`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(107, 141, 214, 0.2)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
          transition: 'transform 0.2s ease-out, box-shadow 0.3s ease-out',
        }}
      >
        {/* Image container */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <Image
            src={destination.image}
            alt={`${destination.city}, ${destination.country}`}
            fill
            sizes="(max-width: 768px) 288px, 320px"
            className="object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Rating badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10"
            style={{
              transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)',
              transition: 'transform 0.3s ease-out',
            }}
          >
            <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs font-medium">{destination.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div
          className="relative p-4 bg-gradient-to-b from-[#1a1a2e] to-[#12121f] border-t border-white/5"
          style={{
            transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)',
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {destination.city}
              </h3>
              <p className="text-white/60 text-sm">{destination.country}</p>
            </div>
            <div
              className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <span className="text-xs font-medium text-white/80">
                {destination.guideCount} guides
              </span>
            </div>
          </div>

          <p className="text-white/50 text-sm italic">{destination.tagline}</p>

          {/* Explore button - appears on hover */}
          <div
            className="mt-3 overflow-hidden"
            style={{
              maxHeight: isHovered ? '40px' : '0',
              opacity: isHovered ? 1 : 0,
              transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out',
            }}
          >
            <button className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-white/10 text-white/90 text-sm font-medium hover:from-blue-500/40 hover:to-purple-500/40 transition-colors">
              Explore Guides
            </button>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isHovered
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, transparent 100%)'
              : 'none',
            transition: 'background 0.3s ease-out',
          }}
        />
      </div>
    </div>
  )
}

export default function DestinationsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const animationFrameRef = useRef<number>()

  // Update scroll progress
  const updateScrollProgress = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollContainerRef.current
    const maxScroll = scrollWidth - clientWidth
    setScrollProgress(maxScroll > 0 ? sl / maxScroll : 0)
  }, [])

  // Momentum scrolling
  useEffect(() => {
    if (isDragging || Math.abs(velocity) < 0.5) return

    const animate = () => {
      if (!scrollContainerRef.current) return

      scrollContainerRef.current.scrollLeft += velocity
      setVelocity((v) => v * 0.95) // Friction

      updateScrollProgress()

      if (Math.abs(velocity) > 0.5) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDragging, velocity, updateScrollProgress])

  // Mouse/touch handlers for drag scrolling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return

    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    lastXRef.current = e.pageX
    lastTimeRef.current = performance.now()
    setVelocity(0)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return

      e.preventDefault()
      const x = e.pageX - scrollContainerRef.current.offsetLeft
      const walk = (x - startX) * 1.5

      scrollContainerRef.current.scrollLeft = scrollLeft - walk

      // Calculate velocity for momentum
      const now = performance.now()
      const dt = now - lastTimeRef.current
      if (dt > 0) {
        const dx = e.pageX - lastXRef.current
        setVelocity(-dx / dt * 15)
      }
      lastXRef.current = e.pageX
      lastTimeRef.current = now

      updateScrollProgress()
    },
    [isDragging, startX, scrollLeft, updateScrollProgress]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return

    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    lastXRef.current = e.touches[0].pageX
    lastTimeRef.current = performance.now()
    setVelocity(0)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !scrollContainerRef.current) return

      const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
      const walk = (x - startX) * 1.5

      scrollContainerRef.current.scrollLeft = scrollLeft - walk

      // Calculate velocity
      const now = performance.now()
      const dt = now - lastTimeRef.current
      if (dt > 0) {
        const dx = e.touches[0].pageX - lastXRef.current
        setVelocity(-dx / dt * 15)
      }
      lastXRef.current = e.touches[0].pageX
      lastTimeRef.current = now

      updateScrollProgress()
    },
    [isDragging, startX, scrollLeft, updateScrollProgress]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle native scroll
  const handleScroll = useCallback(() => {
    updateScrollProgress()
  }, [updateScrollProgress])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mb-3">
          Popular Destinations
        </h2>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
          Explore cities with local student guides who know every hidden gem
        </p>
      </div>

      {/* Drag hint */}
      <div className="text-center mb-4">
        <span className="text-white/40 text-sm flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Drag to explore
        </span>
      </div>

      {/* Carousel container */}
      <div
        ref={scrollContainerRef}
        className={`flex gap-5 px-4 md:px-8 pb-4 overflow-x-auto scrollbar-hide ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
      >
        {/* Leading spacer */}
        <div className="flex-shrink-0 w-4 md:w-8" />

        {destinations.map((destination, index) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            index={index}
            scrollProgress={scrollProgress}
          />
        ))}

        {/* Trailing spacer */}
        <div className="flex-shrink-0 w-4 md:w-8" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center items-center gap-3 mt-6">
        {/* Progress bar */}
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-150"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {destinations.map((_, index) => {
            const isActive = Math.round(scrollProgress * (destinations.length - 1)) === index
            return (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 w-4'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                onClick={() => {
                  if (!scrollContainerRef.current) return
                  const { scrollWidth, clientWidth } = scrollContainerRef.current
                  const maxScroll = scrollWidth - clientWidth
                  const targetScroll = (index / (destinations.length - 1)) * maxScroll
                  scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' })
                }}
                aria-label={`Go to ${destinations[index].city}`}
              />
            )
          })}
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
