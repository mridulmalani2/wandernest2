'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plane, GraduationCap, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { WarpTransition } from '@/components/transitions/WarpTransition'
import { useWarpNavigation } from '@/hooks/useWarpNavigation'

/**
 * LandingFallback - Enhanced mobile version matching desktop aesthetics
 *
 * Features:
 * - Animated CSS star field
 * - Paris night background
 * - Glassmorphism cards
 * - "Why TourWiseCo?" swipeable carousel
 * - Destinations carousel
 * - Same typography and colors as desktop
 */

// ============================================
// DATA - Same as desktop
// ============================================

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
    description: 'Every recommendation comes from lived experience. The café where locals actually go.',
    accentColor: '#9B7BD6',
    secondaryColor: '#D67B8D',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  },
  {
    id: 'concierge',
    tagline: 'YOUR PERSONAL GUIDE',
    headline: 'From Landing',
    subheadline: 'to Departure',
    description: 'Custom itineraries. Public transport mastered. Hidden gems discovered.',
    accentColor: '#D67B8D',
    secondaryColor: '#6BD6C5',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  },
  {
    id: 'student',
    tagline: "WHAT'S MORE?",
    headline: 'Students Earn',
    subheadline: '2× Campus Jobs',
    description: 'Share your city. Meet travelers. Earn more than double typical campus jobs.',
    accentColor: '#6BD6C5',
    secondaryColor: '#6B8DD6',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
  },
]

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
]

// ============================================
// ANIMATED STAR FIELD COMPONENT
// ============================================

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Small distant stars */}
      <div className="stars-layer-1" />
      {/* Layer 2: Medium stars */}
      <div className="stars-layer-2" />
      {/* Layer 3: Large close stars with twinkle */}
      <div className="stars-layer-3" />
      {/* Shooting star occasional */}
      <div className="shooting-star" />
    </div>
  )
}

// ============================================
// JOURNEY CAROUSEL (Why TourWiseCo?)
// ============================================

function JourneyCarousel({ triggerTransition }: { triggerTransition: (path: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)

  const goToIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(journeySections.length - 1, index))
    setCurrentIndex(clampedIndex)
  }, [])

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
    if (!isDragging) return
    setIsDragging(false)
    if (dragDelta < -50 && currentIndex < journeySections.length - 1) {
      goToIndex(currentIndex + 1)
    } else if (dragDelta > 50 && currentIndex > 0) {
      goToIndex(currentIndex - 1)
    }
    setDragDelta(0)
  }, [isDragging, dragDelta, currentIndex, goToIndex])

  const currentSection = journeySections[currentIndex]

  return (
    <section className="relative py-12 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 60% at 50% 50%, ${currentSection.accentColor}20 0%, transparent 70%)`,
        }}
      />

      {/* Section Title */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">
          Why TourWiseCo?
        </h2>
        <p className="text-white/50 text-sm">
          Swipe to discover what makes us different
        </p>
      </div>

      {/* Card Container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {journeySections.map((section, index) => (
            <div key={section.id} className="w-full flex-shrink-0 px-2">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${section.accentColor}15, ${section.secondaryColor}10, rgba(10,10,26,0.95))`,
                  border: `1px solid ${section.accentColor}40`,
                  boxShadow: `0 20px 50px -15px rgba(0,0,0,0.5), 0 0 40px ${section.accentColor}15`,
                }}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.headline}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 20%, ${section.accentColor}30 60%, rgba(10,10,26,1) 100%)`,
                    }}
                  />
                  {/* Card Index */}
                  <div className="absolute top-3 right-3 font-mono text-xs text-white/50">
                    {String(index + 1).padStart(2, '0')}/{String(journeySections.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Tagline */}
                  <div
                    className="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase mb-3"
                    style={{
                      background: `${section.accentColor}20`,
                      color: section.accentColor,
                      border: `1px solid ${section.accentColor}30`,
                    }}
                  >
                    {section.tagline}
                  </div>

                  {/* Headlines */}
                  <h3 className="mb-3">
                    <span
                      className="block text-xl font-bold leading-tight"
                      style={{
                        fontFamily: 'Georgia, serif',
                        color: '#ffffff',
                      }}
                    >
                      {section.headline}
                    </span>
                    <span
                      className="block text-lg font-light italic"
                      style={{
                        fontFamily: 'Georgia, serif',
                        color: section.accentColor,
                      }}
                    >
                      {section.subheadline}
                    </span>
                  </h3>

                  <p className="text-sm text-white/60 leading-relaxed">
                    {section.description}
                  </p>

                  {/* CTA for student card */}
                  {section.id === 'student' && (
                    <button
                      onClick={() => triggerTransition('/student')}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-semibold text-sm transition-transform active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${section.accentColor}, ${section.secondaryColor})`,
                        color: '#0a0a1a',
                      }}
                    >
                      Become a Guide
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {journeySections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => goToIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6' : 'w-2'
              }`}
            style={{
              background: index === currentIndex
                ? `linear-gradient(90deg, ${section.accentColor}, ${section.secondaryColor})`
                : 'rgba(255,255,255,0.25)',
            }}
            aria-label={`Go to ${section.headline}`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-white/30 text-xs mt-3">
        ← Swipe to explore →
      </p>
    </section>
  )
}

// ============================================
// DESTINATIONS CAROUSEL
// ============================================

function DestinationsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const maxScroll = scrollWidth - clientWidth
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', handleScroll)
      return () => el.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <section className="relative py-12">
      {/* Section Header */}
      <div className="text-center mb-6 px-4">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">
          Popular Destinations
        </h2>
        <p className="text-white/50 text-sm">
          Explore cities with local student guides
        </p>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="flex-shrink-0 w-64 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 15px 40px -10px rgba(0,0,0,0.4)',
            }}
          >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
              <Image
                src={dest.image}
                alt={`${dest.city}, ${dest.country}`}
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Rating badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white text-xs font-medium">{dest.rating}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-base font-bold text-white">{dest.city}</h3>
                  <p className="text-white/50 text-xs">{dest.country}</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
                  <span className="text-[10px] font-medium text-white/70">{dest.guideCount} guides</span>
                </div>
              </div>
              <p className="text-white/40 text-xs italic">{dest.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex justify-center px-4 mt-4">
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-150"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LandingFallback() {
  const { isTransitioning, triggerTransition } = useWarpNavigation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Warp overlay */}
      <WarpTransition isActive={isTransitioning} />

      {/* Paris Night Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=60"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/70 via-[#0a0a1a]/50 to-[#0a0a1a]" />
      </div>

      {/* Animated Star Field */}
      <StarField />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
          <motion.div
            className="text-center max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Headline */}
            <h1
              className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight tracking-tight mb-4"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.7)' }}
            >
              Experience Authentic Travel
              <span className="block mt-1">with Local Student Guides</span>
            </h1>

            {/* Subheadline */}
            <motion.p
              className="text-sm sm:text-base text-white/70 max-w-md mx-auto mb-8 font-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Connect with verified university students who will show you
              their city through a local&apos;s eyes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/tourist"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plane className="w-5 h-5" />
                <span>I&apos;m a Tourist</span>
                <span className="ml-1">→</span>
              </Link>

              <button
                onClick={() => triggerTransition('/student')}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] rounded-xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <GraduationCap className="w-5 h-5" />
                <span>I&apos;m a Student</span>
                <span className="ml-1">→</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="text-white/40 text-[10px] uppercase tracking-widest">
              Scroll to explore
            </span>
            <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
          </motion.div>
        </section>

        {/* Journey Carousel - Why TourWiseCo? */}
        <JourneyCarousel triggerTransition={triggerTransition} />

        {/* Destinations Carousel */}
        <DestinationsCarousel />

        {/* CTA Section */}
        <section className="relative py-16 px-4">
          <motion.div
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-2xl font-serif font-bold text-white mb-6"
              style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
            >
              Ready to Start Your Journey?
            </h2>

            <div className="flex flex-col gap-3">
              <Link
                href="/tourist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-white transition-all duration-300 active:scale-95"
              >
                <Plane className="w-4 h-4" />
                <span>I&apos;m a Tourist</span>
                <span>→</span>
              </Link>

              <button
                onClick={() => triggerTransition('/student')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-white transition-all duration-300 active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Become a Guide</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* CSS for stars and animations */}
      <style jsx global>{`
        /* Hide scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Star layers */
        .stars-layer-1,
        .stars-layer-2,
        .stars-layer-3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: repeat;
        }

        .stars-layer-1 {
          background-image: radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent);
          background-size: 200px 200px;
          animation: twinkle 4s ease-in-out infinite;
          opacity: 0.6;
        }

        .stars-layer-2 {
          background-image: radial-gradient(1.5px 1.5px at 150px 150px, white, transparent),
            radial-gradient(1.5px 1.5px at 70px 220px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 220px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 100px 100px, rgba(255,255,255,0.8), transparent);
          background-size: 300px 300px;
          animation: twinkle 6s ease-in-out infinite reverse;
          opacity: 0.5;
        }

        .stars-layer-3 {
          background-image: radial-gradient(2px 2px at 250px 250px, rgba(107,141,214,0.9), transparent),
            radial-gradient(2px 2px at 100px 300px, rgba(155,123,214,0.8), transparent),
            radial-gradient(2px 2px at 300px 100px, rgba(214,123,141,0.7), transparent);
          background-size: 400px 400px;
          animation: twinkle 8s ease-in-out infinite;
          opacity: 0.4;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* Shooting star */
        .shooting-star {
          position: absolute;
          top: 15%;
          left: 0;
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
          animation: shoot 8s ease-in-out infinite;
          opacity: 0;
        }

        @keyframes shoot {
          0% { transform: translateX(-100px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translateX(100vw) translateY(150px); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
