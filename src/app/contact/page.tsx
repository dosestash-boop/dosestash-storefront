import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Dosestash.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
        Contact
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Have a question? Send us a message and we&apos;ll get back to you.
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  )
}
