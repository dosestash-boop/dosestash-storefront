import { cache } from "react"
import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"

/**
 * This store currently has a single region, so we just use the first one
 * returned by the backend for all pricing/product queries.
 */
export const getDefaultRegion = cache(
  async (): Promise<HttpTypes.StoreRegion | null> => {
    const { regions } = await sdk.store.region.list()
    return regions[0] ?? null
  }
)
