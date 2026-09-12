import type { HttpTypes } from "@medusajs/types"

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

export function groupCategoriesByLine(
  categories: HttpTypes.StoreProductCategory[]
): {
  vialCategories: HttpTypes.StoreProductCategory[]
  syringeCategories: HttpTypes.StoreProductCategory[]
} {
  return {
    vialCategories: categories
      .filter((c) => c.name.toLowerCase().includes("vial"))
      .sort(byMlSize),
    syringeCategories: categories
      .filter((c) => c.name.toLowerCase().includes("syringe"))
      .sort(byMlSize),
  }
}
