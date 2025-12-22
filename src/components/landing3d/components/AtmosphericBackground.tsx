'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  Mesh,
  ShaderMaterial,
} from 'three'
import { AtmosphericBackgroundProps, COLORS } from '../types'

/**
 * AtmosphericBackground - Creates depth and atmosphere in the scene
 *
 * Layers:
 * 1. Star field - Distant particles for cosmic depth
 * 2. Nebula planes - Soft gradients for color atmosphere
 * 3. Ambient particles - Close floating particles for life
 *
 * Performance:
 * - Static geometry generated once
 * - Minimal per-frame calculations
 * - No complex shaders
 */

// Star field component
function StarField({ scrollProgress, pointerOffset }: AtmosphericBackgroundProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)

  // Generate star positions once
  const { geometry, colors } = useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    const colorArray = new Float32Array(count * 3)

    const colorBlue = new Color(COLORS.bluePrimary)
    const colorPurple = new Color(COLORS.purplePrimary)
    const colorWhite = new Color(COLORS.white)

    for (let i = 0; i < count; i++) {
      // Distribute stars in a cylinder around the camera path
      const angle = Math.random() * Math.PI * 2
      const radius = 8 + Math.random() * 25 // Between 8-33 units from center
      const height = (Math.random() - 0.5) * 40 // ±20 units vertical spread

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius - 15 // Offset behind

      // Color variation
      const colorChoice = Math.random()
      let color: Color
      if (colorChoice < 0.4) {
        color = colorBlue
      } else if (colorChoice < 0.7) {
        color = colorPurple
      } else {
        color = colorWhite
      }

      // Add slight variation
      colorArray[i * 3] = color.r * (0.8 + Math.random() * 0.4)
      colorArray[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.4)
      colorArray[i * 3 + 2] = color.b * (0.8 + Math.random() * 0.4)
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new Float32BufferAttribute(colorArray, 3))

    return { geometry: geo, colors: colorArray }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const time = state.clock.elapsedTime

    // Very subtle rotation for ambient movement
    pointsRef.current.rotation.y = time * 0.01
    pointsRef.current.rotation.x = Math.sin(time * 0.005) * 0.02

    // Parallax response to pointer
    pointsRef.current.position.x = pointerOffset.x * 0.5
    pointsRef.current.position.y = pointerOffset.y * 0.3
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Floating ambient particles closer to camera
function AmbientParticles({ scrollProgress, pointerOffset }: AtmosphericBackgroundProps) {
  const pointsRef = useRef<Points>(null)

  const geometry = useMemo(() => {
    const count = 150
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute in a narrower volume along camera path
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = Math.random() * -25 // Along the z path

      sizes[i] = 0.02 + Math.random() * 0.04
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('size', new Float32BufferAttribute(sizes, 1))

    return geo
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const time = state.clock.elapsedTime

    // Gentle floating motion
    pointsRef.current.position.y = Math.sin(time * 0.3) * 0.2
    pointsRef.current.rotation.y = time * 0.02

    // Stronger parallax for closer particles
    pointsRef.current.position.x += (pointerOffset.x * 1.5 - pointsRef.current.position.x) * 0.02
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color={COLORS.white}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Gradient background plane
function GradientPlane() {
  const meshRef = useRef<Mesh>(null)

  // Simple gradient shader
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        colorTop: { value: new Color('#0a0a1a') },
        colorMiddle: { value: new Color('#1a1a3a') },
        colorBottom: { value: new Color('#0f0f2f') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorTop;
        uniform vec3 colorMiddle;
        uniform vec3 colorBottom;
        varying vec2 vUv;

        void main() {
          vec3 color;
          if (vUv.y > 0.5) {
            color = mix(colorMiddle, colorTop, (vUv.y - 0.5) * 2.0);
          } else {
            color = mix(colorBottom, colorMiddle, vUv.y * 2.0);
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
    })
  }, [])

  return (
    <mesh ref={meshRef} position={[0, 0, -40]} scale={[80, 60, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}

// Nebula accent planes for color depth
function NebulaPlane({
  position,
  color,
  scale,
  rotation,
}: {
  position: [number, number, number]
  color: string
  scale: number
  rotation: number
}) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    meshRef.current.rotation.z = rotation + Math.sin(time * 0.1) * 0.05
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Main AtmosphericBackground component
 */
export function AtmosphericBackground(props: AtmosphericBackgroundProps) {
  return (
    <group>
      {/* Background gradient */}
      <GradientPlane />

      {/* Nebula accent colors */}
      <NebulaPlane position={[-8, 5, -25]} color={COLORS.purplePrimary} scale={12} rotation={0.2} />
      <NebulaPlane position={[10, -3, -20]} color={COLORS.bluePrimary} scale={10} rotation={-0.3} />
      <NebulaPlane position={[-5, -8, -30]} color={COLORS.blueAccent} scale={15} rotation={0.1} />
      <NebulaPlane position={[8, 8, -35]} color={COLORS.purpleAccent} scale={8} rotation={-0.2} />

      {/* Star field */}
      <StarField {...props} />

      {/* Ambient particles */}
      <AmbientParticles {...props} />
    </group>
  )
}
