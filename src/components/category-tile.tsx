import Link from "next/link"
import type { ReactNode } from "react"

export function CategoryTile({
  href,
  label,
  art,
  onClick,
}: {
  href: string
  label: string
  art: ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-accent-soft transition-colors hover:bg-accent-soft/70"
    >
      <div className="flex aspect-[4/3] items-center justify-center p-6">
        {art}
      </div>
      <span className="border-t border-black/5 px-4 py-3 text-sm font-bold text-gray-900">
        {label}
      </span>
    </Link>
  )
}
