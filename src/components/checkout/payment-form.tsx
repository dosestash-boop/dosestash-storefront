"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1e2420",
      "::placeholder": { color: "#9c9280" },
    },
    invalid: {
      color: "#dc2626",
    },
  },
}

export function PaymentForm({
  clientSecret,
  billingDetails,
  onSuccess,
  onError,
  submitting,
  onSubmittingChange,
}: {
  clientSecret: string
  billingDetails: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  onSuccess: () => void
  onError: (message: string) => void
  submitting: boolean
  onSubmittingChange: (submitting: boolean) => void
}) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-red-600">
        Payment isn&apos;t configured yet. Set NEXT_PUBLIC_STRIPE_KEY to
        enable checkout.
      </p>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner
        clientSecret={clientSecret}
        billingDetails={billingDetails}
        onSuccess={onSuccess}
        onError={onError}
        submitting={submitting}
        onSubmittingChange={onSubmittingChange}
      />
    </Elements>
  )
}

function PaymentFormInner({
  clientSecret,
  billingDetails,
  onSuccess,
  onError,
  submitting,
  onSubmittingChange,
}: {
  clientSecret: string
  billingDetails: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  onSuccess: () => void
  onError: (message: string) => void
  submitting: boolean
  onSubmittingChange: (submitting: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardComplete, setCardComplete] = useState(false)

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    onSubmittingChange(true)

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      }
    )

    if (error) {
      onError(error.message ?? "Your card was declined. Please try another payment method.")
      onSubmittingChange(false)
      return
    }

    // Medusa's Stripe provider authorizes with manual capture by default, so
    // a successful confirmation lands on "requires_capture" rather than
    // "succeeded" — the order is still captured/finalized via cart.complete().
    const confirmedStatuses = ["succeeded", "processing", "requires_capture"]
    if (paymentIntent && confirmedStatuses.includes(paymentIntent.status)) {
      onSuccess()
    } else {
      onError("Payment could not be confirmed. Please try again.")
      onSubmittingChange(false)
    }
  }

  return (
    <div>
      <div className="rounded-md border border-gray-200 px-3 py-3">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={!stripe || !cardComplete || submitting}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Placing order…" : "Place Order"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        100% secure checkout &middot; Your card details are processed by
        Stripe and never touch our servers.
      </p>
    </div>
  )
}
