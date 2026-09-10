import Link from "next/link"
import { LogoIcon, Wordmark } from "./logo"
import { CartButton } from "./cart/cart-button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Dosestash home"
          className="flex items-center gap-2"
        >
          <LogoIcon size={28} />
          <Wordmark className="text-lg font-medium tracking-tight" />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="flex min-h-11 items-center text-sm font-medium text-gray-900 hover:text-teal"
          >
            Shop
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
