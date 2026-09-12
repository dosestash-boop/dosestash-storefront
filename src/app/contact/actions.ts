"use server"

import { headers } from "next/headers"
import { sendContactEmail } from "@/lib/mail"
import { verifyTurnstileToken } from "@/lib/turnstile"

export type ContactFormState = {
  status: "idle" | "success" | "error"
  error?: string
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()
  const honeypot = String(formData.get("company") ?? "").trim()

  // Honeypot field - real visitors never fill this in, bots often do.
  if (honeypot) {
    return { status: "success" }
  }

  if (!name || !email || !message) {
    return { status: "error", error: "Please fill in all fields." }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", error: "Please enter a valid email address." }
  }

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "")
  const remoteIp = (await headers()).get("x-forwarded-for") ?? undefined
  const isHuman = await verifyTurnstileToken(turnstileToken, remoteIp)
  if (!isHuman) {
    return {
      status: "error",
      error: "Verification failed. Please try again.",
    }
  }

  try {
    await sendContactEmail({ name, email, message })
    return { status: "success" }
  } catch {
    return {
      status: "error",
      error: "Something went wrong sending your message. Please try again.",
    }
  }
}
