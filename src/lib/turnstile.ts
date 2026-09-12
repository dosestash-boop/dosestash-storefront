export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) return true // not configured yet, skip verification

  const body = new URLSearchParams({ secret: secretKey, response: token })
  if (remoteIp) body.set("remoteip", remoteIp)

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body }
  )
  const data = await res.json()
  return data.success === true
}
