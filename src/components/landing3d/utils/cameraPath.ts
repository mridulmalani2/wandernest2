import { Vector3, Vector3Tuple } from 'three'
import { CameraPath, CameraKeyframe } from '../types'

/**
 * Camera Path Utilities
 *
 * Provides smooth interpolation between camera keyframes based on scroll progress.
 * Uses Catmull-Rom spline for smooth camera movement through keyframes.
 */

/**
 * Easing functions for camera transitions
 */
export const easings = {
  linear: (t: number) => t,

  easeInOut: (t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  },

  easeOut: (t: number) => {
    return 1 - Math.pow(1 - t, 3)
  },

  easeIn: (t: number) => {
    return t * t * t
  },

  // Smooth step for very organic movement
  smoothstep: (t: number) => {
    return t * t * (3 - 2 * t)
  },
}

/**
 * Find the two keyframes surrounding the current scroll position
 * and return interpolation factor
 */
export function findKeyframePair(
  keyframes: CameraKeyframe[],
  scrollProgress: number
): { from: CameraKeyframe; to: CameraKeyframe; t: number } {
  // Handle edge cases
  if (scrollProgress <= keyframes[0].scroll) {
    return { from: keyframes[0], to: keyframes[0], t: 0 }
  }

  if (scrollProgress >= keyframes[keyframes.length - 1].scroll) {
    const last = keyframes[keyframes.length - 1]
    return { from: last, to: last, t: 1 }
  }

  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const from = keyframes[i]
    const to = keyframes[i + 1]

    if (scrollProgress >= from.scroll && scrollProgress <= to.scroll) {
      const range = to.scroll - from.scroll
      const t = range > 0 ? (scrollProgress - from.scroll) / range : 0
      return { from, to, t }
    }
  }

  // Fallback
  return { from: keyframes[0], to: keyframes[0], t: 0 }
}

/**
 * Interpolate camera state based on scroll progress
 */
export function interpolateCameraState(
  cameraPath: CameraPath,
  scrollProgress: number
): {
  position: Vector3Tuple
  lookAt: Vector3Tuple
  fov: number
} {
  const { keyframes, easing } = cameraPath
  const { from, to, t } = findKeyframePair(keyframes, scrollProgress)

  // Apply easing
  const easingFn = easings[easing] || easings.linear
  const easedT = easingFn(t)

  // Interpolate position
  const position: Vector3Tuple = [
    lerp(from.position[0], to.position[0], easedT),
    lerp(from.position[1], to.position[1], easedT),
    lerp(from.position[2], to.position[2], easedT),
  ]

  // Interpolate lookAt
  const lookAt: Vector3Tuple = [
    lerp(from.lookAt[0], to.lookAt[0], easedT),
    lerp(from.lookAt[1], to.lookAt[1], easedT),
    lerp(from.lookAt[2], to.lookAt[2], easedT),
  ]

  // Interpolate FOV
  const fromFov = from.fov ?? 50
  const toFov = to.fov ?? 50
  const fov = lerp(fromFov, toFov, easedT)

  return { position, lookAt, fov }
}

/**
 * Apply pointer offset to camera position for parallax effect
 */
export function applyPointerOffset(
  position: Vector3Tuple,
  pointerX: number,
  pointerY: number,
  intensity: number = 0.3
): Vector3Tuple {
  return [
    position[0] + pointerX * intensity,
    position[1] + pointerY * intensity * 0.5, // Less vertical movement
    position[2],
  ]
}

/**
 * Simple linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin)
}

/**
 * Calculate visibility/opacity based on scroll range
 */
export function scrollVisibility(
  scrollProgress: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
): number {
  if (scrollProgress < fadeInStart) return 0
  if (scrollProgress > fadeOutEnd) return 0

  if (scrollProgress <= fadeInEnd) {
    return mapRange(scrollProgress, fadeInStart, fadeInEnd, 0, 1)
  }

  if (scrollProgress >= fadeOutStart) {
    return mapRange(scrollProgress, fadeOutStart, fadeOutEnd, 1, 0)
  }

  return 1
}
