const MM_PER_INCH = 25.4
const GRAMS_PER_OUNCE = 28.3495

export function formatMillimeters(mm: number): string {
  return `${mm} mm (${(mm / MM_PER_INCH).toFixed(1)}")`
}

export function formatGrams(g: number): string {
  return `${g} g (${(g / GRAMS_PER_OUNCE).toFixed(1)} oz)`
}
