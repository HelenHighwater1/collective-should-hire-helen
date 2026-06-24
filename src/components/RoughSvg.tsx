import { useEffect, useRef } from 'react'
import rough from 'roughjs/bin/rough'

type RoughBoxProps = {
  stroke: string
  fill?: string
  roughness?: number
  radius?: number
  shadow?: boolean
  corners?: boolean
  className?: string
  paddingClassName?: string
  children: React.ReactNode
}

export function RoughBox({
  stroke,
  fill = 'transparent',
  roughness = 0.9,
  radius = 0,
  shadow = false,
  corners = false,
  className = '',
  paddingClassName = 'p-6',
  children,
}: RoughBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const draw = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return

      svg.setAttribute('width', String(width))
      svg.setAttribute('height', String(height))
      svg.innerHTML = ''

      const rc = rough.svg(svg)
      const node = rc.path(roundedRectPath(6, 6, width - 12, height - 12, radius), {
        stroke,
        strokeWidth: 1.6,
        fill,
        fillStyle: 'solid',
        roughness,
        bowing: 0.8,
      })
      svg.appendChild(node)

      if (corners) {
        const tickOpts = {
          stroke: 'rgba(30,30,30,0.45)',
          strokeWidth: 1.3,
          roughness: 0.6,
        }
        const s = 6
        const inset = 16
        const cross = (cx: number, cy: number) => {
          svg.appendChild(rc.line(cx - s, cy, cx + s, cy, tickOpts))
          svg.appendChild(rc.line(cx, cy - s, cx, cy + s, tickOpts))
        }
        cross(inset, inset)
        cross(width - inset, inset)
        cross(inset, height - inset)
        cross(width - inset, height - inset)
      }
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [stroke, fill, roughness, radius, corners])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={shadow ? { filter: 'drop-shadow(0 6px 10px rgba(30,30,30,0.07))' } : undefined}
        aria-hidden="true"
      />
      <div className={`relative ${paddingClassName}`}>{children}</div>
    </div>
  )
}

type RoughCircleProps = {
  size: number
  stroke: string
  fill?: string
  roughness?: number
  shadow?: boolean
  className?: string
  children?: React.ReactNode
}

export function RoughCircle({
  size,
  stroke,
  fill = 'transparent',
  roughness = 0.9,
  shadow = false,
  className = '',
  children,
}: RoughCircleProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    svg.innerHTML = ''
    const rc = rough.svg(svg)
    const radius = size / 2 - 8
    const node = rc.circle(size / 2, size / 2, radius * 2, {
      stroke,
      strokeWidth: 1.6,
      fill,
      fillStyle: 'solid',
      roughness,
      bowing: 0.8,
    })
    svg.appendChild(node)
  }, [size, stroke, fill, roughness])

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="pointer-events-none absolute inset-0"
        style={shadow ? { filter: 'drop-shadow(0 6px 10px rgba(30,30,30,0.07))' } : undefined}
        aria-hidden="true"
      />
      {children && (
        <div className="relative text-center text-sm text-stone-400">{children}</div>
      )}
    </div>
  )
}

function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const radius = Math.min(r, w / 2, h / 2)
  return [
    `M${x + radius},${y}`,
    `h${w - 2 * radius}`,
    `a${radius},${radius} 0 0 1 ${radius},${radius}`,
    `v${h - 2 * radius}`,
    `a${radius},${radius} 0 0 1 ${-radius},${radius}`,
    `h${-(w - 2 * radius)}`,
    `a${radius},${radius} 0 0 1 ${-radius},${-radius}`,
    `v${-(h - 2 * radius)}`,
    `a${radius},${radius} 0 0 1 ${radius},${-radius}`,
    'z',
  ].join(' ')
}
