import React, { forwardRef, useMemo } from 'react'

export const VIEW_W = 1200
export const VIEW_H = 900
export const NODE_R = 9
const PAD_RATIO = 0.18

function project(path) {
  if (path.length === 0) return { points: [] }
  const xs = path.map((n) => n.x)
  const ys = path.map((n) => n.y)
  let minX = Math.min(...xs)
  let maxX = Math.max(...xs)
  let minY = Math.min(...ys)
  let maxY = Math.max(...ys)
  let rx = maxX - minX
  let ry = maxY - minY
  if (rx === 0) {
    rx = Math.abs(minX) || 1
    minX = minX - rx / 2
    maxX = minX + rx
  }
  if (ry === 0) {
    ry = Math.abs(minY) || 1
    minY = minY - ry / 2
    maxY = minY + ry
  }
  const px = (rx * (1 + 2 * PAD_RATIO)) / (VIEW_W - 80)
  const py = (ry * (1 + 2 * PAD_RATIO)) / (VIEW_H - 80)
  const scale = 1 / Math.max(px, py)
  const ox = (VIEW_W - rx * scale) / 2 - minX * scale
  const oy = (VIEW_H - ry * scale) / 2 - minY * scale
  return {
    points: path.map((n) => ({ x: n.x * scale + ox, y: n.y * scale + oy })),
  }
}

function catmullPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

const SketchCanvas = forwardRef(function SketchCanvas({ path, isComplete, smooth }, ref) {
  const { points } = useMemo(() => project(path), [path])
  const pathD = useMemo(() => {
    if (points.length < 2) return ''
    if (smooth) return catmullPath(points)
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  }, [points, smooth])

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center px-1">
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#09090b" />
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={isComplete ? '#34d399' : '#8b5cf6'}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        )}
        {points.map((p, i) => {
          const isFirst = i === 0
          const nodeClose = isComplete && i === points.length - 1
          const accent = nodeClose ? '#34d399' : isFirst ? '#22d3ee' : '#a78bfa'
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={NODE_R * 3.4} fill={accent} opacity={0.12} />
              <circle cx={p.x} cy={p.y} r={NODE_R * 1.8} fill={accent} opacity={0.28} />
              <circle cx={p.x} cy={p.y} r={NODE_R} fill={accent} filter="url(#glow)" />
              <text
                x={p.x}
                y={p.y + NODE_R + 18}
                textAnchor="middle"
                fill="#e4e4e7"
                fontSize={15}
                fontWeight={600}
                stroke="#09090b"
                strokeWidth={4}
                style={{ paintOrder: 'stroke' }}
              >
                {path[i].word}
              </text>
            </g>
          )
        })}
        {path.length === 0 && (
          <text
            x={VIEW_W / 2}
            y={VIEW_H / 2}
            textAnchor="middle"
            fill="#3f3f46"
            fontSize={26}
            fontWeight={500}
          >
            Type a word to place it in semantic space
          </text>
        )}
      </svg>
    </div>
  )
})

export default SketchCanvas