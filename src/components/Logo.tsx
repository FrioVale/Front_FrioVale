// Substitua o SVG pelo logo real exportado do Figma (public/logo.svg) se desejar.
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="logo" style={{ fontSize: size }}>
      <svg width={size * 1.1} height={size * 1.1} viewBox="0 0 48 48" fill="none">
        <path d="M6 28c4-12 18-18 30-14-2 14-14 22-30 14z" fill="#a6e22e" />
        <path d="M6 36c8 6 20 4 28-6" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 6v22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="30" r="4" fill="#38bdf8" />
        <path d="M38 6v8M34 10h8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>Frio<b>Vale</b></span>
    </div>
  )
}
