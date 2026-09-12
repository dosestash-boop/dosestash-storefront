"use client"

import { useState } from "react"
import type { Review } from "@/lib/reviews"
import { ReviewCard } from "./review-card"

const PAGE_SIZE = 20

export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} truncate={false} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-accent px-6 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Load more reviews
          </button>
        </div>
      )}
    </>
  )
}
