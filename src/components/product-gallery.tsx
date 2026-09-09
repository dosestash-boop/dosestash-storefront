"use client"

import { useState } from "react"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"

export function ProductGallery({
  images,
  title,
}: {
  images: HttpTypes.StoreProductImage[]
  title: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        No image available
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={active.url}
          alt={title}
          width={1000}
          height={1000}
          priority
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={index === activeIndex}
              className={`aspect-square overflow-hidden rounded-md border-2 ${
                index === activeIndex
                  ? "border-gray-900"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                width={200}
                height={200}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
