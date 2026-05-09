'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { verifyTurnstile } from '@/lib/turnstile'
import { isDisposableEmail } from '@/lib/anti-abuse/tempmail'
import { checkRateLimit, keyForIp, rateLimitError } from '@/lib/anti-abuse/rate-limit'
import { notifyUser } from './notifications'

type ActionResult = { success: true } | { error: string }

/**
 * Submit a contributor application. Anyone can apply (no auth required,
 * but if signed in we capture applicant_user_id so we can promote that
 * exact account on accept). CAPTCHA + tempmail + rate-limit gates apply.
 */
export async function submitContributorApplication(input: {
  fullName: string
  email: string
  background: string
  motivation: string
  profileUrl: string | null
  publicDisplayConsent: boolean
  captchaToken: string | null
}): Promise<ActionResult> {
  const fullName = input.fullName.trim()
  const email = input.email.trim()
  const background = input.background.trim()
  const motivation = input.motivation.trim()

  if (!fullName || fullName.length < 2) return { error: 'Please enter your full name.' }
  if (!email) return { error: 'Please enter an email.' }
  if (!background) return { error: 'Please pick a background.' }
  if (!motivation || motivation.length < 30) {
    return { error: 'Please describe your motivation in at least 30 characters.' }
  }

  if (isDisposableEmail(email)) {
    return { error: 'Please use a primary email address we can reach you at.' }
  }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
  const captcha = await verifyTurnstile(input.captchaToken, ip)
  if (!captcha.ok) return { error: captcha.error }

  // Rate limit: 3 applications per day per (IP + email)
  const rl = checkRateLimit(keyForIp(ip, email, 'contributor-app'), { limit: 3, windowSec: 86400 })
  if (!rl.ok) return { error: rateLimitError(rl, 'applications') }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db.from('contributor_applications').insert({
    full_name: fullName,
    email,
    background,
    motivation,
    profile_url: input.profileUrl?.trim() || null,
    public_display_consent: input.publicDisplayConsent,
    applicant_user_id: user?.id ?? null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/contributor-applications')
  return { success: true }
}

/**
 * Admin action: approve a contributor application.
 * - Sets the application status to 'accepted'
 * - Promotes the applicant's user_profiles.role from 'member' (or whatever)
 *   to 'contributor', if applicant_user_id is set
 * - Sends a notification to the applicant
 */
export async function acceptContributorApplication(
  applicationId: string,
  adminNotes?: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return { error: 'Not authorized.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: app } = await db
    .from('contributor_applications')
    .select('id, applicant_user_id, status, full_name')
    .eq('id', applicationId)
    .single()

  if (!app) return { error: 'Application not found.' }
  if (app.status !== 'pending') return { error: `Application already ${app.status}.` }

  // Promote applicant's role (if they have an account)
  if (app.applicant_user_id) {
    const { error: promoteErr } = await db
      .from('user_profiles')
      .update({ role: 'contributor' })
      .eq('id', app.applicant_user_id)
    if (promoteErr) return { error: `Promotion failed: ${promoteErr.message}` }
  }

  const { error: updateErr } = await db
    .from('contributor_applications')
    .update({
      status: 'accepted',
      admin_notes: adminNotes?.trim() || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (updateErr) return { error: updateErr.message }

  if (app.applicant_user_id) {
    await notifyUser({
      userId: app.applicant_user_id,
      type: 'contributor_app_approved',
      title: 'You\'re now a Contributor',
      body: 'Your contributor application was approved. You can now submit politiko profiles and records from the admin area.',
      linkUrl: '/dashboard',
    })
  }

  revalidatePath('/admin/contributor-applications')
  revalidatePath('/me')
  return { success: true }
}

/**
 * Admin action: reject a contributor application.
 */
export async function rejectContributorApplication(
  applicationId: string,
  adminNotes: string,
): Promise<ActionResult> {
  if (!adminNotes.trim()) {
    return { error: 'Please add notes explaining the rejection.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return { error: 'Not authorized.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: app } = await db
    .from('contributor_applications')
    .select('id, applicant_user_id, status')
    .eq('id', applicationId)
    .single()
  if (!app) return { error: 'Application not found.' }
  if (app.status !== 'pending') return { error: `Application already ${app.status}.` }

  const { error } = await db
    .from('contributor_applications')
    .update({
      status: 'rejected',
      admin_notes: adminNotes.trim(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  if (app.applicant_user_id) {
    await notifyUser({
      userId: app.applicant_user_id,
      type: 'contributor_app_rejected',
      title: 'Contributor application not approved',
      body: adminNotes.trim(),
      linkUrl: '/me',
    })
  }

  revalidatePath('/admin/contributor-applications')
  revalidatePath('/me')
  return { success: true }
}
