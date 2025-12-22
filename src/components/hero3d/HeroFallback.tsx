'use client'

import Image from 'next/image'

/**
 * HeroFallback - Static version for mobile and low-end devices
 *
 * This preserves the original hero design exactly, ensuring:
 * - Fast load times on mobile
 * - No battery drain from WebGL
 * - Full accessibility
 * - Same visual hierarchy as the 3D version
 *
 * The CSS animations are retained for a polished experience
 * without the 3D complexity.
 */
export function HeroFallback() {
  return (
    <div className="relative h-[400px] md:h-[480px] lg:h-[560px]">
      {/* Image 1 - Back layer */}
      <div className="image-layer-1 absolute top-[10%] left-[5%] w-[65%] h-[45%] rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
            alt="Tourists exploring a European city together"
            fill
            loading="lazy"
            quality={85}
            sizes="(max-width: 768px) 80vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        </div>
      </div>

      {/* Image 2 - Middle layer */}
      <div className="image-layer-2 absolute top-[35%] right-[10%] w-[60%] h-[40%] rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"
            alt="London cityscape with iconic Tower Bridge at sunset"
            fill
            loading="lazy"
            quality={85}
            sizes="(max-width: 768px) 80vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
        </div>
      </div>

      {/* Image 3 - Front layer */}
      <div className="image-layer-3 absolute bottom-[8%] left-[15%] w-[55%] h-[38%] rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80"
            alt="Beautiful European cafe street scene"
            fill
            loading="lazy"
            quality={85}
            sizes="(max-width: 768px) 80vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-[5%] right-[8%] w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-float-slow" />
      <div
        className="absolute bottom-[15%] right-[5%] w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-slow"
        style={{ animationDelay: '1s' }}
      />
    </div>
  )
}
