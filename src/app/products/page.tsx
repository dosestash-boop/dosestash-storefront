import type { Metadata } from "next"
import {
  ProductListing,
  type ProductListingSearchParams,
} from "@/components/product-listing"

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full Dosestash product catalog.",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductListingSearchParams>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ProductListing searchParams={params} basePath="/products" />
    </div>
  )
}
