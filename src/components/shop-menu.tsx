"use client"

import { useEffect, useRef, useState, type FocusEvent } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { CategoryTile } from "./category-tile"
import { VialsTileArt, SyringesTileArt } from "./category-art"

function artForCategory(name: string) {
  return name.toLowerCase().includes("syringe") ? (
    <SyringesTileArt className="h-full w-full" />
  ) : (
    <VialsTileArt className="h-full w-full" />
  )
}

export function ShopMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const [open, setOpen] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const show = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setOpen(true)
  }

  const hideSoon = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [open])

  if (categories.length === 0) {
    return (
      <Link
        href="/products"
        className="flex min-h-11 items-center text-sm font-medium text-gray-900 hover:text-teal"
      >
        Shop
      </Link>
    )
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocus={show}
      onBlur={handleBlur}
    >
      <Link
        href="/products"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex min-h-11 items-center gap-1 text-sm font-medium text-gray-900 hover:text-teal"
      >
        Shop
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Link>

      <div
        className={`absolute left-0 top-full z-50 pt-3 transition-opacity duration-150 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="w-[420px] rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                href={`/products?category_id=${category.id}`}
                label={category.name}
                art={artForCategory(category.name)}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-11 items-center justify-center rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </div>
  )
}
