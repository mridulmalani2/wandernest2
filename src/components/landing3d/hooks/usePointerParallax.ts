'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PointerState } from '../types'

/**
 * usePointerParallax - Tracks pointer position for parallax effects
 *
 * Design:
 * - Returns normalized coordinates (-1 to 1)
 * - Provides both raw and smoothed values
 * - Handles both mouse and touch
 * - Respects reduced motion preferences
 * - Gracefully handles pointer leaving viewport
 */
export function usePointerParallax(
  enabled: boolean = true,
  options: {
    smoothing?: number    // Lerp factor (0-1, lower = smoother)
    deadzone?: number     // Ignore movement below this threshold
  } = {}
): PointerState {
  const { smoothing = 0.08, deadzone = 0.02 } = options

  const [pointerState, setPointerState] = useState<PointerState>({
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    isActive: false,
  })

  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()
  const isActiveRef = useRef(false)

  // Lerp function for smooth interpolation
  const lerp = useCallback((start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }, [])

  // Animation loop for smooth value updates
  const animate = useCallback(() => {
    const target = targetRef.current
    const current = currentRef.current

    // Apply deadzone
    const deltaX = Math.abs(target.x - current.x)
    const deltaY = Math.abs(target.y - current.y)

    if (deltaX > deadzone || deltaY > deadzone) {
      current.x = lerp(current.x, target.x, smoothing)
      current.y = lerp(current.y, target.y, smoothing)
    }

    setPointerState({
      x: target.x,
      y: target.y,
      smoothX: current.x,
      smoothY: current.y,
      isActive: isActiveRef.current,
    })

    rafRef.current = requestAnimationFrame(animate)
  }, [smoothing, deadzone, lerp])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      isActiveRef.current = true

      let clientX: number
      let clientY: number

      if ('touches' in e) {
        // Touch event
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX
          clientY = e.touches[0].clientY
        } else {
          return
        }
      } else {
        // Mouse event
        clientX = e.clientX
        clientY = e.clientY
      }

      // Normalize to -1 to 1 range
      const x = (clientX / window.innerWidth) * 2 - 1
      const y = -((clientY / window.innerHeight) * 2 - 1) // Invert Y for 3D coords

      targetRef.current = { x, y }
    }

    const handlePointerLeave = () => {
      isActiveRef.current = false
      // Gradually return to center
      targetRef.current = { x: 0, y: 0 }
    }

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate)

    // Add event listeners
    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)
    window.addEventListener('touchend', handlePointerLeave, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('touchend', handlePointerLeave)
    }
  }, [enabled, animate])

  return pointerState
}
