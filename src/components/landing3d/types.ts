'use client'


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
// Component Props
// ============================================

export interface LandingPage3DProps {
  className?: string
}

export interface AtmosphericBackgroundProps {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
}


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
