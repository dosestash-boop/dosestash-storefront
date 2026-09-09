import type { Metadata } from "next"
import { listProducts, listCategories } from "@/lib/data/products"
import { ProductGrid } from "@/components/product-grid"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full Dosestash product catalog.",
}

const PAGE_SIZE = 12

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category_id?: string }>
}) {
  const { page: pageParam, category_id: categoryId } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const [{ products, count }, categories] = await Promise.all([
    listProducts({ limit: PAGE_SIZE, offset, categoryId }),
    listCategories(),
  ])

  const activeCategory = categories.find((c) => c.id === categoryId)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {activeCategory ? activeCategory.name : "Shop All"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>

      <ProductGrid products={products} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/products"
        searchParams={{ category_id: categoryId }}
      />
    </div>
  )
}
