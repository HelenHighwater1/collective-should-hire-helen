import { RoughPie, type PieSlice } from './RoughPie'
import AnimatedNumber from './AnimatedNumber'
import { TooltipTrigger } from './Tooltip'
import { formatCurrency } from '../lib/format'
import { SCORP_OVERHEAD, SCORP_VIABILITY_THRESHOLD } from '../lib/taxConstants'

type ScenarioPanelProps = {
  title: string
  side: 'left' | 'right'
  isActive?: boolean
  isWinner?: boolean
  slices: PieSlice[]
  totalTax: number
  takeHome: number
  savings?: number
  sCorpIsBetter?: boolean
  belowViabilityThreshold?: boolean
}

export default function ScenarioPanel({
  title,
  side,
  isActive = false,
  isWinner = false,
  slices,
  totalTax,
  takeHome,
  savings = 0,
  sCorpIsBetter = false,
  belowViabilityThreshold = false,
}: ScenarioPanelProps) {
  const accent = !isActive
    ? 'var(--color-muted)'
    : isWinner
      ? 'var(--color-green)'
      : 'var(--color-orange)'

  const showInsights = side === 'right' && isActive
  const absSavings = Math.abs(savings)

  return (
    <div className="flex h-full w-full flex-col items-center bg-white/55 px-4 py-6 ring-1 ring-stone-300/40 transition-shadow duration-300 hover:shadow-sm">
      <div className="mb-5 flex w-full flex-col items-center">
        <h2
          className="font-hand text-center text-2xl transition-colors duration-500 ease-out"
          style={{ color: accent }}
        >
          {title}
        </h2>
        <div className="mt-2 flex h-6 items-center justify-center">
          {isActive && isWinner && (
            <span className="badge-enter rounded-full bg-green/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-green uppercase">
              keeps more
            </span>
          )}
        </div>
      </div>

      <RoughPie size={200} data={slices} disabled={!isActive} />

      <ul className="mt-5 w-full max-w-[15rem] space-y-1">
        {slices.map((slice) => (
          <TooltipTrigger
            key={slice.label}
            label={slice.label}
            value={slice.value}
            color={slice.color}
            breakdown={slice.breakdown}
            disabled={!isActive}
          />
        ))}
      </ul>

      {showInsights && (
        <div className="animate-fade-in-up mt-5 w-full max-w-[15rem] space-y-3">
          <div
            className={`rounded-sm border px-3 py-2.5 text-center text-sm transition-colors duration-500 ${
              savings === 0
                ? 'border-stone-300 bg-stone-50 text-muted'
                : sCorpIsBetter
                  ? 'border-green/30 bg-green/5 text-green'
                  : 'border-orange/30 bg-orange/5 text-orange'
            }`}
          >
            <p className="font-hand text-base">
              {savings === 0 ? (
                'Both structures leave you with about the same take-home'
              ) : sCorpIsBetter ? (
                <>
                  You keep <AnimatedNumber value={absSavings} /> more as an S Corp
                </>
              ) : (
                <>
                  An S Corp would cost you <AnimatedNumber value={absSavings} /> more
                </>
              )}
            </p>
          </div>

          {belowViabilityThreshold && (
            <p className="animate-fade-in-up rounded-sm border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-center text-xs leading-relaxed text-muted">
              Net profit is below {formatCurrency(SCORP_VIABILITY_THRESHOLD)}. An S
              Corp may not pencil out after accounting and payroll overhead (~
              {formatCurrency(SCORP_OVERHEAD)}/yr).
            </p>
          )}
        </div>
      )}

      <div className="mt-6 w-full space-y-0.5 text-center">
        <p className="text-sm text-muted">Total tax paid</p>
        <AnimatedNumber
          value={totalTax}
          className="font-hand text-3xl tabular-nums text-ink"
        />
      </div>

      <p className="mt-3 text-center text-sm text-muted">
        You take home{' '}
        <AnimatedNumber
          value={takeHome}
          className="font-hand text-base tabular-nums transition-colors duration-500 ease-out"
          style={{ color: accent }}
        />
      </p>
    </div>
  )
}
