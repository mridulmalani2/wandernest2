/**
 * Type definitions for the Spatial 3D Landing Page
 *
 * This module provides type safety for the entire 3D spatial experience,
 * defining contracts for camera behavior, sections, and UI elements.
 */

import { Vector3Tuple } from 'three'

/**
 * Section definition for depth-based layout
 * Each section occupies a specific Z-range in the scene
 */
export interface SpatialSection {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Z position where this section is centered */
  zPosition: number
  /** Height of this section in world units */
  height: number
  /** Scroll range that maps to this section (0-1 normalized within section) */
  scrollStart: number
  scrollEnd: number
}

/**
 * Camera state for scroll-driven movement
 */
export interface CameraState {
  /** Current Z position */
  z: number
  /** Target Z position (for smooth interpolation) */
  targetZ: number
  /** Current scroll progress (0-1) */
  scrollProgress: number
  /** Which section is currently in view */
  activeSection: string
}

/**
 * Props for spatial text elements
 */
export interface SpatialTextProps {
  /** Text content */
  children: string
  /** Position in 3D space */
  position?: Vector3Tuple
  /** Font size in world units */
  fontSize?: number
  /** Text color */
  color?: string
  /** Maximum width before wrapping */
  maxWidth?: number
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right'
  /** Parallax intensity (0-1) */
  parallaxIntensity?: number
  /** Animation delay in seconds */
  animationDelay?: number
  /** Font weight */
  fontWeight?: 'normal' | 'bold'
  /** Additional class-like styling */
  variant?: 'headline' | 'subheadline' | 'body' | 'label'
  /** Anchor point */
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  /** Letter spacing */
  letterSpacing?: number
  /** Line height */
  lineHeight?: number
}

/**
 * Props for spatial CTA buttons
 */
export interface SpatialButtonProps {
  /** Button text */
  children: string
  /** Button variant/color */
  variant: 'blue' | 'purple'
  /** Position in 3D space */
  position?: Vector3Tuple
  /** Click handler */
  onClick?: () => void
  /** Navigation href */
  href?: string
  /** Parallax intensity */
  parallaxIntensity?: number
  /** Animation delay */
  animationDelay?: number
  /** Width of the button */
  width?: number
  /** Height of the button */
  height?: number
}

/**
 * Feature card data for value proposition section
 */
export interface FeatureCardData {
  id: string
  title: string
  description: string
  bullets: string[]
  imageSrc: string
  imageAlt: string
  accentColor: 'blue' | 'purple' | 'green'
}

/**
 * Props for 3D feature cards
 */
export interface FeatureCard3DProps extends FeatureCardData {
  /** Position in 3D space */
  position: Vector3Tuple
  /** Rotation in radians */
  rotation?: Vector3Tuple
  /** Scale multiplier */
  scale?: number
  /** Mouse position for parallax */
  mousePosition: { smoothX: number; smoothY: number }
  /** Whether this card should be visible/active */
  isActive: boolean
  /** Animation delay */
  animationDelay?: number
}

/**
 * Props for the main spatial canvas
 */
export interface SpatialCanvasProps {
  /** Children to render in the canvas */
  children?: React.ReactNode
  /** Optional className for the container */
  className?: string
}

/**
 * Props for section components
 */
export interface SectionProps {
  /** Mouse position for parallax effects */
  mousePosition: { smoothX: number; smoothY: number }
  /** Current scroll progress (0-1) */
  scrollProgress: number
  /** Whether this section is currently active */
  isActive: boolean
  /** Section visibility progress (0-1, how "in view" it is) */
  sectionProgress: number
}

/**
 * Device capability detection result (extended)
 */
export interface SpatialCapabilities {
  /** Device has enough GPU power for full 3D */
  canRenderFull3D: boolean
  /** Device can render simplified 3D */
  canRenderSimple3D: boolean
  /** Device is mobile */
  isMobile: boolean
  /** Device prefers reduced motion */
  prefersReducedMotion: boolean
  /** Suggested quality level */
  qualityLevel: 'high' | 'medium' | 'low'
  /** Whether to use demand rendering */
  useDemandRendering: boolean
}

/**
 * Configuration for the spatial landing page
 */
export interface SpatialLandingConfig {
  /** Total scroll distance in pixels */
  totalScrollDistance: number
  /** Camera starting Z position */
  cameraStartZ: number
  /** Camera ending Z position */
  cameraEndZ: number
  /** Fog near distance */
  fogNear: number
  /** Fog far distance */
  fogFar: number
  /** Sections configuration */
  sections: SpatialSection[]
}
