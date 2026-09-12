import Image from "next/image"
import type { Review } from "@/lib/reviews"
import { StarRow } from "./star-row"

export function ReviewCard({
  review,
  truncate = true,
}: {
  review: Review
  truncate?: boolean
}) {
  return (
    <div className="flex h-full items-center gap-4 rounded-xl bg-gray-50 p-4">
      {review.images.length > 0 ? (
        <div className="relative w-24 flex-none self-stretch overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={review.images[0]}
            alt={`Photo from ${review.author}'s review`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex w-24 flex-none items-center justify-center self-stretch rounded-lg bg-accent-soft text-2xl font-medium text-accent">
          {review.author.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <StarRow rating={review.rating} className="h-3.5 w-3.5" />
        <p
          className={`mt-1.5 text-sm text-gray-700 ${truncate ? "line-clamp-3" : ""}`}
        >
          {review.text}
        </p>
        <span className="mt-1.5 text-sm font-medium text-gray-900">
          {review.author}
        </span>
      </div>
    </div>
  )
}
