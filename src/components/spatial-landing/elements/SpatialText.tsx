'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Group } from 'three'
import { SpatialTextProps } from '../types'

/**
 * Font configurations for different text variants
 */
const VARIANT_CONFIG = {
  headline: {
    fontSize: 0.8,
    fontWeight: 'bold' as const,
    letterSpacing: -0.02,
    lineHeight: 1.1,
  },
  subheadline: {
    fontSize: 0.35,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 0.2,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
    lineHeight: 1.5,
  },
  label: {
    fontSize: 0.15,
    fontWeight: 'bold' as const,
    letterSpacing: 0.05,
    lineHeight: 1.2,
  },
}

/**
 * SpatialText - 3D text that lives in space
 *
 * Design philosophy:
 * - Text is a physical object in the scene, not an overlay
 * - Subtle parallax based on mouse creates depth perception
 * - Smooth entrance animations tied to visibility
 * - Uses troika-three-text for high-quality SDF rendering
 *
 * The text feels "present" through:
 * - Micro depth offset on mouse movement
 * - Gentle floating motion
 * - Shadow/depth cues from Z positioning
 */
interface SpatialTextInternalProps extends SpatialTextProps {
  /** Mouse position for parallax */
  mousePosition?: { smoothX: number; smoothY: number }
  /** Whether the text should be visible */
  isVisible?: boolean
  /** Opacity override */
  opacity?: number
}

export function SpatialText({
  children,
  position = [0, 0, 0],
  fontSize,
  color = '#ffffff',
  maxWidth = 10,
  textAlign = 'left',
  parallaxIntensity = 0.3,
  animationDelay = 0,
  fontWeight,
  variant = 'body',
  anchorX = 'left',
  anchorY = 'top',
  letterSpacing,
  lineHeight,
  mousePosition = { smoothX: 0, smoothY: 0 },
  isVisible = true,
  opacity = 1,
}: SpatialTextInternalProps) {
  const groupRef = useRef<Group>(null)
  const animationProgress = useRef(0)
  const hasAnimatedIn = useRef(false)
  const startTime = useRef<number | null>(null)

  // Get variant-based defaults
  const variantConfig = VARIANT_CONFIG[variant]

  // Resolve final values (props override variant defaults)
  const finalFontSize = fontSize ?? variantConfig.fontSize
  const finalLetterSpacing = letterSpacing ?? variantConfig.letterSpacing
  const finalLineHeight = lineHeight ?? variantConfig.lineHeight

  // Animation and parallax in frame loop
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

        // Animate opacity and Y position
        groupRef.current.position.y = position[1] + (1 - eased) * 0.3
        // Opacity is handled by the Text component's material

        if (animationProgress.current >= 1) {
          hasAnimatedIn.current = true
        }
      }
    }

    // Parallax movement
    const parallaxX = mousePosition.smoothX * parallaxIntensity * 0.1
    const parallaxY = mousePosition.smoothY * parallaxIntensity * 0.05

    // Apply parallax to base position
    groupRef.current.position.x = position[0] + parallaxX
    if (hasAnimatedIn.current) {
      groupRef.current.position.y = position[1] + parallaxY
    }
  })

  // Calculate opacity based on animation progress
  const currentOpacity = useMemo(() => {
    return opacity * (hasAnimatedIn.current ? 1 : animationProgress.current)
  }, [opacity])

  return (
    <group ref={groupRef} position={position}>
      <Text
        fontSize={finalFontSize}
        color={color}
        maxWidth={maxWidth}
        textAlign={textAlign}
        anchorX={anchorX}
        anchorY={anchorY}
        letterSpacing={finalLetterSpacing}
        lineHeight={finalLineHeight}
        font="/fonts/Inter-Regular.woff"
      >
        {children}
        <meshBasicMaterial
          attach="material"
          color={color}
          transparent
          opacity={opacity}
        />
      </Text>
    </group>
  )
}

/**
 * HeadlineText - Pre-configured for headlines
 */
export function HeadlineText(props: Omit<SpatialTextInternalProps, 'variant'>) {
  return <SpatialText {...props} variant="headline" />
}

/**
 * SubheadlineText - Pre-configured for subheadlines
 */
export function SubheadlineText(props: Omit<SpatialTextInternalProps, 'variant'>) {
  return <SpatialText {...props} variant="subheadline" />
}

/**
 * BodyText - Pre-configured for body text
 */
export function BodyText(props: Omit<SpatialTextInternalProps, 'variant'>) {
  return <SpatialText {...props} variant="body" />
}
