import { useEffect, useRef, useState } from 'react'
import { easeOutCubic } from '../lib/ease'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const DEFAULT_DURATION = 450

export function useAnimatedValues(
  targets: number[],
  duration = DEFAULT_DURATION,
): number[] {
  const reducedMotion = usePrefersReducedMotion()
  const key = targets.join(',')
  const [current, setCurrent] = useState(targets)
  const currentRef = useRef(targets)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (reducedMotion) {
      currentRef.current = targets
      setCurrent(targets)
      return
    }

    const prev = currentRef.current
    const sameLength = prev.length === targets.length
    if (sameLength && prev.every((v, i) => v === targets[i])) return

    const from = sameLength ? [...prev] : targets.map(() => 0)
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = easeOutCubic(progress)
      const next = targets.map((target, i) => from[i] + (target - from[i]) * eased)
      currentRef.current = next
      setCurrent(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        currentRef.current = targets
        setCurrent(targets)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [key, duration, reducedMotion, targets])

  return reducedMotion ? targets : current
}
