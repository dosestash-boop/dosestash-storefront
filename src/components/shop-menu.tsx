import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { CategoryDropdown } from "./category-dropdown"

function parseMlValue(name: string): number {
  const match = name.match(/(\d*\.?\d+)\s*mL/i)
  return match ? parseFloat(match[1]) : Number.POSITIVE_INFINITY
}

function byMlSize(
  a: HttpTypes.StoreProductCategory,
  b: HttpTypes.StoreProductCategory
) {
  return parseMlValue(a.name) - parseMlValue(b.name)
}

export function ShopMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const vialCategories = categories
    .filter((c) => c.name.toLowerCase().includes("vial"))
    .sort(byMlSize)
  const syringeCategories = categories
    .filter((c) => c.name.toLowerCase().includes("syringe"))
    .sort(byMlSize)

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
