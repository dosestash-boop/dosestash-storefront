import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { getDefaultRegion } from "./regions"

const PRODUCT_FIELDS =
  "*variants.calculated_price,*images,+variants.inventory_quantity"

const PRODUCT_DETAIL_FIELDS =
  "*variants.calculated_price,*images,+variants.inventory_quantity,*options.values,*categories"

const PAGE_SIZE = 12

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
