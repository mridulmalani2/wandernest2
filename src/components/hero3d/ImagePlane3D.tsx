'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { ImagePlane3DProps } from './types'

/**
 * ImagePlane3D - A single image rendered as a 3D plane
 *
 * Design philosophy:
 * - Each image exists on its own Z-plane, creating real depth
 * - Parallax movement is proportional to depth (closer = more movement)
 * - Subtle rotations respond to mouse for "living" feel
 * - Spring-based animations for organic movement
 *
 * Performance considerations:
 * - Uses MeshBasicMaterial (no lighting calculations)
 * - Texture loaded once and cached by Three.js
 * - Animation calculations are minimal per frame
 * - No complex shaders or postprocessing
 */
export function ImagePlane3D({
  id,
  src,
  alt,
  position,
  rotation,
  scale,
  aspectRatio,
  parallaxIntensity,
  animationDelay,
  mousePosition,
  scrollProgress,
  isVisible,
}: ImagePlane3DProps) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false)

  // Load texture - Three.js handles caching
  const texture = useLoader(TextureLoader, src)

  // Calculate base dimensions from aspect ratio
  // Standard plane is 1x1, we scale based on design needs
  const planeWidth = 3 * scale
  const planeHeight = (3 / aspectRatio) * scale

  // Memoize target position to avoid recalculating every frame
  const targetPosition = useMemo(() => new Vector3(...position), [position])

  // Animation state refs - using refs to avoid state updates in animation loop
  const animationProgress = useRef(0)
  const currentOpacity = useRef(0)
  const currentScale = useRef(0.8) // Start smaller for scale-in effect

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return

    const mesh = meshRef.current
    const material = materialRef.current
    const time = state.clock.elapsedTime

    // ===== ENTRANCE ANIMATION =====
    // Staggered fade-in with scale effect, mimicking the original CSS animations
    if (isVisible && !hasAnimatedIn) {
      const animationStartTime = animationDelay
      const animationDuration = 0.8

      // Calculate progress with delay
      animationProgress.current = Math.min(
        1,
        Math.max(0, (time - animationStartTime) / animationDuration)
      )

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - animationProgress.current, 3)

      // Animate opacity
      currentOpacity.current = eased
      material.opacity = currentOpacity.current

      // Animate scale (0.8 -> 1.0)
      currentScale.current = 0.8 + 0.2 * eased

      if (animationProgress.current >= 1) {
        setHasAnimatedIn(true)
      }
    }

    // ===== PARALLAX MOVEMENT =====
    // Depth-based parallax: objects further away move less
    // This creates the classic parallax depth effect
    const parallaxX = mousePosition.smoothX * parallaxIntensity * 0.3
    const parallaxY = mousePosition.smoothY * parallaxIntensity * 0.2

    // ===== SCROLL-BASED DEPTH SHIFT =====
    // As user scrolls, push elements slightly back for "receding" effect
    const scrollDepthOffset = scrollProgress * 0.5 * parallaxIntensity

    // ===== SUBTLE FLOATING MOTION =====
    // Very gentle ambient movement to make scene feel alive
    // Different frequencies per plane prevent synchronized movement
    const floatX = Math.sin(time * 0.3 + position[0]) * 0.02 * parallaxIntensity
    const floatY = Math.cos(time * 0.2 + position[1]) * 0.03 * parallaxIntensity

    // ===== APPLY POSITION =====
    mesh.position.x = targetPosition.x + parallaxX + floatX
    mesh.position.y = targetPosition.y + parallaxY + floatY
    mesh.position.z = targetPosition.z - scrollDepthOffset

    // ===== ROTATION RESPONSE =====
    // Subtle rotation towards mouse creates "looking at you" effect
    // Very subtle to avoid feeling gimicky
    const rotationResponseX = -mousePosition.smoothY * 0.05 * parallaxIntensity
    const rotationResponseY = mousePosition.smoothX * 0.05 * parallaxIntensity

    mesh.rotation.x = rotation[0] + rotationResponseX
    mesh.rotation.y = rotation[1] + rotationResponseY
    mesh.rotation.z = rotation[2]

    // ===== SCALE =====
    const finalScale = currentScale.current
    mesh.scale.set(finalScale, finalScale, finalScale)
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        // Rounded corners are handled differently in 3D
        // We rely on the actual image having rounded corners or use a mask
      />
    </mesh>
  )
}
