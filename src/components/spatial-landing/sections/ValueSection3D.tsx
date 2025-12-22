'use client'

import { useRef, useState, useCallback } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Group, TextureLoader, Mesh, MeshBasicMaterial } from 'three'
import { SectionProps, FeatureCardData } from '../types'

/**
 * Feature card data - preserves existing WhyChooseCarousel content
 */
const FEATURES: FeatureCardData[] = [
  {
    id: 'authentic',
    title: 'Authentic Local Experiences',
    description:
      'Skip the tourist traps and discover the real city. Our student guides know the best local cafes, hidden viewpoints, and authentic experiences that guidebooks miss.',
    bullets: [
      'Hidden local spots and neighborhood favorites',
      'Cultural insights from a local perspective',
      'Personalized recommendations for your interests',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    imageAlt: 'Local cafe experience with authentic ambiance',
    accentColor: 'blue',
  },
  {
    id: 'verified',
    title: 'Verified University Students',
    description:
      'All our guides are verified university students with proven local knowledge. They are passionate about sharing their city and creating meaningful connections.',
    bullets: [
      'Background-verified student credentials',
      'Match with guides from your home country',
      'Rated and reviewed by past travelers',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    imageAlt: 'University students in modern campus setting',
    accentColor: 'purple',
  },
  {
    id: 'flexible',
    title: 'Flexible and Personalized',
    description:
      'Every traveler is unique. Whether you want to explore historic landmarks, find the best street food, or discover nightlife hotspots, your guide will customize it.',
    bullets: [
      'Customized itineraries based on preferences',
      'Flexible scheduling around your plans',
      'Small group or one-on-one experiences',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
    imageAlt: 'Friends enjoying flexible travel together',
    accentColor: 'green',
  },
]

/**
 * Accent color configurations
 */
const ACCENT_COLORS = {
  blue: { primary: '#3B82F6', secondary: '#1D4ED8' },
  purple: { primary: '#8B5CF6', secondary: '#6D28D9' },
  green: { primary: '#22C55E', secondary: '#16A34A' },
}

/**
 * FeatureCardSpatial - A feature card in 3D space
 */
interface FeatureCardSpatialProps {
  feature: FeatureCardData
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  mousePosition: { smoothX: number; smoothY: number }
  isActive: boolean
  animationDelay: number
  index: number
}

function FeatureCardSpatial({
  feature,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  mousePosition,
  isActive,
  animationDelay,
  index,
}: FeatureCardSpatialProps) {
  const groupRef = useRef<Group>(null)
  const imageRef = useRef<Mesh>(null)

  const animationProgress = useRef(0)
  const hasAnimatedIn = useRef(false)
  const startTime = useRef<number | null>(null)
  const currentOpacity = useRef(0)
  const currentScale = useRef(0.85)

  const texture = useLoader(TextureLoader, feature.imageSrc)
  const colors = ACCENT_COLORS[feature.accentColor]

  // Card dimensions
  const cardWidth = 3.2 * scale
  const cardHeight = 2.8 * scale
  const imageHeight = cardHeight * 0.35

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    if (startTime.current === null) {
      startTime.current = time
    }

    // Entrance animation
    if (isActive && !hasAnimatedIn.current) {
      const elapsed = time - startTime.current - animationDelay
      const duration = 0.9

      if (elapsed > 0) {
        animationProgress.current = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - animationProgress.current, 3)
        currentOpacity.current = eased
        currentScale.current = 0.85 + 0.15 * eased

        if (animationProgress.current >= 1) {
          hasAnimatedIn.current = true
        }
      }
    }

    // Reset when not active
    if (!isActive && hasAnimatedIn.current) {
      currentOpacity.current = Math.max(0, currentOpacity.current - 0.05)
      if (currentOpacity.current <= 0) {
        hasAnimatedIn.current = false
        startTime.current = null
      }
    }

    // Parallax based on card position
    const parallaxFactor = 0.15 + index * 0.05
    const parallaxX = mousePosition.smoothX * parallaxFactor
    const parallaxY = mousePosition.smoothY * parallaxFactor * 0.5

    // Floating motion
    const floatY = Math.sin(time * 0.4 + index * 2) * 0.03

    groupRef.current.position.x = position[0] + parallaxX
    groupRef.current.position.y = position[1] + parallaxY + floatY
    groupRef.current.position.z = position[2]

    // Subtle rotation response
    const rotX = -mousePosition.smoothY * 0.02
    const rotY = mousePosition.smoothX * 0.03

    groupRef.current.rotation.x = rotation[0] + rotX
    groupRef.current.rotation.y = rotation[1] + rotY
    groupRef.current.rotation.z = rotation[2]

    groupRef.current.scale.setScalar(currentScale.current)
  })

  const opacity = currentOpacity.current

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card background */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.9 * opacity} />
      </mesh>

      {/* Card border */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[cardWidth + 0.04, cardHeight + 0.04]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08 * opacity} />
      </mesh>

      {/* Image at top */}
      <group position={[0, (cardHeight - imageHeight) / 2 - 0.15, 0.01]}>
        <mesh ref={imageRef}>
          <planeGeometry args={[cardWidth - 0.2, imageHeight]} />
          <meshBasicMaterial map={texture} transparent opacity={opacity} />
        </mesh>
        {/* Gradient overlay */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[cardWidth - 0.2, imageHeight]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.25 * opacity} />
        </mesh>
      </group>

      {/* Accent bar */}
      <mesh position={[-(cardWidth - 0.4) / 2 + 0.25, 0.25, 0.02]}>
        <planeGeometry args={[0.5, 0.04]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={opacity} />
      </mesh>

      {/* Title */}
      <Text
        position={[-(cardWidth - 0.4) / 2, 0.1, 0.03]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
        maxWidth={cardWidth - 0.4}
        font="/fonts/Inter-Regular.woff"
      >
        {feature.title}
        <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={opacity} />
      </Text>

      {/* Description */}
      <Text
        position={[-(cardWidth - 0.4) / 2, -0.15, 0.03]}
        fontSize={0.1}
        color="#a0a0a0"
        anchorX="left"
        anchorY="top"
        maxWidth={cardWidth - 0.4}
        lineHeight={1.4}
        font="/fonts/Inter-Regular.woff"
      >
        {feature.description}
        <meshBasicMaterial attach="material" color="#a0a0a0" transparent opacity={opacity * 0.9} />
      </Text>

      {/* Bullet points */}
      {feature.bullets.map((bullet, idx) => (
        <group key={idx} position={[-(cardWidth - 0.4) / 2, -0.55 - idx * 0.15, 0.03]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.11}
            color={colors.primary}
            anchorX="left"
            anchorY="middle"
            font="/fonts/Inter-Regular.woff"
          >
            {'✓'}
            <meshBasicMaterial attach="material" color={colors.primary} transparent opacity={opacity} />
          </Text>
          <Text
            position={[0.15, 0, 0]}
            fontSize={0.09}
            color="#c0c0c0"
            anchorX="left"
            anchorY="middle"
            maxWidth={cardWidth - 0.7}
            font="/fonts/Inter-Regular.woff"
          >
            {bullet}
            <meshBasicMaterial attach="material" color="#c0c0c0" transparent opacity={opacity * 0.9} />
          </Text>
        </group>
      ))}
    </group>
  )
}

/**
 * ValueSection3D - The value proposition section in 3D space
 *
 * Layout:
 * - Section heading at top center
 * - Three feature cards arranged in a gentle arc
 * - Cards stagger in depth for parallax effect
 *
 * Positioned at Z = -15 to -20
 */
export function ValueSection3D({
  mousePosition,
  scrollProgress,
  isActive,
  sectionProgress,
}: SectionProps) {
  const groupRef = useRef<Group>(null)
  const titleRef = useRef<Group>(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Animation state
  const titleAnimProgress = useRef(0)
  const hasTitleAnimated = useRef(false)
  const startTime = useRef<number | null>(null)

  useFrame((state) => {
    if (!groupRef.current || !titleRef.current) return

    const time = state.clock.elapsedTime

    if (startTime.current === null) {
      startTime.current = time
    }

    // Title entrance animation
    if (isActive && !hasTitleAnimated.current) {
      const elapsed = time - startTime.current - 0.1
      const duration = 0.7

      if (elapsed > 0) {
        titleAnimProgress.current = Math.min(1, elapsed / duration)
        if (titleAnimProgress.current >= 1) {
          hasTitleAnimated.current = true
        }
      }
    }

    // Title parallax
    const parallaxX = mousePosition.smoothX * 0.1
    const parallaxY = mousePosition.smoothY * 0.05

    titleRef.current.position.x = parallaxX
    titleRef.current.position.y = 3.5 + parallaxY

    // Update active card based on section progress
    if (sectionProgress < 0.33) {
      setActiveCardIndex(0)
    } else if (sectionProgress < 0.66) {
      setActiveCardIndex(1)
    } else {
      setActiveCardIndex(2)
    }
  })

  const titleEased = 1 - Math.pow(1 - titleAnimProgress.current, 3)
  const titleOpacity = isActive ? titleEased : 0

  // Card positions - arranged in a gentle arc with depth stagger
  const cardPositions: [number, number, number][] = [
    [-4, 0, -18],   // Left card
    [0, 0.3, -19],  // Center card (slightly forward)
    [4, 0, -20],    // Right card
  ]

  const cardRotations: [number, number, number][] = [
    [0, 0.15, 0],   // Left card tilted toward center
    [0, 0, 0],      // Center card straight
    [0, -0.15, 0],  // Right card tilted toward center
  ]

  return (
    <group ref={groupRef} position={[0, 0, -15]}>
      {/* Section title */}
      <group ref={titleRef} position={[0, 3.5, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.woff"
        >
          Why Choose TourWiseCo?
          <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={titleOpacity} />
        </Text>

        <Text
          position={[0, -0.5, -0.1]}
          fontSize={0.16}
          color="#a0a0a0"
          anchorX="center"
          anchorY="middle"
          maxWidth={8}
          font="/fonts/Inter-Regular.woff"
        >
          Experience travel differently with our verified student guides
          <meshBasicMaterial attach="material" color="#a0a0a0" transparent opacity={titleOpacity * 0.9} />
        </Text>
      </group>

      {/* Feature cards */}
      {FEATURES.map((feature, index) => (
        <FeatureCardSpatial
          key={feature.id}
          feature={feature}
          position={cardPositions[index]}
          rotation={cardRotations[index]}
          scale={1}
          mousePosition={mousePosition}
          isActive={isActive}
          animationDelay={0.3 + index * 0.2}
          index={index}
        />
      ))}

      {/* Decorative elements */}
      <mesh position={[-6, 2, -22]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.12 * (isActive ? 1 : 0)} />
      </mesh>
      <mesh position={[6, -1, -21]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.12 * (isActive ? 1 : 0)} />
      </mesh>
      <mesh position={[0, -3, -23]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#22C55E" transparent opacity={0.1 * (isActive ? 1 : 0)} />
      </mesh>
    </group>
  )
}
