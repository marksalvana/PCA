/**
 * Cloudflare Turnstile server-side verification.
 *
 * Used by server actions on public forms (record submissions, petitions)
 * where we need to verify a CAPTCHA token before doing the work. Auth
 * flows (signup/login) use Supabase's built-in captcha integration
 * instead — those just need the token to be passed in `captchaToken`
 * within auth options; Supabase verifies it server-side automatically.
 *
 * Env vars required:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  (client-rendered widget)
 *   TURNSTILE_SECRET_KEY            (server-side verification + Supabase)
 *
 * If TURNSTILE_SECRET_KEY is not set, verification is silently bypassed
 * with a console warning. This keeps local dev workable without a
 * Cloudflare account; production must set the secret.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type TurnstileResult =
  | { ok: true }
  | { ok: false; error: string }

interface SiteverifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint.
 *
 * Pass the client IP when available (from `x-forwarded-for` header) so
 * Cloudflare can flag mismatches between the IP that solved the CAPTCHA
 * and the IP making the request.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string,
): Promise<TurnstileResult> {
  if (!token) {
    return { ok: false, error: 'Please complete the CAPTCHA.' }
  }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // Local dev / unconfigured environments: warn and bypass so the
    // app stays usable. Production must set TURNSTILE_SECRET_KEY.
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — bypassing CAPTCHA verification')
    return { ok: true }
  }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (ip) body.set('remoteip', ip)

  let res: Response
  try {
    res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
  } catch {
    return { ok: false, error: 'CAPTCHA service unreachable. Try again shortly.' }
  }

  if (!res.ok) {
    return { ok: false, error: 'CAPTCHA verification failed. Try again.' }
  }

  let json: SiteverifyResponse
  try {
    json = await res.json()
  } catch {
    return { ok: false, error: 'CAPTCHA response invalid. Try again.' }
  }

  if (!json.success) {
    // Generic message to the user; specific error codes are logged for debugging.
    if (json['error-codes']?.length) {
      console.warn('[turnstile] verification failed:', json['error-codes'])
    }
    return { ok: false, error: 'CAPTCHA failed. Please try again.' }
  }

  return { ok: true }
}
