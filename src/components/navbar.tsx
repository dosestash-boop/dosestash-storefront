import Link from "next/link"
import { listCategories } from "@/lib/data/products"
import { MobileMenu } from "./mobile-menu"

export async function Navbar() {
  const categories = await listCategories()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <MobileMenu categories={categories} />
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
            Dosestash
          </Link>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 sm:flex"
        >
          <Link
            href="/products"
            className="text-sm font-medium text-gray-900 hover:text-gray-600"
          >
            Shop All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category_id=${category.id}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="w-11 sm:hidden" aria-hidden="true" />
      </div>
    </header>
  )
}
