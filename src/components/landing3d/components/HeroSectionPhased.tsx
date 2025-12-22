'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial } from 'three'
import { Html } from '@react-three/drei'
import { COLORS } from '../types'
import { clamp, mapRange } from '../utils/cameraPath'

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
 * Animation Phases:
 * 0: Initial state - nothing visible
 * 1: Title "Experience Authentic Travel" fades in
 * 2: Subtitle "with Local Student Guides" animates in
 * 3: Description text appears
 * 4: CTA cards animate into position (handled by PathwayCards)
 * 5: Complete - ready for normal scroll
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

  // Calculate visibility for each element based on phase
  // Text should fade OUT during phase 3-4 to avoid overlapping CTA cards
  const titleOpacity = useMemo(() => {
    if (currentPhase < 1) return phaseProgress * 0.3
    if (currentPhase === 1) return 0.3 + phaseProgress * 0.7
    if (currentPhase === 2) return 1
    // Start fading out during phase 3, gone by phase 4
    if (currentPhase === 3) return 1 - phaseProgress * 0.7
    if (currentPhase >= 4) return 0.3 - phaseProgress * 0.3
    return 0
  }, [currentPhase, phaseProgress])

  const subtitleOpacity = useMemo(() => {
    if (currentPhase < 2) return 0
    if (currentPhase === 2) return phaseProgress
    // Fade out faster than title
    if (currentPhase === 3) return 1 - phaseProgress * 0.8
    if (currentPhase >= 4) return 0.2 - phaseProgress * 0.2
    return 0
  }, [currentPhase, phaseProgress])

  const descriptionOpacity = useMemo(() => {
    if (currentPhase < 3) return 0
    if (currentPhase === 3) return phaseProgress * 0.8 // Fade in but not fully
    // Fade out immediately when CTA cards start appearing
    if (currentPhase >= 4) return (0.8 - phaseProgress * 0.8)
    return 0
  }, [currentPhase, phaseProgress])

  // For orbs visibility
  const orbsVisibility = useMemo(() => {
    if (currentPhase < 1) return 0
    return Math.min(1, (currentPhase - 1 + phaseProgress) / 2)
  }, [currentPhase, phaseProgress])

  // Fade out when transitioning to normal scroll
  const fadeOutProgress = useMemo(() => {
    if (!isHijackComplete) return 1
    // After hijack is complete, fade out based on scroll progress
    return Math.max(0, 1 - totalProgress * 2)
  }, [isHijackComplete, totalProgress])

  // Entrance/exit animation progress - text moves up as it fades out
  const titleEntranceY = useMemo(() => {
    if (currentPhase < 1) return 30
    if (currentPhase === 1) return 30 * (1 - phaseProgress)
    if (currentPhase === 2) return 0
    // Move up as it fades out
    if (currentPhase === 3) return -phaseProgress * 40
    if (currentPhase >= 4) return -40 - phaseProgress * 20
    return -60
  }, [currentPhase, phaseProgress])

  const subtitleEntranceY = useMemo(() => {
    if (currentPhase < 2) return 20
    if (currentPhase === 2) return 20 * (1 - phaseProgress)
    // Move up faster than title
    if (currentPhase === 3) return -phaseProgress * 50
    if (currentPhase >= 4) return -50 - phaseProgress * 30
    return -80
  }, [currentPhase, phaseProgress])

  const descriptionEntranceY = useMemo(() => {
    if (currentPhase < 3) return 15
    if (currentPhase === 3) return 15 * (1 - phaseProgress) - phaseProgress * 30
    // Move up immediately when CTA appears
    if (currentPhase >= 4) return -30 - phaseProgress * 40
    return -70
  }, [currentPhase, phaseProgress])

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
              width: `${Math.min(1, (currentPhase >= 2 ? 1 : 0) + (currentPhase === 2 ? phaseProgress : 0)) * 120}px`,
              height: '3px',
              opacity: subtitleOpacity * 0.7,
              marginBottom: '1.5em',
              transition: 'width 0.5s ease-out',
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
        progress={currentPhase >= 2 ? 1 : currentPhase === 1 ? phaseProgress : 0}
      />
    </group>
  )
}
