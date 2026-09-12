"use client"

import { useMemo, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "@/lib/format-price"
import { useCart } from "@/components/cart/cart-context"

export function ProductVariants({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { addItem, isPending } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const options = product.options ?? []
  const variants = useMemo(() => product.variants ?? [], [product.variants])

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = variants[0]
    if (!first?.options) return {}
    return Object.fromEntries(
      first.options.map((opt) => [opt.option_id!, opt.value])
    )
  })

  const selectedVariant = useMemo(() => {
    return variants.find((variant) =>
      variant.options?.every(
        (opt) => selected[opt.option_id!] === opt.value
      )
    )
  }, [variants, selected])

  const price = selectedVariant?.calculated_price
  const calculatedAmount = price?.calculated_amount ?? null
  const originalAmount = price?.original_amount ?? null
  const currencyCode = price?.currency_code ?? "usd"
  const isOnSale = Boolean(
    calculatedAmount !== null &&
      originalAmount !== null &&
      originalAmount > calculatedAmount
  )
  const stock = selectedVariant?.inventory_quantity ?? 0
  const isUnmanaged = selectedVariant?.manage_inventory === false
  const inStock = isUnmanaged || stock > 0
  const lowStock = !isUnmanaged && inStock && stock <= 5

  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return
    addItem(selectedVariant.id, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div>
      <div className="text-2xl font-semibold text-gray-900">
        {calculatedAmount !== null ? (
          <>
            {isOnSale && originalAmount !== null && (
              <span className="mr-2 text-lg font-normal text-gray-400 line-through">
                {formatPrice(originalAmount, currencyCode)}
              </span>
            )}
            <span className={isOnSale ? "text-red-600" : ""}>
              {formatPrice(calculatedAmount, currencyCode)}
            </span>
          </>
        ) : (
          <span className="text-gray-400">Select options</span>
        )}
      </div>

      {options.map((option) => (
        <fieldset
          key={option.id}
          className="mt-6"
          role="group"
          aria-label={option.title}
        >
          <legend className="text-sm font-medium text-gray-900">
            {option.title}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(option.values ?? []).map((val) => {
              const isSelected = selected[option.id] === val.value
              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [option.id]: val.value,
                    }))
                  }
                  aria-pressed={isSelected}
                  className={`min-h-11 min-w-11 rounded-md border px-4 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-900 hover:border-gray-900"
                  }`}
                >
                  {val.value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      <p className="mt-6 text-sm" aria-live="polite">
        {!selectedVariant ? (
          <span className="text-gray-500">
            Select options to see availability
          </span>
        ) : inStock ? (
          lowStock ? (
            <span className="text-amber-600">Only {stock} left in stock</span>
          ) : (
            <span className="text-green-700">In stock</span>
          )
        ) : (
          <span className="text-red-600">Out of stock</span>
        )}
      </p>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedVariant || !inStock || isPending}
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!selectedVariant
          ? "Select options"
          : !inStock
            ? "Out of stock"
            : justAdded
              ? "Added"
              : "Add to Cart"}
      </button>
    </div>
  )
}
