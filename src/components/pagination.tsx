import Link from "next/link"

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  basePath: string
  /** Non-pagination search params to preserve across page links (e.g. category filter) */
  searchParams?: Record<string, string | undefined>
}) {
  if (totalPages <= 1) {
    return null
  }

  const hrefForPage = (page: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value)
    }
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-4"
    >
      {prevDisabled ? (
        <span className="min-h-11 min-w-11 cursor-not-allowed rounded-md px-4 py-2 text-sm text-gray-300">
          Previous
        </span>
      ) : (
        <Link
          href={hrefForPage(currentPage - 1)}
          className="min-h-11 min-w-11 rounded-md px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          Previous
        </Link>
      )}

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      {nextDisabled ? (
        <span className="min-h-11 min-w-11 cursor-not-allowed rounded-md px-4 py-2 text-sm text-gray-300">
          Next
        </span>
      ) : (
        <Link
          href={hrefForPage(currentPage + 1)}
          className="min-h-11 min-w-11 rounded-md px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
