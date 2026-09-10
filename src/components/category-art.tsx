function TileVial({ cx, height }: { cx: number; height: number }) {
  const baseline = 92
  const bodyWidth = 22
  const bodyY = baseline - height
  const capWidth = 13
  const capHeight = 10

  return (
    <g>
      <rect
        x={cx - bodyWidth / 2}
        y={bodyY}
        width={bodyWidth}
        height={height}
        rx={9}
        fill="#0e8c93"
      />
      <rect
        x={cx - capWidth / 2}
        y={bodyY - 7}
        width={capWidth}
        height={capHeight}
        rx={3}
        fill="#0e8c93"
      />
    </g>
  )
}

export function VialsTileArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 112"
      fill="none"
      role="img"
      aria-label="Vials"
      className={className}
    >
      <TileVial cx={60} height={62} />
      <TileVial cx={90} height={78} />
      <TileVial cx={120} height={50} />
    </svg>
  )
}

export function SyringesTileArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 112"
      fill="none"
      role="img"
      aria-label="Syringes"
      className={className}
    >
      <g transform="rotate(-22 80 56)">
        <line
          x1={38}
          y1={56}
          x2={12}
          y2={56}
          stroke="#0e8c93"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <rect x={38} y={48} width={78} height={16} rx={8} fill="#0e8c93" />
        <rect x={116} y={46} width={14} height={20} rx={4} fill="#0e8c93" />
      </g>
      <g transform="rotate(22 80 56)" opacity={0.45}>
        <line
          x1={38}
          y1={56}
          x2={12}
          y2={56}
          stroke="#0e8c93"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <rect x={38} y={48} width={78} height={16} rx={8} fill="#0e8c93" />
        <rect x={116} y={46} width={14} height={20} rx={4} fill="#0e8c93" />
      </g>
    </svg>
  )
}
