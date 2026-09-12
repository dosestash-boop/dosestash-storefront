import Image from "next/image"
import reviews from "@/data/reviews.json"
import { getReviewStats } from "@/lib/reviews"
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
  "r91",
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
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <StarRow rating={Math.round(displayRating)} />
          <span>
            {displayRating.toFixed(1)} · {totalCount} reviews
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((review) => (
          <div
            key={review.id}
            className="flex items-center gap-4 rounded-xl bg-gray-50 p-4"
          >
            {review.images.length > 0 ? (
              <div className="relative h-20 w-20 flex-none overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={review.images[0]}
                  alt={`Photo from ${review.author}'s review`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 flex-none items-center justify-center rounded-lg bg-accent-soft text-xl font-medium text-accent">
                {review.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <StarRow rating={review.rating} className="h-3.5 w-3.5" />
              <p className="mt-1.5 line-clamp-3 text-sm text-gray-700">
                {review.text}
              </p>
              <span className="mt-1.5 text-sm font-medium text-gray-900">
                {review.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
