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

// Thresholds calibrated for ~3 scroll actions to complete:
// - Wheel: 300 / 0.5 multiplier = 600 wheel delta (~4-5 scroll clicks)
// - Touch: 300 / 1.5 multiplier = 200px touch movement (~2-3 swipes)
// - Keyboard: 300 / 100 per key = 3 key presses
export const ANIMATION_PHASES: AnimationPhase[] = [
  { id: 0, name: 'initial', threshold: 0, duration: 0 },
  { id: 1, name: 'title', threshold: 60, duration: 150 },
  { id: 2, name: 'subtitle', threshold: 120, duration: 150 },
  { id: 3, name: 'description', threshold: 180, duration: 150 },
  { id: 4, name: 'cta-cards', threshold: 240, duration: 200 },
  { id: 5, name: 'complete', threshold: 300, duration: 0 },
]

// Minimum time at 100% progress before unlocking (prevents accidental unlocks)
const UNLOCK_HYSTERESIS_MS = 100

export interface ScrollHijackState {
  isLocked: boolean
  currentPhase: number
  phaseProgress: number // 0-1 progress within current phase
  totalProgress: number // 0-1 overall progress through all phases
  cumulativeDelta: number
  isComplete: boolean
  direction: 'forward' | 'reverse' | 'none'
}

/**
 * useScrollHijack - Captures scroll events and converts them to animation phases
 *
 * Bidirectional support:
 * - Scroll down: Progress through animation phases forward
 * - Scroll up (when at top of page): Reverse through animation phases
 * - Normal scrolling enabled only when animation is complete and not at top
 */
export function useScrollHijack(enabled: boolean = true): ScrollHijackState {
  const [state, setState] = useState<ScrollHijackState>({
    isLocked: true,
    currentPhase: 0,
    phaseProgress: 0,
    totalProgress: 0,
    cumulativeDelta: 0,
    isComplete: false,
    direction: 'forward',
  })

  const cumulativeDeltaRef = useRef(0)
  const isLockedRef = useRef(true)
  const isCompleteRef = useRef(false)
  const touchStartYRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const lastScrollYRef = useRef(0)
  const previousOverflowRef = useRef<string>('')
  // Track when we first reach complete phase for hysteresis
  const completePhaseStartTimeRef = useRef<number | null>(null)

  const maxThreshold = ANIMATION_PHASES[ANIMATION_PHASES.length - 1].threshold

  // Check if unlock hysteresis has been satisfied
  const canUnlock = useCallback((isComplete: boolean, direction: string): boolean => {
    if (!isComplete || direction !== 'forward') {
      completePhaseStartTimeRef.current = null
      return false
    }

    const now = performance.now()
    if (completePhaseStartTimeRef.current === null) {
      // First time reaching complete phase
      completePhaseStartTimeRef.current = now
      return false
    }

    // Check if we've been at complete phase long enough
    return (now - completePhaseStartTimeRef.current) >= UNLOCK_HYSTERESIS_MS
  }, [])

  // Calculate phase from cumulative delta
  const calculatePhase = useCallback((delta: number) => {
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
  }, [maxThreshold])

  // Re-engage scroll hijack for reverse animation
  const reengageForReverse = useCallback(() => {
    if (!enabled) return

    isLockedRef.current = true
    isCompleteRef.current = false
    cumulativeDeltaRef.current = maxThreshold // Start from complete

    setState(prev => ({
      ...prev,
      isLocked: true,
      isComplete: false,
      direction: 'reverse',
      cumulativeDelta: maxThreshold,
    }))
  }, [enabled, maxThreshold])

  // Handle scroll/wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!enabled) return

    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    const scrollingUp = delta < 0
    const scrollingDown = delta > 0
    const atTopOfPage = window.scrollY <= 5

    // If animation is complete and user scrolls up while at top of page
    if (isCompleteRef.current && scrollingUp && atTopOfPage) {
      e.preventDefault()
      e.stopPropagation()
      reengageForReverse()
      return
    }

    // If not locked but at initial state (reversed to start), re-engage for forward scroll
    if (!isLockedRef.current && !isCompleteRef.current && scrollingDown && atTopOfPage && cumulativeDeltaRef.current <= 0) {
      e.preventDefault()
      e.stopPropagation()
      isLockedRef.current = true
      cumulativeDeltaRef.current = 0
      setState(prev => ({
        ...prev,
        isLocked: true,
        direction: 'forward',
      }))
      return
    }

    // If not locked, allow normal scrolling
    if (!isLockedRef.current) return

    e.preventDefault()
    e.stopPropagation()

    // Update cumulative delta based on direction
    if (scrollingDown) {
      cumulativeDeltaRef.current += Math.abs(delta) * 0.5
    } else if (scrollingUp) {
      cumulativeDeltaRef.current -= Math.abs(delta) * 0.5
    }

    // Clamp to valid range
    cumulativeDeltaRef.current = Math.max(0, Math.min(maxThreshold, cumulativeDeltaRef.current))

    const phaseData = calculatePhase(cumulativeDeltaRef.current)
    const direction = scrollingDown ? 'forward' : scrollingUp ? 'reverse' : 'none'

    // Determine if we should unlock (with hysteresis to prevent accidental unlocks)
    const shouldUnlock = canUnlock(phaseData.isComplete, direction)

    // If reversing back to start, stay locked but reset to initial state
    const reversedToStart = direction === 'reverse' && cumulativeDeltaRef.current <= 0

    // Update refs BEFORE setState to ensure event handlers see consistent state
    if (shouldUnlock) {
      isLockedRef.current = false
      isCompleteRef.current = true
      completePhaseStartTimeRef.current = null
    } else if (reversedToStart) {
      // When reversed to start, stay locked and ready for forward animation
      isLockedRef.current = true
      isCompleteRef.current = false
      completePhaseStartTimeRef.current = null
    }

    setState(prev => ({
      ...prev,
      ...phaseData,
      cumulativeDelta: cumulativeDeltaRef.current,
      isLocked: isLockedRef.current, // Use ref value for consistency
      isComplete: isCompleteRef.current,
      direction,
    }))
  }, [enabled, calculatePhase, reengageForReverse, maxThreshold, canUnlock])

  // Handle touch events
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return
    touchStartYRef.current = e.touches[0].clientY
    lastScrollYRef.current = window.scrollY
  }, [enabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return

    const touchY = e.touches[0].clientY
    const delta = touchStartYRef.current - touchY
    touchStartYRef.current = touchY

    const scrollingUp = delta < 0
    const scrollingDown = delta > 0
    const atTopOfPage = window.scrollY <= 5

    // If animation is complete and user scrolls up while at top
    if (isCompleteRef.current && scrollingUp && atTopOfPage) {
      e.preventDefault()
      reengageForReverse()
      return
    }

    // If not locked but at initial state, re-engage for forward scroll
    if (!isLockedRef.current && !isCompleteRef.current && scrollingDown && atTopOfPage && cumulativeDeltaRef.current <= 0) {
      e.preventDefault()
      isLockedRef.current = true
      cumulativeDeltaRef.current = 0
      setState(prev => ({
        ...prev,
        isLocked: true,
        direction: 'forward',
      }))
      return
    }

    if (!isLockedRef.current) return

    e.preventDefault()

    // Update cumulative delta
    if (scrollingDown) {
      cumulativeDeltaRef.current += Math.abs(delta) * 1.5
    } else if (scrollingUp) {
      cumulativeDeltaRef.current -= Math.abs(delta) * 1.5
    }

    cumulativeDeltaRef.current = Math.max(0, Math.min(maxThreshold, cumulativeDeltaRef.current))

    const phaseData = calculatePhase(cumulativeDeltaRef.current)
    const direction = scrollingDown ? 'forward' : scrollingUp ? 'reverse' : 'none'

    // Use hysteresis for unlock to prevent accidental unlocks
    const shouldUnlock = canUnlock(phaseData.isComplete, direction)
    const reversedToStart = direction === 'reverse' && cumulativeDeltaRef.current <= 0

    // Update refs BEFORE setState to ensure event handlers see consistent state
    if (shouldUnlock) {
      isLockedRef.current = false
      isCompleteRef.current = true
      completePhaseStartTimeRef.current = null
    } else if (reversedToStart) {
      isLockedRef.current = true
      isCompleteRef.current = false
      completePhaseStartTimeRef.current = null
    }

    setState(prev => ({
      ...prev,
      ...phaseData,
      cumulativeDelta: cumulativeDeltaRef.current,
      isLocked: isLockedRef.current,
      isComplete: isCompleteRef.current,
      direction,
    }))
  }, [enabled, calculatePhase, reengageForReverse, maxThreshold, canUnlock])

  // Prevent default scroll when locked
  const preventScroll = useCallback((e: Event) => {
    if (isLockedRef.current && enabled) {
      e.preventDefault()
    }
  }, [enabled])

  // Monitor scroll position for re-engagement
  useEffect(() => {
    if (!enabled) return

    const checkScrollPosition = () => {
      lastScrollYRef.current = window.scrollY
    }

    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    return () => window.removeEventListener('scroll', checkScrollPosition)
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
      if (state.direction === 'forward' || cumulativeDeltaRef.current === 0) {
        window.scrollTo(0, 0)
      }
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
  }, [enabled, state.isLocked, state.direction])

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('scroll', preventScroll, { passive: false })

    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End']

      if (!scrollKeys.includes(e.key)) return

      const atTopOfPage = window.scrollY <= 5
      const goingUp = e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home'
      const goingDown = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Space' || e.key === 'End'

      // Re-engage for reverse on up key at top
      if (isCompleteRef.current && goingUp && atTopOfPage) {
        e.preventDefault()
        reengageForReverse()
        return
      }

      // Re-engage for forward if at initial state
      if (!isLockedRef.current && !isCompleteRef.current && goingDown && atTopOfPage && cumulativeDeltaRef.current <= 0) {
        e.preventDefault()
        isLockedRef.current = true
        cumulativeDeltaRef.current = 0
        setState(prev => ({
          ...prev,
          isLocked: true,
          direction: 'forward',
        }))
        return
      }

      if (!isLockedRef.current) return

      e.preventDefault()

      if (goingDown) {
        cumulativeDeltaRef.current += 100
      } else if (goingUp) {
        cumulativeDeltaRef.current -= 100
      }

      cumulativeDeltaRef.current = Math.max(0, Math.min(maxThreshold, cumulativeDeltaRef.current))

      const phaseData = calculatePhase(cumulativeDeltaRef.current)
      const direction = goingDown ? 'forward' : 'reverse'

      // Use hysteresis for unlock to prevent accidental unlocks
      const shouldUnlock = canUnlock(phaseData.isComplete, direction)
      const reversedToStart = direction === 'reverse' && cumulativeDeltaRef.current <= 0

      // Update refs BEFORE setState to ensure event handlers see consistent state
      if (shouldUnlock) {
        isLockedRef.current = false
        isCompleteRef.current = true
        completePhaseStartTimeRef.current = null
      } else if (reversedToStart) {
        isLockedRef.current = true
        isCompleteRef.current = false
        completePhaseStartTimeRef.current = null
      }

      setState(prev => ({
        ...prev,
        ...phaseData,
        cumulativeDelta: cumulativeDeltaRef.current,
        isLocked: isLockedRef.current,
        isComplete: isCompleteRef.current,
        direction,
      }))
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
  }, [enabled, handleWheel, handleTouchStart, handleTouchMove, preventScroll, calculatePhase, reengageForReverse, maxThreshold, canUnlock])

  return state
}
