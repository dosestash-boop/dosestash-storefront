"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { getDefaultRegion } from "./regions"

const CART_COOKIE = "cart_id"
const CART_FIELDS = "*items,*items.variant,*items.product,*region"

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

export async function getCart(): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: CART_FIELDS,
    })
    return cart
  } catch {
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
