import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Dosestash terms of service.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-gray-600">
        This page is a placeholder. Add your actual terms of service here
        before launch.
      </p>
    </div>
  )
}
