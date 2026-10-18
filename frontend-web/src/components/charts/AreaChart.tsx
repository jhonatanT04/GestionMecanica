import { useEffect, useRef, useState, type PointerEvent } from 'react'

export interface ChartPoint {
  label: string
  shortLabel: string
  value: number
}

const PAD = { top: 12, right: 12, bottom: 28, left: 48 }

function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4)! * magnitude
  return step * 4
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/**
 * Serie única: línea 2px + lavado al 10%, crosshair y tooltip al pasar el
 * puntero. Sin leyenda (el título de la tarjeta nombra la serie).
 */
export function AreaChart({
  points,
  height = 240,
  formatValue,
  formatTick,
  ariaLabel,
}: {
  points: ChartPoint[]
  height?: number
  formatValue: (v: number) => string
  formatTick: (v: number) => string
  ariaLabel: string
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const max = niceMax(Math.max(...points.map((p) => p.value), 0))
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i)

  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (innerW * i) / (points.length - 1))
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ')
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const last = points.length - 1
  const active = hover ?? last

  // Con muchos meses, etiquetar uno de cada N para que no choquen.
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(innerW / 44))))

  function handlePointer(e: PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / rect.width
    const index = Math.round(rel * (points.length - 1))
    const clamped = Math.min(points.length - 1, Math.max(0, index))
    if (clamped !== hover) setHover(clamped)
  }

  const tooltipLeft = width > 0 ? Math.min(Math.max(x(active), 70), width - 70) : 0

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-slate-200" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">
                {formatTick(t)}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i % labelEvery === 0 || i === last ? (
              <text
                key={p.label}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                className={`text-[11px] ${i === active ? 'fill-slate-900 font-medium' : 'fill-slate-500'}`}
              >
                {p.shortLabel}
              </text>
            ) : null,
          )}

          <path d={area} className="fill-accent-500" fillOpacity={0.1} />
          <path d={line} fill="none" className="stroke-accent-500" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} className="stroke-slate-300" strokeWidth={1} />
          )}
          <circle cx={x(active)} cy={y(points[active].value)} r={5} className="fill-accent-500 stroke-surface" strokeWidth={2} />

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={handlePointer}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-slate-200 bg-surface px-3 py-2 text-xs shadow-lg shadow-slate-950/10"
          style={{ left: tooltipLeft }}
        >
          <p className="text-slate-500">{points[hover].label}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums">{formatValue(points[hover].value)}</p>
        </div>
      )}
    </div>
  )
}
