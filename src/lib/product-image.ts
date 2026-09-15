import type { HttpTypes } from "@medusajs/types"

/**
 * Falls back to the first product image when `thumbnail` isn't set, so a
 * product doesn't need thumbnail set separately from images to show a
 * photo on tiles/grids.
 */
export function getProductThumbnail(
  product: HttpTypes.StoreProduct
): string | null {
  return product.thumbnail ?? product.images?.[0]?.url ?? null
}
