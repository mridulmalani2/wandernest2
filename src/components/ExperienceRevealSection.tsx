// Visual: Modern Experience Reveal Section with staggered cards, boutique design, and smooth animations
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'

interface Experience {
  title: string
  description: string
  bullets: string[]
  image: string
  imageAlt: string
  accentColor: string
}

const experiences: Experience[] = [
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

const gradientAccents = {
  blue: 'from-blue-500 via-blue-400 to-cyan-400',
  purple: 'from-purple-500 via-purple-400 to-pink-400',
  green: 'from-green-500 via-emerald-400 to-teal-400',
}

const glowColors = {
  blue: 'shadow-[0_0_40px_rgba(59,130,246,0.4)]',
  purple: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
  green: 'shadow-[0_0_40px_rgba(34,197,94,0.4)]',
}

export default function ExperienceRevealSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <div className="pt-12 space-y-8 animate-fade-in-up delay-300" ref={sectionRef}>
      {/* Section Title */}
      <div className="text-center space-y-2 px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-shadow-lg tracking-tight">
          Why Choose WanderNest?
        </h2>
        <p className="text-base md:text-lg text-white/90 text-shadow max-w-2xl mx-auto">
          Experience travel differently with our verified student guides
        </p>
      </div>

      {/* Experience Cards Container */}
      <div className="relative w-full px-4">
        {/* Desktop: Grid Layout with Stagger */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {experiences.map((experience, index) => {
            const isCenterCard = index === 1
            const gradient = gradientAccents[experience.accentColor as keyof typeof gradientAccents]
            const glow = glowColors[experience.accentColor as keyof typeof glowColors]

            return (
              <motion.div
                key={experience.title}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        y: isCenterCard ? -12 : 0,
                        scale: 1,
                      }
                    : { opacity: 0, y: 60, scale: 0.9 }
                }
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: isCenterCard ? -20 : -8,
                  scale: 1.02,
                }}
                className={`group relative ${isCenterCard ? 'z-10' : 'z-0'}`}
              >
                {/* Card Container */}
                <div
                  className={`relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/20 transition-all duration-500 ${
                    isCenterCard && isInView ? glow : 'shadow-xl'
                  }`}
                >
                  {/* Gradient Accent Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={experience.image}
                      alt={experience.imageAlt}
                      fill
                      loading={index === 0 ? 'eager' : 'lazy'}
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-xl lg:text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                      {experience.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {experience.description}
                    </p>

                    {/* Bullet Points */}
                    <ul className="space-y-2.5 pt-2">
                      {experience.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start">
                          <span
                            className={`mr-2.5 font-bold text-lg flex-shrink-0 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                          >
                            ✓
                          </span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Center Card Glow Effect */}
                {isCenterCard && (
                  <motion.div
                    className={`absolute -inset-4 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-2xl -z-10 rounded-3xl transition-opacity duration-500`}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 0.15 } : { opacity: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Mobile: Horizontal Scroll (Airbnb-style) */}
        <div className="md:hidden">
          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {experiences.map((experience, index) => {
                const gradient = gradientAccents[experience.accentColor as keyof typeof gradientAccents]
                const isCenterCard = index === 1

                return (
                  <motion.div
                    key={experience.title}
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex-shrink-0 w-[85vw] max-w-sm snap-center"
                  >
                    {/* Card Container */}
                    <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/20 shadow-xl">
                      {/* Gradient Accent Bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                      {/* Image Section */}
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={experience.image}
                          alt={experience.imageAlt}
                          fill
                          loading={index === 0 ? 'eager' : 'lazy'}
                          quality={85}
                          sizes="85vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>

                      {/* Content Section */}
                      <div className="p-5 space-y-3">
                        {/* Title */}
                        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                          {experience.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {experience.description}
                        </p>

                        {/* Bullet Points */}
                        <ul className="space-y-2 pt-1">
                          {experience.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span
                                className={`mr-2 font-bold text-base flex-shrink-0 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                              >
                                ✓
                              </span>
                              <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                {bullet}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Scroll Hint */}
          <p className="text-center text-sm text-white/80 mt-3 text-shadow-sm font-medium">
            Swipe to explore more features
          </p>
        </div>
      </div>
    </div>
  )
}
