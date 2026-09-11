import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { getProductPriceInfo } from "@/lib/product-price"
import { formatPrice } from "@/lib/format-price"
import { ProductArtPlaceholder } from "./product-art-placeholder"

export function ProductTile({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const priceInfo = getProductPriceInfo(product)

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100"
    >
      <div className="aspect-square w-full overflow-hidden">
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
          <ProductArtPlaceholder title={product.title} className="p-8" />
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
          {product.title}
        </h3>
        {priceInfo && (
          <p className="mt-1 text-sm">
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
  )
}
