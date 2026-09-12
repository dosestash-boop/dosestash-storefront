import nodemailer from "nodemailer"

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
