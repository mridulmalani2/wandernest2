'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial } from 'three'
import { Html } from '@react-three/drei'
import { HeroSection3DProps, COLORS } from '../types'
import { scrollVisibility, mapRange, clamp } from '../utils/cameraPath'

/**
 * HeroSection3D - The main hero content in 3D space
 *
 * Design:
 * - Headline rendered as HTML positioned in 3D space
 * - Uses system fonts for reliability
 * - Entrance animation triggered by scroll
 * - Parallax response to pointer
 * - Fades out as camera moves past
 *
 * The hero exists in the "Gateway" zone (0-35% scroll)
 */

// Decorative accent line
function AccentLine({
  position,
  width,
  opacity,
  scrollProgress,
}: {
  position: [number, number, number]
  width: number
  opacity: number
  scrollProgress: number
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)

  const entranceProgress = clamp(mapRange(scrollProgress, 0, 0.1, 0, 1), 0, 1)

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return

    // Scale animation
    meshRef.current.scale.x = entranceProgress
    materialRef.current.opacity = opacity * entranceProgress
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

/**
 * Main HeroSection3D component
 */
export function HeroSection3D({
  scrollProgress,
  pointerOffset,
  isVisible,
}: HeroSection3DProps) {
  const groupRef = useRef<Group>(null)

  // Calculate visibility - visible from 0-35% scroll
  const visibility = useMemo(() => {
    return scrollVisibility(scrollProgress, 0, 0.05, 0.25, 0.4)
  }, [scrollProgress])

  // Scale effect as camera approaches
  const scale = useMemo(() => {
    const baseScale = 1
    const scaleBoost = mapRange(scrollProgress, 0, 0.3, 0, 0.15)
    return baseScale + clamp(scaleBoost, 0, 0.15)
  }, [scrollProgress])

  // Entrance progress
  const entranceProgress = useMemo(() => {
    return clamp(mapRange(scrollProgress, 0, 0.12, 0, 1), 0, 1)
  }, [scrollProgress])

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

  if (!isVisible || visibility < 0.01) return null

  return (
    <group ref={groupRef} position={[0, 1.5, 0]}>
      {/* Decorative floating orbs */}
      <FloatingOrbs visibility={visibility} />

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
            opacity: visibility,
            transform: `translateY(${(1 - entranceProgress) * 30}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Main headline */}
          <h1
            className="font-display font-bold text-white leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.4)',
              marginBottom: '0.5em',
            }}
          >
            Experience Authentic Travel
            <br />
            <span
              style={{
                opacity: clamp(mapRange(scrollProgress, 0.02, 0.1, 0, 1), 0, 1),
              }}
            >
              with Local Student Guides
            </span>
          </h1>

          {/* Accent line */}
          <div
            className="mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{
              width: `${entranceProgress * 120}px`,
              height: '3px',
              opacity: visibility * 0.7,
              marginBottom: '1.5em',
            }}
          />

          {/* Subheadline */}
          <p
            className="text-white/80 font-light max-w-lg mx-auto"
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              opacity: clamp(mapRange(scrollProgress, 0.03, 0.12, 0, 1), 0, 1),
              transform: `translateY(${(1 - clamp(mapRange(scrollProgress, 0.03, 0.12, 0, 1), 0, 1)) * 15}px)`,
            }}
          >
            Connect with verified university students in Paris and London who will
            show you their city through a local&apos;s eyes.
          </p>
        </div>
      </Html>

      {/* Scroll indicator */}
      <Html
        center
        position={[0, -2.5, 0]}
        style={{
          opacity: visibility * clamp(mapRange(scrollProgress, 0, 0.08, 1, 0), 0, 1),
          pointerEvents: 'none',
        }}
      >
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span
            className="text-white/60 text-xs font-light uppercase"
            style={{ letterSpacing: '0.15em' }}
          >
            Scroll to explore
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/50"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </Html>

      {/* Accent line in 3D */}
      <AccentLine
        position={[0, -0.8, 0]}
        width={2.5}
        opacity={visibility * 0.5}
        scrollProgress={scrollProgress}
      />
    </group>
  )
}
