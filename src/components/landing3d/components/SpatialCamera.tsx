'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { CAMERA_PATH, SpatialCameraProps } from '../types'
import { interpolateCameraState, applyPointerOffset } from '../utils/cameraPath'

/**
 * SpatialCamera - Scroll-driven camera that moves through the 3D space
 *
 * Design Philosophy:
 * - Camera position is determined by scroll progress
 * - Pointer adds subtle parallax offset for depth feel
 * - Smooth interpolation between keyframes prevents jarring transitions
 * - FOV changes subtly to enhance spatial progression
 *
 * The camera follows a predefined path through the scene,
 * with scroll being the primary navigation mechanism.
 */
export function SpatialCamera({ scrollProgress, pointerState }: SpatialCameraProps) {
  const { camera, set } = useThree()
  const lookAtTarget = useRef(new Vector3(0, 0, 0))
  const currentPosition = useRef(new Vector3(0, 0, 15))
  const currentFov = useRef(50)

  useFrame((_, delta) => {
    const perspCamera = camera as PerspectiveCamera

    // Get target state from camera path
    const targetState = interpolateCameraState(CAMERA_PATH, scrollProgress)

    // Apply pointer offset for parallax
    const offsetPosition = applyPointerOffset(
      targetState.position,
      pointerState.smoothX,
      pointerState.smoothY,
      0.2 // Subtle parallax
    )

    // Smooth interpolation to target position (lerp factor)
    const lerpFactor = 1 - Math.pow(0.001, delta)

    // Update position with smoothing
    currentPosition.current.x += (offsetPosition[0] - currentPosition.current.x) * lerpFactor
    currentPosition.current.y += (offsetPosition[1] - currentPosition.current.y) * lerpFactor
    currentPosition.current.z += (offsetPosition[2] - currentPosition.current.z) * lerpFactor

    // Update lookAt with smoothing
    lookAtTarget.current.x += (targetState.lookAt[0] - lookAtTarget.current.x) * lerpFactor
    lookAtTarget.current.y += (targetState.lookAt[1] - lookAtTarget.current.y) * lerpFactor
    lookAtTarget.current.z += (targetState.lookAt[2] - lookAtTarget.current.z) * lerpFactor

    // Update FOV with smoothing
    currentFov.current += (targetState.fov - currentFov.current) * lerpFactor * 0.5

    // Apply to camera
    perspCamera.position.copy(currentPosition.current)
    perspCamera.lookAt(lookAtTarget.current)

    // Update FOV if changed significantly
    if (Math.abs(perspCamera.fov - currentFov.current) > 0.01) {
      perspCamera.fov = currentFov.current
      perspCamera.updateProjectionMatrix()
    }
  })

  return null // Camera manipulation only, no rendered geometry
}
