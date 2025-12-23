import Link from 'next/link'
import CTATileBase from './CTATileBase'

/**
 * Student CTA Tile Component
 *
 * Elegant, image-based CTA tile for students to become guides.
 * Links to the student landing page.
 *
 * Design features:
 * - Full-bleed background: Student-themed image (campus/studying)
 * - Minimal default state: Just the word "Student" in elegant serif
 * - Hover reveals: Description and explore arrow with smooth 150ms transition
 * - Fully clickable: Entire tile acts as navigation link
 *
 * Background image source: Local asset in /public/images/backgrounds
 */

export default function StudentCTA() {
  return (
    <Link href="/student" className="block">
      <CTATileBase
        backgroundImage="/images/backgrounds/cafe-ambiance.jpg"
        imageAlt="University students walking on campus with books and backpacks"
        headline="Student"
        description="Earn by guiding travelers. Show your city and share local insights."
        gradientFrom="from-ui-purple-primary/40"
        gradientVia="via-ui-purple-accent/50"
        gradientTo="to-ui-purple-accent/40"
      />
    </Link>
  )
}
