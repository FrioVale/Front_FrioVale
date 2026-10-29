import { useId } from 'react'

const W = 1100, H = 190, L = 24, R = 1076, T = 24, B = 150
const MIN = 6, MAX = 15, LO = 8, HI = 12
const y = (t: number) => T + ((MAX - t) / (MAX - MIN)) * (B - T)

function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}

export default function TempChart({ series, start = 6 }: { series: number[]; start?: number }) {
  const uid = useId().replace(/:/g, '')
  const pts = series.map((t, i) => [L + (i / (series.length - 1)) * (R - L), y(t)] as [number, number])
  const line = smooth(pts)
  const area = `${line} L${R},${B} L${L},${B} Z`
  const labels = series.map((_, i) => ({ i, h: start + i })).filter(l => l.h % 3 === 0)

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Histórico de temperatura">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e8a3c" stopOpacity=".18" />
          <stop offset="1" stopColor="#1e8a3c" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`in${uid}`}><rect x="0" y={y(HI)} width={W} height={y(LO) - y(HI)} /></clipPath>
        <clipPath id={`out${uid}`}>
          <rect x="0" y="0" width={W} height={y(HI)} />
          <rect x="0" y={y(LO)} width={W} height={H - y(LO)} />
        </clipPath>
      </defs>
      <rect x={L} y={y(HI)} width={R - L} height={y(LO) - y(HI)} fill="#1e8a3c" opacity=".13" rx="6" />
      <line x1={L} x2={R} y1={T} y2={T} stroke="currentColor" opacity=".15" strokeDasharray="3 4" />
      <path d={area} fill={`url(#g${uid})`} />
      <path d={line} fill="none" stroke="#1e8a3c" strokeWidth="3" strokeLinecap="round" clipPath={`url(#in${uid})`} />
      <path d={line} fill="none" stroke="#e11d1d" strokeWidth="3" strokeLinecap="round" clipPath={`url(#out${uid})`} />
      {labels.map(l => (
        <text key={l.i} x={pts[l.i][0]} y={B + 24} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".55">
          {String(l.h).padStart(2, '0')}h
        </text>
      ))}
    </svg>
  )
}