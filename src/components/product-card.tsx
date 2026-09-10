import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { getProductPriceInfo } from "@/lib/product-price"
import { formatPrice } from "@/lib/format-price"

export function ProductCard({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const priceInfo = getProductPriceInfo(product)

  return (
    <article className="group">
      <Link
        href={`/products/${product.handle}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              width={600}
              height={600}
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
            {product.title}
          </h3>
          {priceInfo && (
            <p className="text-sm">
              {priceInfo.isOnSale && (
                <span className="mr-2 text-gray-400 line-through">
                  {formatPrice(
                    priceInfo.minOriginalPrice,
                    priceInfo.currencyCode
                  )}
                </span>
              )}
              <span
                className={
                  priceInfo.isOnSale
                    ? "font-bold text-red-600"
                    : "font-medium text-gray-700"
                }
              >
                {priceInfo.isRange ? "From " : ""}
                {formatPrice(
                  priceInfo.minCalculatedPrice,
                  priceInfo.currencyCode
                )}
              </span>
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
