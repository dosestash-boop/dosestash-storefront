import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductByHandle, listProducts } from "@/lib/data/products"
import { getProductPriceInfo } from "@/lib/product-price"
import { ProductGallery } from "@/components/product-gallery"
import { ProductVariants } from "@/components/product-variants"
import { ProductGrid } from "@/components/product-grid"

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const { product } = await getProductByHandle(handle)

  if (!product) {
    return { title: "Product Not Found" }
  }

  const description =
    product.description ?? `Shop ${product.title} at Dosestash.`

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const { product } = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  const priceInfo = getProductPriceInfo(product)
  const categoryId = product.categories?.[0]?.id

  const related = categoryId
    ? (await listProducts({ categoryId, limit: 5 })).products.filter(
        (p) => p.id !== product.id
      )
    : []

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.images?.map((img) => img.url) ?? undefined,
    sku: product.variants?.[0]?.sku ?? undefined,
    offers: priceInfo
      ? {
          "@type": "Offer",
          price: priceInfo.minCalculatedPrice,
          priceCurrency: priceInfo.currencyCode.toUpperCase(),
          availability: (product.variants ?? []).some(
            (v) => v.manage_inventory === false || (v.inventory_quantity ?? 0) > 0
          )
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        }
      : undefined,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-gray-900">
              Shop All
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} title={product.title} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {product.title}
          </h1>
          {product.subtitle && (
            <p className="mt-1 text-sm text-gray-500">{product.subtitle}</p>
          )}

          <div className="mt-4">
            <ProductVariants product={product} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900">
            You May Also Like
          </h2>
          <ProductGrid products={related.slice(0, 4)} />
        </section>
      )}
    </div>
  )
}
