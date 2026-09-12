import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Dosestash privacy policy.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-gray-600">
        This page is a placeholder. Add your actual privacy policy here
        before launch.
      </p>
    </div>
  )
}
