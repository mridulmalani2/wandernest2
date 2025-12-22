'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { Group, Mesh, MeshBasicMaterial, Color } from 'three'
import { SpatialButtonProps } from '../types'

/**
 * Color configurations for button variants
 */
const VARIANT_COLORS = {
  blue: {
    background: '#3B82F6',
    backgroundHover: '#2563EB',
    text: '#FFFFFF',
    glow: '#3B82F6',
  },
  purple: {
    background: '#8B5CF6',
    backgroundHover: '#7C3AED',
    text: '#FFFFFF',
    glow: '#8B5CF6',
  },
}

/**
 * SpatialButton - Interactive CTA button in 3D space
 *
 * Design philosophy:
 * - Button exists as a physical object in the scene
 * - Hover creates Z-lift and scale increase
 * - Click creates micro depth push
 * - Spring physics for organic feel
 *
 * Interaction model:
 * - Slight Z lift on hover (0.1 units)
 * - Shadow softening via opacity
 * - Scale via spring physics (1.0 → 1.05)
 * - Click: micro depth push then navigate
 */
interface SpatialButtonInternalProps extends SpatialButtonProps {
  /** Mouse position for parallax */
  mousePosition?: { smoothX: number; smoothY: number }
  /** Whether the button should be visible */
  isVisible?: boolean
}

export function SpatialButton({
  children,
  variant,
  position = [0, 0, 0],
  onClick,
  href,
  parallaxIntensity = 0.2,
  animationDelay = 0,
  width = 2.5,
  height = 0.6,
  mousePosition = { smoothX: 0, smoothY: 0 },
  isVisible = true,
}: SpatialButtonInternalProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)

  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Animation state refs
  const animationProgress = useRef(0)
  const hasAnimatedIn = useRef(false)
  const startTime = useRef<number | null>(null)

  // Spring physics state
  const currentScale = useRef(1)
  const targetScale = useRef(1)
  const currentZ = useRef(0)
  const targetZ = useRef(0)

  // Get colors for variant
  const colors = VARIANT_COLORS[variant]

  // Handle pointer events
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    targetScale.current = 1.05
    targetZ.current = 0.15
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    setIsPressed(false)
    targetScale.current = 1
    targetZ.current = 0
    document.body.style.cursor = 'auto'
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsPressed(true)
    targetScale.current = 0.98
    targetZ.current = -0.05
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsPressed(false)
    targetScale.current = isHovered ? 1.05 : 1
    targetZ.current = isHovered ? 0.15 : 0

    // Navigate on click
    if (href) {
      window.location.href = href
    }
    onClick?.()
  }

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Initialize start time
    if (startTime.current === null) {
      startTime.current = time
    }

    // Entrance animation
    if (isVisible && !hasAnimatedIn.current) {
      const elapsed = time - startTime.current - animationDelay
      const duration = 0.8

      if (elapsed > 0) {
        animationProgress.current = Math.min(1, elapsed / duration)

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - animationProgress.current, 3)

        // Scale in effect
        currentScale.current = 0.8 + 0.2 * eased

        if (animationProgress.current >= 1) {
          hasAnimatedIn.current = true
          currentScale.current = 1
        }
      }
    }

    // Spring physics for hover/click
    if (hasAnimatedIn.current) {
      const springFactor = 0.15
      currentScale.current += (targetScale.current - currentScale.current) * springFactor
      currentZ.current += (targetZ.current - currentZ.current) * springFactor
    }

    // Parallax movement
    const parallaxX = mousePosition.smoothX * parallaxIntensity * 0.1
    const parallaxY = mousePosition.smoothY * parallaxIntensity * 0.05

    // Apply transforms
    groupRef.current.position.x = position[0] + parallaxX
    groupRef.current.position.y = position[1] + parallaxY
    groupRef.current.position.z = position[2] + currentZ.current

    groupRef.current.scale.setScalar(currentScale.current)

    // Update material color based on hover
    if (materialRef.current) {
      const targetColor = isHovered ? colors.backgroundHover : colors.background
      materialRef.current.color.lerp(new Color(targetColor), 0.1)
    }
  })

  // Calculate opacity based on animation
  const opacity = useMemo(() => {
    return hasAnimatedIn.current ? 1 : animationProgress.current
  }, [])

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Button background */}
      <RoundedBox
        ref={meshRef}
        args={[width, height, 0.08]}
        radius={0.1}
        smoothness={4}
      >
        <meshBasicMaterial
          ref={materialRef}
          color={colors.background}
          transparent
          opacity={1}
        />
      </RoundedBox>

      {/* Button text */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.18}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.woff"
      >
        {children}
        <meshBasicMaterial attach="material" color={colors.text} />
      </Text>

      {/* Subtle glow effect on hover */}
      {isHovered && (
        <RoundedBox
          args={[width + 0.1, height + 0.1, 0.02]}
          radius={0.12}
          smoothness={4}
          position={[0, 0, -0.05]}
        >
          <meshBasicMaterial
            color={colors.glow}
            transparent
            opacity={0.3}
          />
        </RoundedBox>
      )}
    </group>
  )
}

/**
 * BlueCTAButton - Pre-configured blue CTA
 */
export function BlueCTAButton(props: Omit<SpatialButtonInternalProps, 'variant'>) {
  return <SpatialButton {...props} variant="blue" />
}

/**
 * PurpleCTAButton - Pre-configured purple CTA
 */
export function PurpleCTAButton(props: Omit<SpatialButtonInternalProps, 'variant'>) {
  return <SpatialButton {...props} variant="purple" />
}
