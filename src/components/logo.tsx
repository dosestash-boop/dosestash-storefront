export function LogoIcon({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="#0e8c93" />
      <rect x="26" y="14" width="12" height="10" rx="3" fill="#e4f6f7" />
      <rect x="22" y="22" width="20" height="30" rx="8" fill="#e4f6f7" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-gray-900">dose</span>
      <span className="text-teal">stash</span>
    </span>
  )
}
