import CTATileBase from './CTATileBase'

/**
 * Student CTA Tile Component
 *
 * Elegant, image-based CTA tile for students to become guides.
 *
 * IMPORTANT - ROUTING CONFIGURATION:
 * ===================================
 * Currently redirecting to temporary Google Form for student onboarding.
 * This is a TEMPORARY solution during MVP phase.
 *
 * TODO: Replace temporary Google Form redirect with internal student landing route
 * once student registration is ready.
 *
 * To enable internal routing:
 * 1. Uncomment the Link import and Link wrapper below
 * 2. Comment out the <a> tag wrapper
 * 3. Update href to point to /student or the appropriate internal route
 *
 * Design features:
 * - Full-bleed background: Student-themed image (campus/studying)
 * - Minimal default state: Just the word "Student" in elegant serif
 * - Hover reveals: Description and explore arrow with smooth 150ms transition
 * - Fully clickable: Entire tile acts as navigation link
 *
 * Background image source: Unsplash - Students studying on university campus
 */

// Uncomment this import when switching to internal routing:
// import Link from 'next/link'

export default function StudentCTA() {
  // TEMPORARY: Google Form redirect for MVP
  const GOOGLE_FORM_URL = 'https://forms.gle/fhzBnMAh2eGbGSyt8'

  return (
    // TEMPORARY: External link to Google Form
    <a
      href={GOOGLE_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {/* TODO: Replace above <a> tag with this Link component once internal student route is ready:
      <Link href="/student" className="block">
      */}
      <CTATileBase
        backgroundImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=85"
        imageAlt="University students collaborating and learning together on campus"
        headline="Student"
        description="Earn by guiding travelers. Show your city and share local insights."
        gradientFrom="from-purple-600/40"
        gradientVia="via-purple-700/50"
        gradientTo="to-pink-600/40"
      />
    </a>
    // TODO: Close with </Link> instead of </a> when switching to internal routing
  )
}
