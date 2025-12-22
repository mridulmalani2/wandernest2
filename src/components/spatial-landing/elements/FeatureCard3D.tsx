'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { Group, Mesh, MeshBasicMaterial, TextureLoader, Color } from 'three'
import { FeatureCard3DProps } from '../types'

/**
 * Accent color configurations
 */
const ACCENT_COLORS = {
  blue: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  green: {
    primary: '#22C55E',
    secondary: '#16A34A',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
}

/**
 * FeatureCard3D - A spatial feature card for the value proposition section
 *
 * Design philosophy:
 * - Card is a physical object floating in space
 * - Image serves as backdrop with text overlay
 * - Subtle parallax creates depth within the card
 * - Glass-morphism effect in 3D space
 *
 * The card feels present through:
 * - Real Z-depth in the scene
 * - Mouse-responsive rotation
 * - Smooth entrance animations
 */
export function FeatureCard3D({
  id,
  title,
  description,
  bullets,
  imageSrc,
  imageAlt,
  accentColor,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  mousePosition,
  isActive,
  animationDelay = 0,
}: FeatureCard3DProps) {
  const groupRef = useRef<Group>(null)
  const cardRef = useRef<Mesh>(null)
  const imageRef = useRef<Mesh>(null)

  const [isHovered, setIsHovered] = useState(false)

  // Animation state
  const animationProgress = useRef(0)
  const hasAnimatedIn = useRef(false)
  const startTime = useRef<number | null>(null)
  const currentOpacity = useRef(0)
  const currentScale = useRef(0.9)

  // Load image texture
  const texture = useLoader(TextureLoader, imageSrc)

  // Get accent colors
  const colors = ACCENT_COLORS[accentColor]

  // Card dimensions
  const cardWidth = 4 * scale
  const cardHeight = 3 * scale
  const imageHeight = cardHeight * 0.45

  // Handle pointer events
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Initialize start time
    if (startTime.current === null) {
      startTime.current = time
    }

    // Entrance animation
    if (isActive && !hasAnimatedIn.current) {
      const elapsed = time - startTime.current - animationDelay
      const duration = 1.0

      if (elapsed > 0) {
        animationProgress.current = Math.min(1, elapsed / duration)

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - animationProgress.current, 3)

        // Animate opacity and scale
        currentOpacity.current = eased
        currentScale.current = 0.9 + 0.1 * eased

        if (animationProgress.current >= 1) {
          hasAnimatedIn.current = true
        }
      }
    }

    // Reset if not active
    if (!isActive && hasAnimatedIn.current) {
      hasAnimatedIn.current = false
      currentOpacity.current = 0
      currentScale.current = 0.9
      startTime.current = null
    }

    // Parallax movement
    const parallaxIntensity = 0.3
    const parallaxX = mousePosition.smoothX * parallaxIntensity * 0.15
    const parallaxY = mousePosition.smoothY * parallaxIntensity * 0.1

    // Rotation response to mouse
    const rotationResponseX = -mousePosition.smoothY * 0.03
    const rotationResponseY = mousePosition.smoothX * 0.05

    // Apply transforms
    groupRef.current.position.x = position[0] + parallaxX
    groupRef.current.position.y = position[1] + parallaxY
    groupRef.current.position.z = position[2] + (isHovered ? 0.2 : 0)

    groupRef.current.rotation.x = rotation[0] + rotationResponseX
    groupRef.current.rotation.y = rotation[1] + rotationResponseY
    groupRef.current.rotation.z = rotation[2]

    groupRef.current.scale.setScalar(currentScale.current * (isHovered ? 1.02 : 1))
  })

  // Calculate if card should be visible
  const opacity = isActive ? currentOpacity.current : 0

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      visible={isActive}
    >
      {/* Card background with glass effect */}
      <RoundedBox
        ref={cardRef}
        args={[cardWidth, cardHeight, 0.05]}
        radius={0.15}
        smoothness={4}
        position={[0, 0, -0.025]}
      >
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.85 * opacity}
        />
      </RoundedBox>

      {/* Border/frame */}
      <RoundedBox
        args={[cardWidth + 0.02, cardHeight + 0.02, 0.02]}
        radius={0.16}
        smoothness={4}
        position={[0, 0, -0.05]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1 * opacity}
        />
      </RoundedBox>

      {/* Image section at top */}
      <group position={[0, (cardHeight - imageHeight) / 2 - 0.1, 0.03]}>
        <mesh ref={imageRef}>
          <planeGeometry args={[cardWidth - 0.3, imageHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Image gradient overlay */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[cardWidth - 0.3, imageHeight]} />
          <meshBasicMaterial
            color="#1a1a2e"
            transparent
            opacity={0.3 * opacity}
          />
        </mesh>
      </group>

      {/* Accent bar */}
      <mesh position={[-(cardWidth - 0.3) / 2 + 0.3, 0.2, 0.03]}>
        <planeGeometry args={[0.6, 0.05]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={opacity} />
      </mesh>

      {/* Title */}
      <Text
        position={[-(cardWidth - 0.3) / 2, 0, 0.04]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
        maxWidth={cardWidth - 0.5}
        font="/fonts/Inter-Regular.woff"
      >
        {title}
        <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={opacity} />
      </Text>

      {/* Description */}
      <Text
        position={[-(cardWidth - 0.3) / 2, -0.35, 0.04]}
        fontSize={0.12}
        color="#a0a0a0"
        anchorX="left"
        anchorY="top"
        maxWidth={cardWidth - 0.5}
        lineHeight={1.4}
        font="/fonts/Inter-Regular.woff"
      >
        {description}
        <meshBasicMaterial attach="material" color="#a0a0a0" transparent opacity={opacity} />
      </Text>

      {/* Bullet points */}
      {bullets.map((bullet, idx) => (
        <group key={idx} position={[-(cardWidth - 0.3) / 2, -0.85 - idx * 0.2, 0.04]}>
          {/* Checkmark */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.14}
            color={colors.primary}
            anchorX="left"
            anchorY="middle"
            font="/fonts/Inter-Regular.woff"
          >
            {'✓'}
            <meshBasicMaterial attach="material" color={colors.primary} transparent opacity={opacity} />
          </Text>

          {/* Bullet text */}
          <Text
            position={[0.2, 0, 0]}
            fontSize={0.11}
            color="#c0c0c0"
            anchorX="left"
            anchorY="middle"
            maxWidth={cardWidth - 0.8}
            font="/fonts/Inter-Regular.woff"
          >
            {bullet}
            <meshBasicMaterial attach="material" color="#c0c0c0" transparent opacity={opacity} />
          </Text>
        </group>
      ))}

      {/* Hover glow effect */}
      {isHovered && (
        <RoundedBox
          args={[cardWidth + 0.2, cardHeight + 0.2, 0.01]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, -0.1]}
        >
          <meshBasicMaterial
            color={colors.primary}
            transparent
            opacity={0.15}
          />
        </RoundedBox>
      )}
    </group>
  )
}
