"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { getDefaultRegion } from "./regions"
import { sendOrderConfirmationEmail } from "@/lib/mail"

const CART_COOKIE = "cart_id"
const CART_FIELDS =
  "*items,*items.variant,+items.variant.inventory_quantity,*items.product,*region,*shipping_address,*billing_address,*shipping_methods,*payment_collection.payment_sessions"

async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value ?? null
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

async function clearCartId() {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
}

export async function getCart(): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: CART_FIELDS,
    })

    // A cart created against a region that's since been removed (e.g. the
    // old EUR region) can't complete checkout — treat it as stale rather
    // than letting a returning visitor's old cookie dead-end at checkout.
    const region = await getDefaultRegion()
    if (region && cart.region_id !== region.id) {
      await clearCartId()
      return null
    }

    return cart
  } catch {
    await clearCartId()
    return null
  }
}

async function getOrCreateCart(): Promise<HttpTypes.StoreCart> {
  const existing = await getCart()
  if (existing) return existing

  const region = await getDefaultRegion()
  const { cart } = await sdk.store.cart.create(
    { region_id: region?.id },
    { fields: CART_FIELDS }
  )
  await setCartId(cart.id)
  return cart
}

export async function addToCart({
  variantId,
  quantity = 1,
}: {
  variantId: string
  quantity?: number
}): Promise<HttpTypes.StoreCart> {
  const cart = await getOrCreateCart()
  const { cart: updated } = await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    { fields: CART_FIELDS }
  )
  revalidatePath("/", "layout")
  return updated
}

export async function updateCartItem({
  lineItemId,
  quantity,
}: {
  lineItemId: string
  quantity: number
}): Promise<HttpTypes.StoreCart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const { cart } = await sdk.store.cart.updateLineItem(
    cartId,
    lineItemId,
    { quantity },
    { fields: CART_FIELDS }
  )
  revalidatePath("/", "layout")
  return cart
}

export async function removeCartItem({
  lineItemId,
}: {
  lineItemId: string
}): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const { parent } = await sdk.store.cart.deleteLineItem(cartId, lineItemId, {
    fields: CART_FIELDS,
  })
  revalidatePath("/", "layout")
  return parent ?? null
}

export async function updateCartDetails({
  email,
  shippingAddress,
}: {
  email: string
  shippingAddress: HttpTypes.StoreAddAddress
}): Promise<HttpTypes.StoreCart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const { cart } = await sdk.store.cart.update(
    cartId,
    {
      email,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
    },
    { fields: CART_FIELDS }
  )
  return cart
}

export async function listShippingOptions(): Promise<
  HttpTypes.StoreCartShippingOption[]
> {
  const cartId = await getCartId()
  if (!cartId) return []

  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
    cart_id: cartId,
  })
  return shipping_options
}

export async function addShippingMethod({
  optionId,
}: {
  optionId: string
}): Promise<HttpTypes.StoreCart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const { cart } = await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: optionId },
    { fields: CART_FIELDS }
  )
  return cart
}

export async function listPaymentProviders(
  regionId: string
): Promise<HttpTypes.StorePaymentProvider[]> {
  const { payment_providers } = await sdk.store.payment.listPaymentProviders({
    region_id: regionId,
  })
  return payment_providers
}

export async function initiatePaymentSession({
  cart,
  providerId,
}: {
  cart: HttpTypes.StoreCart
  providerId: string
}): Promise<HttpTypes.StorePaymentCollectionResponse> {
  return sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: providerId,
  })
}

/**
 * Multiple products share the same underlying color inventory (e.g. a
 * 5-vial case and a 100-vial case both draw from the same "Charcoal
 * Black" filament pool, at different required_quantity rates). Medusa
 * validates each cart line's stock against that shared pool
 * independently, so two different products in one cart can each look
 * individually valid while together exceeding what's actually in stock.
 * This re-checks the combined demand per shared pool before completing.
 *
 * Returns the color name to block on, or null if everything fits.
 */
async function findOversoldColor(cartId: string): Promise<string | null> {
  const { cart } = await sdk.store.cart.retrieve(cartId, {
    fields: "id,*items,*items.variant,*items.variant.inventory_items",
  })
  const items = cart.items ?? []
  if (items.length === 0) return null

  const productIds = [...new Set(items.map((i) => i.product_id).filter((id): id is string => !!id))]
  if (productIds.length === 0) return null

  const region = await getDefaultRegion()
  const { products } = await sdk.store.product.list({
    id: productIds,
    region_id: region?.id,
    fields: "id,+variants.inventory_quantity",
    limit: productIds.length,
  })

  const variantAvailable = new Map<string, number>()
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (variant.id && variant.inventory_quantity != null) {
        variantAvailable.set(variant.id, variant.inventory_quantity)
      }
    }
  }

  const groups = new Map<string, { label: string; demand: number; estimate: number }>()

  // `inventory_items` isn't declared on StoreProductVariant's type, but is
  // returned when requested via the `fields` param above.
  type VariantWithInventory = HttpTypes.StoreProductVariant & {
    inventory_items?: { inventory_item_id: string; required_quantity: number | null }[]
  }

  for (const item of items) {
    const variant = item.variant as VariantWithInventory | undefined
    const link = variant?.inventory_items?.[0]
    const available = item.variant_id ? variantAvailable.get(item.variant_id) : undefined
    if (!link || available == null) continue

    const requiredQuantity = link.required_quantity ?? 1
    // A lower bound on the true pool size: since the storefront-facing
    // quantity is already floor(pool / required_quantity), multiplying
    // back can only under-estimate the real pool, never over-estimate —
    // so this check can produce a false block at the margin, but never
    // a false pass that lets a real oversell through.
    const estimate = available * requiredQuantity
    const demand = item.quantity * requiredQuantity

    const existing = groups.get(link.inventory_item_id)
    if (existing) {
      existing.demand += demand
      existing.estimate = Math.max(existing.estimate, estimate)
    } else {
      groups.set(link.inventory_item_id, {
        label: variant?.title ?? item.title,
        demand,
        estimate,
      })
    }
  }

  for (const group of groups.values()) {
    if (group.demand > group.estimate) {
      return group.label
    }
  }
  return null
}

export async function completeCart(): Promise<HttpTypes.StoreCompleteCartResponse> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const oversoldColor = await findOversoldColor(cartId)
  if (oversoldColor) {
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
    return {
      type: "cart",
      cart,
      error: {
        name: "insufficient_inventory",
        type: "insufficient_inventory",
        message: `Only limited ${oversoldColor} stock is left across your cart items — please reduce the quantity of ${oversoldColor} items before placing your order.`,
      },
    }
  }

  const result = await sdk.store.cart.complete(cartId, {
    fields: "*items,*shipping_address",
  })
  if (result.type === "order") {
    const cookieStore = await cookies()
    cookieStore.delete(CART_COOKIE)
    revalidatePath("/", "layout")

    try {
      await sendOrderConfirmationEmail(result.order)
    } catch (err) {
      console.error("Failed to send order confirmation email", err)
    }
  }
  return result
}
