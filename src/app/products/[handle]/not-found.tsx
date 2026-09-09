import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Product not found
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        This product may have been removed or the link is incorrect.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-white hover:bg-gray-700"
      >
        Browse All Products
      </Link>
    </div>
  )
}
