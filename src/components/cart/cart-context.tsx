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
  cartError: string | null
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity?: number) => void
  updateItem: (lineItemId: string, quantity: number) => void
  removeItem: (lineItemId: string) => void
  setCartData: (cart: HttpTypes.StoreCart) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [optimisticBump, setOptimisticBump] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [cartError, setCartError] = useState<string | null>(null)

  useEffect(() => {
    getCart().then(setCart)
  }, [])

  useEffect(() => {
    if (!cartError) return
    const timeout = setTimeout(() => setCartError(null), 5000)
    return () => clearTimeout(timeout)
  }, [cartError])

  const itemCount =
    (cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0) +
    optimisticBump

  const addItem = (variantId: string, quantity = 1) => {
    setOptimisticBump((n) => n + quantity)
    setIsOpen(true)
    startTransition(async () => {
      try {
        const updated = await addToCart({ variantId, quantity })
        setCart(updated)
        setCartError(null)
      } catch {
        setCartError("Couldn't add that to your cart. Please try again.")
      } finally {
        setOptimisticBump(0)
      }
    })
  }

  const updateItem = (lineItemId: string, quantity: number) => {
    startTransition(async () => {
      try {
        const updated = await updateCartItem({ lineItemId, quantity })
        setCart(updated)
        setCartError(null)
      } catch {
        setCartError("Couldn't update that item. Please try again.")
      }
    })
  }

  const removeItem = (lineItemId: string) => {
    startTransition(async () => {
      try {
        const updated = await removeCartItem({ lineItemId })
        setCart(updated)
        setCartError(null)
      } catch {
        setCartError("Couldn't remove that item. Please try again.")
      }
    })
  }

  const clearCart = () => setCart(null)

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isOpen,
        isPending,
        cartError,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        setCartData: setCart,
        clearCart,
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
