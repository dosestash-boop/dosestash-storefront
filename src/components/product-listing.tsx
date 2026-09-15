import Link from "next/link"
import { listFilteredProducts, listCategories } from "@/lib/data/products"
import { groupCategoriesByLine } from "@/lib/category-groups"
import { ProductGrid } from "@/components/product-grid"
import { Pagination } from "@/components/pagination"

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const

export type ProductListingSearchParams = {
  page?: string
  category_id?: string
  type?: string
  sort?: string
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

  const categories = await listCategories()
  const { vialCategories, syringeCategories } =
    groupCategoriesByLine(categories)

  // Vials/Syringes tabs only make sense when no specific size category is
  // already selected (e.g. arrived here via the navbar megamenu).
  const showTypeTabs = !searchParams.category_id
  const activeType = showTypeTabs ? searchParams.type : undefined

  let categoryIdFilter: string | string[] | undefined = searchParams.category_id
  if (activeType === "vial") {
    categoryIdFilter = vialCategories.map((c) => c.id)
  } else if (activeType === "syringe") {
    categoryIdFilter = syringeCategories.map((c) => c.id)
  }

  const sortParam = searchParams.sort
  const sortBy: "price_asc" | "price_desc" | undefined =
    sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : undefined

  const filters = {
    categoryId: categoryIdFilter,
    sortBy,
  }

  const { products, count } = await listFilteredProducts({
    filters,
    limit: PAGE_SIZE,
    offset,
  })

  const activeCategory = categories.find(
    (c) => c.id === searchParams.category_id
  )
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const heroHeading =
    heading ??
    activeCategory?.name ??
    (activeType === "vial"
      ? "Vials"
      : activeType === "syringe"
        ? "Syringes"
        : "Shop All")

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (searchParams.category_id) {
      params.set("category_id", searchParams.category_id)
    }
    if (searchParams.type) params.set("type", searchParams.type)
    if (searchParams.sort) params.set("sort", searchParams.sort)
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div>
      <div className="mb-8">
        <HeadingTag className="font-heading text-3xl font-medium tracking-tight text-gray-900">
          {heroHeading}
        </HeadingTag>
        <p className="mt-2 text-sm text-gray-500">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {showTypeTabs ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ type: undefined })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                !activeType
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              All
            </Link>
            <Link
              href={buildHref({ type: "vial" })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeType === "vial"
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Vials
            </Link>
            <Link
              href={buildHref({ type: "syringe" })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeType === "syringe"
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Syringes
            </Link>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort:</span>
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref({ sort: option.value })}
              className={`rounded-md px-3 py-1.5 font-medium ${
                sortBy === option.value
                  ? "bg-accent text-accent-foreground"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <ProductGrid products={products} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
        searchParams={{
          category_id: searchParams.category_id,
          type: searchParams.type,
          sort: searchParams.sort,
        }}
      />
    </div>
  )
}
