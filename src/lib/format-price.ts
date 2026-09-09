/**
 * Medusa stores/returns amounts already in the currency's display unit
 * (e.g. 49.99, not 4999 cents) — never divide by 100 here.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}
