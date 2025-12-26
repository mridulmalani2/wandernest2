'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Animation phases for the hero section scroll hijacking
 * 3 discrete steps:
 * - Phase 0: TourWiseCo title + scroll indicator
 * - Phase 1: Title shatters, karaoke text plays
 * - Phase 2: Cards shown (frozen, complete)
 */
export interface AnimationPhase {
  id: number
  name: string
}

export const ANIMATION_PHASES: AnimationPhase[] = [
  { id: 0, name: 'title' },        // TourWiseCo title
  { id: 1, name: 'karaoke' },      // Karaoke text animation
  { id: 2, name: 'cards' },        // Cards shown (frozen/complete)
]

// Minimum scroll delta to trigger a phase change (prevents accidental triggers)
const MIN_SCROLL_DELTA = 30
// Cooldown between phase changes (ms)
const PHASE_CHANGE_COOLDOWN = 400

export interface ScrollHijackState {
  isLocked: boolean
  currentPhase: number
  phaseProgress: number // Always 1 for discrete steps
  totalProgress: number // 0, 0.5, or 1 based on phase
  cumulativeDelta: number
  isComplete: boolean
  direction: 'forward' | 'reverse' | 'none'
}

export interface UseScrollHijackOptions {
  enabled?: boolean
  canAdvance?: (currentPhase: number) => boolean // Callback to check if advancing from currentPhase is allowed
}

/**
 * useScrollHijack - Captures scroll events and converts them to discrete animation phases
 *
 * Step-based progression (one scroll action = one step):
 * - Phase 0: TourWiseCo title + scroll indicator
 * - Phase 1: Title shatters, karaoke plays (blocked until animation completes)
 * - Phase 2: Cards shown - frozen permanently
 *
 * Uses canAdvance callback to allow parent to block phase transitions
 */
export function useScrollHijack(options: UseScrollHijackOptions | boolean = true): ScrollHijackState {
  // Handle both old boolean API and new options object
  const { enabled = true, canAdvance } = typeof options === 'boolean'
    ? { enabled: options, canAdvance: undefined }
    : options
  const [state, setState] = useState<ScrollHijackState>({
    isLocked: true,
    currentPhase: 0,
    phaseProgress: 1,
    totalProgress: 0,
    cumulativeDelta: 0,
    isComplete: false,
    direction: 'forward',
  })

  const currentPhaseRef = useRef(0)
  const isLockedRef = useRef(true)
  const isCompleteRef = useRef(false)
  const touchStartYRef = useRef(0)
  const accumulatedDeltaRef = useRef(0)
  const lastPhaseChangeTimeRef = useRef(0)
  const previousOverflowRef = useRef<string>('')

  const maxPhase = ANIMATION_PHASES.length - 1

  // Advance to next phase
  const advancePhase = useCallback(() => {
    const now = performance.now()

    // Check cooldown to prevent rapid phase changes
    if (now - lastPhaseChangeTimeRef.current < PHASE_CHANGE_COOLDOWN) {
      return
    }

    if (currentPhaseRef.current >= maxPhase) {
      return
    }

    // Check if parent allows advancing from current phase
    if (canAdvance && !canAdvance(currentPhaseRef.current)) {
      return
    }

    lastPhaseChangeTimeRef.current = now
    currentPhaseRef.current += 1
    accumulatedDeltaRef.current = 0

    const newPhase = currentPhaseRef.current
    const isComplete = newPhase >= maxPhase

    if (isComplete) {
      isLockedRef.current = false
      isCompleteRef.current = true
    }

    setState({
      isLocked: isLockedRef.current,
      currentPhase: newPhase,
      phaseProgress: 1,
      totalProgress: newPhase / maxPhase,
      cumulativeDelta: newPhase,
      isComplete,
      direction: 'forward',
    })
  }, [maxPhase, canAdvance])

  // Handle scroll/wheel events - discrete step progression
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!enabled) return

    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    const scrollingDown = delta > 0

    // If animation is complete, allow normal scrolling
    if (isCompleteRef.current) return

    // If not locked, allow normal scrolling
    if (!isLockedRef.current) return

    e.preventDefault()
    e.stopPropagation()

    // Only progress forward (scroll down)
    if (scrollingDown) {
      accumulatedDeltaRef.current += Math.abs(delta)

      // Check if accumulated enough to trigger phase change
      if (accumulatedDeltaRef.current >= MIN_SCROLL_DELTA) {
        advancePhase()
      }
    }
  }, [enabled, advancePhase])

  // Handle touch events - discrete step progression
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return
    touchStartYRef.current = e.touches[0].clientY
    accumulatedDeltaRef.current = 0
  }, [enabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return

    const touchY = e.touches[0].clientY
    const delta = touchStartYRef.current - touchY

    const scrollingDown = delta > 0

    // If animation is complete, allow normal scrolling
    if (isCompleteRef.current) return

    if (!isLockedRef.current) return

    e.preventDefault()

    // Only progress forward (scroll/swipe down)
    if (scrollingDown && delta > MIN_SCROLL_DELTA) {
      touchStartYRef.current = touchY // Reset for next swipe
      advancePhase()
    }
  }, [enabled, advancePhase])

  // Prevent default scroll when locked
  const preventScroll = useCallback((e: Event) => {
    if (isLockedRef.current && enabled) {
      e.preventDefault()
    }
  }, [enabled])

  // Lock/unlock body scroll - store and restore previous overflow value
  useEffect(() => {
    if (!enabled) {
      // Restore previous overflow if we stored one
      if (previousOverflowRef.current !== '') {
        document.body.style.overflow = previousOverflowRef.current
        previousOverflowRef.current = ''
      }
      return
    }

    if (state.isLocked) {
      // Store current overflow before overwriting
      if (previousOverflowRef.current === '') {
        previousOverflowRef.current = document.body.style.overflow || ''
      }
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      // Restore previous overflow
      document.body.style.overflow = previousOverflowRef.current || ''
      previousOverflowRef.current = ''
    }

    return () => {
      // Cleanup: restore previous overflow
      if (previousOverflowRef.current !== '') {
        document.body.style.overflow = previousOverflowRef.current
        previousOverflowRef.current = ''
      } else {
        document.body.style.overflow = ''
      }
    }
  }, [enabled, state.isLocked])

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('scroll', preventScroll, { passive: false })

    // Keyboard navigation - discrete step progression
    const handleKeydown = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End']

      if (!scrollKeys.includes(e.key)) return

      const goingDown = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Space' || e.key === 'End'

      // If animation is complete, allow normal keyboard navigation
      if (isCompleteRef.current) return

      if (!isLockedRef.current) return

      e.preventDefault()

      // Only progress forward (down keys)
      if (goingDown) {
        advancePhase()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('scroll', preventScroll)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [enabled, handleWheel, handleTouchStart, handleTouchMove, preventScroll, advancePhase])

  return state
}
