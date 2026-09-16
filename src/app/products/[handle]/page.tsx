import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductByHandle, listProducts } from "@/lib/data/products"
import { getProductPriceInfo } from "@/lib/product-price"
import { getProductThumbnail } from "@/lib/product-image"
import { formatMillimeters, formatGrams } from "@/lib/format-dimensions"
import {
  getProductReviewLine,
  getReviewsForProductTitle,
} from "@/lib/reviews"
import { ProductGallery } from "@/components/product-gallery"
import { ProductVariants } from "@/components/product-variants"
import { ProductGrid } from "@/components/product-grid"
import { ReviewCard } from "@/components/review-card"
import { StarRow } from "@/components/star-row"

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
  const thumbnail = getProductThumbnail(product)

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: thumbnail ? [thumbnail] : undefined,
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

  const productReviews = getReviewsForProductTitle(product.title)
  const reviewLine = getProductReviewLine(product.title)
  const hasDimensions =
    product.width != null &&
    product.length != null &&
    product.height != null &&
    product.weight != null
  const reviewAggregate =
    productReviews.length > 0
      ? {
          count: productReviews.length,
          average:
            productReviews.reduce((sum, r) => sum + r.rating, 0) /
            productReviews.length,
        }
      : null

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
    ...(reviewAggregate && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewAggregate.average,
        reviewCount: reviewAggregate.count,
      },
    }),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
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
          <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
            {product.title}
          </h1>
          {product.subtitle && (
            <p className="mt-1 text-sm text-gray-500">{product.subtitle}</p>
          )}

          {reviewAggregate && (
            <Link
              href="#reviews"
              className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <StarRow
                rating={Math.round(reviewAggregate.average)}
                className="h-3.5 w-3.5"
              />
              <span className="font-medium text-gray-900">
                {reviewAggregate.average.toFixed(1)}
              </span>
              <span>
                ({reviewAggregate.count}{" "}
                {reviewAggregate.count === 1 ? "review" : "reviews"})
              </span>
            </Link>
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

          {hasDimensions && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Specifications
              </h2>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Width</dt>
                <dd className="text-gray-900">
                  {formatMillimeters(product.width!)}
                </dd>
                <dt className="text-gray-500">Length</dt>
                <dd className="text-gray-900">
                  {formatMillimeters(product.length!)}
                </dd>
                <dt className="text-gray-500">Thickness</dt>
                <dd className="text-gray-900">
                  {formatMillimeters(product.height!)}
                </dd>
                <dt className="text-gray-500">Weight</dt>
                <dd className="text-gray-900">{formatGrams(product.weight!)}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>

      {productReviews.length > 0 && (
        <section
          id="reviews"
          className="mt-16 scroll-mt-20 border-t border-gray-100 pt-10"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-gray-900">
              What customers are saying
            </h2>
            {reviewLine && (
              <Link
                href={`/reviews?line=${encodeURIComponent(reviewLine)}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                See all reviews
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productReviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="font-heading mb-6 text-2xl font-medium tracking-tight text-gray-900">
            You May Also Like
          </h2>
          <ProductGrid products={related.slice(0, 4)} />
        </section>
      )}
    </div>
  )
}
