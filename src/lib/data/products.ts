import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { getDefaultRegion } from "./regions"
import { getProductPriceInfo } from "@/lib/product-price"
import { formatPrice } from "@/lib/format-price"

const PRODUCT_FIELDS =
  "*variants.calculated_price,*images,+variants.inventory_quantity"

const PRODUCT_DETAIL_FIELDS =
  "*variants.calculated_price,*images,+variants.inventory_quantity,*options.values,*categories"

const PRODUCT_FILTERABLE_FIELDS = `${PRODUCT_FIELDS},*options,*options.values`

const PAGE_SIZE = 12
const FILTER_FETCH_LIMIT = 100

export async function listProducts({
  limit = PAGE_SIZE,
  offset = 0,
  categoryId,
}: {
  limit?: number
  offset?: number
  categoryId?: string
} = {}): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion | null
}> {
  const region = await getDefaultRegion()

  const { products, count } = await sdk.store.product.list({
    limit,
    offset,
    region_id: region?.id,
    category_id: categoryId ? [categoryId] : undefined,
    fields: PRODUCT_FIELDS,
  })

  return { products, count, region }
}

const FEATURED_COLLECTION_HANDLE = "featured"

export async function listFeaturedProducts({
  limit = 4,
}: {
  limit?: number
} = {}): Promise<{
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion | null
}> {
  const region = await getDefaultRegion()

  const { collections } = await sdk.store.collection.list({
    handle: FEATURED_COLLECTION_HANDLE,
  })
  const featuredCollection = collections[0]

  if (!featuredCollection) {
    const { products } = await listProducts({ limit })
    return { products, region }
  }

  const { products } = await sdk.store.product.list({
    limit,
    region_id: region?.id,
    collection_id: [featuredCollection.id],
    fields: PRODUCT_FIELDS,
  })

  return { products, region }
}

export async function getProductByHandle(handle: string): Promise<{
  product: HttpTypes.StoreProduct | null
  region: HttpTypes.StoreRegion | null
}> {
  const region = await getDefaultRegion()

  const { products } = await sdk.store.product.list({
    handle,
    region_id: region?.id,
    fields: PRODUCT_DETAIL_FIELDS,
  })

  return { product: products[0] ?? null, region }
}

export async function listCategories(): Promise<
  HttpTypes.StoreProductCategory[]
> {
  const { product_categories } = await sdk.store.category.list({
    limit: 20,
    fields: "id,name,handle",
  })
  return product_categories
}

/**
 * Picks the category with the most products from a list of candidates -
 * used for picking a default/primary category to link to (e.g. a homepage
 * CTA) without hardcoding which size is "the real one" as the catalog
 * fills in unevenly across sizes.
 */
export async function getMostStockedCategory(
  categories: HttpTypes.StoreProductCategory[]
): Promise<HttpTypes.StoreProductCategory | undefined> {
  if (categories.length === 0) return undefined
  if (categories.length === 1) return categories[0]

  const region = await getDefaultRegion()

  const counts = await Promise.all(
    categories.map((category) =>
      sdk.store.product.list({
        category_id: [category.id],
        region_id: region?.id,
        limit: 1,
        fields: "id",
      })
    )
  )

  let best = categories[0]
  let bestCount = counts[0]?.count ?? 0
  for (let i = 1; i < categories.length; i++) {
    const count = counts[i]?.count ?? 0
    if (count > bestCount) {
      best = categories[i]
      bestCount = count
    }
  }
  return best
}

async function getCategoryPriceStats(categoryId: string): Promise<{
  min: number
  max: number
  currencyCode: string
} | null> {
  const region = await getDefaultRegion()

  const { products } = await sdk.store.product.list({
    category_id: [categoryId],
    region_id: region?.id,
    limit: FILTER_FETCH_LIMIT,
    fields: PRODUCT_FIELDS,
  })

  let min = Infinity
  let max = -Infinity
  let currencyCode = "usd"
  for (const product of products) {
    const priceInfo = getProductPriceInfo(product)
    if (!priceInfo) continue
    currencyCode = priceInfo.currencyCode
    min = Math.min(min, priceInfo.minCalculatedPrice)
    max = Math.max(max, priceInfo.minCalculatedPrice)
  }

  return min === Infinity ? null : { min, max, currencyCode }
}

/**
 * Cheapest calculated price across all products in a category, formatted
 * for display (e.g. "from $22.00" CTAs) - fetched live so it always
 * reflects current Medusa pricing rather than being hardcoded.
 */
export async function getCategoryStartingPrice(
  categoryId: string
): Promise<string | null> {
  const stats = await getCategoryPriceStats(categoryId)
  return stats ? formatPrice(stats.min, stats.currencyCode) : null
}

/**
 * Min-max calculated price range across all products in a category,
 * formatted for display (e.g. "$34–$58" photo badges). Collapses to a
 * single price when every product in the category costs the same.
 */
export async function getCategoryPriceRange(
  categoryId: string
): Promise<string | null> {
  const stats = await getCategoryPriceStats(categoryId)
  if (!stats) return null

  const low = formatPrice(stats.min, stats.currencyCode)
  if (stats.min === stats.max) return low

  const high = formatPrice(stats.max, stats.currencyCode)
  return `${low}–${high}`
}

export type ProductFilters = {
  categoryId?: string
  sizes?: string[]
  colors?: string[]
  priceMin?: number
  priceMax?: number
}

export type FilterFacets = {
  sizes: { value: string; count: number }[]
  colors: { value: string; count: number }[]
  priceBounds: { min: number; max: number } | null
}

function getOptionValues(
  product: HttpTypes.StoreProduct,
  optionTitle: string
): string[] {
  const option = product.options?.find(
    (opt) => opt.title.toLowerCase() === optionTitle.toLowerCase()
  )
  return option?.values?.map((v) => v.value) ?? []
}

export async function listFilteredProducts({
  filters,
  limit = PAGE_SIZE,
  offset = 0,
}: {
  filters: ProductFilters
  limit?: number
  offset?: number
}): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion | null
  facets: FilterFacets
}> {
  const region = await getDefaultRegion()

  const { products: categoryProducts } = await sdk.store.product.list({
    limit: FILTER_FETCH_LIMIT,
    region_id: region?.id,
    category_id: filters.categoryId ? [filters.categoryId] : undefined,
    fields: PRODUCT_FILTERABLE_FIELDS,
  })

  const sizeCounts = new Map<string, number>()
  const colorCounts = new Map<string, number>()
  let priceMin = Infinity
  let priceMax = -Infinity

  for (const product of categoryProducts) {
    for (const size of getOptionValues(product, "size")) {
      sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1)
    }
    for (const color of getOptionValues(product, "color")) {
      colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1)
    }
    const priceInfo = getProductPriceInfo(product)
    if (priceInfo) {
      priceMin = Math.min(priceMin, priceInfo.minCalculatedPrice)
      priceMax = Math.max(priceMax, priceInfo.minCalculatedPrice)
    }
  }

  const facets: FilterFacets = {
    sizes: [...sizeCounts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    colors: [...colorCounts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    priceBounds:
      priceMin === Infinity ? null : { min: priceMin, max: priceMax },
  }

  const filtered = categoryProducts.filter((product) => {
    if (filters.sizes?.length) {
      const productSizes = getOptionValues(product, "size")
      if (!filters.sizes.some((size) => productSizes.includes(size))) {
        return false
      }
    }

    if (filters.colors?.length) {
      const productColors = getOptionValues(product, "color")
      if (!filters.colors.some((color) => productColors.includes(color))) {
        return false
      }
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const priceInfo = getProductPriceInfo(product)
      const price = priceInfo?.minCalculatedPrice
      if (price === undefined) return false
      if (filters.priceMin !== undefined && price < filters.priceMin) {
        return false
      }
      if (filters.priceMax !== undefined && price > filters.priceMax) {
        return false
      }
    }

    return true
  })

  return {
    products: filtered.slice(offset, offset + limit),
    count: filtered.length,
    region,
    facets,
  }
}
