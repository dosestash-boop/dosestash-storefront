"use client"

import { useCart } from "./cart-context"

export function CartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      className="relative flex h-11 w-11 items-center justify-center text-gray-900 hover:text-teal"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.593 2.707-6.615a1.125 1.125 0 0 0-1.087-1.5H5.106M7.5 14.25 5.106 5.272M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {itemCount > 0 && (
        <span
          aria-live="polite"
          className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-teal px-1 text-[10px] font-bold text-teal-foreground"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  )
}
