import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { CategoryDropdown } from "./category-dropdown"
import { groupCategoriesByLine } from "@/lib/category-groups"

export function ShopMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const { vialCategories, syringeCategories } =
    groupCategoriesByLine(categories)

  return (
    <>
      <CategoryDropdown label="Vials" categories={vialCategories} />
      <CategoryDropdown label="Syringes" categories={syringeCategories} />
      <Link
        href="/products"
        className="flex min-h-11 items-center text-base font-medium text-gray-900 hover:text-accent"
      >
        Shop All
      </Link>
    </>
  )
}
