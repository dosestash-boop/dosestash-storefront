import Medusa from "@medusajs/js-sdk"

const isServer = typeof window === "undefined"

const backendUrl = isServer
  ? process.env.MEDUSA_BACKEND_URL_INTERNAL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: backendUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
