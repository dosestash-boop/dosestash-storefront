import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Dosestash storage cases.",
}

const FAQS = [
  {
    question: "What sizes do you offer?",
    answer:
      "Vial cases in 3mL, 5mL, and 10mL, and syringe cases in .3mL, .5mL, and 1mL.",
  },
  {
    question: "How fast does my order ship?",
    answer: "Orders ship in 2–3 days.",
  },
  {
    question: "Is the packaging discreet?",
    answer: "Yes, every order ships in plain packaging.",
  },
  {
    question: "Can I use these in the freezer or fridge?",
    answer:
      "Yes, the cases are built for freezer, fridge, or travel storage.",
  },
]

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight text-gray-900">
        Frequently Asked Questions
      </h1>

      <dl className="mt-8 space-y-6">
        {FAQS.map((faq) => (
          <div key={faq.question} className="border-t border-gray-100 pt-6">
            <dt className="text-base font-medium text-gray-900">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm text-gray-600">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
