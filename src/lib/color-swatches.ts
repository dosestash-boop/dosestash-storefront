/**
 * Polymaker Panchroma Matte PLA color codes - keep the option value
 * spelling here in sync with whatever's actually set in Medusa, since
 * swatch/shipping lookups match on exact string equality.
 */
export const COLOR_SWATCHES: Record<string, string> = {
  "Charcoal Black": "#2F2E30",
  "Ash Grey": "#485155",
  "Fossil Grey": "#8A8C94",
  "Artic Teal": "#61BCC3",
  "Electric Indigo": "#6858A9",
  "Lava Red": "#ED2F2E",
  "Lotus Pink": "#DD76C0",
  "Sakura Pink": "#EAADBD",
  "Sapphire Blue": "#0163A6",
  "Sky Blue": "#1AC5FC",
  "Savannah Yellow": "#F3C432",
  "Army Blue": "#2E4462",
  "Muted Red": "#D84B2E",
  "Lavender Purple": "#9572BF",
  "Seafoam Green": "#7DD4BE",
  "Raspberry Blue": "#5472D0",
  "Wine Burgundy": "#753E4C",
  "Muted Terracotta": "#C06443",
}

/** Colors that ship in 2-3 days; everything else ships in 2-5 days. */
export const CORE_SHIPPING_COLORS = ["Charcoal Black", "Ash Grey", "Fossil Grey"]
