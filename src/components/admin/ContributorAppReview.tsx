'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptContributorApplication, rejectContributorApplication } from '@/lib/actions/applications'
import type { ContributorApplication } from '@/types/database'

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  accepted: 'bg-green-500/15 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
}

const BACKGROUND_LABEL: Record<string, string> = {
  researcher:    'Researcher / Analyst',
  journalist:    'Journalist / Writer',
  civic_org:     'Civic society / NGO',
  educator:      'Teacher / Educator',
  student:       'Student',
  fact_checker:  'Fact-checker',
  legal:         'Lawyer / Legal Professional',
  government:    'Government Employee',
  other:         'Other',
}

export default function ContributorAppReview({ app }: { app: ContributorApplication }) {
  const [open, setOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const isResolved = app.status !== 'pending'

  function run(fn: () => Promise<{ success: true } | { error: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md ${STATUS_COLOR[app.status]}`}>
              {app.status}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
              {BACKGROUND_LABEL[app.background] ?? app.background}
            </span>
          </div>
          <p className="font-bold text-white">{app.full_name}</p>
          <p className="text-xs text-gray-400 font-mono">{app.email}</p>
          <p className="text-xs text-gray-600 mt-1">
            Applied {new Date(app.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
            {app.applicant_user_id ? ' · has Politiko account' : ' · anonymous applicant'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-bold border border-white/10 text-gray-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          {open ? 'Collapse' : 'Review'}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4">
          {/* Motivation */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Motivation</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{app.motivation}</p>
          </div>

          {/* Profile URL */}
          {app.profile_url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Profile URL</p>
              <a href={app.profile_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#60a5fa] hover:underline break-all font-mono">
                {app.profile_url} ↗
              </a>
            </div>
          )}

          {/* Resolved meta */}
          {isResolved && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Resolution</p>
              <p className="text-xs text-gray-400">
                {app.reviewed_at && new Date(app.reviewed_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              {app.admin_notes && (
                <p className="text-xs text-gray-300 italic mt-1 whitespace-pre-wrap">&ldquo;{app.admin_notes}&rdquo;</p>
              )}
            </div>
          )}

          {/* Action panel */}
          {!isResolved && (
            <div className="bg-[#0a0a0f] border border-white/10 rounded-lg p-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded mb-3">
                  {error}
                </div>
              )}
              <label className="block text-xs text-gray-400 mb-1.5">
                Admin notes (required for reject)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="What did you verify? Reason for accept/reject."
                className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-600 resize-none mb-3"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => run(() => acceptContributorApplication(app.id, adminNotes.trim() || undefined))}
                  disabled={pending}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {pending ? '…' : 'Accept and promote to Contributor'}
                </button>
                <button
                  type="button"
                  onClick={() => run(() => rejectContributorApplication(app.id, adminNotes))}
                  disabled={pending}
                  className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/40 text-red-300 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
              {!app.applicant_user_id && (
                <p className="text-[11px] text-amber-400/80 mt-2 leading-relaxed">
                  ⚠ Applicant submitted without a Politiko account. Approving will mark the application accepted but cannot promote anyone — they need to sign up first, then admin promotes their role manually.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
