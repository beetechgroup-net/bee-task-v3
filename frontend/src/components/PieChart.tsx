import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

export interface PieSlice {
  key: string | number
  label: string
  value: number
  color: string
  legendIcon?: ReactNode
}

interface PieChartProps {
  slices: PieSlice[]
  centerLabel?: string
  centerValue?: string | number
  size?: number
  formatTooltip?: (slice: PieSlice, percent: number) => string
}

interface TooltipState {
  x: number
  y: number
  content: string
}

export function PieChart({ slices, centerLabel, centerValue, size = 200, formatTooltip }: PieChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const total = slices.reduce((sum, s) => sum + s.value, 0)
  if (total === 0 || slices.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full opacity-40 font-bold text-sm">
        Sem dados no período
      </div>
    )
  }

  const cx = 100
  const cy = 100
  const r = 70
  const innerR = 42

  let startAngle = -Math.PI / 2

  const paths = slices.map((slice) => {
    const fraction = slice.value / total
    const angle = fraction * 2 * Math.PI
    const endAngle = startAngle + angle

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const ix1 = cx + innerR * Math.cos(endAngle)
    const iy1 = cy + innerR * Math.sin(endAngle)
    const ix2 = cx + innerR * Math.cos(startAngle)
    const iy2 = cy + innerR * Math.sin(startAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')
    const pct = fraction * 100
    const tip = formatTooltip
      ? formatTooltip(slice, pct)
      : `${slice.label}: ${slice.value} (${pct.toFixed(1)}%)`
    startAngle = endAngle
    return { path, color: slice.color, tip }
  })

  const handleMouseMove = (e: React.MouseEvent, content: string) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, content })
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {paths.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            stroke="var(--color-surface, #fff)"
            strokeWidth="2"
            className="cursor-pointer transition-opacity hover:opacity-80"
            onMouseMove={(e) => handleMouseMove(e, slice.tip)}
          />
        ))}
        {centerLabel && (
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">
            {centerLabel}
          </text>
        )}
        {centerValue !== undefined && (
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="20" fontWeight="900" fill="currentColor">
            {centerValue}
          </text>
        )}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-surface border border-border-soft rounded-lg px-2 py-1 text-xs font-bold text-text-main shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 36, transform: 'translateX(-50%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
