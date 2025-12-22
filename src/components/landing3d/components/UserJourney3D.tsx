'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { Group, Vector3, Color } from 'three'

/**
 * UserJourney3D - Immersive scroll-driven user journey
 *
 * Four engaging sections highlighting USPs:
 * 1. Cultural Connection - Students from your home country
 * 2. Lived Experience - Real recommendations, not commercial
 * 3. Personal Concierge - Itinerary, transport, guidance
 * 4. Student Opportunity - Earn more than campus jobs
 *
 * Features:
 * - 3D animated backgrounds per section
 * - Varied typography (big/small, different weights)
 * - Floating elements and particle effects
 * - Scroll-driven transitions
 * - Engaging micro-interactions
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
}

const journeySections: JourneySection[] = [
  {
    id: 'cultural',
    tagline: 'FEEL AT HOME',
    headline: 'Connect with Your Culture',
    subheadline: 'Abroad',
    description: 'Match with student guides from your home country who speak your language and understand your culture.',
    accentColor: '#6B8DD6',
    secondaryColor: '#9B7BD6',
    icon: '🌍',
  },
  {
    id: 'authentic',
    tagline: 'SKIP THE TOURIST TRAPS',
    headline: 'Real Experiences',
    subheadline: 'Not Reviews',
    description: 'Every recommendation comes from lived experience. The café where locals actually go. The viewpoint that\'s not on Instagram.',
    accentColor: '#9B7BD6',
    secondaryColor: '#D67B8D',
    icon: '✨',
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
  },
  {
    id: 'student',
    tagline: "WHAT'S MORE?",
    headline: 'Students Earn',
    subheadline: '2x Campus Jobs',
    description: 'Share your city. Meet travelers. Earn more than double what typical campus jobs pay. Flexible hours around your schedule.',
    accentColor: '#6BD6C5',
    secondaryColor: '#6B8DD6',
    icon: '🎓',
  },
]

// Floating orb component for 3D background
function FloatingOrb({
  position,
  color,
  scale = 1,
  speed = 1,
  distort = 0.4,
}: {
  position: [number, number, number]
  color: string
  scale?: number
  speed?: number
  distort?: number
}) {
  const meshRef = useRef<any>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime * speed
    meshRef.current.position.y = position[1] + Math.sin(time) * 0.3
    meshRef.current.position.x = position[0] + Math.cos(time * 0.7) * 0.2
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2
    meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.2
  })

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.6}
        distort={distort}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  )
}

// Particle field for atmospheric effect
function ParticleField({ color, count = 50 }: { color: string; count?: number }) {
  const points = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      )
    }
    return new Float32Array(positions)
  }, [count])

  const ref = useRef<any>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// 3D Scene for each section
function JourneyScene({
  section,
  progress,
}: {
  section: JourneySection
  progress: number
}) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = progress * 0.5
  })

  return (
    <group ref={groupRef}>
      <ParticleField color={section.accentColor} count={80} />
      <FloatingOrb
        position={[-3, 1, -2]}
        color={section.accentColor}
        scale={0.8}
        speed={0.8}
      />
      <FloatingOrb
        position={[3, -1, -3]}
        color={section.secondaryColor}
        scale={0.6}
        speed={1.2}
      />
      <FloatingOrb
        position={[0, 2, -4]}
        color={section.accentColor}
        scale={0.4}
        speed={1}
        distort={0.6}
      />
    </group>
  )
}

// Individual journey section content
function JourneySectionContent({
  section,
  index,
  isActive,
  progress,
}: {
  section: JourneySection
  index: number
  isActive: boolean
  progress: number
}) {
  const isStudentSection = section.id === 'student'

  // Animation states based on progress
  const opacity = isActive ? 1 : 0
  const translateY = isActive ? 0 : 50
  const scale = isActive ? 1 : 0.9

  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6 md:px-12 transition-all duration-700 ease-out"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="max-w-4xl w-full text-center">
        {/* Tagline */}
        <div
          className="mb-4 transition-all duration-500 delay-100"
          style={{
            opacity: isActive ? 1 : 0,
            transform: `translateY(${isActive ? 0 : 20}px)`,
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.3em] uppercase"
            style={{
              background: `linear-gradient(135deg, ${section.accentColor}30, ${section.secondaryColor}30)`,
              border: `1px solid ${section.accentColor}40`,
              color: section.accentColor,
            }}
          >
            {section.tagline}
          </span>
        </div>

        {/* Main headline with varied typography */}
        <h2
          className="transition-all duration-500 delay-200"
          style={{
            opacity: isActive ? 1 : 0,
            transform: `translateY(${isActive ? 0 : 30}px)`,
          }}
        >
          <span
            className="block font-serif font-bold tracking-tight leading-none"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              background: `linear-gradient(135deg, #ffffff 0%, ${section.accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 80px ${section.accentColor}40`,
            }}
          >
            {section.headline}
          </span>
          <span
            className="block font-light tracking-wide mt-2"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 3rem)',
              color: section.secondaryColor,
              textShadow: `0 0 40px ${section.secondaryColor}30`,
            }}
          >
            {section.subheadline}
          </span>
        </h2>

        {/* Icon */}
        <div
          className="my-8 transition-all duration-500 delay-300"
          style={{
            opacity: isActive ? 1 : 0,
            transform: `scale(${isActive ? 1 : 0.5}) translateY(${isActive ? 0 : 20}px)`,
          }}
        >
          <span
            className="inline-block text-6xl md:text-7xl animate-float"
            style={{
              filter: `drop-shadow(0 0 30px ${section.accentColor}60)`,
            }}
          >
            {section.icon}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-white/70 max-w-xl mx-auto leading-relaxed transition-all duration-500 delay-400"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            opacity: isActive ? 1 : 0,
            transform: `translateY(${isActive ? 0 : 20}px)`,
          }}
        >
          {section.description}
        </p>

        {/* CTA for student section */}
        {isStudentSection && (
          <div
            className="mt-10 transition-all duration-500 delay-500"
            style={{
              opacity: isActive ? 1 : 0,
              transform: `translateY(${isActive ? 0 : 20}px)`,
            }}
          >
            <a
              href="/student"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${section.accentColor}, ${section.secondaryColor})`,
                color: '#0a0a1a',
                boxShadow: `0 10px 40px ${section.accentColor}40`,
              }}
            >
              Become a Guide
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// Progress indicator
function JourneyProgress({
  currentSection,
  totalSections,
  sections,
}: {
  currentSection: number
  totalSections: number
  sections: JourneySection[]
}) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3">
      {sections.map((section, index) => {
        const isActive = index === currentSection
        const isPast = index < currentSection

        return (
          <div
            key={section.id}
            className="relative group"
          >
            {/* Connecting line */}
            {index < totalSections - 1 && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3"
                style={{
                  background: isPast || isActive
                    ? `linear-gradient(180deg, ${section.accentColor}, ${sections[index + 1]?.accentColor || section.accentColor})`
                    : 'rgba(255,255,255,0.2)',
                }}
              />
            )}

            {/* Dot */}
            <button
              className="relative w-3 h-3 rounded-full transition-all duration-300"
              style={{
                background: isActive
                  ? section.accentColor
                  : isPast
                  ? section.accentColor + '80'
                  : 'rgba(255,255,255,0.3)',
                boxShadow: isActive ? `0 0 20px ${section.accentColor}` : 'none',
                transform: isActive ? 'scale(1.5)' : 'scale(1)',
              }}
            >
              {/* Pulse effect for active */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: section.accentColor,
                    opacity: 0.5,
                  }}
                />
              )}
            </button>

            {/* Label on hover */}
            <div
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ borderColor: section.accentColor + '40', borderWidth: 1 }}
            >
              {section.tagline}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Scroll prompt
function ScrollPrompt({ show }: { show: boolean }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: `translateY(${show ? 0 : 20}px)`,
      }}
    >
      <div className="flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-xs uppercase tracking-widest">Keep Scrolling</span>
        <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

// Main component
export default function UserJourney3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionProgress, setSectionProgress] = useState(0)
  const [isInView, setIsInView] = useState(false)

  // Calculate current section based on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const containerTop = rect.top
    const containerHeight = rect.height
    const viewportHeight = window.innerHeight

    // Calculate how far through the container we've scrolled
    const scrollProgress = Math.max(0, Math.min(1,
      (-containerTop) / (containerHeight - viewportHeight)
    ))

    // Determine which section we're in
    const sectionCount = journeySections.length
    const rawSection = scrollProgress * sectionCount
    const section = Math.min(sectionCount - 1, Math.floor(rawSection))
    const progress = rawSection - section

    setCurrentSection(section)
    setSectionProgress(progress)

    // Check if in view
    setIsInView(containerTop < viewportHeight && containerTop + containerHeight > 0)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const currentJourneySection = journeySections[currentSection]

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${journeySections.length * 100}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            {currentJourneySection && (
              <JourneyScene
                section={currentJourneySection}
                progress={sectionProgress}
              />
            )}
          </Canvas>
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 0%, ${currentJourneySection?.accentColor}10 50%, #0a0a1a 100%)`,
          }}
        />

        {/* Content sections */}
        <div className="relative h-full">
          {journeySections.map((section, index) => (
            <JourneySectionContent
              key={section.id}
              section={section}
              index={index}
              isActive={index === currentSection}
              progress={sectionProgress}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <JourneyProgress
          currentSection={currentSection}
          totalSections={journeySections.length}
          sections={journeySections}
        />

        {/* Scroll prompt - show only for non-last sections */}
        <ScrollPrompt show={isInView && currentSection < journeySections.length - 1} />

        {/* Section counter */}
        <div className="absolute bottom-8 left-8 text-white/30 text-sm font-mono">
          <span style={{ color: currentJourneySection?.accentColor }}>
            {String(currentSection + 1).padStart(2, '0')}
          </span>
          <span className="mx-2">/</span>
          <span>{String(journeySections.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
