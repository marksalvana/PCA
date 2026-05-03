'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  acceptSubmission,
  rejectSubmission,
  markDuplicate,
  markUnderReview,
} from '@/lib/actions/submissions'
import type {
  Politician,
  RecordSubmission,
  SubmissionStatus,
} from '@/types/database'

type SubmissionWithPolitician = RecordSubmission & {
  politician: Pick<Politician, 'id' | 'slug' | 'full_name' | 'preferred_name'> | null
}

type Props = {
  submission: SubmissionWithPolitician
  reviewerName: string | null
}

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  pending:      'bg-amber-500/15 text-amber-300 border-amber-500/30',
  under_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  accepted:     'bg-green-500/15 text-green-300 border-green-500/30',
  rejected:     'bg-red-500/15 text-red-300 border-red-500/30',
  duplicate:    'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

const TYPE_LABEL: Record<string, string> = {
  education:    'Education',
  track_record: 'Track Record',
  achievement:  'Achievement',
}

export default function SubmissionReview({ submission, reviewerName }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [markVerified, setMarkVerified] = useState(false)

  const isResolved =
    submission.status === 'accepted' ||
    submission.status === 'rejected' ||
    submission.status === 'duplicate'

  function run(fn: () => Promise<{ success: true } | { error: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/admin/submissions')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            href="/admin/submissions"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block"
          >
            ← Back to queue
          </Link>
          <h1 className="text-2xl font-black text-white">
            Review submission
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {submission.politician ? (
              <>
                For{' '}
                <Link href={`/profiles/${submission.politician.slug}`} target="_blank" className="text-[#60a5fa] hover:underline">
                  {submission.politician.full_name}
                </Link>
              </>
            ) : (
              <span className="text-red-400">Politician record was deleted</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded-md ${STATUS_COLOR[submission.status]}`}>
            {submission.status.replace('_', ' ')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
            {TYPE_LABEL[submission.submission_type] ?? submission.submission_type}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submitter */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Submitted by</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="Name" value={submission.submitter_name} />
          <Field label="Email" value={submission.submitter_email} mono />
          <Field
            label="Account"
            value={submission.submitter_user_id ? 'Logged in' : 'Anonymous (no Politiko account)'}
          />
          <Field
            label="Submitted"
            value={new Date(submission.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
          />
        </div>
      </div>

      {/* Source — primary */}
      <div className="bg-[#111827] border-l-4 border-l-[#60a5fa] border border-white/10 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Source</p>
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <span className="text-gray-500 text-xs">Source URL</span>
            <a
              href={submission.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#60a5fa] hover:underline break-all font-mono text-xs mt-0.5"
            >
              {submission.source_url} ↗
            </a>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Source label</span>
            <p className="text-white mt-0.5">{submission.source_label}</p>
          </div>
          {submission.supporting_document_url && (
            <div>
              <span className="text-gray-500 text-xs">Supporting document</span>
              <a
                href={submission.supporting_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#60a5fa] hover:underline break-all font-mono text-xs mt-0.5"
              >
                {submission.supporting_document_url} ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Submitter&apos;s explanation</p>
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
          {submission.explanation}
        </p>
      </div>

      {/* Payload */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
          Proposed {TYPE_LABEL[submission.submission_type] ?? submission.submission_type} record
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {Object.entries(submission.payload).map(([key, value]) => (
            <Field
              key={key}
              label={humanizeKey(key)}
              value={formatValue(value)}
            />
          ))}
        </div>
      </div>

      {/* Already-resolved meta */}
      {isResolved && (
        <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Resolution</p>
          <div className="text-sm">
            <p className="text-gray-400">
              Resolved by reviewer{' '}
              <span className="text-white font-semibold">{reviewerName ?? '(unknown)'}</span>
              {submission.resolved_at && (
                <>
                  {' '}on{' '}
                  {new Date(submission.resolved_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                </>
              )}
            </p>
            {submission.admin_notes && (
              <p className="mt-2 text-gray-300 italic whitespace-pre-wrap">&ldquo;{submission.admin_notes}&rdquo;</p>
            )}
          </div>
        </div>
      )}

      {/* Action panel — only when not yet resolved */}
      {!isResolved && (
        <div className="bg-[#111827] border-l-4 border-l-amber-500/40 border border-white/10 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Reviewer actions</p>

          <label className="block text-xs text-gray-400 mb-1.5">
            Reviewer notes (required for reject)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="What did you verify? What's missing? Why reject?"
            className="w-full bg-[#0a0a0f] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-600 resize-none mb-3"
          />

          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={markVerified}
              onChange={(e) => setMarkVerified(e.target.checked)}
              className="accent-green-500 w-4 h-4 mt-0.5"
            />
            <div>
              <span className="text-sm text-white font-semibold">Mark verified on accept</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Inserts the record with is_verified=true and logs you as the vetter.
                Only check if you&apos;ve already verified the source. Otherwise leave unchecked
                and the record will appear in the normal vetting queue.
              </span>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                run(() =>
                  acceptSubmission(submission.id, {
                    adminNotes: adminNotes.trim() || undefined,
                    markVerified,
                  })
                )
              }
              disabled={pending}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {pending ? '…' : markVerified ? 'Accept and verify' : 'Accept and add'}
            </button>
            <button
              type="button"
              onClick={() => run(() => rejectSubmission(submission.id, adminNotes))}
              disabled={pending}
              className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/40 text-red-300 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => run(() => markDuplicate(submission.id, adminNotes))}
              disabled={pending}
              className="bg-slate-600/10 hover:bg-slate-600/20 border border-slate-400/30 text-slate-300 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Mark duplicate
            </button>
            {submission.status === 'pending' && (
              <button
                type="button"
                onClick={() => run(() => markUnderReview(submission.id))}
                disabled={pending}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ml-auto"
              >
                Move to under review
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
            Email notification to <span className="font-mono">{submission.submitter_email}</span> is
            not sent automatically — copy the address and notify them out-of-band.
          </p>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`text-white text-sm mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? <span className="text-gray-600 italic">— not provided —</span>}
      </p>
    </div>
  )
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\bis\s/gi, 'Is ')
    .replace(/^./, (c) => c.toUpperCase())
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
