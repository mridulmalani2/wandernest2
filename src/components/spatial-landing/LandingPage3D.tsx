'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { Fog } from 'three'

import { useMouseParallax, useDeviceCapabilities } from '@/components/hero3d/hooks'
import { useCameraScroll, DEFAULT_SECTIONS, DEFAULT_CAMERA_CONFIG } from './hooks'
import { HeroSection3D } from './sections/HeroSection3D'
import { ValueSection3D } from './sections/ValueSection3D'
import { HeroContent } from '@/components/hero3d/HeroContent'
import { LandingPageFallback } from './LandingPageFallback'

/**
 * CameraController - Smoothly interpolates camera Z position
 */
function CameraController({ targetZ }: { targetZ: number }) {
  const { camera } = useThree()
  const currentZ = useRef(targetZ)

  useFrame(() => {
    // Smooth lerp towards target
    currentZ.current += (targetZ - currentZ.current) * 0.08
    camera.position.z = currentZ.current
  })

  return null
}

/**
 * Scene3D - The 3D scene containing all spatial sections
 */
interface Scene3DProps {
  mousePosition: { smoothX: number; smoothY: number }
  scrollProgress: number
  activeSection: string
  sectionProgress: Record<string, number>
  cameraZ: number
}

function Scene3D({
  mousePosition,
  scrollProgress,
  activeSection,
  sectionProgress,
  cameraZ,
}: Scene3DProps) {
  return (
    <>
      {/* Hero Section - Z = 0 */}
      <HeroSection3D
        mousePosition={mousePosition}
        scrollProgress={scrollProgress}
        isActive={activeSection === 'hero' || sectionProgress.hero > 0}
        sectionProgress={sectionProgress.hero || 0}
      />

      {/* Value Proposition Section - Z = -15 to -20 */}
      <ValueSection3D
        mousePosition={mousePosition}
        scrollProgress={scrollProgress}
        isActive={activeSection === 'value' || sectionProgress.value > 0.1}
        sectionProgress={sectionProgress.value || 0}
      />

      {/* Preload all textures */}
      <Preload all />
    </>
  )
}


/**
 * LandingPage3D - The full spatial 3D landing experience
 *
 * Architecture:
 * ┌─────────────────────────────────────────────┐
 * │ Background (CSS - Parallax Image)          │ z-index: 0
 * ├─────────────────────────────────────────────┤
 * │ 3D Canvas (Three.js - Spatial Sections)    │ z-index: 1
 * ├─────────────────────────────────────────────┤
 * │ HTML Overlay (Navbar, CTAs, Accessibility) │ z-index: 2
 * └─────────────────────────────────────────────┘
 *
 * Key features:
 * - Single persistent canvas for entire experience
 * - Scroll drives camera through Z-space
 * - Sections are positioned in real 3D depth
 * - HTML overlay for accessibility and CTAs
 * - Graceful fallback for mobile/low-end devices
 */
interface LandingPage3DProps {
  className?: string
}

export function LandingPage3D({ className = '' }: LandingPage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState(1000)

  // Handle viewport height for scroll distance calculation
  useEffect(() => {
    setViewportHeight(window.innerHeight)
    const handleResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Device capability detection
  const { canRender3D, isMobile, prefersReducedMotion } = useDeviceCapabilities()

  // Mouse tracking for parallax
  const mousePosition = useMouseParallax(canRender3D && !isMobile)

  // Scroll-driven camera movement
  const {
    z: cameraZ,
    scrollProgress,
    activeSection,
    sectionProgress,
  } = useCameraScroll({
    startZ: DEFAULT_CAMERA_CONFIG.startZ,
    endZ: DEFAULT_CAMERA_CONFIG.endZ,
    scrollDistance: DEFAULT_CAMERA_CONFIG.scrollDistance,
    sections: DEFAULT_SECTIONS,
  })

  // Determine if we should render 3D
  const shouldRender3D = canRender3D && !prefersReducedMotion && !isMobile

  // Calculate total page height for scroll
  const pageHeight = DEFAULT_CAMERA_CONFIG.scrollDistance + viewportHeight

  // Render fallback for mobile/low-end/reduced-motion devices
  if (!shouldRender3D) {
    return <LandingPageFallback />
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${pageHeight}px` }}
    >
      {/* ===== LAYER 0: Background ===== */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
          alt="Beautiful Paris cityscape with Eiffel Tower"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/10 via-ui-purple-accent/8 to-ui-purple-primary/12" />
      </div>

      {/* Dot pattern overlay */}
      <div className="fixed inset-0 z-0 pattern-dots opacity-15" />

      {/* ===== LAYER 1: 3D Canvas ===== */}
      {shouldRender3D && (
        <div className="fixed inset-0 z-[1]">
          <Canvas
            camera={{
              position: [0, 0, DEFAULT_CAMERA_CONFIG.startZ],
              fov: 50,
              near: 0.1,
              far: 100,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: true,
            }}
            frameloop="always"
            dpr={[1, 1.5]}
            resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
            onCreated={({ gl, scene }) => {
              gl.setClearColor(0x000000, 0)
              scene.fog = new Fog('#0a0a15', 15, 50)
            }}
          >
            <Suspense fallback={null}>
              {/* Camera movement controller */}
              <CameraController targetZ={cameraZ} />

              {/* 3D Scene content */}
              <Scene3D
                mousePosition={mousePosition}
                scrollProgress={scrollProgress}
                activeSection={activeSection}
                sectionProgress={sectionProgress}
                cameraZ={cameraZ}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* ===== LAYER 2: HTML Content Overlay ===== */}
      {/* Hero Section HTML - CTAs and accessible text */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 2.5),
          transform: `translateY(${scrollProgress * -50}px)`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-24 md:pb-12 lg:pt-28 lg:pb-16 h-screen">
          <div className="max-w-6xl mx-auto h-full flex items-center">
            <div className="w-full lg:w-1/2 pointer-events-auto">
              <HeroContent is3DEnabled={shouldRender3D} />
            </div>
          </div>
        </div>
      </div>

      {/* Value Section HTML - Scroll indicator */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          opacity: scrollProgress < 0.1 ? 1 - scrollProgress * 10 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm font-light">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Section Progress Indicator */}
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-3"
        style={{ opacity: scrollProgress > 0.05 ? 1 : 0 }}
      >
        {DEFAULT_SECTIONS.map((section) => (
          <div
            key={section.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-white scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            title={section.name}
          />
        ))}
      </div>
    </div>
  )
}

