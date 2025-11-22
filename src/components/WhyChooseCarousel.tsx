// Visual: Using design system border radii, shadows, and typography for consistency
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Feature {
  title: string
  description: string
  bullets: string[]
  image: string
  imageAlt: string
  accentColor: string
}

const features: Feature[] = [
  {
    title: 'Authentic Local Experiences',
    description:
      'Skip the tourist traps and discover the real city. Our student guides know the best local cafes, hidden viewpoints, and authentic experiences that guidebooks miss. Connect with the culture through someone who lives it every day.',
    bullets: [
      'Hidden local spots and neighborhood favorites',
      'Cultural insights from a local perspective',
      'Personalized recommendations for your interests',
    ],
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    imageAlt: 'Local cafe experience with authentic ambiance',
    accentColor: 'blue',
  },
  {
    title: 'Verified University Students',
    description:
      'All our guides are verified university students with proven local knowledge. They are passionate about sharing their city and creating meaningful connections with travelers from around the world.',
    bullets: [
      'Background-verified student credentials',
      'Match with guides from your home country for added comfort',
      'Rated and reviewed by past travelers',
    ],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    imageAlt: 'University students working together in modern campus setting',
    accentColor: 'purple',
  },
  {
    title: 'Flexible and Personalized',
    description:
      'Every traveler is unique. Whether you want to explore historic landmarks, find the best street food, or discover nightlife hotspots, your guide will customize the experience to match your interests and pace.',
    bullets: [
      'Customized itineraries based on your preferences',
      'Flexible scheduling around your travel plans',
      'Small group or one-on-one experiences',
    ],
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
    imageAlt: 'Friends enjoying flexible travel together in a European city',
    accentColor: 'green',
  },
]

const accentColors = {
  blue: {
    check: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-600',
    dotActive: 'bg-blue-500',
    dotGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]',
  },
  purple: {
    check: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-600',
    dotActive: 'bg-purple-500',
    dotGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]',
  },
  green: {
    check: 'text-green-600 dark:text-green-400',
    dot: 'bg-green-600',
    dotActive: 'bg-green-500',
    dotGlow: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]',
  },
}

export default function WhyChooseCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToSlide = useCallback((index: number, dir: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(dir)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    const newIndex = (currentIndex + 1) % features.length
    goToSlide(newIndex, 1)
  }, [currentIndex, goToSlide])

  const prevSlide = useCallback(() => {
    const newIndex = (currentIndex - 1 + features.length) % features.length
    goToSlide(newIndex, -1)
  }, [currentIndex, goToSlide])

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentFeature = features[currentIndex]
  const colors = accentColors[currentFeature.accentColor as keyof typeof accentColors]

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const contentVariants = {
    enter: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
  }

  return (
    <div className="pt-12 space-y-6 animate-fade-in-up delay-300">
      {/* Section Title */}
      <div className="text-center space-y-2 px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-shadow-lg tracking-tight">
          Why Choose TourWiseCo?
        </h2>
        <p className="text-base md:text-lg text-white/90 text-shadow max-w-2xl mx-auto">
          Experience travel differently with our verified student guides
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-5xl mx-auto px-4">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Why choose TourWiseCo carousel"
          aria-live="polite"
        >
          {/* Main Image Background */}
          <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px]">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={currentFeature.image}
                  alt={currentFeature.imageAlt}
                  fill
                  loading={index === 0 ? 'eager' : 'lazy'}
                  quality={85}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1200px"
                  className="object-cover"
                />
                {/* Refined gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
              </div>
            ))}

            {/* Content Card - Better positioned and styled */}
            <div className="absolute inset-0 flex items-end md:items-center justify-center p-4 md:p-6">
              <div
                className={`w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 space-y-4 md:space-y-5 transition-all duration-500 border border-white/40 dark:border-gray-700/40 shadow-xl ${
                  isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
              >
                {/* Title with accent color bar */}
                <div className="space-y-3">
                  <div className={`w-16 h-1 rounded-full ${colors.dot}`} />
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                    {currentFeature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {currentFeature.description}
                </p>

                {/* Bullet Points with improved styling */}
                <ul className="space-y-3 pt-2">
                  {currentFeature.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start transition-all duration-300"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className={`mr-3 font-bold text-xl flex-shrink-0 ${colors.check}`}>
                        ✓
                      </span>
                      <span className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation Arrows - Refined design */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white border border-white/40 dark:border-gray-700/40"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white" />
            </button>

            <motion.button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white border border-white/40 dark:border-gray-700/40"
              aria-label="Next feature"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white" />
            </motion.button>
          </div>
        </div>

        {/* Dot Indicators - Refined design */}
        <div className="flex justify-center items-center gap-2 md:gap-3 mt-5 md:mt-6">
          {features.map((feature, index) => {
            const dotColors = accentColors[feature.accentColor as keyof typeof accentColors]
            const isActive = index === currentIndex
            return (
              <motion.button
                key={feature.title}
                onClick={() => {
                  const dir = index > currentIndex ? 1 : -1
                  goToSlide(index, dir)
                }}
                disabled={isTransitioning}
                className={`group transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-full ${
                  index === currentIndex ? 'w-10 md:w-12' : 'w-2.5 md:w-3'
                }`}
                aria-label={`Go to ${feature.title}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <div
                  className={`h-2.5 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? `${dotColors.dotActive} shadow-md`
                      : 'bg-white/70 hover:bg-white/90'
                  }`}
                />
              </motion.button>
            )
          })}
        </div>

        {/* Swipe Hint for Mobile */}
        <p className="text-center text-sm text-white/80 mt-3 md:hidden text-shadow-sm font-medium">
          Swipe to explore more features
        </p>
      </div>
    </div>
  )
}
