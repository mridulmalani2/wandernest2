'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { CameraState, SpatialSection } from '../types'

/**
 * Configuration for the scroll-driven camera
 */
interface UseCameraScrollConfig {
  /** Camera starting Z position */
  startZ: number
  /** Camera ending Z position */
  endZ: number
  /** Total scroll distance in pixels */
  scrollDistance: number
  /** Section definitions for tracking active section */
  sections: SpatialSection[]
  /** Smoothing factor for lerp (0.05-0.15 recommended) */
  smoothingFactor?: number
}

/**
 * Custom hook for scroll-driven camera movement through Z-space
 *
 * Key design decisions:
 * - Maps page scroll to camera Z position
 * - Uses lerp for smooth, cinematic camera movement
 * - Tracks which section is currently active
 * - Provides section-specific progress values
 * - Uses RAF for performance
 *
 * The camera moves from startZ to endZ as the user scrolls,
 * creating the illusion of moving through a 3D space.
 */
export function useCameraScroll({
  startZ,
  endZ,
  scrollDistance,
  sections,
  smoothingFactor = 0.08,
}: UseCameraScrollConfig): CameraState & {
  sectionProgress: Record<string, number>
} {
  // Refs for smooth animation without causing re-renders
  const targetZRef = useRef(startZ)
  const currentZRef = useRef(startZ)
  const scrollProgressRef = useRef(0)
  const frameRef = useRef<number>()
  const lastUpdateRef = useRef(0)

  const [cameraState, setCameraState] = useState<CameraState>({
    z: startZ,
    targetZ: startZ,
    scrollProgress: 0,
    activeSection: sections[0]?.id || 'hero',
  })

  // Calculate section progress for each section
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({})

  // Calculate which section is active based on scroll progress
  const calculateActiveSection = useCallback(
    (progress: number): string => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (progress >= section.scrollStart) {
          return section.id
        }
      }
      return sections[0]?.id || 'hero'
    },
    [sections]
  )

  // Calculate progress within each section
  const calculateSectionProgress = useCallback(
    (progress: number): Record<string, number> => {
      const result: Record<string, number> = {}

      for (const section of sections) {
        const sectionRange = section.scrollEnd - section.scrollStart
        if (sectionRange <= 0) {
          result[section.id] = progress >= section.scrollStart ? 1 : 0
          continue
        }

        const sectionProgress = (progress - section.scrollStart) / sectionRange
        result[section.id] = Math.max(0, Math.min(1, sectionProgress))
      }

      return result
    },
    [sections]
  )

  // Handle scroll - update target Z
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const maxScroll = scrollDistance

    // Normalize scroll to 0-1
    const progress = Math.max(0, Math.min(1, scrollY / maxScroll))
    scrollProgressRef.current = progress

    // Calculate target Z position
    const targetZ = startZ + (endZ - startZ) * progress
    targetZRef.current = targetZ
  }, [startZ, endZ, scrollDistance])

  // Animation loop for smooth camera movement
  useEffect(() => {
    const animate = () => {
      const now = performance.now()

      // Lerp current Z towards target Z
      const diff = targetZRef.current - currentZRef.current
      currentZRef.current += diff * smoothingFactor

      // Only update state every ~16ms (60fps) to reduce re-renders
      if (now - lastUpdateRef.current > 16) {
        lastUpdateRef.current = now

        const activeSection = calculateActiveSection(scrollProgressRef.current)
        const newSectionProgress = calculateSectionProgress(scrollProgressRef.current)

        setCameraState({
          z: currentZRef.current,
          targetZ: targetZRef.current,
          scrollProgress: scrollProgressRef.current,
          activeSection,
        })

        setSectionProgress(newSectionProgress)
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [smoothingFactor, calculateActiveSection, calculateSectionProgress])

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    ...cameraState,
    sectionProgress,
  }
}

/**
 * Default section configuration for the landing page
 */
export const DEFAULT_SECTIONS: SpatialSection[] = [
  {
    id: 'hero',
    name: 'Hero',
    zPosition: 0,
    height: 10,
    scrollStart: 0,
    scrollEnd: 0.35,
  },
  {
    id: 'value',
    name: 'Value Proposition',
    zPosition: -20,
    height: 15,
    scrollStart: 0.35,
    scrollEnd: 0.75,
  },
  {
    id: 'footer',
    name: 'Footer',
    zPosition: -35,
    height: 10,
    scrollStart: 0.75,
    scrollEnd: 1,
  },
]

/**
 * Default camera configuration
 */
export const DEFAULT_CAMERA_CONFIG = {
  startZ: 12,
  endZ: -25,
  scrollDistance: 3000, // 3 viewport heights roughly
}
