import type { HttpTypes } from "@medusajs/types"
import { ProductCard } from "./product-card"

export function ProductGrid({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium text-gray-900">
          No products found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Check back soon for new arrivals.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
