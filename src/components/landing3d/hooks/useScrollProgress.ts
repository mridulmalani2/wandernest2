'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ScrollState } from '../types'

/**
 * useScrollProgress - Tracks scroll position through a container
 *
 * Design:
 * - Returns normalized progress (0-1) through the scrollable area
 * - Tracks velocity for momentum-based animations
 * - Uses RAF for smooth updates
 * - Debounces direction changes to prevent jitter
 *
 * The scroll progress maps to camera position in the 3D scene,
 * making scroll the primary navigation mechanism.
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  options: {
    scrollHeight?: number // Total scroll height (vh units)
    smoothing?: number    // Smoothing factor for velocity
  } = {}
): ScrollState {
  const { scrollHeight = 300, smoothing = 0.15 } = options

  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    velocity: 0,
    direction: 'none',
  })

  const lastScrollRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const velocityRef = useRef(0)
  const rafRef = useRef<number>()

  const updateScroll = useCallback(() => {
    if (typeof window === 'undefined') return

    const scrollY = window.scrollY
    const now = performance.now()
    const deltaTime = (now - lastTimeRef.current) / 1000 // seconds
    const deltaScroll = scrollY - lastScrollRef.current

    // Calculate raw velocity (pixels per second)
    const rawVelocity = deltaTime > 0 ? deltaScroll / deltaTime : 0

    // Smooth velocity with exponential moving average
    velocityRef.current = velocityRef.current * (1 - smoothing) + rawVelocity * smoothing

    // Calculate progress through the scroll container
    // The container is scrollHeight vh tall, minus viewport height
    const maxScroll = (scrollHeight / 100) * window.innerHeight - window.innerHeight
    const progress = Math.max(0, Math.min(1, scrollY / Math.max(maxScroll, 1)))

    // Determine direction with hysteresis to prevent jitter
    let direction: 'up' | 'down' | 'none' = 'none'
    if (Math.abs(velocityRef.current) > 50) {
      direction = velocityRef.current > 0 ? 'down' : 'up'
    }

    setScrollState({
      progress,
      velocity: velocityRef.current / 1000, // Normalize to reasonable range
      direction,
    })

    lastScrollRef.current = scrollY
    lastTimeRef.current = now
  }, [scrollHeight, smoothing])

  useEffect(() => {
    // Initial update
    updateScroll()

    // Scroll listener with RAF throttling
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          updateScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updateScroll])

  return scrollState
}
