import type { HttpTypes } from "@medusajs/types"

export type ProductPriceInfo = {
  currencyCode: string
  /** Lowest calculated (possibly discounted) price across variants */
  minCalculatedPrice: number
  /** Lowest original (pre-discount) price across variants */
  minOriginalPrice: number
  /** Whether variants have differing prices, so UI should show "From $X" */
  isRange: boolean
  /** Whether the lowest-priced variant is currently discounted */
  isOnSale: boolean
} | null

export function getProductPriceInfo(
  product: HttpTypes.StoreProduct
): ProductPriceInfo {
  const pricedVariants = (product.variants ?? []).filter(
    (variant) => variant.calculated_price
  )

  if (pricedVariants.length === 0) {
    return null
  }

  const currencyCode =
    pricedVariants[0].calculated_price!.currency_code ?? "usd"

  const calculatedAmounts = pricedVariants.map(
    (variant) => variant.calculated_price!.calculated_amount ?? 0
  )
  const originalAmounts = pricedVariants.map(
    (variant) => variant.calculated_price!.original_amount ?? 0
  )

  const minCalculatedPrice = Math.min(...calculatedAmounts)
  const minIndex = calculatedAmounts.indexOf(minCalculatedPrice)
  const minOriginalPrice = originalAmounts[minIndex]

  return {
    currencyCode,
    minCalculatedPrice,
    minOriginalPrice,
    isRange: new Set(calculatedAmounts).size > 1,
    isOnSale: minOriginalPrice > minCalculatedPrice,
  }
}
