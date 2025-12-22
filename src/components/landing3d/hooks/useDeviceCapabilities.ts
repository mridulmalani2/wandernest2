'use client'

import { useState, useEffect } from 'react'
import { DeviceCapabilities } from '../types'

/**
 * useDeviceCapabilities - Detects device capabilities for graceful degradation
 *
 * Checks:
 * - WebGL support and context availability
 * - Device performance indicators (cores, memory)
 * - Mobile detection
 * - Reduced motion preference
 * - Pixel ratio for DPR optimization
 *
 * This ensures we only render 3D on capable devices,
 * falling back gracefully on others.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    canRender3D: true,    // Optimistic default for SSR
    isMobile: false,
    isLowEnd: false,
    prefersReducedMotion: false,
    pixelRatio: 1,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || ('ontouchstart' in window && window.innerWidth < 1024)

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Check WebGL support
    const checkWebGL = (): boolean => {
      try {
        const canvas = document.createElement('canvas')
        const gl = (
          canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')
        ) as WebGLRenderingContext | null

        if (!gl) return false

        // Check for major performance caveats
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string | null
          // Blacklist known problematic renderers
          const problematicRenderers = ['SwiftShader', 'llvmpipe', 'Software']
          if (renderer && problematicRenderers.some(r => renderer.includes(r))) {
            return false
          }
        }

        return true
      } catch {
        return false
      }
    }

    const canRenderWebGL = checkWebGL()

    // Performance estimation
    const cores = navigator.hardwareConcurrency || 2
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4

    // Low-end detection
    const isLowEnd =
      cores < 4 ||
      deviceMemory < 4 ||
      isMobile // Treat mobile as low-end for now

    // Pixel ratio with cap for performance
    const rawPixelRatio = window.devicePixelRatio || 1
    const pixelRatio = Math.min(rawPixelRatio, isLowEnd ? 1.5 : 2)

    // Final decision
    const canRender3D =
      canRenderWebGL &&
      !prefersReducedMotion &&
      !isMobile // Disable 3D on mobile for this implementation

    setCapabilities({
      canRender3D,
      isMobile,
      isLowEnd,
      prefersReducedMotion,
      pixelRatio,
    })
  }, [])

  return capabilities
}
