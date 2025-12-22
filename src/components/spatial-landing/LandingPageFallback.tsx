'use client'

import Image from 'next/image'
import { HeroContent } from '@/components/hero3d/HeroContent'
import { HeroFallback } from '@/components/hero3d/HeroFallback'

/**
 * Feature data for the value proposition section
 */
const FEATURES = [
  {
    id: 'authentic',
    title: 'Authentic Local Experiences',
    description:
      'Skip the tourist traps and discover the real city. Our student guides know the best local cafes, hidden viewpoints, and authentic experiences.',
    bullets: [
      'Hidden local spots and neighborhood favorites',
      'Cultural insights from a local perspective',
      'Personalized recommendations for your interests',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    imageAlt: 'Local cafe experience',
    accentColor: 'blue' as const,
  },
  {
    id: 'verified',
    title: 'Verified University Students',
    description:
      'All our guides are verified university students with proven local knowledge. They are passionate about sharing their city.',
    bullets: [
      'Background-verified student credentials',
      'Match with guides from your home country',
      'Rated and reviewed by past travelers',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    imageAlt: 'University students',
    accentColor: 'purple' as const,
  },
  {
    id: 'flexible',
    title: 'Flexible and Personalized',
    description:
      'Every traveler is unique. Your guide will customize the experience to match your interests and pace.',
    bullets: [
      'Customized itineraries based on preferences',
      'Flexible scheduling around your plans',
      'Small group or one-on-one experiences',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
    imageAlt: 'Flexible travel',
    accentColor: 'green' as const,
  },
]

const ACCENT_CLASSES = {
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  green: 'text-green-500',
}

/**
 * LandingPageFallback - Static fallback for mobile and low-end devices
 *
 * Provides the same content and information hierarchy as the 3D version,
 * but in a traditional scrolling layout that's:
 * - Fast loading
 * - Battery efficient
 * - Fully accessible
 * - Touch-friendly
 *
 * This ensures all users get a premium experience regardless of device.
 */
export function LandingPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
            alt="Beautiful Paris cityscape with Eiffel Tower"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/15 via-ui-purple-accent/10 to-ui-purple-primary/15" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 pattern-dots opacity-20" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-24 md:pb-12 lg:pt-28 lg:pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-7 lg:gap-14 items-center min-h-[calc(100vh-14rem)]">
              {/* Left Column - Text Content */}
              <div className="relative z-20">
                <HeroContent is3DEnabled={false} />
              </div>

              {/* Right Column - Static Images */}
              <div className="hidden lg:block relative">
                <HeroFallback />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-fade-in">
          <span className="text-sm font-light">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-transparent via-black/80 to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
                Why Choose TourWiseCo?
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Experience travel differently with our verified student guides
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Accent bar */}
                    <div
                      className={`w-12 h-1 rounded-full mb-4 ${
                        feature.accentColor === 'blue'
                          ? 'bg-blue-500'
                          : feature.accentColor === 'purple'
                            ? 'bg-purple-500'
                            : 'bg-green-500'
                      }`}
                    />

                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Bullets */}
                    <ul className="space-y-2">
                      {feature.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className={`mr-2 font-bold ${ACCENT_CLASSES[feature.accentColor]}`}>
                            ✓
                          </span>
                          <span className="text-gray-300">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
