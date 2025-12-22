'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Group, TextureLoader, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { SectionProps } from '../types'

/**
 * Image plane configurations for the hero section
 * Replicates the existing hero3d layout but adapted for spatial context
 */
const IMAGE_CONFIGS = [
  {
    id: 'tourists',
    src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    alt: 'Tourists exploring a European city together',
    position: [2.5, 1.2, -3] as [number, number, number],
    rotation: [0, -0.15, -0.08] as [number, number, number],
    scale: 1.3,
    parallaxIntensity: 0.4,
    animationDelay: 0.3,
  },
  {
    id: 'london',
    src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    alt: 'London cityscape with Tower Bridge',
    position: [3.5, -0.3, -1.5] as [number, number, number],
    rotation: [0, -0.1, 0.05] as [number, number, number],
    scale: 1.1,
    parallaxIntensity: 0.7,
    animationDelay: 0.5,
  },
  {
    id: 'cafe',
    src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    alt: 'European cafe street scene',
    position: [2, -1.5, 0] as [number, number, number],
    rotation: [0, -0.08, 0.03] as [number, number, number],
    scale: 1.0,
    parallaxIntensity: 1.0,
    animationDelay: 0.7,
  },
]

/**
 * SpatialImagePlane - 3D image plane with parallax
 */
interface SpatialImagePlaneProps {
  src: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  parallaxIntensity: number
  animationDelay: number
  mousePosition: { smoothX: number; smoothY: number }
  isVisible: boolean
}

function SpatialImagePlane({
  src,
  position,
  rotation,
  scale,
  parallaxIntensity,
  animationDelay,
  mousePosition,
  isVisible,
}: SpatialImagePlaneProps) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const hasAnimatedIn = useRef(false)
  const animationProgress = useRef(0)
  const startTime = useRef<number | null>(null)
  const currentOpacity = useRef(0)
  const currentScale = useRef(0.8)

  const texture = useLoader(TextureLoader, src)
  const targetPosition = useMemo(() => new Vector3(...position), [position])

  const planeWidth = 2.5 * scale
  const planeHeight = 1.7 * scale

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return

    const time = state.clock.elapsedTime
    const mesh = meshRef.current
    const material = materialRef.current

    if (startTime.current === null) {
      startTime.current = time
    }

    // Entrance animation
    if (isVisible && !hasAnimatedIn.current) {
      const elapsed = time - startTime.current - animationDelay
      const duration = 0.8

      if (elapsed > 0) {
        animationProgress.current = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - animationProgress.current, 3)
        currentOpacity.current = eased
        currentScale.current = 0.8 + 0.2 * eased

        material.opacity = currentOpacity.current

        if (animationProgress.current >= 1) {
          hasAnimatedIn.current = true
        }
      }
    }

    // Parallax
    const parallaxX = mousePosition.smoothX * parallaxIntensity * 0.25
    const parallaxY = mousePosition.smoothY * parallaxIntensity * 0.15

    // Floating motion
    const floatX = Math.sin(time * 0.3 + position[0]) * 0.02 * parallaxIntensity
    const floatY = Math.cos(time * 0.2 + position[1]) * 0.03 * parallaxIntensity

    mesh.position.x = targetPosition.x + parallaxX + floatX
    mesh.position.y = targetPosition.y + parallaxY + floatY
    mesh.position.z = targetPosition.z

    // Rotation response
    const rotationX = -mousePosition.smoothY * 0.04 * parallaxIntensity
    const rotationY = mousePosition.smoothX * 0.06 * parallaxIntensity

    mesh.rotation.x = rotation[0] + rotationX
    mesh.rotation.y = rotation[1] + rotationY
    mesh.rotation.z = rotation[2]

    mesh.scale.setScalar(currentScale.current)
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

/**
 * HeroSection3D - The hero section in 3D space
 *
 * Layout:
 * - Text content on the left (Z = 0 to -0.5)
 * - Image planes on the right (Z = -3 to 0)
 * - CTAs at slight depth (Z = -0.5)
 *
 * The section is positioned at Z = 0 (closest to camera)
 */
export function HeroSection3D({
  mousePosition,
  scrollProgress,
  isActive,
  sectionProgress,
}: SectionProps) {
  const groupRef = useRef<Group>(null)
  const textGroupRef = useRef<Group>(null)

  // Animation state
  const textAnimProgress = useRef(0)
  const hasTextAnimated = useRef(false)
  const startTime = useRef<number | null>(null)

  useFrame((state) => {
    if (!groupRef.current || !textGroupRef.current) return

    const time = state.clock.elapsedTime

    if (startTime.current === null) {
      startTime.current = time
    }

    // Text entrance animation
    if (isActive && !hasTextAnimated.current) {
      const elapsed = time - startTime.current - 0.1
      const duration = 0.8

      if (elapsed > 0) {
        textAnimProgress.current = Math.min(1, elapsed / duration)

        if (textAnimProgress.current >= 1) {
          hasTextAnimated.current = true
        }
      }
    }

    // Text parallax
    const parallaxX = mousePosition.smoothX * 0.15
    const parallaxY = mousePosition.smoothY * 0.08

    textGroupRef.current.position.x = -3.5 + parallaxX
    textGroupRef.current.position.y = parallaxY
  })

  // Ease function for text animation
  const textEased = 1 - Math.pow(1 - textAnimProgress.current, 3)
  const textOpacity = isActive ? textEased : 0

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Text content - left side */}
      <group ref={textGroupRef} position={[-3.5, 0, 0]}>
        {/* Main headline */}
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.55}
          color="#ffffff"
          anchorX="left"
          anchorY="top"
          maxWidth={6}
          lineHeight={1.1}
          letterSpacing={-0.02}
          font="/fonts/Inter-Regular.woff"
        >
          Experience Authentic Travel
          <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={textOpacity} />
        </Text>

        <Text
          position={[0, 1.15, -0.1]}
          fontSize={0.55}
          color="#ffffff"
          anchorX="left"
          anchorY="top"
          maxWidth={6}
          lineHeight={1.1}
          letterSpacing={-0.02}
          font="/fonts/Inter-Regular.woff"
        >
          with Local Student Guides
          <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={textOpacity} />
        </Text>

        {/* Subheadline */}
        <Text
          position={[0, 0.3, -0.2]}
          fontSize={0.16}
          color="#d4d4d8"
          anchorX="left"
          anchorY="top"
          maxWidth={5}
          lineHeight={1.5}
          font="/fonts/Inter-Regular.woff"
        >
          {`Connect with verified university students in Paris and London who will show you their city through a local's eyes. Get personalized recommendations and authentic experiences.`}
          <meshBasicMaterial attach="material" color="#d4d4d8" transparent opacity={textOpacity * 0.9} />
        </Text>

        {/* CTA Buttons - using HTML overlay for accessibility */}
        {/* The actual CTAs will be rendered as HTML overlay, synced to 3D position */}
      </group>

      {/* Image planes - right side */}
      {IMAGE_CONFIGS.map((config) => (
        <SpatialImagePlane
          key={config.id}
          src={config.src}
          position={config.position}
          rotation={config.rotation}
          scale={config.scale}
          parallaxIntensity={config.parallaxIntensity}
          animationDelay={config.animationDelay}
          mousePosition={mousePosition}
          isVisible={isActive}
        />
      ))}

      {/* Decorative elements */}
      <mesh position={[5, 2, -5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.15} />
      </mesh>
      <mesh position={[-5, -2, -4]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}
