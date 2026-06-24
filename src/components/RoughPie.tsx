import { useEffect, useMemo, useRef, useState } from 'react'
import rough from 'roughjs/bin/rough'
import { useAnimatedValues } from '../hooks/useAnimatedValues'
import { BreakdownTooltipPopup } from './Tooltip'
import type { BreakdownLine } from '../lib/explain'

export type { BreakdownLine }

export type PieSlice = {
  label: string
  value: number
  color: string
  breakdown?: BreakdownLine[]
}

type RoughPieProps = {
  size: number
  data: PieSlice[]
  disabled?: boolean
}

type SliceGeometry = {
  index: number
  slice: PieSlice
  start: number
  stop: number
  sweep: number
  isFull: boolean
}

function computeSliceGeometry(data: PieSlice[]): SliceGeometry[] {
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0)
  if (total <= 0) return []

  let start = -Math.PI / 2
  const geometry: SliceGeometry[] = []

  data.forEach((slice, index) => {
    const value = Math.max(0, slice.value)
    if (value <= 0) return

    const sweep = (value / total) * Math.PI * 2
    const stop = start + sweep
    geometry.push({
      index,
      slice,
      start,
      stop,
      sweep,
      isFull: sweep >= Math.PI * 2 - 0.0001,
    })
    start = stop
  })

  return geometry
}

function wedgePath(
  cx: number,
  cy: number,
  radius: number,
  start: number,
  stop: number,
): string {
  const x1 = cx + radius * Math.cos(start)
  const y1 = cy + radius * Math.sin(start)
  const x2 = cx + radius * Math.cos(stop)
  const y2 = cy + radius * Math.sin(stop)
  const largeArc = stop - start > Math.PI ? 1 : 0

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ')
}

export function RoughPie({ size, data, disabled = false }: RoughPieProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 8
  const diameter = radius * 2

  const targetValues = useMemo(() => data.map((d) => d.value), [data])
  const animatedValues = useAnimatedValues(targetValues)
  const displayData = useMemo(
    () => data.map((slice, i) => ({ ...slice, value: animatedValues[i] ?? 0 })),
    [data, animatedValues],
  )

  const total = displayData.reduce((sum, d) => sum + Math.max(0, d.value), 0)
  const geometry = useMemo(() => computeSliceGeometry(displayData), [displayData])
  const hoveredSlice =
    hoveredIndex != null ? data[hoveredIndex] : null

  useEffect(() => {
    setHoveredIndex(null)
  }, [data, disabled])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    svg.innerHTML = ''
    const rc = rough.svg(svg)

    if (total <= 0) {
      svg.appendChild(
        rc.circle(cx, cy, diameter, {
          stroke: '#c9c7c1',
          strokeWidth: 1.5,
          roughness: 1,
          seed: 1,
        }),
      )
      return
    }

    geometry.forEach(({ slice, start, stop, sweep, index }) => {
      const options = {
        fill: slice.color,
        fillStyle: 'solid',
        fillWeight: 2,
        stroke: 'rgba(30,30,30,0.6)',
        strokeWidth: 1.2,
        roughness: 1,
        seed: index + 1,
      }

      if (sweep >= Math.PI * 2 - 0.0001) {
        svg.appendChild(rc.circle(cx, cy, diameter, options))
      } else {
        // Draw the wedge as a path rather than rc.arc(): roughjs's arc routine
        // subdivides by a fixed angular increment, so a near-zero sweep (which
        // happens on intermediate animation frames as a slice shrinks toward 0)
        // generates a runaway number of points and throws "Maximum call stack
        // size exceeded". A path wedge renders identically and is bounded.
        svg.appendChild(rc.path(wedgePath(cx, cy, radius, start, stop), options))
      }
    })
  }, [size, total, geometry, cx, cy, diameter, radius])

  const interactive = !disabled && total > 0

  return (
    <div
      className={`relative inline-block transition-transform duration-300 ease-out ${
        interactive ? 'hover:scale-[1.03]' : ''
      }`}
      style={{ width: size, height: size }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {interactive && hoveredSlice?.breakdown?.length && (
        <BreakdownTooltipPopup
          label={hoveredSlice.label}
          value={hoveredSlice.value}
          breakdown={hoveredSlice.breakdown}
          className="animate-tooltip-in pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2"
        />
      )}

      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="pointer-events-none absolute inset-0 block"
        role="img"
        aria-label="Income breakdown pie chart"
      />

      {interactive && (
        <svg
          width={size}
          height={size}
          className="absolute inset-0 block"
          aria-hidden="true"
        >
          {geometry.map(({ index, slice, start, stop, isFull }) =>
            isFull ? (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                className="cursor-help transition-[fill] duration-150 hover:fill-black/5"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            ) : (
              <path
                key={slice.label}
                d={wedgePath(cx, cy, radius, start, stop)}
                fill="transparent"
                className="cursor-help transition-[fill] duration-150 hover:fill-black/5"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            ),
          )}
        </svg>
      )}
    </div>
  )
}
