'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useAnimation,
  useTransform,
  PanInfo,
  animate,
  useMotionValueEvent
} from 'framer-motion'

/**
 * UserJourney3D - Fluid Physics Carousel
 *
 * Uses Framer Motion for 1:1 direct manipulation, inertia, and spring physics.
 * Cards exist in a continuous unbounded space and wrap visually around the center.
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

// Constants
const DRAG_FACTOR = 0.5 // Damping for horizontal 2-finger scroll
const CARD_WIDTH = 400  // Width of card "slot" in pixels
const SNAP_THRESHOLD = 50 // Pixels to drag before committed to snap to next

// Helper to wrap value within a range [min, max)
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

interface CardProps {
  section: JourneySection
  index: number
  x: any // MotionValue<number>
  total: number
  onActionClick?: () => void
  onCardClick: (index: number) => void // Used to snap to clicked card
}

function JourneyCard({ section, index, x, total, onActionClick, onCardClick }: CardProps) {
  const isStudentCard = section.id === 'student'

  // Create a transform that maps the global `x` to this card's local properties.
  // We need to calculate the card's position relative to the center *with wrapping*.
  //
  // Center of viewport is 0.
  // Card's "base" position is index * CARD_WIDTH.
  // Current scroll is x.
  // Raw position = base + x.
  // Wrapped position lies within [-totalWidth/2, totalWidth/2].

  const totalWidth = total * CARD_WIDTH

  const childX = useTransform(x, (latestX: number) => {
    // 1. Where is the card naturally?
    const basePos = index * CARD_WIDTH
    // 2. Add scroll
    let pos = basePos + latestX
    // 3. Wrap it so it stays within expected bounds around the center (0)
    // We want the range [-totalWidth/2, totalWidth/2]
    pos = wrap(-totalWidth / 2, totalWidth / 2, pos)
    return pos
  })

  // Derive visual props from childX (distance from center 0)
  const scale = useTransform(childX, [-CARD_WIDTH, 0, CARD_WIDTH], [0.8, 1, 0.8])
  const rotateY = useTransform(childX, [-CARD_WIDTH, 0, CARD_WIDTH], [15, 0, -15])
  const opacity = useTransform(childX, [-CARD_WIDTH, 0, CARD_WIDTH], [0.5, 1, 0.5])
  const zIndex = useTransform(childX, (latestX) => {
    // Higher z-index when closer to 0
    return Math.round(100 - Math.abs(latestX) / 10)
  })
  const blur = useTransform(childX, [-CARD_WIDTH, 0, CARD_WIDTH], ['4px', '0px', '4px'])
  const brightness = useTransform(childX, [-CARD_WIDTH, 0, CARD_WIDTH], [0.6, 1, 0.6])

  // Click handler to snap this card to center
  const handleClick = useCallback(() => {
    // Determine the current visual offset
    const currentPos = childX.get()
    // If it's close to center (e.g. < 10px), treat as active click (e.g. CTA)
    if (Math.abs(currentPos) < 20) {
      if (isStudentCard && onActionClick) {
        onActionClick()
      } else if (isStudentCard) {
        window.location.href = '/student'
      }
      return
    }
    // Otherwise, request snap to this card
    onCardClick(index)
  }, [childX, index, isStudentCard, onActionClick, onCardClick])

  return (
    <motion.div
      style={{
        x: childX,
        y: '-50%', // Center vertically
        scale,
        rotateY,
        opacity,
        zIndex,
        filter: useTransform(blur, (b) => `blur(${b}) brightness(${brightness.get()})`),
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -190, // Half of card width (380px)
        width: 380,
      }}
      className="cursor-grab active:cursor-grabbing"
      onClick={handleClick}
    >
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a2e]"
      >
        {/* Image */}
        <div className="relative h-52 w-full">
          <Image
            src={section.image}
            alt={section.headline}
            fill
            sizes="400px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a2e]" />

        </div>

        {/* Content */}
        <div className="p-6">
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

          <h3 className="mb-4">
            <span className="block text-3xl font-bold text-white mb-1 font-serif">
              {section.headline}
            </span>
            <span
              className="block text-xl italic font-serif"
              style={{ color: section.accentColor }}
            >
              {section.subheadline}
            </span>
          </h3>

          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-4 font-light">
            {section.description}
          </p>


        </div>
      </div>
    </motion.div>
  )
}

export default function UserJourney3D({ onStudentClick }: { onStudentClick?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Global scroll value (pixels)
  const x = useMotionValue(0)

  // Track current centered index for dots updates
  const [centeredIndex, setCenteredIndex] = useState(0)

  // Update centered index when x changes
  useMotionValueEvent(x, "change", (latest) => {
    // Current logical position: -latest
    // -latest / CARD_WIDTH gives us the "index" position
    const rawIndex = Math.round(-latest / CARD_WIDTH)
    const wrappedIndex = ((rawIndex % journeySections.length) + journeySections.length) % journeySections.length
    if (wrappedIndex !== centeredIndex) {
      setCenteredIndex(wrappedIndex)
    }
  })

  // Snap to nearest card logic
  const snapToNearest = useCallback(() => {
    const currentX = x.get()
    const nearestSlot = Math.round(currentX / CARD_WIDTH) * CARD_WIDTH
    animate(x, nearestSlot, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 0.8
    })
  }, [x])

  // Handle manual drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.x
    const offset = info.offset.x
    const currentX = x.get()

    // Predict where it would land with inertia
    // (Simplification: just behave like standard carousel snap)

    // Find nearest slot
    let targetIndex = Math.round(currentX / CARD_WIDTH)

    // If dragged significantly or fast, force next/prev
    if (offset < -SNAP_THRESHOLD || velocity < -500) {
      targetIndex = Math.floor(currentX / CARD_WIDTH)
    } else if (offset > SNAP_THRESHOLD || velocity > 500) {
      targetIndex = Math.ceil(currentX / CARD_WIDTH)
    }

    animate(x, targetIndex * CARD_WIDTH, {
      type: "spring",
      stiffness: 200,
      damping: 30,
    })
  }

  // Handle Wheel (Trackpad)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let wheelTimeout: NodeJS.Timeout

    const handleWheel = (e: WheelEvent) => {
      // Prioritize horizontal
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        // Direct manipulation: Update x by delta
        // Negative deltaX moves content left (which is "scrolling right" in interaction terms)
        // Actually: Swipe Left (positive deltaX) -> Content moves Left (decrease x)
        x.set(x.get() - e.deltaX)

        // Clear timeout
        clearTimeout(wheelTimeout)
        // Set snap timeout
        wheelTimeout = setTimeout(snapToNearest, 150)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      clearTimeout(wheelTimeout)
    }
  }, [x, snapToNearest])

  // Snap to specific card index 
  // (We need to find the "closest" instance of this index to our current X)
  const snapToCard = useCallback((targetIndex: number) => {
    const currentX = x.get()
    const currentRawIndex = -currentX / CARD_WIDTH

    // We want to go to targetIndex, but wrapped closest to currentRawIndex
    // e.g. Current = 10.2, Target = 2 (Total 4).
    // Candidates for 2: ... -2, 2, 6, 10, 14 ... 
    // 10 is current. Closest 2-equivalent is 10 (Wait 10 is 2 mod 4). 
    // So if we are at 10.2, we snap to 10.

    let closestDiff = Infinity
    let bestTarget = 0

    // Search a few loops around
    for (let i = -2; i <= 2; i++) {
      const testIndex = Math.floor(currentRawIndex / journeySections.length) * journeySections.length + (i * journeySections.length) + targetIndex
      const diff = Math.abs(testIndex - currentRawIndex)
      if (diff < closestDiff) {
        closestDiff = diff
        bestTarget = testIndex
      }
    }

    // Target X is negative of index * width
    animate(x, -bestTarget * CARD_WIDTH, {
      type: "spring",
      stiffness: 150,
      damping: 30
    })

  }, [x])

  const currentSection = journeySections[centeredIndex]

  return (
    <div className="relative py-20 min-h-[700px] flex flex-col justify-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${currentSection.accentColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Section Title */}
      <div className="text-center mb-10 px-4 relative z-10">
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
          Why TourWiseCo?
        </h2>

      </div>

      {/* Carousel Viewport */}
      <div
        ref={containerRef}
        className="relative h-[600px] w-full max-w-[1200px] mx-auto perspective-1000"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center h-full w-full"
          drag="x"
          dragConstraints={{ left: -100000, right: 100000 }} // Effectively infinite
          onDragEnd={handleDragEnd}
          style={{ x }} // Bind motion value but we override visual pos in children
        >
          {/* 
               We render cards as children. 
               Note: `drag` on parent moves the parent's `x`.
               Children use `useTransform(x)` to decide where to be.
               Wait, if parent moves `x`, children move with parent naturally?
               Yes, IF they are static children.
               BUT we want infinite wrapping.
               So we actually shouldn't move the PARENT visually. We should use `x` as a signal.
               
               Hack: Pass `style={{ x }}` to a non-rendering div or just don't pass it to style?
               If we pass `style={{ x }}` to the drag container, the whole container slides.
               This is fine for "standard" carousel, but for "infinite wrap", cards need to jump back.
               
               Better Approach:
               Use a transparent "Drag Proxy" that captures gesture and updates `x`.
               The Cards are siblings that listen to `x`.
            */}
        </motion.div>

        {/* Render Cards (Independent of drag container which just simulates input) */}
        <div className="absolute inset-0 pointer-events-none">
          {journeySections.map((section, idx) => (
            <div key={section.id} className="pointer-events-auto">
              <JourneyCard
                section={section}
                index={idx}
                x={x}
                total={journeySections.length}
                onActionClick={onStudentClick}
                onCardClick={snapToCard}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-8 z-10">
        {journeySections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => snapToCard(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === centeredIndex ? 'w-8' : 'w-2'}`}
            style={{
              background: idx === centeredIndex
                ? currentSection.accentColor
                : 'rgba(255,255,255,0.2)'
            }}
          />
        ))}
      </div>
    </div>
  )
}
