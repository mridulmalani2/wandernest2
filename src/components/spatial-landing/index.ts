/**
 * Spatial 3D Landing Page Module
 *
 * A fully spatial, 3D-native landing page experience where content
 * lives in real 3D space. Users scroll through depth, not a document.
 *
 * Key features:
 * - Single persistent Three.js canvas
 * - Scroll-driven camera movement through Z-space
 * - Text and UI exist as physical objects in 3D
 * - Mouse parallax for depth perception
 * - Cinematic section transitions
 * - Graceful fallback for mobile/low-end devices
 *
 * Usage:
 * ```tsx
 * import { LandingPage3D } from '@/components/spatial-landing'
 *
 * export default function Page() {
 *   return <LandingPage3D />
 * }
 * ```
 */

export { LandingPage3D } from './LandingPage3D'
export { LandingPageFallback } from './LandingPageFallback'
export { SpatialCanvas } from './SpatialCanvas'
export { HeroSection3D } from './sections/HeroSection3D'
export { ValueSection3D } from './sections/ValueSection3D'
export { SpatialText, HeadlineText, SubheadlineText, BodyText } from './elements/SpatialText'
export { SpatialButton, BlueCTAButton, PurpleCTAButton } from './elements/SpatialButton'
export { FeatureCard3D } from './elements/FeatureCard3D'
export { useCameraScroll, DEFAULT_SECTIONS, DEFAULT_CAMERA_CONFIG } from './hooks'
export type {
  SpatialSection,
  CameraState,
  SpatialTextProps,
  SpatialButtonProps,
  FeatureCardData,
  FeatureCard3DProps,
  SpatialCanvasProps,
  SectionProps,
  SpatialCapabilities,
  SpatialLandingConfig,
} from './types'
