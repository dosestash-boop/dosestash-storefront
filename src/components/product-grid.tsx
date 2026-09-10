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
        <p className="text-lg font-bold text-gray-900">No products found</p>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting or clearing your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
