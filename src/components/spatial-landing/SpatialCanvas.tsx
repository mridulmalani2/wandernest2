'use client'

import { Suspense, useRef, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { Fog, PerspectiveCamera } from 'three'

/**
 * CameraController - Manages camera position based on scroll
 *
 * Design philosophy:
 * - Camera moves through Z-space as user scrolls
 * - Smooth lerping for cinematic feel
 * - No sudden jumps or snapping
 */
interface CameraControllerProps {
  targetZ: number
  smoothingFactor?: number
}

function CameraController({ targetZ, smoothingFactor = 0.06 }: CameraControllerProps) {
  const { camera } = useThree()
  const currentZ = useRef(camera.position.z)

  useFrame(() => {
    // Lerp camera Z position towards target
    currentZ.current += (targetZ - currentZ.current) * smoothingFactor
    camera.position.z = currentZ.current
  })

  return null
}

/**
 * SceneFog - Atmospheric depth fog
 *
 * Very subtle fog to reinforce depth perception,
 * not for mood or effect.
 */
interface SceneFogProps {
  near: number
  far: number
  color?: string
}

function SceneFog({ near, far, color = '#0a0a15' }: SceneFogProps) {
  const { scene } = useThree()

  // Set up fog on mount
  useFrame(() => {
    if (!scene.fog) {
      scene.fog = new Fog(color, near, far)
    }
  })

  return null
}

/**
 * Props for the SpatialCanvas
 */
interface SpatialCanvasProps {
  children: ReactNode
  /** Camera Z position (driven by scroll) */
  cameraZ?: number
  /** Fog near distance */
  fogNear?: number
  /** Fog far distance */
  fogFar?: number
  /** Optional class name */
  className?: string
}

/**
 * SpatialCanvas - The single persistent canvas for the spatial landing page
 *
 * Key features:
 * - One canvas for the entire experience
 * - Scroll-driven camera movement
 * - Subtle atmospheric fog for depth
 * - Performance-optimized settings
 *
 * Performance safeguards:
 * - DPR capped at 1.5
 * - No postprocessing
 * - No complex shaders
 * - Transparent background (CSS handles actual bg)
 */
export function SpatialCanvas({
  children,
  cameraZ = 12,
  fogNear = 8,
  fogFar = 50,
  className = '',
}: SpatialCanvasProps) {
  return (
    <div className={`fixed inset-0 ${className}`} style={{ zIndex: 1 }}>
      <Canvas
        camera={{
          position: [0, 0, cameraZ],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: true,
        }}
        frameloop="always"
        dpr={[1, 1.5]}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          {/* Camera movement controller */}
          <CameraController targetZ={cameraZ} />

          {/* Atmospheric fog for depth */}
          <SceneFog near={fogNear} far={fogFar} />

          {/* Scene content */}
          {children}

          {/* Preload assets */}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

/**
 * SpatialCanvasLoading - Loading state for the canvas
 */
export function SpatialCanvasLoading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-slate-900 animate-pulse" />
  )
}
