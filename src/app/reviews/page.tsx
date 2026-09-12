import type { Metadata } from "next"
import Link from "next/link"
import {
  reviews,
  getReviewStats,
  getProductLines,
  formatProductLine,
} from "@/lib/reviews"
import { ReviewsGrid } from "@/components/reviews-grid"
import { StarRow } from "@/components/star-row"

export const metadata: Metadata = {
  title: "Reviews",
  description: "See what customers are saying about Dosestash storage cases.",
}

function FilterTab({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-gray-200 text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </Link>
  )
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ line?: string }>
}) {
  const { line } = await searchParams
  const { count: totalCount, displayRating } = getReviewStats()
  const productLines = getProductLines()

  const visibleReviews = reviews
    .filter((r) => r.text.trim().length > 0)
    .filter((r) => !line || r.productLine === line)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
          Customer reviews
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <StarRow rating={Math.round(displayRating)} />
          <span>
            {displayRating.toFixed(1)} · {totalCount} reviews
          </span>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterTab href="/reviews" label="All" active={!line} />
        {productLines.map((productLine) => (
          <FilterTab
            key={productLine}
            href={`/reviews?line=${encodeURIComponent(productLine)}`}
            label={formatProductLine(productLine)}
            active={line === productLine}
          />
        ))}
      </div>

      {visibleReviews.length > 0 ? (
        <ReviewsGrid key={line ?? "all"} reviews={visibleReviews} />
      ) : (
        <p className="text-sm text-gray-500">No reviews yet for this size.</p>
      )}
    </div>
  )
}
