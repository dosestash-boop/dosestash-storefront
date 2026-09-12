import { listFilteredProducts, listCategories } from "@/lib/data/products"
import { ProductGrid } from "@/components/product-grid"
import { Pagination } from "@/components/pagination"
import { ProductFiltersPanel } from "@/components/product-filters"

const PAGE_SIZE = 12

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return raw !== undefined && !Number.isNaN(parsed) ? parsed : undefined
}

export type ProductListingSearchParams = {
  page?: string
  category_id?: string
  size?: string | string[]
  color?: string | string[]
  price_min?: string
  price_max?: string
}

export async function ProductListing({
  searchParams,
  basePath,
  heading,
  headingTag: HeadingTag = "h1",
}: {
  searchParams: ProductListingSearchParams
  basePath: string
  /** Overrides the auto category-derived heading (used on the homepage). */
  heading?: string
  /** Use "h2" when this section isn't the page's top-level heading. */
  headingTag?: "h1" | "h2"
}) {
  const currentPage = Math.max(1, Number(searchParams.page) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const filters = {
    categoryId: searchParams.category_id,
    sizes: toArray(searchParams.size),
    colors: toArray(searchParams.color),
    priceMin: toNumber(searchParams.price_min),
    priceMax: toNumber(searchParams.price_max),
  }

  const [{ products, count, facets, region }, categories] = await Promise.all(
    [
      listFilteredProducts({ filters, limit: PAGE_SIZE, offset }),
      listCategories(),
    ]
  )

  const activeCategory = categories.find((c) => c.id === filters.categoryId)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div>
      <div className="mb-10">
        <HeadingTag className="font-heading text-3xl font-medium tracking-tight text-gray-900">
          {heading ?? (activeCategory ? activeCategory.name : "Shop All")}
        </HeadingTag>
        <p className="mt-2 text-sm text-gray-500">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <ProductFiltersPanel
            facets={facets}
            active={filters}
            currencyCode={region?.currency_code ?? "eur"}
          />
        </aside>

        <div>
          <ProductGrid products={products} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            searchParams={{
              category_id: filters.categoryId,
              size: filters.sizes,
              color: filters.colors,
              price_min: searchParams.price_min,
              price_max: searchParams.price_max,
            }}
          />
        </div>
      </div>
    </div>
  )
}
