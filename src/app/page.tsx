import type { ReactNode } from "react"
import Link from "next/link"
import { LogoIcon, Wordmark } from "@/components/logo"

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}

function StackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M2 13l10 5 10-5" />
      <path d="M2 18l10 5 10-5" />
    </svg>
  )
}

function FeatureCard({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 px-4 py-6 text-center">
      <span className="text-teal">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
  )
}

export default function Home() {
  return (
    <div className="mx-auto flex max-w-[380px] flex-col items-center px-4 py-16 text-center sm:py-24">
      <div className="flex items-center gap-3">
        <LogoIcon size={60} />
        <Wordmark className="text-[30px] font-medium tracking-tight" />
      </div>

      <h1 className="mt-8 text-xl font-medium text-gray-900 sm:text-[22px]">
        Neatly stored, easy to find.
      </h1>

      <p className="mx-auto mt-3 max-w-[300px] text-sm text-gray-500">
        Compact, sleek storage for your vials and syringes — built to keep a
        few or a few hundred neatly organized.
      </p>

      <Link
        href="/products"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-teal px-6 text-sm font-medium text-teal-foreground hover:bg-teal/90"
      >
        Shop cases
      </Link>

      <div className="mt-12 grid w-full grid-cols-2 gap-4">
        <FeatureCard
          icon={<BoxIcon className="h-6 w-6" />}
          label="Vials & syringes"
        />
        <FeatureCard
          icon={<StackIcon className="h-6 w-6" />}
          label="Scales with your supply"
        />
      </div>
    </div>
  )
}
