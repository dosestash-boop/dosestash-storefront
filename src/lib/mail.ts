import nodemailer from "nodemailer"
import type { HttpTypes } from "@medusajs/types"
import { formatPrice } from "@/lib/format-price"

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("Missing SMTP environment variables")
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  })
}

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  const to = process.env.CONTACT_EMAIL_TO
  if (!to) {
    throw new Error("Missing CONTACT_EMAIL_TO environment variable")
  }

  const transporter = getTransporter()

  await transporter.sendMail({
    from: `"Dosestash Contact Form" <${process.env.SMTP_USER}>`,
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  })
}

export async function sendOrderConfirmationEmail(order: HttpTypes.StoreOrder) {
  if (!order.email) return

  const currencyCode = order.currency_code
  const items = order.items ?? []
  const address = order.shipping_address

  const itemLines = items
    .map(
      (item) =>
        `  ${item.quantity} x ${item.product_title ?? item.title}${
          item.variant_title ? ` (${item.variant_title})` : ""
        } - ${formatPrice(item.total, currencyCode)}`
    )
    .join("\n")

  const addressBlock = address
    ? `${address.first_name} ${address.last_name}\n${address.address_1}${
        address.address_2 ? `, ${address.address_2}` : ""
      }\n${address.city}, ${address.province?.toUpperCase()} ${address.postal_code}`
    : ""

  const text = `Thanks for your order, ${order.shipping_address?.first_name ?? ""}!

Order #${order.display_id}

Items:
${itemLines}

Subtotal: ${formatPrice(order.item_subtotal ?? 0, currencyCode)}
Shipping: ${formatPrice(order.shipping_total ?? 0, currencyCode)}
Total: ${formatPrice(order.total ?? 0, currencyCode)}

Shipping to:
${addressBlock}

Questions? Just reply to this email.`

  const itemRowsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#1e2420;">
            ${item.quantity} &times; ${item.product_title ?? item.title}${
              item.variant_title
                ? ` <span style="color:#6b6455;">(${item.variant_title})</span>`
                : ""
            }
          </td>
          <td style="padding:8px 0;text-align:right;color:#1e2420;">
            ${formatPrice(item.total, currencyCode)}
          </td>
        </tr>`
    )
    .join("")

  const html = `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;color:#1e2420;">
      <h1 style="font-size:20px;margin:0 0 4px;">Order confirmed</h1>
      <p style="color:#6b6455;margin:0 0 24px;">Order #${order.display_id}</p>

      <table style="width:100%;border-collapse:collapse;">
        ${itemRowsHtml}
        <tr>
          <td style="padding:12px 0 2px;border-top:1px solid #d9d0be;color:#6b6455;">Subtotal</td>
          <td style="padding:12px 0 2px;border-top:1px solid #d9d0be;text-align:right;color:#6b6455;">${formatPrice(order.item_subtotal ?? 0, currencyCode)}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;color:#6b6455;">Shipping</td>
          <td style="padding:2px 0;text-align:right;color:#6b6455;">${formatPrice(order.shipping_total ?? 0, currencyCode)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0 0;font-weight:600;">Total</td>
          <td style="padding:8px 0 0;text-align:right;font-weight:600;">${formatPrice(order.total ?? 0, currencyCode)}</td>
        </tr>
      </table>

      ${
        address
          ? `<p style="margin-top:24px;color:#6b6455;">
              <strong style="color:#1e2420;">Shipping to</strong><br />
              ${address.first_name} ${address.last_name}<br />
              ${address.address_1}${address.address_2 ? `, ${address.address_2}` : ""}<br />
              ${address.city}, ${address.province?.toUpperCase()} ${address.postal_code}
            </p>`
          : ""
      }

      <p style="margin-top:24px;color:#6b6455;font-size:13px;">Questions? Just reply to this email.</p>
    </div>
  `

  const transporter = getTransporter()

  await transporter.sendMail({
    from: `"Dosestash" <${process.env.SMTP_USER}>`,
    to: order.email,
    replyTo: process.env.CONTACT_EMAIL_TO,
    subject: `Order confirmed - #${order.display_id}`,
    text,
    html,
  })
}
