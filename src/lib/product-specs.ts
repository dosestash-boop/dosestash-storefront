export type ProductSpecs = {
  size: string
  type: "Vial" | "Syringe"
  capacity: number
}

/**
 * Derives structured specs from a title like "3mL Vial Storage Case — 5
 * Vials" or ".3mL Syringe Storage Case — 7 Syringes", since these facts
 * aren't otherwise stored anywhere in Medusa for this catalog.
 */
export function getProductSpecs(title: string): ProductSpecs | null {
  const sizeMatch = title.match(/^(\.?\d+mL)\s+(Vial|Syringe)\s+Storage Case/i)
  const qtyMatch = title.match(/—\s*(\d+)\s+(?:Vials|Syringes)/i)
  if (!sizeMatch || !qtyMatch) return null

  return {
    size: sizeMatch[1],
    type: sizeMatch[2] as "Vial" | "Syringe",
    capacity: Number(qtyMatch[1]),
  }
}
