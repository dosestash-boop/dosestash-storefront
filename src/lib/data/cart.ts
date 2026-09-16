"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { getDefaultRegion } from "./regions"

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

export async function completeCart(): Promise<HttpTypes.StoreCompleteCartResponse> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No active cart")

  const result = await sdk.store.cart.complete(cartId)
  if (result.type === "order") {
    const cookieStore = await cookies()
    cookieStore.delete(CART_COOKIE)
    revalidatePath("/", "layout")
  }
  return result
}
