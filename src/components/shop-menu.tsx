import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { CategoryDropdown } from "./category-dropdown"

export function ShopMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const vialCategories = categories.filter((c) =>
    c.name.toLowerCase().includes("vial")
  )
  const syringeCategories = categories.filter((c) =>
    c.name.toLowerCase().includes("syringe")
  )

  return (
    <>
      <CategoryDropdown label="Vials" categories={vialCategories} />
      <CategoryDropdown label="Syringes" categories={syringeCategories} />
      <Link
        href="/products"
        className="flex min-h-11 items-center text-sm font-medium text-gray-900 hover:text-teal"
      >
        Shop All
      </Link>
    </>
  )
}
