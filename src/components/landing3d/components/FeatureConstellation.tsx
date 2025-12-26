'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Html, Sphere } from '@react-three/drei'
import { COLORS } from '../types'
import { scrollVisibility, mapRange, clamp } from '../utils/cameraPath'

/**
 * FeatureConstellation - Value proposition section at end of journey
 *
 * Design:
 * - Three orbiting feature "orbs" representing key value props
 * - Each orb has an icon and brief description
 * - Appear in the "Constellation" zone (70-100% scroll)
 * - Subtle orbital motion creates sense of a complete system
 *
 * Features:
 * 1. Authentic Experiences
 * 2. Verified Students
 * 3. Flexible & Personal
 */

interface FeatureOrbProps {
  position: [number, number, number]
  color: string
  title: string
  description: string
  icon: string
  scrollProgress: number
  index: number
  pointerOffset: { x: number; y: number }
}

const FEATURES = [
  {
    title: 'Authentic Experiences',
    description: 'Discover hidden gems and local favorites',
    icon: '🗺️',
    color: COLORS.bluePrimary,
  },
  {
    title: 'Verified Students',
    description: 'Background-checked university guides',
    icon: '✓',
    color: COLORS.purplePrimary,
  },
  {
    title: 'Flexible & Personal',
    description: 'Customized tours on your schedule',
    icon: '⚡',
    color: COLORS.blueAccent,
  },
]

function FeatureOrb({
  position,
  color,
  title,
  description,
  icon,
  scrollProgress,
  index,
  pointerOffset,
}: FeatureOrbProps) {
  const groupRef = useRef<Group>(null)
  const sphereRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)

  // Visibility - appears at 60%+ scroll
  const visibility = useMemo(() => {
    const delay = 0.6 + index * 0.05
    return scrollVisibility(scrollProgress, delay, delay + 0.1, 0.95, 1.0)
  }, [scrollProgress, index])

  // Entrance progress
  const entranceProgress = useMemo(() => {
    const delay = 0.6 + index * 0.05
    return clamp(mapRange(scrollProgress, delay, delay + 0.1, 0, 1), 0, 1)
  }, [scrollProgress, index])

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Orbital motion around center
    const orbitRadius = 0.3
    const orbitSpeed = 0.2
    const orbitAngle = time * orbitSpeed + (index * Math.PI * 2) / 3
    const orbitX = Math.sin(orbitAngle) * orbitRadius * 0.5
    const orbitY = Math.cos(orbitAngle) * orbitRadius * 0.3

    // Pulsing scale
    const pulseScale = 1 + Math.sin(time * 1.5 + index) * 0.05

    // Entrance scale
    const entranceScale = 0.3 + entranceProgress * 0.7

    // Parallax
    const parallaxX = pointerOffset.x * 0.08
    const parallaxY = pointerOffset.y * 0.05

    // Apply transforms
    groupRef.current.position.set(
      position[0] + orbitX + parallaxX,
      position[1] + orbitY + parallaxY,
      position[2]
    )
    groupRef.current.scale.setScalar(pulseScale * entranceScale)

    // Update glow
    if (glowRef.current) {
      const mat = glowRef.current.material as MeshBasicMaterial
      mat.opacity = 0.3 * visibility * entranceProgress
    }
  })

  if (visibility < 0.01) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Glow behind sphere */}
      <Sphere ref={glowRef} args={[0.45, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </Sphere>

      {/* Main sphere */}
      <Sphere ref={sphereRef} args={[0.35, 24, 24]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9 * visibility * entranceProgress}
        />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[0.25, 16, 16]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15 * visibility * entranceProgress}
        />
      </Sphere>

      {/* Content */}
      <Html
        position={[0, -0.7, 0]}
        center
        style={{
          opacity: visibility * entranceProgress,
          pointerEvents: 'none',
          transition: 'opacity 0.3s',
        }}
      >
        <div className="text-center" style={{ width: '120px' }}>
          <div className="text-xl mb-1">{icon}</div>
          <h4
            className="text-white font-semibold text-xs mb-0.5 font-display"
            style={{
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h4>
          <p
            className="text-white/60 font-light font-body"
            style={{
              fontSize: '10px',
              lineHeight: 1.3,
            }}
          >
            {description}
          </p>
        </div>
      </Html>
    </group>
  )
}

// Connecting lines between orbs
function ConnectionLines({
  scrollProgress,
  visibility,
}: {
  scrollProgress: number
  visibility: number
}) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    groupRef.current.rotation.z = time * 0.05
  })

  if (visibility < 0.1) return null

  return (
    <group ref={groupRef}>
      {/* Simple connecting lines */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 64]} />
        <meshBasicMaterial
          color={COLORS.white}
          transparent
          opacity={0.1 * visibility}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Central TourWise branding orb
function CentralOrb({
  scrollProgress,
  pointerOffset,
}: {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
}) {
  const groupRef = useRef<Group>(null)

  const visibility = useMemo(() => {
    return scrollVisibility(scrollProgress, 0.7, 0.8, 0.95, 1.0)
  }, [scrollProgress])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    // Pulsing
    const scale = 1 + Math.sin(time * 0.8) * 0.05
    groupRef.current.scale.setScalar(scale)

    // Rotation
    groupRef.current.rotation.y = time * 0.1
  })

  if (visibility < 0.01) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer glow */}
      <Sphere args={[0.6, 24, 24]}>
        <meshBasicMaterial
          color={COLORS.purplePrimary}
          transparent
          opacity={0.15 * visibility}
          depthWrite={false}
        />
      </Sphere>

      {/* Main sphere */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9 * visibility}
        />
      </Sphere>

      {/* Inner core */}
      <Sphere args={[0.25, 24, 24]}>
        <meshBasicMaterial
          color={COLORS.bluePrimary}
          transparent
          opacity={0.8 * visibility}
        />
      </Sphere>

      {/* Brand label */}
      <Html
        position={[0, -0.8, 0]}
        center
        style={{
          opacity: visibility,
          pointerEvents: 'none',
        }}
      >
        <div className="text-center">
          <h3
            className="text-white font-bold text-sm font-display"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            TourWise
          </h3>
          <p
            className="text-white/60 text-xs font-light font-body"
          >
            Your journey starts here
          </p>
        </div>
      </Html>
    </group>
  )
}

/**
 * Main FeatureConstellation component
 */
export function FeatureConstellation({
  scrollProgress,
  pointerOffset,
}: {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
}) {
  const groupRef = useRef<Group>(null)

  // Overall visibility
  const visibility = useMemo(() => {
    return scrollVisibility(scrollProgress, 0.55, 0.65, 0.95, 1.0)
  }, [scrollProgress])

  // Position based on scroll - moves up as we approach
  const yOffset = useMemo(() => {
    return mapRange(scrollProgress, 0.5, 1, 2, 0)
  }, [scrollProgress])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.y = -4 + yOffset
  })

  if (visibility < 0.01) return null

  // Calculate orb positions in a circle around center
  const orbPositions: [number, number, number][] = [
    [-2, 0.5, 0],
    [2, 0.5, 0],
    [0, -1.5, 0],
  ]

  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      {/* Connection ring */}
      <ConnectionLines scrollProgress={scrollProgress} visibility={visibility} />

      {/* Central branding */}
      <CentralOrb scrollProgress={scrollProgress} pointerOffset={pointerOffset} />

      {/* Feature orbs */}
      {FEATURES.map((feature, index) => (
        <FeatureOrb
          key={feature.title}
          position={orbPositions[index]}
          color={feature.color}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          scrollProgress={scrollProgress}
          index={index}
          pointerOffset={pointerOffset}
        />
      ))}
    </group>
  )
}
