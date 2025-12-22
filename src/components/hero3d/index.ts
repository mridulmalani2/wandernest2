/**
 * 3D Hero Section Module
 *
 * A depth-based, immersive hero section using real 3D via Three.js.
 *
 * Key features:
 * - Mouse-responsive parallax with depth-based intensity
 * - Scroll-triggered depth transitions
 * - Spring-based CTA interactions
 * - Automatic fallback for mobile/low-end devices
 * - Respects reduced motion preferences
 *
 * Usage:
 * ```tsx
 * import { Hero3D } from '@/components/hero3d'
 *
 * export default function Page() {
 *   return <Hero3D />
 * }
 * ```
 */

export { Hero3D } from './Hero3D'
export { HeroFallback } from './HeroFallback'
export { HeroContent } from './HeroContent'
export type { Hero3DProps, ImagePlaneConfig, DeviceCapabilities } from './types'
