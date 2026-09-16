import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"

const ORDER_FIELDS =
  "*items,*items.variant,*shipping_address,*billing_address,*shipping_methods,*payment_collections.payments"

export async function getOrder(
  id: string
): Promise<HttpTypes.StoreOrder | null> {
  try {
    const { order } = await sdk.store.order.retrieve(id, {
      fields: ORDER_FIELDS,
    })
    return order
  } catch {
    return null
  }
}
