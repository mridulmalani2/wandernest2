'use client'

import Image from 'next/image'
// PERF: Removed framer-motion - using CSS transitions for better performance

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
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-3xl cursor-pointer
        shadow-xl hover:shadow-2xl
        transition-all duration-300 ease-out
        hover:scale-[1.02] active:scale-[0.99]
        ${className}
      `}
      style={{ minHeight: '400px' }}
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
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Dark gradient overlay - strengthens on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}
        transition-all duration-300
        group-hover:from-black/60 group-hover:via-black/70 group-hover:to-black/80
      `} />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center">
        {/* Headline - always visible, large elegant serif font */}
        <h2 className="
          text-5xl md:text-6xl font-serif font-bold text-white
          transition-all duration-300 ease-out
          mb-4 group-hover:mb-6 group-hover:-translate-y-2
        ">
          {headline}
        </h2>

        {/* Description text - fades in on hover */}
        <p className="
          text-lg md:text-xl text-white/90 max-w-md leading-relaxed
          opacity-0 translate-y-2
          transition-all duration-300 ease-out
          group-hover:opacity-100 group-hover:translate-y-0
        ">
          {description}
        </p>

        {/* Arrow icon - appears on hover */}
        <div className="
          mt-4 text-white text-2xl
          opacity-0 translate-y-2
          transition-all duration-300 delay-75 ease-out
          group-hover:opacity-100 group-hover:translate-y-0
        ">
          →
        </div>
      </div>
    </div>
  )
}
