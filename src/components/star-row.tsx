export function StarRow({
  rating,
  className = "h-4 w-4",
}: {
  rating: number
  className?: string
}) {
  return (
    <div className="flex gap-0.5 text-accent" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.2}
          className={className}
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.5Z" />
        </svg>
      ))}
    </div>
  )
}
