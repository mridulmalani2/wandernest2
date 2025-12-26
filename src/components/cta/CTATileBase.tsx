'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface CTATileBaseProps {
  /**
   * Background image URL (Unsplash or similar royalty-free source)
   */
  backgroundImage: string
  /**
   * Alt text for the background image
   */
  imageAlt: string
  /**
   * Main headline text (visible by default)
   */
  headline: string
  /**
   * CTA description text (visible only on hover)
   */
  description: string
  /**
   * Gradient colors for the overlay (from/via/to)
   */
  gradientFrom?: string
  gradientVia?: string
  gradientTo?: string
  /**
   * Click handler or can be wrapped in Link
   */
  onClick?: () => void
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Shared base component for image-based CTA tiles
 * Implements the clean, modern design pattern with premium interactions
 *
 * Features:
 * - Full-bleed background image
 * - Dark gradient overlay for readability
 * - Minimal default state with elegant headline
 * - Hover state reveals additional details with smooth Framer Motion transitions
 * - Fully clickable tile (entire surface is interactive)
 */
export default function CTATileBase({
  backgroundImage,
  imageAlt,
  headline,
  description,
  gradientFrom = 'from-black/40',
  gradientVia = 'via-black/50',
  gradientTo = 'to-black/60',
  onClick,
  className = '',
}: CTATileBaseProps) {
  const safeBackgroundImage =
    typeof backgroundImage === 'string' && backgroundImage.trim().length > 0
      ? backgroundImage
      : '/images/backgrounds/london-blur.jpg';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`
        group relative overflow-hidden rounded-3xl cursor-pointer
        shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-purple/50
        ${className}
      `}
      style={{ minHeight: '400px' }}
      variants={{
        initial: { scale: 1 },
        hover: { scale: 1.03 },
        tap: { scale: 0.98 }
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src={safeBackgroundImage}
          alt={imageAlt}
          fill
          loading="lazy"
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      </div>

      {/* Dark gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`}
        variants={{
          initial: { opacity: 0.8 },
          hover: { opacity: 1 }
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center">
        {/* Headline */}
        <motion.h2
          className="text-5xl md:text-6xl font-display font-bold text-white mb-4"
          variants={{
            initial: { y: 0, marginBottom: '1rem' },
            hover: { y: -8, marginBottom: '1.5rem' }
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {headline}
        </motion.h2>

        {/* Description text */}
        <motion.p
          className="text-lg md:text-xl text-white/90 max-w-md leading-relaxed"
          variants={{
            initial: { opacity: 0, y: 10 },
            hover: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {description}
        </motion.p>

        {/* Arrow icon */}
        <motion.div
          className="mt-4 text-white text-2xl"
          variants={{
            initial: { opacity: 0, y: 10 },
            hover: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          →
        </motion.div>
      </div>
    </motion.div>
  )
}
