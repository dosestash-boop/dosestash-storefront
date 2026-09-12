"use client"

import { useActionState } from "react"
import Script from "next/script"
import { submitContactForm, type ContactFormState } from "@/app/contact/actions"

const initialState: ContactFormState = { status: "idle" }
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState
  )

  if (state.status === "success") {
    return (
      <p className="rounded-md bg-accent-soft px-4 py-3 text-sm text-gray-900">
        Thanks for reaching out! We&apos;ll get back to you soon.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          async
          defer
        />
      )}

      {/* Honeypot field - hidden from real visitors, catches simple bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-900"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-accent focus:outline-none"
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  )
}
