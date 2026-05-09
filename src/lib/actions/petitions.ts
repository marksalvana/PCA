'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { verifyTurnstile } from '@/lib/turnstile'
import { checkRateLimit, keyForIp, rateLimitError } from '@/lib/anti-abuse/rate-limit'
import { isDisposableEmail } from '@/lib/anti-abuse/tempmail'

type ActionResult = { success: true } | { error: string }

/**
 * Public petition submission. Open to anyone (no auth required); CAPTCHA
 * gates spam submissions. Server-side validation mirrors the form's
 * client-side checks but is the source of truth.
 */
export async function submitPetition(input: {
  politicianName: string
  currentPosition: string
  reason: string
  email: string
  captchaToken: string | null
}): Promise<ActionResult> {
  const name = input.politicianName.trim()
  if (!name || name.length < 2) {
    return { error: 'Please enter the politician\'s name.' }
  }

  // If an email is provided, reject tempmail providers.
  if (input.email.trim() && isDisposableEmail(input.email)) {
    return { error: 'Please use a primary email address we can reach you at.' }
  }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
  const captcha = await verifyTurnstile(input.captchaToken, ip)
  if (!captcha.ok) return { error: captcha.error }

  // Rate limit: 3 petitions per day per (IP + email).
  const rl = checkRateLimit(keyForIp(ip, input.email, 'submit-petition'), {
    limit: 3,
    windowSec: 86400,
  })
  if (!rl.ok) return { error: rateLimitError(rl, 'petitions') }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db.from('petitions').insert({
    politician_name: name,
    current_position: input.currentPosition.trim() || null,
    reason: input.reason.trim() || null,
    requester_email: input.email.trim() || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/petitions')
  return { success: true }
}
