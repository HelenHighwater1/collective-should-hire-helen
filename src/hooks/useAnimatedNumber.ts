import { useEffect, useRef, useState } from 'react'
import { easeOutCubic } from '../lib/ease'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const DEFAULT_DURATION = 450

export function useAnimatedNumber(target: number, duration = DEFAULT_DURATION): number {
  const reducedMotion = usePrefersReducedMotion()
  const [current, setCurrent] = useState(target)
  const currentRef = useRef(target)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (reducedMotion) {
      currentRef.current = target
      setCurrent(target)
      return
    }

    const from = currentRef.current
    if (from === target) return

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const next = from + (target - from) * easeOutCubic(progress)
      currentRef.current = next
      setCurrent(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        currentRef.current = target
        setCurrent(target)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, reducedMotion])

  return reducedMotion ? target : current
}
