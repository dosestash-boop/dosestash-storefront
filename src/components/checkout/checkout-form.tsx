"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useCart } from "@/components/cart/cart-context"
import {
  updateCartDetails,
  addShippingMethod,
  listPaymentProviders,
  initiatePaymentSession,
  completeCart,
} from "@/lib/data/cart"
import { formatPrice } from "@/lib/format-price"
import { US_STATES } from "@/lib/us-states"
import { PaymentForm } from "./payment-form"
import { OrderSummary } from "./order-summary"

type Step = "address" | "delivery" | "payment"

const inputClass =
  "mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none"
const labelClass = "block text-sm font-medium text-gray-900"

function stepStatus(step: Step, current: Step): "done" | "active" | "upcoming" {
  const order: Step[] = ["address", "delivery", "payment"]
  const stepIndex = order.indexOf(step)
  const currentIndex = order.indexOf(current)
  if (stepIndex < currentIndex) return "done"
  if (stepIndex === currentIndex) return "active"
  return "upcoming"
}

function SectionHeader({
  number,
  title,
  status,
  onEdit,
}: {
  number: number
  title: string
  status: "done" | "active" | "upcoming"
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-semibold ${
            status === "upcoming"
              ? "bg-gray-100 text-gray-400"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {status === "done" ? "✓" : number}
        </span>
        <h2
          className={`text-base font-semibold ${
            status === "upcoming" ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
      </div>
      {status === "done" && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
        </button>
      )}
    </div>
  )
}

export function CheckoutForm({
  cart: initialCart,
  shippingOptions,
}: {
  cart: HttpTypes.StoreCart
  shippingOptions: HttpTypes.StoreCartShippingOption[]
}) {
  const router = useRouter()
  const { setCartData, clearCart } = useCart()
  const [cart, setCart] = useState(initialCart)
  const [step, setStep] = useState<Step>(
    cart.shipping_methods?.length
      ? "payment"
      : cart.shipping_address?.address_1
        ? "delivery"
        : "address",
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const [form, setForm] = useState({
    email: cart.email ?? "",
    first_name: cart.shipping_address?.first_name ?? "",
    last_name: cart.shipping_address?.last_name ?? "",
    address_1: cart.shipping_address?.address_1 ?? "",
    address_2: cart.shipping_address?.address_2 ?? "",
    city: cart.shipping_address?.city ?? "",
    province: cart.shipping_address?.province ?? "",
    postal_code: cart.shipping_address?.postal_code ?? "",
    phone: cart.shipping_address?.phone ?? "",
  })

  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState(
    cart.shipping_methods?.[0]?.shipping_option_id ??
      shippingOptions[0]?.id ??
      "",
  )

  const updateForm = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmitAddress = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const updated = await updateCartDetails({
          email: form.email,
          shippingAddress: {
            first_name: form.first_name,
            last_name: form.last_name,
            address_1: form.address_1,
            address_2: form.address_2 || undefined,
            city: form.city,
            province: form.province,
            postal_code: form.postal_code,
            country_code: "us",
            phone: form.phone || undefined,
          },
        })
        setCart(updated)
        setCartData(updated)
        setStep("delivery")
      } catch {
        setError(
          "Couldn't save your address. Please check the fields and try again.",
        )
      }
    })
  }

  const handleSubmitDelivery = () => {
    if (!selectedShippingOptionId) return
    setError(null)
    startTransition(async () => {
      try {
        const updated = await addShippingMethod({
          optionId: selectedShippingOptionId,
        })
        setCart(updated)
        setCartData(updated)

        const providers = await listPaymentProviders(updated.region_id!)
        const stripeProvider = providers.find((p) => p.id.includes("stripe"))
        if (!stripeProvider) {
          setError(
            "No payment method is available right now. Please contact us.",
          )
          return
        }

        const existingSession =
          updated.payment_collection?.payment_sessions?.find(
            (s) => s.provider_id === stripeProvider.id,
          )
        const secretFromExisting = existingSession?.data?.client_secret as
          string | undefined

        if (secretFromExisting) {
          setClientSecret(secretFromExisting)
          setStep("payment")
          return
        }

        const { payment_collection } = await initiatePaymentSession({
          cart: updated,
          providerId: stripeProvider.id,
        })
        const session = payment_collection.payment_sessions?.find(
          (s) => s.provider_id === stripeProvider.id,
        )
        const secret = session?.data?.client_secret as string | undefined
        if (!secret) {
          setError("Couldn't start payment. Please try again.")
          return
        }
        setClientSecret(secret)
        setStep("payment")
      } catch {
        setError("Couldn't save your shipping method. Please try again.")
      }
    })
  }

  const handlePaymentSuccess = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await completeCart()
        if (result.type === "order") {
          clearCart()
          router.push(`/order-confirmation/${result.order.id}`)
        } else {
          setError(
            result.error?.message ??
              "Something went wrong placing your order. Please try again.",
          )
          setSubmittingPayment(false)
        }
      } catch {
        setError("Something went wrong placing your order. Please try again.")
        setSubmittingPayment(false)
      }
    })
  }

  const selectedShippingOption = shippingOptions.find(
    (o) => o.id === selectedShippingOptionId,
  )

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Step 1: Contact & shipping address */}
        <section className="rounded-lg border border-gray-100 bg-surface p-5">
          <SectionHeader
            number={1}
            title="Contact & shipping address"
            status={stepStatus("address", step)}
            onEdit={() => setStep("address")}
          />

          {step === "address" && (
            <form onSubmit={handleSubmitAddress} className="mt-5 space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="first_name"
                    required
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={(e) => updateForm("first_name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="last_name"
                    required
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={(e) => updateForm("last_name", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address_1" className={labelClass}>
                  Address
                </label>
                <input
                  id="address_1"
                  required
                  autoComplete="address-line1"
                  value={form.address_1}
                  onChange={(e) => updateForm("address_1", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="address_2" className={labelClass}>
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  id="address_2"
                  autoComplete="address-line2"
                  value={form.address_2}
                  onChange={(e) => updateForm("address_2", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="city"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="province" className={labelClass}>
                    State
                  </label>
                  <select
                    id="province"
                    required
                    autoComplete="address-level1"
                    value={form.province}
                    onChange={(e) => updateForm("province", e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="postal_code" className={labelClass}>
                    ZIP code
                  </label>
                  <input
                    id="postal_code"
                    required
                    autoComplete="postal-code"
                    value={form.postal_code}
                    onChange={(e) => updateForm("postal_code", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {isPending ? "Saving…" : "Continue to delivery"}
              </button>
            </form>
          )}

          {stepStatus("address", step) === "done" && (
            <p className="mt-4 text-sm text-gray-600">
              {form.first_name} {form.last_name}, {form.address_1}
              {form.address_2 ? `, ${form.address_2}` : ""}, {form.city},{" "}
              {form.province.toUpperCase()} {form.postal_code}
            </p>
          )}
        </section>

        {/* Step 2: Delivery method */}
        <section className="rounded-lg border border-gray-100 bg-surface p-5">
          <SectionHeader
            number={2}
            title="Delivery method"
            status={stepStatus("delivery", step)}
            onEdit={() => setStep("delivery")}
          />

          {step === "delivery" && (
            <div className="mt-5 space-y-3">
              <fieldset className="space-y-2">
                <legend className="sr-only">Shipping method</legend>
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-between rounded-md border px-4 py-2.5 text-sm ${
                      selectedShippingOptionId === option.id
                        ? "border-gray-900"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping_option"
                        value={option.id}
                        checked={selectedShippingOptionId === option.id}
                        onChange={() => setSelectedShippingOptionId(option.id)}
                      />
                      <span className="font-medium text-gray-900">
                        {option.name}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      {formatPrice(option.amount, cart.currency_code)}
                    </span>
                  </label>
                ))}
              </fieldset>

              <button
                type="button"
                onClick={handleSubmitDelivery}
                disabled={isPending || !selectedShippingOptionId}
                className="flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {isPending ? "Saving…" : "Continue to payment"}
              </button>
            </div>
          )}

          {stepStatus("delivery", step) === "done" &&
            selectedShippingOption && (
              <p className="mt-4 text-sm text-gray-600">
                {selectedShippingOption.name} &middot;{" "}
                {formatPrice(selectedShippingOption.amount, cart.currency_code)}
              </p>
            )}
        </section>

        {/* Step 3: Payment */}
        <section className="rounded-lg border border-gray-100 bg-surface p-5">
          <SectionHeader
            number={3}
            title="Payment"
            status={stepStatus("payment", step)}
          />

          {step === "payment" && clientSecret && (
            <div className="mt-5">
              <PaymentForm
                clientSecret={clientSecret}
                billingDetails={{
                  name: `${form.first_name} ${form.last_name}`,
                  email: form.email,
                  address: {
                    line1: form.address_1,
                    line2: form.address_2 || undefined,
                    city: form.city,
                    state: form.province,
                    postal_code: form.postal_code,
                    country: "US",
                  },
                }}
                onSuccess={handlePaymentSuccess}
                onError={setError}
                submitting={submittingPayment || isPending}
                onSubmittingChange={setSubmittingPayment}
              />
            </div>
          )}
        </section>
      </div>

      <div className="lg:order-last">
        <OrderSummary cart={cart} />
      </div>
    </div>
  )
}
