'use client'

import { useState, useEffect } from 'react'
import { DeviceCapabilities } from '../types'

/**
 * Custom hook for detecting device capabilities
 *
 * Key design decisions:
 * - Checks for WebGL support and hardware concurrency
 * - Respects user's reduced motion preferences
 * - Provides quality level suggestions for adaptive rendering
 * - Errs on the side of caution for low-end devices
 *
 * This ensures the 3D hero gracefully degrades on devices
 * that can't handle the full experience.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    canRender3D: true, // Optimistic default for SSR
    isMobile: false,
    prefersReducedMotion: false,
    qualityLevel: 'high',
  })

  useEffect(() => {
    // Detect mobile via user agent and touch support
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || ('ontouchstart' in window && window.innerWidth < 1024)

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Check WebGL support
    const canRenderWebGL = (() => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        return !!gl
      } catch {
        return false
      }
    })()

    // Estimate device performance
    // Hardware concurrency gives us a rough idea of CPU power
    const cores = navigator.hardwareConcurrency || 2
    const hasGoodCPU = cores >= 4

    // Device memory API (Chrome only, but useful when available)
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
    const hasGoodMemory = deviceMemory >= 4

    // Determine quality level
    let qualityLevel: 'high' | 'medium' | 'low' = 'high'
    if (prefersReducedMotion) {
      qualityLevel = 'low'
    } else if (isMobile) {
      qualityLevel = 'low' // Disable 3D on mobile for now
    } else if (!hasGoodCPU || !hasGoodMemory) {
      qualityLevel = 'medium'
    }

    // Final decision: can we render 3D?
    const canRender3D =
      canRenderWebGL &&
      !prefersReducedMotion &&
      !isMobile && // Mobile gets static fallback
      qualityLevel !== 'low'

    setCapabilities({
      canRender3D,
      isMobile,
      prefersReducedMotion,
      qualityLevel,
    })
  }, [])

  return capabilities
}
