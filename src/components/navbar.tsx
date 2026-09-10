import Link from "next/link"
import { LogoIcon, Wordmark } from "./logo"
import { CartButton } from "./cart/cart-button"
import { ShopMenu } from "./shop-menu"
import { MobileMenu } from "./mobile-menu"
import { listCategories } from "@/lib/data/products"

export async function Navbar() {
  const categories = await listCategories()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <MobileMenu categories={categories} />
          <Link
            href="/"
            aria-label="Dosestash home"
            className="flex items-center gap-2"
          >
            <LogoIcon size={28} />
            <Wordmark className="text-lg font-medium tracking-tight" />
          </Link>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 sm:flex"
        >
          <ShopMenu categories={categories} />
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
        </div>
      </div>
    </header>
  )
}
