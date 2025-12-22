/**
 * Type definitions for the 3D Hero Section
 *
 * These types ensure type safety across the 3D scene components
 * and provide clear contracts for the depth-based layout system.
 */

import { Vector3Tuple } from 'three'

/**
 * Configuration for each image plane in 3D space
 * Positions and rotations define where each image "floats" in the scene
 */
export interface ImagePlaneConfig {
  /** Unique identifier for the image plane */
  id: string
  /** Unsplash image URL */
  src: string
  /** Accessible alt text */
  alt: string
  /** Position in 3D space [x, y, z] - z determines depth layer */
  position: Vector3Tuple
  /** Rotation in radians [x, y, z] - subtle rotations add visual interest */
  rotation: Vector3Tuple
  /** Scale multiplier for the plane */
  scale: number
  /** Aspect ratio (width/height) */
  aspectRatio: number
  /** How strongly this plane responds to mouse movement (0-1) */
  parallaxIntensity: number
  /** Delay before animation starts (staggered entrance) */
  animationDelay: number
}

/**
 * Props for the ImagePlane3D component
 */
export interface ImagePlane3DProps extends ImagePlaneConfig {
  /** Smoothed mouse position for parallax (-1 to 1) */
  mousePosition: { smoothX: number; smoothY: number }
  /** Current scroll progress (0-1) */
  scrollProgress: number
  /** Whether the component has entered the viewport */
  isVisible: boolean
}

/**
 * Props for the main Hero3D component
 */
export interface Hero3DProps {
  /** Optional className for the container */
  className?: string
}

/**
 * Mouse tracking state
 */
export interface MouseState {
  /** Normalized X position (-1 to 1) */
  x: number
  /** Normalized Y position (-1 to 1) */
  y: number
  /** Smoothed X position (lerped for buttery motion) */
  smoothX: number
  /** Smoothed Y position (lerped for buttery motion) */
  smoothY: number
}

/**
 * Device capability detection result
 */
export interface DeviceCapabilities {
  /** Device has enough GPU power for 3D */
  canRender3D: boolean
  /** Device is mobile */
  isMobile: boolean
  /** Device prefers reduced motion */
  prefersReducedMotion: boolean
  /** Suggested quality level */
  qualityLevel: 'high' | 'medium' | 'low'
}
