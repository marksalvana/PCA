'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { verifyTurnstile } from '@/lib/turnstile'
import { checkRateLimit, keyForIp, rateLimitError } from '@/lib/anti-abuse/rate-limit'
import { isDisposableEmail } from '@/lib/anti-abuse/tempmail'
import { notifyUser } from './notifications'
import type {
  RecordSubmission,
  RecordSubmissionPayload,
  SubmissionType,
} from '@/types/database'

type ActionResult = { success: true } | { error: string }

/**
 * Public-facing record-submission action. Anyone (anonymous or authed)
 * can submit; we verify Cloudflare Turnstile before inserting to prevent
 * spam pile-ups in the admin queue.
 */
export async function submitRecord(input: {
  politicianId: string
  submissionType: SubmissionType
  payload: RecordSubmissionPayload
  sourceUrl: string
  sourceLabel: string
  supportingDocumentUrl: string | null
  explanation: string
  submitterName: string
  submitterEmail: string
  captchaToken: string | null
}): Promise<ActionResult> {
  // Basic shape checks (the form does its own UX-level validation; this
  // is the server-side defense in depth)
  if (!input.politicianId) return { error: 'Missing politician.' }
  if (!input.sourceUrl.trim()) return { error: 'Source URL is required.' }
  if (!input.sourceLabel.trim()) return { error: 'Source label is required.' }
  if (!input.explanation.trim()) return { error: 'Explanation is required.' }
  if (!input.submitterName.trim() || input.submitterName.trim().length < 2) {
    return { error: 'Please enter your name.' }
  }
  if (!input.submitterEmail.trim()) return { error: 'Please enter an email.' }

  // Tempmail rejection — generic message so we don't tip off the spammer.
  if (isDisposableEmail(input.submitterEmail)) {
    return { error: 'Please use a primary email address we can reach you at.' }
  }

  // CAPTCHA gate
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
  const captcha = await verifyTurnstile(input.captchaToken, ip)
  if (!captcha.ok) return { error: captcha.error }

  // Rate limit: 5 submissions per day per (IP + email).
  const rl = checkRateLimit(keyForIp(ip, input.submitterEmail, 'submit-record'), {
    limit: 5,
    windowSec: 86400,
  })
  if (!rl.ok) return { error: rateLimitError(rl, 'submissions') }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db.from('record_submissions').insert({
    politician_id: input.politicianId,
    submission_type: input.submissionType,
    payload: input.payload,
    source_url: input.sourceUrl.trim(),
    source_label: input.sourceLabel.trim(),
    supporting_document_url: input.supportingDocumentUrl?.trim() || null,
    explanation: input.explanation.trim(),
    submitter_name: input.submitterName.trim(),
    submitter_email: input.submitterEmail.trim(),
    submitter_user_id: user?.id ?? null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/submissions')
  return { success: true }
}

type ReviewerAuth =
  | { ok: false; error: string }
  | {
      ok: true
      user: { id: string }
      profile: { role: string }
      supabase: Awaited<ReturnType<typeof createClient>>
    }

async function requireReviewer(): Promise<ReviewerAuth> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'vetter', 'superadmin'].includes(profile.role)) {
    return { ok: false, error: 'Not authorized.' }
  }

  return { ok: true, user, profile, supabase }
}

/**
 * Accept a citizen submission and convert it into a record in the
 * appropriate table (education_records / track_records / achievements).
 *
 * If markVerified is true, the new record is inserted with is_verified=true
 * and a vetting_records audit trail entry is created. The politician's
 * objective_score is then recomputed.
 *
 * If markVerified is false (default), the record is inserted as unverified
 * and goes through the normal vetter review workflow afterwards.
 *
 * Both inserts are NOT wrapped in a transaction at the SDK level — Supabase
 * JS client does not expose multi-statement transactions. If the records
 * insert succeeds but the submission update fails, the admin sees the error
 * and can manually mark the submission accepted (the converted record is
 * already in the records table, fully usable).
 */
export async function acceptSubmission(
  submissionId: string,
  options: { adminNotes?: string; markVerified?: boolean } = {}
): Promise<ActionResult> {
  const auth = await requireReviewer()
  if (!auth.ok) return { error: auth.error }
  const { user, supabase } = auth

  const { data: subRow, error: fetchErr } = await supabase
    .from('record_submissions')
    .select('*')
    .eq('id', submissionId)
    .single<RecordSubmission>()

  if (fetchErr || !subRow) return { error: 'Submission not found.' }
  if (subRow.status === 'accepted' || subRow.status === 'rejected' || subRow.status === 'duplicate') {
    return { error: `Submission already ${subRow.status}.` }
  }

  const payload = subRow.payload as RecordSubmissionPayload
  const isVerified = options.markVerified === true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Step 1 — insert the record into the appropriate table
  let recordTable: 'education_records' | 'track_records' | 'achievements'
  let insertPayload: Record<string, unknown>

  if (subRow.submission_type === 'education') {
    if (!payload.institution) return { error: 'Submission is missing an institution.' }
    recordTable = 'education_records'
    insertPayload = {
      politician_id: subRow.politician_id,
      institution: payload.institution,
      degree: payload.degree ?? null,
      field_of_study: payload.field_of_study ?? null,
      year_started: payload.year_started ?? null,
      year_ended: payload.year_ended ?? null,
      is_completed: payload.is_completed ?? true,
      ched_accreditation: payload.ched_accreditation ?? null,
      source_url: subRow.source_url,
      source_label: subRow.source_label,
      created_by: user.id,
      is_verified: isVerified,
    }
  } else if (subRow.submission_type === 'track_record') {
    if (!payload.position) return { error: 'Submission is missing a position.' }
    recordTable = 'track_records'
    insertPayload = {
      politician_id: subRow.politician_id,
      position: payload.position,
      start_date: payload.start_date ?? null,
      end_date: payload.is_current ? null : (payload.end_date ?? null),
      is_current: payload.is_current ?? false,
      coa_finding: payload.coa_finding ?? null,
      bills_authored: payload.bills_authored ?? null,
      bills_passed: payload.bills_passed ?? null,
      bills_enacted_count: payload.bills_enacted_count ?? null,
      sglg_awarded: payload.sglg_awarded ?? null,
      attendance_rate: payload.attendance_rate ?? null,
      source_url: subRow.source_url,
      source_label: subRow.source_label,
      created_by: user.id,
      is_verified: isVerified,
    }
  } else if (subRow.submission_type === 'achievement') {
    if (!payload.title) return { error: 'Submission is missing a title.' }
    recordTable = 'achievements'
    insertPayload = {
      politician_id: subRow.politician_id,
      title: payload.title,
      description: payload.description ?? null,
      year: payload.year ?? null,
      impact_scope: payload.impact_scope ?? null,
      category: payload.category ?? null,
      source_url: subRow.source_url,
      source_label: subRow.source_label,
      created_by: user.id,
      is_verified: isVerified,
    }
  } else {
    return { error: `Unknown submission type: ${subRow.submission_type}` }
  }

  const { data: newRecord, error: insertErr } = await db
    .from(recordTable)
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertErr || !newRecord) {
    return { error: insertErr?.message ?? 'Failed to insert record.' }
  }

  // Step 2 — if marking verified, log an append-only vetting_records entry
  if (isVerified) {
    const vettingRow: Record<string, unknown> = {
      politician_id: subRow.politician_id,
      vetter_id: user.id,
      action: 'approved',
      notes: `Accepted from submission ${submissionId}${options.adminNotes ? ` — ${options.adminNotes}` : ''}`,
    }
    if (subRow.submission_type === 'education') vettingRow.education_record_id = newRecord.id
    if (subRow.submission_type === 'track_record') vettingRow.track_record_id = newRecord.id
    if (subRow.submission_type === 'achievement') vettingRow.achievement_id = newRecord.id

    await db.from('vetting_records').insert(vettingRow)

    // Recompute objective score since a verified record was added
    await db.rpc('compute_objective_score', { p_politician_id: subRow.politician_id })
  }

  // Step 3 — mark submission accepted
  const { error: updateErr } = await db
    .from('record_submissions')
    .update({
      status: 'accepted',
      admin_notes: options.adminNotes ?? null,
      reviewed_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (updateErr) {
    return {
      error: `Record was inserted into ${recordTable} but submission update failed: ${updateErr.message}. Mark the submission accepted manually.`,
    }
  }

  // Notify the submitter (if they have an account)
  if (subRow.submitter_user_id) {
    await notifyUser({
      userId: subRow.submitter_user_id,
      type: 'submission_accepted',
      title: 'Your submission was accepted',
      body: options.adminNotes?.trim() || 'Your record was added to the platform.',
      linkUrl: '/me',
    })
  }

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  return { success: true }
}

export async function rejectSubmission(
  submissionId: string,
  adminNotes: string
): Promise<ActionResult> {
  const auth = await requireReviewer()
  if (!auth.ok) return { error: auth.error }
  const { user, supabase } = auth

  if (!adminNotes.trim()) {
    return { error: 'Reason for rejection is required.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: subRow } = await db
    .from('record_submissions')
    .select('submitter_user_id')
    .eq('id', submissionId)
    .single()

  const { error } = await db
    .from('record_submissions')
    .update({
      status: 'rejected',
      admin_notes: adminNotes.trim(),
      reviewed_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .in('status', ['pending', 'under_review'])

  if (error) return { error: error.message }

  if (subRow?.submitter_user_id) {
    await notifyUser({
      userId: subRow.submitter_user_id,
      type: 'submission_rejected',
      title: 'Your submission was not accepted',
      body: adminNotes.trim(),
      linkUrl: '/me',
    })
  }

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  return { success: true }
}

export async function markDuplicate(
  submissionId: string,
  adminNotes: string
): Promise<ActionResult> {
  const auth = await requireReviewer()
  if (!auth.ok) return { error: auth.error }
  const { user, supabase } = auth

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: subRow } = await db
    .from('record_submissions')
    .select('submitter_user_id')
    .eq('id', submissionId)
    .single()

  const { error } = await db
    .from('record_submissions')
    .update({
      status: 'duplicate',
      admin_notes: adminNotes.trim() || 'Already exists in records.',
      reviewed_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .in('status', ['pending', 'under_review'])

  if (error) return { error: error.message }

  if (subRow?.submitter_user_id) {
    await notifyUser({
      userId: subRow.submitter_user_id,
      type: 'submission_rejected',
      title: 'Your submission was marked duplicate',
      body: adminNotes.trim() || 'A matching record already exists.',
      linkUrl: '/me',
    })
  }

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  return { success: true }
}

export async function markUnderReview(submissionId: string): Promise<ActionResult> {
  const auth = await requireReviewer()
  if (!auth.ok) return { error: auth.error }
  const { user, supabase } = auth

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: subRow } = await db
    .from('record_submissions')
    .select('submitter_user_id')
    .eq('id', submissionId)
    .single()

  const { error } = await db
    .from('record_submissions')
    .update({ status: 'under_review', reviewed_by: user.id })
    .eq('id', submissionId)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  if (subRow?.submitter_user_id) {
    await notifyUser({
      userId: subRow.submitter_user_id,
      type: 'submission_under_review',
      title: 'Your submission is under review',
      body: 'A reviewer has picked up your submission. We\'ll let you know when it\'s decided.',
      linkUrl: '/me',
    })
  }

  revalidatePath('/admin/submissions')
  revalidatePath(`/admin/submissions/${submissionId}`)
  return { success: true }
}
