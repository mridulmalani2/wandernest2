'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Animation phases for the hero section scroll hijacking
 */
export interface AnimationPhase {
  id: number
  name: string
  threshold: number // Cumulative scroll delta needed to reach this phase
  duration: number  // Minimum time to stay in this phase (ms)
}

export const ANIMATION_PHASES: AnimationPhase[] = [
  { id: 0, name: 'initial', threshold: 0, duration: 0 },
  { id: 1, name: 'title', threshold: 100, duration: 300 },
  { id: 2, name: 'subtitle', threshold: 250, duration: 300 },
  { id: 3, name: 'description', threshold: 400, duration: 300 },
  { id: 4, name: 'cta-cards', threshold: 600, duration: 500 },
  { id: 5, name: 'complete', threshold: 800, duration: 0 },
]

export interface ScrollHijackState {
  isLocked: boolean
  currentPhase: number
  phaseProgress: number // 0-1 progress within current phase
  totalProgress: number // 0-1 overall progress through all phases
  cumulativeDelta: number
  isComplete: boolean
}

/**
 * useScrollHijack - Captures scroll events and converts them to animation phases
 *
 * Instead of scrolling the page, scroll events progress through animation phases.
 * Once all phases are complete, normal scrolling is restored.
 */
export function useScrollHijack(enabled: boolean = true): ScrollHijackState {
  const [state, setState] = useState<ScrollHijackState>({
    isLocked: true,
    currentPhase: 0,
    phaseProgress: 0,
    totalProgress: 0,
    cumulativeDelta: 0,
    isComplete: false,
  })

  const cumulativeDeltaRef = useRef(0)
  const lastPhaseTimeRef = useRef(0)
  const isLockedRef = useRef(true)
  const touchStartYRef = useRef(0)
  const animationFrameRef = useRef<number>()

  // Calculate phase from cumulative delta
  const calculatePhase = useCallback((delta: number) => {
    const maxThreshold = ANIMATION_PHASES[ANIMATION_PHASES.length - 1].threshold
    const clampedDelta = Math.max(0, Math.min(delta, maxThreshold))

    // Find current phase
    let currentPhase = 0
    for (let i = ANIMATION_PHASES.length - 1; i >= 0; i--) {
      if (clampedDelta >= ANIMATION_PHASES[i].threshold) {
        currentPhase = i
        break
      }
    }

    // Calculate progress within current phase
    const currentThreshold = ANIMATION_PHASES[currentPhase].threshold
    const nextThreshold = currentPhase < ANIMATION_PHASES.length - 1
      ? ANIMATION_PHASES[currentPhase + 1].threshold
      : maxThreshold

    const phaseProgress = nextThreshold > currentThreshold
      ? (clampedDelta - currentThreshold) / (nextThreshold - currentThreshold)
      : 1

    // Calculate total progress
    const totalProgress = clampedDelta / maxThreshold

    // Check if complete
    const isComplete = currentPhase >= ANIMATION_PHASES.length - 1

    return {
      currentPhase,
      phaseProgress: Math.min(1, phaseProgress),
      totalProgress: Math.min(1, totalProgress),
      isComplete,
    }
  }, [])

  // Handle scroll/wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!enabled || !isLockedRef.current) return

    e.preventDefault()
    e.stopPropagation()

    // Accumulate scroll delta
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX

    // Only allow forward progression (downward scroll)
    if (delta > 0) {
      cumulativeDeltaRef.current += delta * 0.5 // Dampen for smoother progression
    } else {
      // Allow some backward scrolling but with more resistance
      cumulativeDeltaRef.current = Math.max(0, cumulativeDeltaRef.current + delta * 0.2)
    }

    const phaseData = calculatePhase(cumulativeDeltaRef.current)

    setState(prev => ({
      ...prev,
      ...phaseData,
      cumulativeDelta: cumulativeDeltaRef.current,
      isLocked: !phaseData.isComplete,
    }))

    if (phaseData.isComplete) {
      isLockedRef.current = false
    }
  }, [enabled, calculatePhase])

  // Handle touch events
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !isLockedRef.current) return
    touchStartYRef.current = e.touches[0].clientY
  }, [enabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isLockedRef.current) return

    e.preventDefault()

    const touchY = e.touches[0].clientY
    const delta = touchStartYRef.current - touchY
    touchStartYRef.current = touchY

    // Only allow forward progression (upward swipe = positive delta)
    if (delta > 0) {
      cumulativeDeltaRef.current += delta * 1.5 // Increase sensitivity for touch
    } else {
      cumulativeDeltaRef.current = Math.max(0, cumulativeDeltaRef.current + delta * 0.3)
    }

    const phaseData = calculatePhase(cumulativeDeltaRef.current)

    setState(prev => ({
      ...prev,
      ...phaseData,
      cumulativeDelta: cumulativeDeltaRef.current,
      isLocked: !phaseData.isComplete,
    }))

    if (phaseData.isComplete) {
      isLockedRef.current = false
    }
  }, [enabled, calculatePhase])

  // Prevent default scroll when locked
  const preventScroll = useCallback((e: Event) => {
    if (isLockedRef.current && enabled) {
      e.preventDefault()
    }
  }, [enabled])

  // Lock/unlock body scroll
  useEffect(() => {
    if (!enabled) {
      document.body.style.overflow = ''
      return
    }

    if (state.isLocked) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [enabled, state.isLocked])

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return

    // Use passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('scroll', preventScroll, { passive: false })

    // Prevent keyboard scrolling while locked
    const handleKeydown = (e: KeyboardEvent) => {
      if (!isLockedRef.current) return
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End']
      if (scrollKeys.includes(e.key)) {
        e.preventDefault()
        // Simulate scroll for keyboard input
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Space') {
          cumulativeDeltaRef.current += 100
          const phaseData = calculatePhase(cumulativeDeltaRef.current)
          setState(prev => ({
            ...prev,
            ...phaseData,
            cumulativeDelta: cumulativeDeltaRef.current,
            isLocked: !phaseData.isComplete,
          }))
          if (phaseData.isComplete) {
            isLockedRef.current = false
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('scroll', preventScroll)
      window.removeEventListener('keydown', handleKeydown)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, handleWheel, handleTouchStart, handleTouchMove, preventScroll, calculatePhase])

  return state
}
