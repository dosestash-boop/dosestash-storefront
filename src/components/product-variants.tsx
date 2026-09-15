"use client"

import { useMemo, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "@/lib/format-price"
import { useCart } from "@/components/cart/cart-context"
import { COLOR_SWATCHES, CORE_SHIPPING_COLORS } from "@/lib/color-swatches"

export function ProductVariants({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { addItem, isPending } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

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
  const maxQuantity = isUnmanaged ? 99 : Math.max(1, stock)
  // Derived rather than reset via an effect, so switching to a variant
  // with less stock can't leave quantity above its available amount.
  const clampedQuantity = Math.min(quantity, maxQuantity)

  const colorOption = options.find((o) => o.title.toLowerCase().includes("color"))
  const selectedColor = colorOption ? selected[colorOption.id] : undefined
  const isCoreColor = selectedColor
    ? CORE_SHIPPING_COLORS.includes(selectedColor)
    : true
  const shippingText = isCoreColor ? "2–3 days" : "2–5 days"

  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return
    addItem(selectedVariant.id, clampedQuantity)
    setJustAdded(true)
    setQuantity(1)
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

      {options.map((option) => {
        const isColorOption = option.title.toLowerCase().includes("color")
        const values = option.values ?? []

        const renderValueButton = (
          val: NonNullable<typeof option.values>[number]
        ) => {
          const isSelected = selected[option.id] === val.value
          const swatchColor = isColorOption
            ? COLOR_SWATCHES[val.value]
            : undefined
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
              className={`flex min-h-11 min-w-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-900 hover:border-gray-900"
              }`}
            >
              {swatchColor && (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 flex-none rounded-full border border-black/10"
                  style={{ backgroundColor: swatchColor }}
                />
              )}
              {val.value}
            </button>
          )
        }

        if (isColorOption) {
          const coreValues = values.filter((v) =>
            CORE_SHIPPING_COLORS.includes(v.value)
          )
          const otherValues = values.filter(
            (v) => !CORE_SHIPPING_COLORS.includes(v.value)
          )

          return (
            <fieldset
              key={option.id}
              className="mt-6"
              role="group"
              aria-label={option.title}
            >
              <legend className="text-sm font-medium text-gray-900">
                {option.title}
              </legend>

              {coreValues.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-gray-500">
                    Ships in 2&ndash;3 days
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coreValues.map(renderValueButton)}
                  </div>
                </div>
              )}

              {otherValues.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-medium text-gray-500">
                    Ships in 2&ndash;5 days
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {otherValues.map(renderValueButton)}
                  </div>
                </div>
              )}
            </fieldset>
          )
        }

        return (
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
              {values.map(renderValueButton)}
            </div>
          </fieldset>
        )
      })}

      <div className="mt-6">
        <span className="text-sm font-medium text-gray-900">Quantity</span>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={clampedQuantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-11 w-11 items-center justify-center text-lg text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &minus;
            </button>
            <span
              className="flex h-11 w-10 items-center justify-center text-sm font-medium text-gray-900"
              aria-live="polite"
            >
              {clampedQuantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={clampedQuantity >= maxQuantity}
              aria-label="Increase quantity"
              className="flex h-11 w-11 items-center justify-center text-lg text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

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

      <p className="mt-3 text-center text-xs text-gray-500">
        Ships in {shippingText} &middot; Plain packaging
      </p>
    </div>
  )
}
