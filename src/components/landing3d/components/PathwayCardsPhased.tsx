'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
} from 'three'
import { Html, RoundedBox } from '@react-three/drei'
import { COLORS } from '../types'

/**
 * PathwayCardsPhased - CTA cards with phase-based animations
 *
 * Designed for scroll hijacking mode where cards animate in
 * during phase 4 of the animation sequence.
 */

interface PathwayCardPhasedProps {
  type: 'tourist' | 'student'
  position: [number, number, number]
  rotation: [number, number, number]
  currentPhase: number
  phaseProgress: number
  pointerOffset: { x: number; y: number }
  isHijackComplete: boolean
  onClick?: () => void
}

const CARD_CONFIG = {
  tourist: {
    label: "I'm a Tourist",
    sublabel: 'Find your local guide',
    href: '/tourist',
    icon: '✈️',
    color: COLORS.bluePrimary,
    glowColor: '#4A7FD6',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
    delay: 0,
  },
  student: {
    label: "I'm a Student",
    sublabel: 'Become a guide',
    href: '/student',
    icon: '🎓',
    color: COLORS.purplePrimary,
    glowColor: '#8B5CD6',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    delay: 0.15, // Slight delay for staggered animation
  },
}

function PathwayCardPhased({
  type,
  position,
  rotation,
  currentPhase,
  phaseProgress,
  pointerOffset,
  isHijackComplete,
  onClick,
}: PathwayCardPhasedProps) {
  const config = CARD_CONFIG[type]
  const groupRef = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Load card image texture
  const texture = useLoader(TextureLoader, config.image)

  // Cards should appear in phase 4
  const cardPhase = 4

  // Calculate entrance progress based on phase
  const entranceProgress = useMemo(() => {
    if (currentPhase < cardPhase) return 0
    if (currentPhase === cardPhase) {
      // Apply stagger delay
      const adjustedProgress = Math.max(0, phaseProgress - config.delay)
      return Math.min(1, adjustedProgress / (1 - config.delay))
    }
    return 1
  }, [currentPhase, phaseProgress, config.delay])

  // Visibility based on entrance progress
  const visibility = useMemo(() => {
    if (!isHijackComplete) {
      return entranceProgress
    }
    // After hijack, keep fully visible
    return 1
  }, [entranceProgress, isHijackComplete])

  // Hover animation state
  const hoverProgress = useRef(0)

  useFrame((state) => {
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

    // Entrance animation - slide up and scale
    const slideY = (1 - entranceProgress) * 2
    const entranceScale = 0.6 + entranceProgress * 0.4

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
      glowMat.opacity = (0.2 + hoverProgress.current * 0.3) * visibility
    }
  })

  const handlePointerEnter = () => {
    if (visibility < 0.5) return
    setIsHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = () => {
    if (visibility < 0.5) return

    if (onClick) {
      onClick()
      return
    }

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
          opacity={0.85 * visibility}
        />
      </RoundedBox>

      {/* Image texture on card */}
      <mesh position={[0, 0.35, 0.05]}>
        <planeGeometry args={[1.7, 1.4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={visibility}
        />
      </mesh>

      {/* Gradient overlay on image */}
      <mesh position={[0, 0.35, 0.06]}>
        <planeGeometry args={[1.7, 1.4]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.3 * visibility}
        />
      </mesh>

      {/* Content via HTML */}
      <Html
        position={[0, -0.7, 0.1]}
        center
        style={{
          opacity: visibility,
          pointerEvents: isHovered && visibility > 0.5 ? 'auto' : 'none',
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
            className="text-white font-bold text-base mb-0.5 font-display"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {config.label}
          </h3>
          <p
            className="text-white/70 text-xs font-light font-body"
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

      {/* Border glow on hover - use state for re-render trigger */}
      <mesh position={[0, 0, 0.045]} visible={isHovered}>
        <planeGeometry args={[2.05, 2.65]} />
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={isHovered ? 0.15 : 0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * PathwayCardsPhased - Container for both pathway cards with phase-based animation
 */
export function PathwayCardsPhased({
  currentPhase,
  phaseProgress,
  pointerOffset,
  isHijackComplete,
  onStudentClick,
}: {
  currentPhase: number
  phaseProgress: number
  pointerOffset: { x: number; y: number }
  isHijackComplete: boolean
  onStudentClick?: () => void
}) {
  return (
    <group position={[0, -0.5, 2]}>
      {/* Tourist card - left */}
      <PathwayCardPhased
        type="tourist"
        position={[-1.8, 0, 0]}
        rotation={[0, 0.08, 0]}
        currentPhase={currentPhase}
        phaseProgress={phaseProgress}
        pointerOffset={pointerOffset}
        isHijackComplete={isHijackComplete}
      />

      {/* Student card - right */}
      <PathwayCardPhased
        type="student"
        position={[1.8, 0, 0]}
        rotation={[0, -0.08, 0]}
        currentPhase={currentPhase}
        phaseProgress={phaseProgress}
        pointerOffset={pointerOffset}
        isHijackComplete={isHijackComplete}
      />
    </group>
  )
}
