"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import type { HttpTypes } from "@medusajs/types"
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/data/cart"

type CartContextValue = {
  cart: HttpTypes.StoreCart | null
  itemCount: number
  isOpen: boolean
  isPending: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity?: number) => void
  updateItem: (lineItemId: string, quantity: number) => void
  removeItem: (lineItemId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [optimisticBump, setOptimisticBump] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getCart().then(setCart)
  }, [])

  const itemCount =
    (cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0) +
    optimisticBump

  const addItem = (variantId: string, quantity = 1) => {
    setOptimisticBump((n) => n + quantity)
    setIsOpen(true)
    startTransition(async () => {
      const updated = await addToCart({ variantId, quantity })
      setCart(updated)
      setOptimisticBump(0)
    })
  }

  const updateItem = (lineItemId: string, quantity: number) => {
    startTransition(async () => {
      const updated = await updateCartItem({ lineItemId, quantity })
      setCart(updated)
    })
  }

  const removeItem = (lineItemId: string) => {
    startTransition(async () => {
      const updated = await removeCartItem({ lineItemId })
      setCart(updated)
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isOpen,
        isPending,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return ctx
}
