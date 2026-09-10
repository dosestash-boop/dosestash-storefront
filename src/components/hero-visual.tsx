function Vial({ cx, height }: { cx: number; height: number }) {
  const baseline = 216
  const bodyWidth = 32
  const bodyY = baseline - height
  const capWidth = 18
  const capHeight = 14

  return (
    <g>
      <rect
        x={cx - bodyWidth / 2}
        y={bodyY}
        width={bodyWidth}
        height={height}
        rx={12}
        fill="#0e8c93"
      />
      <rect
        x={cx - capWidth / 2}
        y={bodyY - 9}
        width={capWidth}
        height={capHeight}
        rx={4}
        fill="#0e8c93"
      />
    </g>
  )
}

export function HeroVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 280"
      fill="none"
      role="img"
      aria-label="Illustration of vials and a syringe neatly arranged in a storage case"
      className={className}
    >
      <rect x="40" y="216" width="400" height="10" rx="5" fill="#0e8c93" fillOpacity="0.12" />

      <Vial cx={90} height={110} />
      <Vial cx={190} height={130} />
      <Vial cx={290} height={95} />
      <Vial cx={390} height={120} />

      <g transform="rotate(-18 400 70)">
        <line
          x1={350}
          y1={70}
          x2={314}
          y2={70}
          stroke="#0e8c93"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <rect x={350} y={62} width={100} height={16} rx={8} fill="#0e8c93" />
        <rect x={442} y={60} width={16} height={20} rx={4} fill="#0e8c93" />
      </g>
    </svg>
  )
}
