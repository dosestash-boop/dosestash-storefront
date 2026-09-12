import type { FilterFacets, ProductFilters } from "@/lib/data/products"
import { formatPrice } from "@/lib/format-price"

export function ProductFiltersPanel({
  facets,
  active,
  currencyCode,
}: {
  facets: FilterFacets
  active: ProductFilters
  currencyCode: string
}) {
  const hasActiveFilters =
    (active.sizes?.length ?? 0) > 0 ||
    (active.colors?.length ?? 0) > 0 ||
    active.priceMin !== undefined ||
    active.priceMax !== undefined

  const clearHref = active.categoryId
    ? `/products?category_id=${active.categoryId}`
    : "/products"

  return (
    <form action="/products" method="GET">
      {active.categoryId && (
        <input type="hidden" name="category_id" value={active.categoryId} />
      )}

      {facets.sizes.length > 0 && (
        <details open className="border-b border-gray-100 py-4">
          <summary className="cursor-pointer select-none text-sm font-bold text-gray-900">
            Size
          </summary>
          <div className="mt-3 space-y-3">
            {facets.sizes.map(({ value, count }) => (
              <label
                key={value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="size"
                  value={value}
                  defaultChecked={active.sizes?.includes(value)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                {value}
                <span className="text-gray-400">({count})</span>
              </label>
            ))}
          </div>
        </details>
      )}

      {facets.colors.length > 0 && (
        <details open className="border-b border-gray-100 py-4">
          <summary className="cursor-pointer select-none text-sm font-bold text-gray-900">
            Color
          </summary>
          <div className="mt-3 space-y-3">
            {facets.colors.map(({ value, count }) => (
              <label
                key={value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="color"
                  value={value}
                  defaultChecked={active.colors?.includes(value)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                {value}
                <span className="text-gray-400">({count})</span>
              </label>
            ))}
          </div>
        </details>
      )}

      {facets.priceBounds && (
        <details open className="border-b border-gray-100 py-4">
          <summary className="cursor-pointer select-none text-sm font-bold text-gray-900">
            Price
          </summary>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              name="price_min"
              min={0}
              defaultValue={active.priceMin ?? facets.priceBounds.min}
              aria-label="Minimum price"
              className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
            />
            <span className="text-gray-400" aria-hidden="true">
              &ndash;
            </span>
            <input
              type="number"
              name="price_max"
              min={0}
              defaultValue={active.priceMax ?? facets.priceBounds.max}
              aria-label="Maximum price"
              className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {formatPrice(facets.priceBounds.min, currencyCode)} &ndash;{" "}
            {formatPrice(facets.priceBounds.max, currencyCode)} available
          </p>
        </details>
      )}

      <div className="flex flex-col gap-2 pt-4">
        <button
          type="submit"
          className="min-h-11 rounded-md bg-gray-900 text-sm font-bold text-white hover:bg-gray-700"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <a
            href={clearHref}
            className="text-center text-sm text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
          >
            Clear all
          </a>
        )}
      </div>
    </form>
  )
}
