'use client'

import { Vector3Tuple } from 'three'

/**
 * Types for the 3D Landing Page System
 *
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  LandingPage3D (Container)                                  │
 * │  ├── Canvas (React Three Fiber)                             │
 * │  │   ├── SpatialScene (Scene orchestrator)                 │
 * │  │   │   ├── SpatialCamera (Scroll-driven camera)          │
 * │  │   │   ├── AtmosphericBackground                          │
 * │  │   │   ├── HeroSection3D                                  │
 * │  │   │   ├── PathwayCards3D                                 │
 * │  │   │   └── FeatureConstellation                           │
 * │  │   └── Effects (minimal post-processing)                 │
 * │  └── HTMLOverlay (Accessibility layer)                      │
 * └─────────────────────────────────────────────────────────────┘
 */

// ============================================
// Core Types
// ============================================

export interface ScrollState {
  progress: number // 0-1 normalized scroll progress
  velocity: number // Scroll velocity for momentum effects
  direction: 'up' | 'down' | 'none'
}

export interface PointerState {
  x: number // -1 to 1 normalized
  y: number // -1 to 1 normalized
  smoothX: number // Lerped for smooth movement
  smoothY: number // Lerped for smooth movement
  isActive: boolean
}

export interface DeviceCapabilities {
  canRender3D: boolean
  isMobile: boolean
  isLowEnd: boolean
  prefersReducedMotion: boolean
  pixelRatio: number
}

// ============================================
// Scene Types
// ============================================

export interface SceneZone {
  name: 'gateway' | 'crossroads' | 'constellation'
  scrollStart: number // 0-1
  scrollEnd: number   // 0-1
}

export interface CameraKeyframe {
  position: Vector3Tuple
  lookAt: Vector3Tuple
  fov?: number
  scroll: number // 0-1 when this keyframe is active
}

export interface CameraPath {
  keyframes: CameraKeyframe[]
  easing: 'linear' | 'easeInOut' | 'easeOut'
}

// ============================================
// Component Props
// ============================================

export interface LandingPage3DProps {
  className?: string
}

export interface SpatialSceneProps {
  scrollState: ScrollState
  pointerState: PointerState
  isVisible: boolean
}

export interface SpatialCameraProps {
  scrollProgress: number
  pointerState: PointerState
}

export interface HeroSection3DProps {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
  isVisible: boolean
}

export interface PathwayCard3DProps {
  type: 'tourist' | 'student'
  position: Vector3Tuple
  rotation: Vector3Tuple
  scrollProgress: number
  pointerOffset: { x: number; y: number }
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}

export interface AtmosphericBackgroundProps {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
}

export interface FeatureOrb3DProps {
  position: Vector3Tuple
  color: string
  title: string
  scrollProgress: number
  index: number
}

// ============================================
// Animation Types
// ============================================

export interface SpringConfig {
  tension: number
  friction: number
  mass: number
}

export interface AnimationState {
  opacity: number
  scale: number
  position: Vector3Tuple
}

// ============================================
// Configuration Constants
// ============================================

export const CAMERA_PATH: CameraPath = {
  keyframes: [
    // Gateway - wide establishing shot
    { position: [0, 0, 15], lookAt: [0, 0, 0], fov: 50, scroll: 0 },
    // Transition - moving in
    { position: [0, 0.5, 10], lookAt: [0, 0, 0], fov: 48, scroll: 0.25 },
    // Crossroads - closer, centered on cards
    { position: [0, 0, 7], lookAt: [0, -0.5, 0], fov: 45, scroll: 0.5 },
    // Constellation - intimate view
    { position: [0, -0.5, 5], lookAt: [0, -1, 0], fov: 42, scroll: 0.75 },
    // Final - close and personal
    { position: [0, -1, 4], lookAt: [0, -1.5, 0], fov: 40, scroll: 1 },
  ],
  easing: 'easeInOut',
}

export const SCENE_ZONES: SceneZone[] = [
  { name: 'gateway', scrollStart: 0, scrollEnd: 0.35 },
  { name: 'crossroads', scrollStart: 0.35, scrollEnd: 0.7 },
  { name: 'constellation', scrollStart: 0.7, scrollEnd: 1 },
]

export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  snappy: { tension: 300, friction: 20, mass: 1 },
  wobbly: { tension: 180, friction: 12, mass: 1 },
  stiff: { tension: 400, friction: 30, mass: 1 },
} as const

// ============================================
// Color Palette (matching brand)
// ============================================

export const COLORS = {
  // Primary brand colors
  bluePrimary: '#6B8DD6',    // Soft periwinkle
  purplePrimary: '#9B7BD6',  // Soft lavender
  blueAccent: '#4A7FD6',     // Deeper blue
  purpleAccent: '#8B5CD6',   // Deeper purple

  // Atmospheric
  deepSpace: '#0a0a1a',
  nebulaPurple: 'rgba(139, 92, 246, 0.15)',
  nebulaBlue: 'rgba(74, 127, 214, 0.15)',

  // UI
  white: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  glassBackground: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
} as const
