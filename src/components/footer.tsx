import Link from "next/link"
import { listCategories } from "@/lib/data/products"
import { groupCategoriesByLine } from "@/lib/category-groups"
import { LogoIcon, Wordmark } from "./logo"

export async function Footer() {
  const categories = await listCategories()
  const { vialCategories, syringeCategories } =
    groupCategoriesByLine(categories)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-[2fr_0.8fr_0.8fr_0.8fr]">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon size={28} />
              <Wordmark className="text-lg font-medium tracking-tight" />
            </Link>
            <p className="mt-3 max-w-[260px] text-sm text-gray-600">
              Purpose-built storage for insulin, peptides, and prescribed
              hormone therapy.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent/80"
            >
              Shop All
            </Link>
          </div>

          <nav aria-label="Footer company navigation">
            <h3 className="text-sm font-bold text-gray-900">Company</h3>
            <ul className="mt-1 space-y-1">
              <li>
                <Link
                  href="/reviews"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer vial navigation">
            <h3 className="text-sm font-bold text-gray-900">Vials</h3>
            <ul className="mt-1 space-y-1">
              {vialCategories.map((category) => (
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

          <nav aria-label="Footer syringe navigation">
            <h3 className="text-sm font-bold text-gray-900">Syringes</h3>
            <ul className="mt-1 space-y-1">
              {syringeCategories.map((category) => (
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
