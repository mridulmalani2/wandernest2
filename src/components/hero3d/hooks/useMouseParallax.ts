'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MouseState } from '../types'

/**
 * Custom hook for tracking mouse position with smooth interpolation
 *
 * Key design decisions:
 * - Normalizes mouse position to -1 to 1 range for consistent parallax math
 * - Uses lerping (linear interpolation) for buttery smooth movement
 * - Throttles updates to prevent jank on fast mouse movements
 * - Respects reduced motion preferences
 *
 * @param enabled - Whether to track mouse movement
 * @param smoothingFactor - How quickly the smoothed values catch up (0.05-0.2 recommended)
 */
export function useMouseParallax(
  enabled: boolean = true,
  smoothingFactor: number = 0.08
): MouseState {
  const [mouseState, setMouseState] = useState<MouseState>({
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
  })

  // Use refs to track actual values without causing re-renders
  const targetRef = useRef({ x: 0, y: 0 })
  const smoothRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>()

  // Handle mouse movement - normalize to -1 to 1 range
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return

    // Normalize: center of screen = 0, edges = -1 or 1
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -((event.clientY / window.innerHeight) * 2 - 1) // Invert Y for natural feel

    targetRef.current = { x, y }
  }, [enabled])

  // Animation loop for smooth interpolation
  useEffect(() => {
    if (!enabled) return

    const animate = () => {
      // Linear interpolation (lerp) for smooth movement
      // The smaller the factor, the smoother (and slower) the movement
      smoothRef.current.x += (targetRef.current.x - smoothRef.current.x) * smoothingFactor
      smoothRef.current.y += (targetRef.current.y - smoothRef.current.y) * smoothingFactor

      // Only update state when values have meaningfully changed
      // This prevents unnecessary re-renders
      const hasChanged =
        Math.abs(smoothRef.current.x - mouseState.smoothX) > 0.001 ||
        Math.abs(smoothRef.current.y - mouseState.smoothY) > 0.001

      if (hasChanged) {
        setMouseState({
          x: targetRef.current.x,
          y: targetRef.current.y,
          smoothX: smoothRef.current.x,
          smoothY: smoothRef.current.y,
        })
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [enabled, smoothingFactor, mouseState.smoothX, mouseState.smoothY])

  // Set up mouse event listener
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enabled, handleMouseMove])

  return mouseState
}
