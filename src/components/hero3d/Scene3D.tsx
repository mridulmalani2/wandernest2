'use client'

import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ImagePlane3D } from './ImagePlane3D'
import { ImagePlaneConfig, MouseState } from './types'

/**
 * Configuration for the three hero images
 *
 * Depth layout strategy:
 * - Background layer (z: -2): Tourists image - furthest, moves least
 * - Middle layer (z: -1): London cityscape - medium depth
 * - Foreground layer (z: 0): Cafe scene - closest, moves most
 *
 * This creates a layered "diorama" effect where each image
 * exists at a different depth, and parallax makes this visible.
 *
 * Position values are in Three.js units (arbitrary, but consistent)
 * The camera is at z: 5, looking at origin.
 */
const IMAGE_CONFIGS: ImagePlaneConfig[] = [
  {
    // Back layer - Tourists exploring (largest, furthest)
    id: 'tourists',
    src: '/images/backgrounds/cafe-ambiance.jpg',
    alt: 'Tourists exploring a European city together',
    position: [-1.2, 0.8, -2], // Top-left, far back
    rotation: [0, 0, -0.1], // Slight counter-clockwise tilt (~-6 degrees)
    scale: 1.1,
    aspectRatio: 1.5, // Landscape orientation
    parallaxIntensity: 0.4, // Subtle movement (far)
    animationDelay: 0.3,
  },
  {
    // Middle layer - London cityscape
    id: 'london',
    src: '/images/backgrounds/cafe-ambiance.jpg',
    alt: 'London cityscape with iconic Tower Bridge at sunset',
    position: [1.0, 0, -1], // Center-right, medium depth
    rotation: [0, 0, 0.08], // Slight clockwise tilt (~5 degrees)
    scale: 1.0,
    aspectRatio: 1.5,
    parallaxIntensity: 0.7, // Medium movement
    animationDelay: 0.5,
  },
  {
    // Front layer - Cafe scene (closest)
    id: 'cafe',
    src: '/images/backgrounds/cafe-ambiance.jpg',
    alt: 'Beautiful European cafe street scene',
    position: [-0.5, -0.8, 0], // Bottom-left, closest
    rotation: [0, 0, 0.05], // Very slight tilt (~3 degrees)
    scale: 0.9,
    aspectRatio: 1.5,
    parallaxIntensity: 1.0, // Maximum movement (closest)
    animationDelay: 0.7,
  },
]

interface Scene3DProps {
  mousePosition: MouseState
  scrollProgress: number
  isVisible: boolean
}

/**
 * Scene3D - The Three.js scene containing all 3D elements
 *
 * Design philosophy:
 * - Orthographic-like perspective (high FOV distance) for subtle depth
 * - No complex lighting - using MeshBasicMaterial for performance
 * - Clean, minimal scene with only the essential elements
 * - Background is transparent - CSS handles the actual background
 */
function Scene({ mousePosition, scrollProgress, isVisible }: Scene3DProps) {
  return (
    <>
      {/* Ambient particles or effects could go here */}
      {/* Keeping scene minimal for performance */}

      {/* Image planes at different depths */}
      {IMAGE_CONFIGS.map((config) => (
        <ImagePlane3D
          key={config.id}
          {...config}
          mousePosition={{ smoothX: mousePosition.smoothX, smoothY: mousePosition.smoothY }}
          scrollProgress={scrollProgress}
          isVisible={isVisible}
        />
      ))}

      {/* Preload textures for smoother experience */}
      <Preload all />
    </>
  )
}

/**
 * Scene3DCanvas - Canvas wrapper with performance-optimized settings
 */
export function Scene3DCanvas({ mousePosition, scrollProgress, isVisible }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        // Camera setup: positioned to view the scene with subtle perspective
        camera={{
          position: [0, 0, 5],
          fov: 50, // Narrower FOV = less perspective distortion
          near: 0.1,
          far: 100,
        }}
        // Performance settings
        gl={{
          antialias: true,
          alpha: true, // Transparent background
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: true, // Fail gracefully on weak GPUs
        }}
        // Continuous rendering for smooth animations
        frameloop="always"
        // Reduce pixel ratio on high-DPI screens for performance
        dpr={[1, 1.5]}
        // Resize handling
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        // Enable transparent background
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0) // Fully transparent
        }}
      >
        <Suspense fallback={null}>
          <Scene
            mousePosition={mousePosition}
            scrollProgress={scrollProgress}
            isVisible={isVisible}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
