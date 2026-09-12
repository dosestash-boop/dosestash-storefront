import type { ReactNode } from "react"
import Link from "next/link"
import { LogoIcon, Wordmark } from "@/components/logo"
import { ProductTile } from "@/components/product-tile"
import { VialsTileArt, SyringesTileArt } from "@/components/category-art"
import {
  listFeaturedProducts,
  listCategories,
  getMostStockedCategory,
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

function FeatureCard({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 px-4 py-6 text-center">
      <span className="text-accent">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
  )
}

function HeroPhoto({ art, label }: { art: ReactNode; label: string }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-50">
      <div className="flex h-full w-full items-center justify-center p-10">
        {art}
      </div>
      <span className="absolute bottom-3 left-3 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm">
        {label}
      </span>
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

  return (
    <div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <LogoIcon size={56} />
            <Wordmark className="text-[32px] font-medium tracking-tight" />
          </div>

          <h1 className="mt-8 text-3xl font-medium text-gray-900 sm:text-4xl">
            Neatly stored, easy to find.
          </h1>

          <p className="mt-4 max-w-[440px] text-base text-gray-500">
            Compact, sleek storage for your vials and syringes — built to
            keep a few or a few hundred neatly organized.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryVialCategory && (
              <Link
                href={`/products?category_id=${primaryVialCategory.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Shop Vials
              </Link>
            )}
            {primarySyringeCategory && (
              <Link
                href={`/products?category_id=${primarySyringeCategory.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-gray-900 px-6 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
              >
                Shop Syringes
              </Link>
            )}
          </div>

          <div className="mt-10 grid max-w-[440px] grid-cols-2 gap-4 border-t border-gray-100 pt-8">
            <FeatureCard
              icon={<BoxIcon className="h-6 w-6" />}
              label="Vials & syringes"
            />
            <FeatureCard
              icon={<StackIcon className="h-6 w-6" />}
              label="Scales with your supply"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <HeroPhoto
            art={<VialsTileArt className="h-full w-full" />}
            label="Vial cases"
          />
          <HeroPhoto
            art={<SyringesTileArt className="h-full w-full" />}
            label="Syringe cases"
          />
        </div>
      </div>

      {products.length > 0 && (
        <div className="mx-auto max-w-7xl border-t border-gray-100 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
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
