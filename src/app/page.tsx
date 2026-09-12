import type { ReactNode } from "react"
import Link from "next/link"
import { ProductTile } from "@/components/product-tile"
import { VialsTileArt, SyringesTileArt } from "@/components/category-art"
import {
  listFeaturedProducts,
  listCategories,
  getMostStockedCategory,
  getCategoryStartingPrice,
  getCategoryPriceRange,
} from "@/lib/data/products"
import { groupCategoriesByLine } from "@/lib/category-groups"

export const revalidate = 60

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}

function StackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M2 13l10 5 10-5" />
      <path d="M2 18l10 5 10-5" />
    </svg>
  )
}

function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
    </svg>
  )
}

function FeatureItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2 text-center sm:py-0">
      <span className="text-accent">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
  )
}

function HeroPhoto({
  art,
  label,
  priceRange,
}: {
  art: ReactNode
  label: string
  priceRange?: string | null
}) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-50">
      <div className="flex h-full w-full items-center justify-center p-6">
        {art}
      </div>
      <span className="absolute bottom-3 left-3 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm">
        {label}
      </span>
      {priceRange && (
        <span className="absolute bottom-3 right-3 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground shadow-sm">
          {priceRange}
        </span>
      )}
    </div>
  )
}

export default async function Home() {
  const [{ products }, categories] = await Promise.all([
    listFeaturedProducts({ limit: 4 }),
    listCategories(),
  ])
  const { vialCategories, syringeCategories } =
    groupCategoriesByLine(categories)
  const [primaryVialCategory, primarySyringeCategory] = await Promise.all([
    getMostStockedCategory(vialCategories),
    getMostStockedCategory(syringeCategories),
  ])
  const [
    vialStartingPrice,
    syringeStartingPrice,
    vialPriceRange,
    syringePriceRange,
  ] = await Promise.all([
    primaryVialCategory
      ? getCategoryStartingPrice(primaryVialCategory.id)
      : null,
    primarySyringeCategory
      ? getCategoryStartingPrice(primarySyringeCategory.id)
      : null,
    primaryVialCategory ? getCategoryPriceRange(primaryVialCategory.id) : null,
    primarySyringeCategory
      ? getCategoryPriceRange(primarySyringeCategory.id)
      : null,
  ])

  return (
    <div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-8 lg:py-16">
        <div className="text-center">
          <h1 className="font-heading text-[clamp(2.6rem,4.2vw,3.6rem)] leading-[1.05] tracking-[-0.015em] font-medium text-gray-900">
            Every vial and syringe in its place.
          </h1>

          <p className="mx-auto mt-[22px] max-w-[500px] text-lg text-gray-500">
            Purpose-built storage for insulin, peptides, and prescribed
            hormone therapy. Keep your supply organized and easy to grab.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryVialCategory && (
              <Link
                href={`/products?category_id=${primaryVialCategory.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Shop Vial Cases
                {vialStartingPrice && (
                  <span className="ml-1.5 font-normal text-accent-foreground/70">
                    from {vialStartingPrice}
                  </span>
                )}
              </Link>
            )}
            {primarySyringeCategory && (
              <Link
                href={`/products?category_id=${primarySyringeCategory.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-accent px-6 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Shop Syringe Cases
                {syringeStartingPrice && (
                  <span className="ml-1.5 font-normal opacity-70">
                    from {syringeStartingPrice}
                  </span>
                )}
              </Link>
            )}
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Ships in 2–3 days · Plain packaging · Built to protect your vials
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <HeroPhoto
            art={<VialsTileArt className="h-full w-full" />}
            label="Vial cases"
            priceRange={vialPriceRange}
          />
          <HeroPhoto
            art={<SyringesTileArt className="h-full w-full" />}
            label="Syringe cases"
            priceRange={syringePriceRange}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-gray-100 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3 sm:divide-x sm:divide-gray-100">
          <FeatureItem
            icon={<BoxIcon className="h-6 w-6" />}
            label="Vials & syringes"
          />
          <FeatureItem
            icon={<StackIcon className="h-6 w-6" />}
            label="Fits your supply"
          />
          <FeatureItem
            icon={<SnowflakeIcon className="h-6 w-6" />}
            label="Freezer, fridge, or travel"
          />
        </div>
      </div>

      {products.length > 0 && (
        <div className="mx-auto max-w-7xl border-t border-gray-100 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-gray-900">
              Shop the Collection
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Shop All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
