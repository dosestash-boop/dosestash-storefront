import type { Metadata } from "next"
import Link from "next/link"
import { getCart, listShippingOptions } from "@/lib/data/cart"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function CheckoutPage() {
  const cart = await getCart()

  if (!cart || (cart.items ?? []).length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-medium text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Shop All
        </Link>
      </div>
    )
  }

  const shippingOptions = await listShippingOptions()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-medium tracking-tight text-gray-900">
        Checkout
      </h1>

      <CheckoutForm cart={cart} shippingOptions={shippingOptions} />
    </div>
  )
}
