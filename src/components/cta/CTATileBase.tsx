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
  return (
    <motion.div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-3xl cursor-pointer
        shadow-xl
        ${className}
      `}
      style={{ minHeight: '400px' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={imageAlt}
          fill
          loading="lazy"
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Dark gradient overlay - strengthens on hover */}
      <motion.div
        className={`
          absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}
        `}
        initial={false}
        whileHover={{
          background: [
            `linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.5), rgba(0,0,0,0.6))`,
            `linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.7), rgba(0,0,0,0.8))`
          ]
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center">
        {/* Headline - always visible, large elegant serif font */}
        <motion.h2
          className="
            text-5xl md:text-6xl font-serif font-bold text-white
            transition-all duration-300
          "
          initial={{ y: 0, marginBottom: '1rem' }}
          whileHover={{ y: -8, marginBottom: '1.5rem' }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {headline}
        </motion.h2>

        {/* Description text - fades in on hover */}
        <motion.p
          className="
            text-lg md:text-xl text-white/90 max-w-md leading-relaxed
          "
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {description}
        </motion.p>

        {/* Arrow icon - appears on hover */}
        <motion.div
          className="
            mt-4 text-white text-2xl
          "
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          →
        </motion.div>
      </div>

      {/* Enhanced shadow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
        whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
