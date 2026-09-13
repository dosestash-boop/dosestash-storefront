"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { groupCategoriesByLine } from "@/lib/category-groups"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function MobileMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const { vialCategories, syringeCategories } =
    groupCategoriesByLine(categories)

  useEffect(() => {
    // Portal target (document.body) only exists client-side; `open` can
    // never be true during SSR, so this only guards the portal call itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR
    )
    firstFocusable?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        return
      }

      if (event.key !== "Tab" || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    const trigger = triggerRef.current

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
      trigger?.focus()
    }
  }, [open])

  return (
    <div className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
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
            d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
          />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              tabIndex={-1}
              className={`absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col overflow-y-auto bg-surface shadow-xl transition-transform duration-300 focus:outline-none ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <span className="text-sm font-bold text-gray-900">Menu</span>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
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

              <nav className="flex flex-col px-2 py-2">
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-md px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  Shop All
                </Link>

                {vialCategories.length > 0 && (
                  <>
                    <span className="mt-2 px-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Vials
                    </span>
                    {vialCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category_id=${category.id}`}
                        onClick={() => setOpen(false)}
                        className="min-h-11 rounded-md px-3 py-3 text-base text-gray-700 hover:bg-gray-50"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </>
                )}

                {syringeCategories.length > 0 && (
                  <>
                    <span className="mt-2 px-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Syringes
                    </span>
                    {syringeCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category_id=${category.id}`}
                        onClick={() => setOpen(false)}
                        className="min-h-11 rounded-md px-3 py-3 text-base text-gray-700 hover:bg-gray-50"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
