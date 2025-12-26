'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  Vector3,
  Color,
} from 'three'
import { Html, RoundedBox } from '@react-three/drei'
import { PathwayCard3DProps, COLORS } from '../types'
import { scrollVisibility, mapRange, clamp } from '../utils/cameraPath'

/**
 * PathwayCard3D - 3D CTA cards for Tourist/Student paths
 *
 * Design:
 * - Glass-like cards floating in space
 * - Image texture with gradient overlay
 * - Icon and label
 * - Hover interaction with scale and glow
 * - Click navigates to respective path
 *
 * These appear in the "Crossroads" zone (35-70% scroll)
 */

// Card configuration
const CARD_CONFIG = {
  tourist: {
    label: "I'm a Tourist",
    sublabel: 'Find your local guide',
    href: '/tourist',
    icon: '✈️',
    color: COLORS.bluePrimary,
    glowColor: '#4A7FD6',
    image: '/images/backgrounds/cafe-ambiance.jpg',
  },
  student: {
    label: "I'm a Student",
    sublabel: 'Become a guide',
    href: '/student',
    icon: '🎓',
    color: COLORS.purplePrimary,
    glowColor: '#8B5CD6',
    image: '/images/backgrounds/cafe-ambiance.jpg',
  },
}

export function PathwayCard3D({
  type,
  position,
  rotation,
  scrollProgress,
  pointerOffset,
  onHover,
  onClick,
}: PathwayCard3DProps) {
  const config = CARD_CONFIG[type]
  const groupRef = useRef<Group>(null)
  const cardRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Load card image texture
  const texture = useLoader(TextureLoader, config.image)

  // Calculate visibility - visible from 20-70% scroll
  const visibility = useMemo(() => {
    return scrollVisibility(scrollProgress, 0.2, 0.35, 0.65, 0.85)
  }, [scrollProgress])

  // Entrance progress for animation
  const entranceProgress = useMemo(() => {
    const delay = type === 'tourist' ? 0.25 : 0.3
    return clamp(mapRange(scrollProgress, delay, delay + 0.1, 0, 1), 0, 1)
  }, [scrollProgress, type])

  // Hover animation state
  const hoverProgress = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Hover animation
    const targetHover = isHovered ? 1 : 0
    hoverProgress.current += (targetHover - hoverProgress.current) * 0.1

    // Floating motion
    const floatY = Math.sin(time * 0.6 + position[0]) * 0.05
    const floatX = Math.cos(time * 0.4 + position[1]) * 0.03

    // Parallax
    const parallaxX = pointerOffset.x * 0.1
    const parallaxY = pointerOffset.y * 0.08

    // Entrance animation
    const slideY = (1 - entranceProgress) * 1.5
    const entranceScale = 0.7 + entranceProgress * 0.3

    // Apply position
    groupRef.current.position.set(
      position[0] + floatX + parallaxX,
      position[1] + floatY + parallaxY - slideY,
      position[2]
    )

    // Scale with hover effect
    const scale = entranceScale * (1 + hoverProgress.current * 0.08)
    groupRef.current.scale.setScalar(scale)

    // Rotation with subtle tilt toward pointer
    groupRef.current.rotation.set(
      rotation[0] - pointerOffset.y * 0.05,
      rotation[1] + pointerOffset.x * 0.05,
      rotation[2]
    )

    // Update glow intensity
    if (glowRef.current) {
      const glowMat = glowRef.current.material as MeshBasicMaterial
      glowMat.opacity = (0.2 + hoverProgress.current * 0.3) * visibility * entranceProgress
    }
  })

  const handlePointerEnter = () => {
    setIsHovered(true)
    onHover?.(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    onHover?.(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = () => {
    onClick?.()
    // Navigate to the path
    if (typeof window !== 'undefined') {
      window.location.href = config.href
    }
  }

  if (visibility < 0.01) return null

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Glow effect behind card */}
      <mesh ref={glowRef} position={[0, 0, -0.1]} scale={[1.3, 1.3, 1]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Main card body - glass effect */}
      <RoundedBox
        ref={cardRef}
        args={[2, 2.6, 0.08]}
        radius={0.12}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.85 * visibility * entranceProgress}
        />
      </RoundedBox>

      {/* Image texture on card */}
      <mesh position={[0, 0.35, 0.05]}>
        <planeGeometry args={[1.7, 1.4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={visibility * entranceProgress}
        />
      </mesh>

      {/* Gradient overlay on image */}
      <mesh position={[0, 0.35, 0.06]}>
        <planeGeometry args={[1.7, 1.4]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.3 * visibility * entranceProgress}
        />
      </mesh>

      {/* Content via HTML */}
      <Html
        position={[0, -0.7, 0.1]}
        center
        style={{
          opacity: visibility * entranceProgress,
          pointerEvents: isHovered ? 'auto' : 'none',
          transition: 'opacity 0.2s',
          userSelect: 'none',
        }}
      >
        <div
          className="text-center"
          style={{ width: '140px' }}
          onClick={handleClick}
        >
          <div className="text-2xl mb-1">{config.icon}</div>
          <h3
            className="text-white font-bold text-base mb-0.5"
            style={{
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {config.label}
          </h3>
          <p
            className="text-white/70 text-xs font-light"
            style={{
              fontFamily: '-apple-system, sans-serif',
            }}
          >
            {config.sublabel}
          </p>

          {/* Arrow indicator */}
          <div
            className="mt-2 transition-transform duration-300"
            style={{
              transform: `translateX(${isHovered ? '4px' : '0'})`,
            }}
          >
            <span className="text-white/80 text-sm">→</span>
          </div>
        </div>
      </Html>

      {/* Border glow on hover */}
      <mesh position={[0, 0, 0.045]} visible={isHovered}>
        <planeGeometry args={[2.05, 2.65]} />
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={0.15 * hoverProgress.current}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * PathwayCards3D - Container for both pathway cards
 */
export function PathwayCards3D({
  scrollProgress,
  pointerOffset,
}: {
  scrollProgress: number
  pointerOffset: { x: number; y: number }
}) {
  return (
    <group position={[0, -2, 0]}>
      {/* Tourist card - left */}
      <PathwayCard3D
        type="tourist"
        position={[-1.8, 0, 0]}
        rotation={[0, 0.08, 0]}
        scrollProgress={scrollProgress}
        pointerOffset={pointerOffset}
      />

      {/* Student card - right */}
      <PathwayCard3D
        type="student"
        position={[1.8, 0, 0]}
        rotation={[0, -0.08, 0]}
        scrollProgress={scrollProgress}
        pointerOffset={pointerOffset}
      />
    </group>
  )
}
