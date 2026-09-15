"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useCart } from "./cart-context"
import { formatPrice } from "@/lib/format-price"
import { ProductArtPlaceholder } from "@/components/product-art-placeholder"

export function CartDrawer() {
  const {
    cart,
    isOpen,
    isPending,
    cartError,
    closeCart,
    updateItem,
    removeItem,
  } = useCart()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, closeCart])

  const items = cart?.items ?? []
  const currencyCode = cart?.currency_code ?? "eur"

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        tabIndex={isOpen ? 0 : -1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">
            Cart{items.length > 0 ? ` (${items.length})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {cartError && (
          <p
            role="alert"
            className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-800"
          >
            {cartError}
          </p>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-gray-900">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Browse cases to find something you like.
            </p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {items.map((item) => {
              const isUnmanaged = item.variant?.manage_inventory === false
              const canIncrease =
                isUnmanaged ||
                item.quantity < (item.variant?.inventory_quantity ?? 0)

              return (
              <li
                key={item.id}
                className="flex gap-4 border-b border-gray-50 py-4 first:pt-0"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.product_title ?? item.title}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ProductArtPlaceholder
                      title={item.product_title ?? item.title}
                      className="p-3"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product_title ?? item.title}
                      </p>
                      {item.variant?.title && (
                        <p className="text-xs text-gray-500">
                          {item.variant.title}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(
                        item.item_total ?? item.unit_price * item.quantity,
                        currencyCode
                      )}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 rounded-md border border-gray-200">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        disabled={isPending || item.quantity <= 1}
                        onClick={() =>
                          updateItem(item.id, item.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center text-gray-600 disabled:opacity-30"
                      >
                        &minus;
                      </button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        disabled={isPending || !canIncrease}
                        onClick={() =>
                          updateItem(item.id, item.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center text-gray-600 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                  {!canIncrease && (
                    <p className="mt-1 text-xs text-amber-600">
                      Max available quantity in cart
                    </p>
                  )}
                </div>
              </li>
              )
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between text-sm font-bold text-gray-900">
              <span>Subtotal</span>
              <span>{formatPrice(cart?.subtotal ?? 0, currencyCode)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
