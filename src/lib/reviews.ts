import reviewsData from "@/data/reviews.json"

export type Review = (typeof reviewsData)[number]

export const reviews: Review[] = reviewsData

export function getReviewStats() {
  const count = reviews.length
  if (count === 0) return { count: 0, displayRating: 0 }

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

/**
 * Derives the reviews.json productLine value (e.g. "3mL", "1mL syringe")
 * from a product title like "3mL Vial Storage Case — 5 Vials", so a
 * product page can show reviews for its specific size without needing
 * per-product tagging in Medusa.
 */
export function getProductReviewLine(title: string): string | null {
  const match = title.match(/^(\.?\d+mL)\s+(Vial|Syringe)/i)
  if (!match) return null

  const [, size, type] = match
  return type.toLowerCase() === "vial" ? size : `${size} syringe`
}

export function getReviewsForProductTitle(title: string): Review[] {
  const line = getProductReviewLine(title)
  if (!line) return []

  return reviews.filter((r) => r.productLine === line && r.text.trim())
}
