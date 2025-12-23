import Link from 'next/link'
import CTATileBase from './CTATileBase'

/**
 * Tourist CTA Tile Component
 *
 * Elegant, image-based CTA tile for tourists to explore local student guides.
 * Routes to the internal tourist landing page (/tourist).
 *
 * Design features:
 * - Full-bleed background: Travel-themed image (cityscape/traveler)
 * - Minimal default state: Just the word "Tourist" in elegant serif
 * - Hover reveals: Description and explore arrow with smooth 150ms transition
 * - Fully clickable: Entire tile acts as navigation link
 *
 * Background image source: Local asset in /public/images/backgrounds
 */
export default function TouristCTA() {
  return (
    <Link href="/tourist" className="block">
      <CTATileBase
        backgroundImage="/images/backgrounds/london-blur.jpg"
        imageAlt="Traveler standing on mountain overlooking scenic European landscape"
        headline="Tourist"
        description="Explore with a local student guide. Personalized and authentic experiences."
        gradientFrom="from-ui-blue-primary/40"
        gradientVia="via-ui-blue-accent/50"
        gradientTo="to-ui-blue-accent/40"
      />
    </Link>
  )
}
