import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "@/lib/format-price"
import { ProductArtPlaceholder } from "@/components/product-art-placeholder"

export function OrderSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  const currencyCode = cart.currency_code

  return (
    <div className="rounded-lg border border-gray-100 bg-surface p-5">
      <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>

      <ul className="mt-4 space-y-4">
        {(cart.items ?? []).map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-md bg-gray-100">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.product_title ?? item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <ProductArtPlaceholder
                  title={item.product_title ?? item.title}
                  className="p-2"
                />
              )}
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.product_title ?? item.title}
              </p>
              {item.variant?.title && (
                <p className="text-xs text-gray-500">{item.variant.title}</p>
              )}
            </div>
            <p className="flex-none text-sm font-medium text-gray-900">
              {formatPrice(
                item.item_total ?? item.unit_price * item.quantity,
                currencyCode
              )}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(cart.item_subtotal ?? 0, currencyCode)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {cart.shipping_methods?.length
              ? formatPrice(cart.shipping_subtotal ?? 0, currencyCode)
              : "—"}
          </span>
        </div>
        {cart.tax_total != null && cart.tax_total > 0 && (
          <div className="flex items-center justify-between text-gray-600">
            <span>Tax</span>
            <span>{formatPrice(cart.tax_total, currencyCode)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(cart.total ?? 0, currencyCode)}</span>
        </div>
      </div>
    </div>
  )
}
