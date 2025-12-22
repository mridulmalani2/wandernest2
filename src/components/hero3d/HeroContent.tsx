'use client'

import { Plane, GraduationCap } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { motion, type Variants } from 'framer-motion'

/**
 * HeroContent - HTML overlay containing text and CTAs
 *
 * Design philosophy:
 * - Positioned in front of the 3D scene via z-index
 * - Uses Framer Motion for entrance animations
 * - CTAs have enhanced depth effects (scale on hover)
 * - Text has subtle text-shadow for readability over 3D scene
 *
 * The CTA buttons feel "closer" to the user through:
 * - Larger scale transitions on hover
 * - Glow effects that intensify
 * - Spring-based motion for organic feel
 */

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

// Enhanced CTA animation for 3D depth feel
const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
  hover: {
    scale: 1.03,
    y: -4,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

interface HeroContentProps {
  /** Whether to use 3D-enhanced styles */
  is3DEnabled?: boolean
}

export function HeroContent({ is3DEnabled = true }: HeroContentProps) {
  return (
    <motion.div
      className="space-y-7 lg:space-y-9"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Headline with enhanced text shadow for 3D scene */}
      <div className="space-y-3">
        <motion.h1
          variants={itemVariants}
          className={`
            text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
            font-serif font-bold leading-[1.05] tracking-tight text-white
            ${is3DEnabled ? 'text-shadow-lg drop-shadow-2xl' : 'text-shadow-lg'}
          `}
        >
          Experience Authentic Travel
          <span className="block mt-2 lg:mt-3">
            with Local Student Guides
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className={`
            text-sm sm:text-base lg:text-lg text-stone-100
            leading-relaxed font-light max-w-xl
            ${is3DEnabled ? 'drop-shadow-md' : ''}
          `}
        >
          Connect with verified university students in Paris and London who will show you their city
          through a local&apos;s eyes. Get personalized recommendations and authentic
          experiences.
        </motion.p>
      </div>

      {/* CTAs with enhanced 3D depth interactions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Tourist CTA - feels closer due to blue gradient */}
        <motion.div
          variants={ctaVariants}
          whileHover="hover"
          whileTap="tap"
          className={is3DEnabled ? 'will-change-transform' : ''}
        >
          <PrimaryCTAButton
            href="/tourist"
            icon={Plane}
            showArrow
            variant="blue"
          >
            I&apos;m a Tourist
          </PrimaryCTAButton>
        </motion.div>

        {/* Student CTA */}
        <motion.div
          variants={ctaVariants}
          whileHover="hover"
          whileTap="tap"
          className={is3DEnabled ? 'will-change-transform' : ''}
        >
          <PrimaryCTAButton
            href="/student"
            icon={GraduationCap}
            showArrow
            variant="purple"
          >
            I&apos;m a Student
          </PrimaryCTAButton>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
