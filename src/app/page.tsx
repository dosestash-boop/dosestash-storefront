import type { ReactNode } from "react"
import Link from "next/link"
import { LogoIcon, Wordmark } from "@/components/logo"
import { ProductTile } from "@/components/product-tile"
import { listFeaturedProducts } from "@/lib/data/products"

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
      <span className="text-teal">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
  )
}

export default async function Home() {
  const { products } = await listFeaturedProducts({ limit: 4 })

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-12 lg:px-8">
        <div className="flex items-center gap-4">
          <LogoIcon size={72} />
          <Wordmark className="text-[45px] font-medium tracking-tight" />
        </div>

        <h1 className="mt-8 text-xl font-medium text-gray-900 sm:text-[22px]">
          Neatly stored, easy to find.
        </h1>

        <p className="mx-auto mt-3 max-w-[300px] text-sm text-gray-500 sm:max-w-[440px]">
          Compact, sleek storage for your vials and syringes — built to keep a
          few or a few hundred neatly organized.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-teal px-6 text-sm font-medium text-teal-foreground hover:bg-teal/90"
        >
          Shop cases
        </Link>

        <div className="mt-10 grid w-full max-w-[640px] grid-cols-2 gap-4">
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
