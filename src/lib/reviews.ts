import reviewsData from "@/data/reviews.json"

export type Review = (typeof reviewsData)[number]

export const reviews: Review[] = reviewsData

export function getReviewStats() {
  const count = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count
  const displayRating = Math.floor(avgRating * 10) / 10

  return { count, displayRating }
}

export function getProductLines(): string[] {
  return [...new Set(reviews.map((r) => r.productLine))]
}

export function formatProductLine(productLine: string): string {
  const titleCased = productLine
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return /syringe/i.test(productLine) ? titleCased : `${titleCased} Vials`
}
