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
    <div className="pt-8 space-y-4 animate-fade-in-up delay-300">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-white text-shadow-lg tracking-tight px-4">
        Why Choose WanderNest?
      </h2>

      {/* Carousel Container */}
      <div className="relative w-full max-w-4xl mx-auto px-4">
        <div
          className="relative rounded-3xl overflow-hidden shadow-elevated"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Why choose WanderNest carousel"
          aria-live="polite"
        >
          {/* Main Image Background */}
          <div className="relative w-full h-[250px] md:h-[300px] lg:h-[325px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 }
                }}
                className="absolute inset-0"
              >
                <Image
                  src={currentFeature.image}
                  alt={currentFeature.imageAlt}
                  fill
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                  quality={80}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
              </motion.div>
            </AnimatePresence>

            {/* Floating Glass Content Card */}
            <div className="absolute inset-0 flex items-end md:items-center justify-center p-2 md:p-4 pointer-events-none">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="w-full max-w-xl glass-card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 space-y-2 md:space-y-3"
                >
                  {/* Title */}
                  <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-bold text-foreground tracking-tight">
                    {currentFeature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {currentFeature.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-1 md:space-y-2">
                    {currentFeature.bullets.map((bullet, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="flex items-start"
                      >
                        <span className={`mr-1.5 md:mr-2 font-bold text-base md:text-lg ${colors.check}`}>
                          ✓
                        </span>
                        <span className="text-xs md:text-sm text-foreground leading-relaxed">
                          {bullet}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows - Enhanced Design */}
            <motion.button
              onClick={prevSlide}
              disabled={isTransitioning}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-1.5 md:left-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-2 border border-white/20"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-foreground" strokeWidth={2.5} />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              disabled={isTransitioning}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-2 border border-white/20"
              aria-label="Next feature"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-foreground" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* Dot Indicators - Enhanced Design */}
        <div className="flex justify-center items-center gap-2 md:gap-2.5 mt-3 md:mt-4">
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
                whileHover={{ scale: isActive ? 1 : 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="group focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-full transition-all duration-300 relative"
                aria-label={`Go to ${feature.title}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <motion.div
                  animate={{
                    width: isActive ? '40px' : '12px',
                    height: '12px',
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? `${dotColors.dotActive} ${dotColors.dotGlow}`
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              </motion.button>
            )
          })}
        </div>

        {/* Swipe Hint for Mobile */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-white/80 mt-2 md:hidden text-shadow-sm"
        >
          Swipe left or right to explore
        </motion.p>
      </div>
    </div>
  )
}
