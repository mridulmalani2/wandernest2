'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for tracking scroll progress within the hero section
 *
 * Key design decisions:
 * - Returns normalized 0-1 progress for the hero's viewport scroll
 * - Uses passive listeners for performance
 * - Throttles updates via requestAnimationFrame
 * - Provides smooth scroll progress that can drive subtle 3D transitions
 *
 * @param containerRef - Ref to the hero container element
 * @param scrollRange - How many pixels of scroll before reaching 1.0 (default: window height)
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement>,
  scrollRange?: number
): number {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>()
  const lastProgressRef = useRef(0)

  const calculateProgress = useCallback(() => {
    if (!containerRef.current) return 0

    const rect = containerRef.current.getBoundingClientRect()
    const range = scrollRange || window.innerHeight

    // Calculate how far we've scrolled into the hero
    // At top of hero: 0, fully scrolled through: 1
    const scrolledAmount = -rect.top
    const normalizedProgress = Math.max(0, Math.min(1, scrolledAmount / range))

    return normalizedProgress
  }, [containerRef, scrollRange])

  const handleScroll = useCallback(() => {
    // Use RAF to batch scroll updates
    if (rafRef.current) return

    rafRef.current = requestAnimationFrame(() => {
      const newProgress = calculateProgress()

      // Only update state if meaningfully different
      if (Math.abs(newProgress - lastProgressRef.current) > 0.001) {
        lastProgressRef.current = newProgress
        setProgress(newProgress)
      }

      rafRef.current = undefined
    })
  }, [calculateProgress])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Calculate initial progress

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll])

  return progress
}
