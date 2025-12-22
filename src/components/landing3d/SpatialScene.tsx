'use client'

import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import { SpatialSceneProps } from './types'
import {
  SpatialCamera,
  AtmosphericBackground,
  HeroSection3D,
  PathwayCards3D,
  FeatureConstellation,
} from './components'

/**
 * SpatialScene - The main 3D scene orchestrator
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  SpatialScene                                               │
 * │  ├── SpatialCamera (scroll-driven)                         │
 * │  ├── AtmosphericBackground                                  │
 * │  │   ├── GradientPlane (far background)                    │
 * │  │   ├── NebulaPlanes (color accents)                      │
 * │  │   ├── StarField (distant particles)                     │
 * │  │   └── AmbientParticles (close particles)                │
 * │  ├── HeroSection3D (0-35% scroll)                          │
 * │  │   ├── 3D Text Lines                                     │
 * │  │   ├── Accent Line                                       │
 * │  │   └── HTML Subheadline                                  │
 * │  ├── PathwayCards3D (35-70% scroll)                        │
 * │  │   ├── TouristCard                                       │
 * │  │   └── StudentCard                                       │
 * │  └── FeatureConstellation (70-100% scroll)                 │
 * │      ├── CentralOrb                                        │
 * │      └── FeatureOrbs                                       │
 * └─────────────────────────────────────────────────────────────┘
 *
 * The scene is organized into three spatial "zones":
 * 1. Gateway (0-35%): Hero introduction with floating text
 * 2. Crossroads (35-70%): Choice point with pathway cards
 * 3. Constellation (70-100%): Value proposition features
 *
 * Performance optimizations:
 * - Components only render when visible (scroll-based)
 * - Minimal geometry and materials
 * - No complex lighting or shadows
 * - Efficient particle systems with instancing
 */
export function SpatialScene({
  scrollState,
  pointerState,
  isVisible,
}: SpatialSceneProps) {
  const scrollProgress = scrollState.progress
  const pointerOffset = {
    x: pointerState.smoothX,
    y: pointerState.smoothY,
  }

  return (
    <>
      {/* Camera - scroll drives movement through space */}
      <SpatialCamera
        scrollProgress={scrollProgress}
        pointerState={pointerState}
      />

      {/* Atmospheric background - always visible */}
      <AtmosphericBackground
        scrollProgress={scrollProgress}
        pointerOffset={pointerOffset}
      />

      {/* Hero Section - visible at start */}
      <Suspense fallback={null}>
        <HeroSection3D
          scrollProgress={scrollProgress}
          pointerOffset={pointerOffset}
          isVisible={isVisible}
        />
      </Suspense>

      {/* Pathway Cards - visible in middle section */}
      <Suspense fallback={null}>
        <PathwayCards3D
          scrollProgress={scrollProgress}
          pointerOffset={pointerOffset}
        />
      </Suspense>

      {/* Feature Constellation - visible at end */}
      <Suspense fallback={null}>
        <FeatureConstellation
          scrollProgress={scrollProgress}
          pointerOffset={pointerOffset}
        />
      </Suspense>

      {/* Preload all assets */}
      <Preload all />
    </>
  )
}
