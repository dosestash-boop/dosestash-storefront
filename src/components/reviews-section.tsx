import Link from "next/link"
import { reviews, getReviewStats } from "@/lib/reviews"
import { ReviewCard } from "./review-card"
import { StarRow } from "./star-row"

const FEATURED_REVIEW_IDS = [
  "r04",
  "r28",
  "r42",
  "r49",
  "r47",
  "r58",
  "r72",
  "r60",
]

export function ReviewsSection() {
  const { count: totalCount, displayRating } = getReviewStats()

  const featured = FEATURED_REVIEW_IDS.map((id) =>
    reviews.find((r) => r.id === id)
  ).filter((r): r is (typeof reviews)[number] => Boolean(r))

  if (featured.length === 0) return null

  return (
    <div className="mx-auto max-w-7xl border-t border-gray-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-gray-900">
          What customers are saying
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <StarRow rating={Math.round(displayRating)} />
            <span>
              {displayRating.toFixed(1)} · {totalCount} reviews
            </span>
          </div>
          <Link
            href="/reviews"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            See all reviews
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {featured.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
