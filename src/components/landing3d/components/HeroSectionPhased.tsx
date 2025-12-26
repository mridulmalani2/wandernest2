'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial } from 'three'
import { Html } from '@react-three/drei'
import { COLORS } from '../types'

interface HeroSectionPhasedProps {
  currentPhase: number
  phaseProgress: number
  totalProgress: number
  pointerOffset: { x: number; y: number }
  isVisible: boolean
  isHijackComplete: boolean
}

/**
 * HeroSectionPhased - Hero content with phase-based animations
 *
 * Simplified Animation Phases (step-based):
 * 0: Initial state - nothing visible (scroll indicator shown in parent)
 * 1: All text visible at once (title, subtitle, description)
 * 2: Text fades out, CTA cards appear (frozen state)
 */

// Decorative floating orbs
function FloatingOrbs({ visibility }: { visibility: number }) {
  const group1Ref = useRef<Group>(null)
  const group2Ref = useRef<Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (group1Ref.current) {
      group1Ref.current.position.x = Math.sin(time * 0.3) * 0.5 - 3
      group1Ref.current.position.y = Math.cos(time * 0.4) * 0.3 + 1.5
    }

    if (group2Ref.current) {
      group2Ref.current.position.x = Math.cos(time * 0.25) * 0.4 + 3
      group2Ref.current.position.y = Math.sin(time * 0.35) * 0.25 + 0.5
    }
  })

  if (visibility < 0.01) return null

  return (
    <>
      <group ref={group1Ref} position={[-3, 1.5, -2]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.bluePrimary}
            transparent
            opacity={0.4 * visibility}
          />
        </mesh>
        <mesh scale={1.5}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.bluePrimary}
            transparent
            opacity={0.1 * visibility}
          />
        </mesh>
      </group>

      <group ref={group2Ref} position={[3, 0.5, -2]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.purplePrimary}
            transparent
            opacity={0.4 * visibility}
          />
        </mesh>
        <mesh scale={1.5}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.purplePrimary}
            transparent
            opacity={0.1 * visibility}
          />
        </mesh>
      </group>
    </>
  )
}

// Decorative accent line
function AccentLine({
  position,
  width,
  opacity,
  progress,
}: {
  position: [number, number, number]
  width: number
  opacity: number
  progress: number
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return
    meshRef.current.scale.x = progress
    materialRef.current.opacity = opacity * progress
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, 0.015]} />
      <meshBasicMaterial
        ref={materialRef}
        color={COLORS.bluePrimary}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

export function HeroSectionPhased({
  currentPhase,
  phaseProgress,
  totalProgress,
  pointerOffset,
  isVisible,
  isHijackComplete,
}: HeroSectionPhasedProps) {
  const groupRef = useRef<Group>(null)

  // Calculate visibility for each element based on simplified phase system
  // Phase 0: Nothing visible, Phase 1: All text visible, Phase 2: Text fades out
  const titleOpacity = useMemo(() => {
    if (currentPhase === 0) return 0
    if (currentPhase === 1) return 1
    if (currentPhase >= 2) return 0 // Fade out when cards appear
    return 0
  }, [currentPhase])

  const subtitleOpacity = useMemo(() => {
    if (currentPhase === 0) return 0
    if (currentPhase === 1) return 1
    if (currentPhase >= 2) return 0 // Fade out when cards appear
    return 0
  }, [currentPhase])

  const descriptionOpacity = useMemo(() => {
    if (currentPhase === 0) return 0
    if (currentPhase === 1) return 0.8
    if (currentPhase >= 2) return 0 // Fade out when cards appear
    return 0
  }, [currentPhase])

  // For orbs visibility
  const orbsVisibility = useMemo(() => {
    if (currentPhase === 0) return 0
    if (currentPhase === 1) return 1
    if (currentPhase >= 2) return 0 // Hide with text
    return 0
  }, [currentPhase])

  // Fade out when transitioning to normal scroll
  const fadeOutProgress = useMemo(() => {
    if (!isHijackComplete) return 1
    // After hijack is complete, fade out based on scroll progress
    return Math.max(0, 1 - totalProgress * 2)
  }, [isHijackComplete, totalProgress])

  // Entrance/exit animation progress - simplified for step-based phases
  const titleEntranceY = useMemo(() => {
    if (currentPhase === 0) return 30 // Start below
    if (currentPhase === 1) return 0  // In position
    if (currentPhase >= 2) return -40 // Move up when fading out
    return 0
  }, [currentPhase])

  const subtitleEntranceY = useMemo(() => {
    if (currentPhase === 0) return 20 // Start below
    if (currentPhase === 1) return 0  // In position
    if (currentPhase >= 2) return -30 // Move up when fading out
    return 0
  }, [currentPhase])

  const descriptionEntranceY = useMemo(() => {
    if (currentPhase === 0) return 15 // Start below
    if (currentPhase === 1) return 0  // In position
    if (currentPhase >= 2) return -20 // Move up when fading out
    return 0
  }, [currentPhase])

  // Scale effect
  const scale = useMemo(() => {
    return 1 + totalProgress * 0.1
  }, [totalProgress])

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Subtle floating motion
    const floatY = Math.sin(time * 0.4) * 0.03
    const floatX = Math.cos(time * 0.3) * 0.02

    // Parallax response
    const parallaxX = pointerOffset.x * 0.15
    const parallaxY = pointerOffset.y * 0.1

    groupRef.current.position.set(parallaxX + floatX, 1.5 + floatY + parallaxY, 0)
    groupRef.current.scale.setScalar(scale)
  })

  if (!isVisible) return null

  const overallOpacity = fadeOutProgress

  return (
    <group ref={groupRef} position={[0, 1.5, 0]}>
      {/* Decorative floating orbs */}
      <FloatingOrbs visibility={orbsVisibility * overallOpacity} />

      {/* Main hero content - HTML for reliable text rendering */}
      <Html
        center
        position={[0, 0, 0]}
        style={{
          width: '90vw',
          maxWidth: '800px',
          pointerEvents: 'none',
        }}
      >
        <div
          className="text-center"
          style={{
            opacity: overallOpacity,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          {/* Main headline */}
          <h1
            className="font-serif font-bold text-white leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.4)',
              marginBottom: '0.5em',
            }}
          >
            <span
              style={{
                opacity: titleOpacity,
                transform: `translateY(${titleEntranceY}px)`,
                display: 'inline-block',
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              }}
            >
              Experience Authentic Travel
            </span>
            <br />
            <span
              style={{
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleEntranceY}px)`,
                display: 'inline-block',
                transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              }}
            >
              with Local Student Guides
            </span>
          </h1>

          {/* Accent line */}
          <div
            className="mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{
              width: `${currentPhase === 1 ? 120 : 0}px`,
              height: '3px',
              opacity: subtitleOpacity * 0.7,
              marginBottom: '1.5em',
              transition: 'width 0.5s ease-out, opacity 0.4s ease-out',
            }}
          />

          {/* Subheadline */}
          <p
            className="text-white/80 font-light max-w-lg mx-auto"
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              opacity: descriptionOpacity,
              transform: `translateY(${descriptionEntranceY}px)`,
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            }}
          >
            Connect with verified university students in Paris and London who will
            show you their city through a local&apos;s eyes.
          </p>
        </div>
      </Html>

      {/* Accent line in 3D */}
      <AccentLine
        position={[0, -0.8, 0]}
        width={2.5}
        opacity={overallOpacity * 0.5}
        progress={currentPhase === 1 ? 1 : 0}
      />
    </group>
  )
}
