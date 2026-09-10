import Link from "next/link"
import { listCategories } from "@/lib/data/products"

export async function Footer() {
  const categories = await listCategories()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Dosestash
            </span>
          </div>

          <nav aria-label="Footer shop navigation">
            <h3 className="text-sm font-bold text-gray-900">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Shop All
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category_id=${category.id}`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            &copy; {year} Dosestash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
