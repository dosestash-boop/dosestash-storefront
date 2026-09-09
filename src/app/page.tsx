import Link from "next/link"
import { listProducts } from "@/lib/data/products"
import { ProductGrid } from "@/components/product-grid"

export const revalidate = 300

export default async function Home() {
  const { products } = await listProducts({ limit: 8 })

  return (
    <div>
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Dosestash
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
            Everyday essentials, carefully made.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-white hover:bg-gray-700"
          >
            Shop All
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View All
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  )
}
