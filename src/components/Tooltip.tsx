import { useId } from 'react'
import AnimatedNumber from './AnimatedNumber'
import { RoughBox } from './RoughSvg'
import type { BreakdownLine } from '../lib/explain'

type BreakdownTooltipPopupProps = {
  label: string
  value: number
  breakdown: BreakdownLine[]
  id?: string
  className?: string
}

export function BreakdownTooltipPopup({
  label,
  value,
  breakdown,
  id,
  className = '',
}: BreakdownTooltipPopupProps) {
  return (
    <div id={id} role="tooltip" className={className}>
      <RoughBox
        stroke="rgba(30,30,30,0.55)"
        fill="#ffffff"
        roughness={0.7}
        paddingClassName="px-3 py-2.5"
      >
        <p className="font-hand text-sm text-ink">{label}</p>
        <p className="mt-0.5 text-xs font-semibold tabular-nums text-purple">
          <AnimatedNumber value={value} />
        </p>
        <ul className="mt-2 space-y-1 border-t border-dashed border-stone-200 pt-2">
          {breakdown.map((line) => (
            <li
              key={`${line.label}-${line.value}`}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <span className="text-muted">{line.label}</span>
              <span className="shrink-0 text-right text-ink">{line.value}</span>
            </li>
          ))}
        </ul>
      </RoughBox>
    </div>
  )
}

type TooltipTriggerProps = {
  label: string
  value: number
  color: string
  breakdown?: BreakdownLine[]
  disabled?: boolean
}

export function TooltipTrigger({
  label,
  value,
  color,
  breakdown,
  disabled = false,
}: TooltipTriggerProps) {
  const tooltipId = useId()
  const hasTooltip = !disabled && Boolean(breakdown?.length)

  return (
    <li
      className={`group relative flex items-center justify-between gap-2 rounded-sm px-1 py-0.5 text-sm outline-none ${
        hasTooltip
          ? 'cursor-help hover:bg-stone-100/80 focus-visible:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-purple/40'
          : ''
      }`}
      tabIndex={hasTooltip ? 0 : undefined}
      aria-describedby={hasTooltip ? tooltipId : undefined}
    >
      {hasTooltip && (
        <BreakdownTooltipPopup
          id={tooltipId}
          label={label}
          value={value}
          breakdown={breakdown!}
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        />
      )}

      <span className="flex min-w-0 items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-[3px]"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="truncate text-stone-600">{label}</span>
      </span>
      <span className="shrink-0 tabular-nums text-ink">
        <AnimatedNumber value={value} />
      </span>
    </li>
  )
}
