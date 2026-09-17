import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrder } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format-price"

export const metadata: Metadata = {
  title: "Order Confirmed",
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const currencyCode = order.currency_code

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-2xl text-accent">
          &#10003;
        </span>
        <h1 className="mt-4 font-heading text-2xl font-medium text-gray-900">
          Order confirmed
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Thanks{order.email ? `, we've sent a confirmation to ${order.email}` : ""}.
          Order #{order.display_id}.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-gray-100 bg-surface p-5">
        <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        <ul className="mt-4 space-y-3">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-900">
                {item.quantity} &times; {item.product_title ?? item.title}
                {item.variant_title && (
                  <span className="text-gray-500"> ({item.variant_title})</span>
                )}
              </span>
              <span className="text-gray-600">
                {formatPrice(item.total, currencyCode)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.item_subtotal ?? 0, currencyCode)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_subtotal ?? 0, currencyCode)}</span>
          </div>
          {order.tax_total != null && order.tax_total > 0 && (
            <div className="flex items-center justify-between text-gray-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax_total, currencyCode)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total ?? 0, currencyCode)}</span>
          </div>
        </div>
      </div>

      {order.shipping_address && (
        <div className="mt-6 rounded-lg border border-gray-100 bg-surface p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Shipping to
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {order.shipping_address.first_name} {order.shipping_address.last_name}
            <br />
            {order.shipping_address.address_1}
            {order.shipping_address.address_2 && (
              <>, {order.shipping_address.address_2}</>
            )}
            <br />
            {order.shipping_address.city}, {order.shipping_address.province?.toUpperCase()}{" "}
            {order.shipping_address.postal_code}
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
