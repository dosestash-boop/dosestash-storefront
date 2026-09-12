import reviews from "@/data/reviews.json"

export function getReviewStats() {
  const count = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count
  const displayRating = Math.floor(avgRating * 10) / 10

  return { count, displayRating }
}
