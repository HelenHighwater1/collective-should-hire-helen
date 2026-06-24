import { useEffect, useRef, useState } from 'react'
import { RoughBox } from './RoughSvg'

type TourProps = {
  step: number
  total: number
  title: string
  body: string
  onNext: () => void
  onSkip: () => void
  isLast: boolean
  anchorRef?: React.RefObject<HTMLElement | null>
}

const DESKTOP_QUERY = '(min-width: 1024px)'

export default function Tour({
  step,
  total,
  title,
  body,
  onNext,
  onSkip,
  isLast,
  anchorRef,
}: TourProps) {
  const nextRef = useRef<HTMLButtonElement>(null)
  const [anchorStyle, setAnchorStyle] = useState<React.CSSProperties | null>(null)

  useEffect(() => {
    nextRef.current?.focus()
  }, [step])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onSkip])

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)

    const update = () => {
      const anchor = anchorRef?.current
      if (!desktop.matches || !anchor) {
        setAnchorStyle(null)
        return
      }
      const rect = anchor.getBoundingClientRect()
      setAnchorStyle({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    desktop.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      desktop.removeEventListener('change', update)
    }
  }, [anchorRef, step])

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40 transition-opacity"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="fixed bottom-6 left-1/2 z-[60] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2"
        style={anchorStyle ?? undefined}
      >
        <RoughBox
          stroke="var(--color-purple)"
          fill="#ffffff"
          roughness={0.85}
          shadow
          paddingClassName="px-5 py-5"
        >
          <h2 id="tour-title" className="font-hand text-xl text-purple">
            {title}
          </h2>
          <p id="tour-body" className="mt-2 text-sm leading-relaxed text-stone-600">
            {body}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === step ? 'bg-purple' : 'bg-stone-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-muted transition-colors hover:text-purple"
              >
                Skip tour
              </button>
              <button
                ref={nextRef}
                type="button"
                onClick={onNext}
                className="rounded-sm bg-purple px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {isLast ? 'Got it' : 'Next'}
              </button>
            </div>
          </div>
        </RoughBox>
      </div>
    </>
  )
}
