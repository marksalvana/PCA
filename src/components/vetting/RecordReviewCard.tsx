'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMutationClient } from '@/lib/supabase/mutations'
import type { PoliticianWithDetails } from '@/types/database'
import LegalBadge from '@/components/profiles/LegalBadge'
import SourceLink from '@/components/ui/SourceLink'

type Props = { politician: PoliticianWithDetails }

export default function RecordReviewCard({ politician: p }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitVetting(action: 'approved' | 'flagged') {
    setSubmitting(true)
    setError(null)

    const supabase = getMutationClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSubmitting(false); return }

    const { error: vErr } = await supabase.from('vetting_records').insert({
      politician_id: p.id,
      vetter_id: user.id,
      action,
      notes: notes || null,
    })

    if (vErr) { setError(vErr.message); setSubmitting(false); return }

    if (action === 'approved') {
      await supabase
        .from('politicians')
        .update({ status: 'published' })
        .eq('id', p.id)
    } else {
      await supabase
        .from('politicians')
        .update({ status: 'flagged' })
        .eq('id', p.id)
    }

    router.push('/vetting')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Education */}
      {p.education_records && p.education_records.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Education</h2>
          <div className="flex flex-col gap-2">
            {p.education_records.map((r) => (
              <div key={r.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                <p className="font-semibold text-white">{r.institution}</p>
                {r.degree && <p className="text-gray-400 text-xs">{r.degree}</p>}
                <p className="text-gray-500 text-xs">CHED: {r.ched_accreditation} · Score: {r.institution_score ?? 'TBD'}</p>
                <SourceLink url={r.source_url} label={r.source_label} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track records */}
      {p.track_records && p.track_records.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Track Record</h2>
          <div className="flex flex-col gap-2">
            {p.track_records.map((r) => (
              <div key={r.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                <p className="font-semibold text-white">{r.position}</p>
                <p className="text-gray-500 text-xs">COA: {r.coa_finding} · Score: {r.performance_score ?? 'TBD'}</p>
                <SourceLink url={r.source_url} label={r.source_label} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Legal */}
      {p.legal_records && p.legal_records.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Legal Records</h2>
          <div className="flex flex-col gap-2">
            {p.legal_records.map((r) => (
              <LegalBadge key={r.id} record={r} expanded />
            ))}
          </div>
        </section>
      )}

      {/* Vetting decision */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-3">Your Decision</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-3">
            {error}
          </div>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add notes (optional — visible in the audit trail)"
          className="w-full bg-[#0a0a0f] border border-white/10 focus:border-white/30 text-white rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3 placeholder:text-gray-600"
        />
        <div className="flex gap-3">
          <button
            onClick={() => submitVetting('approved')}
            disabled={submitting}
            className="flex-1 bg-green-600 hover:bg-green-600/80 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            Approve & Publish
          </button>
          <button
            onClick={() => submitVetting('flagged')}
            disabled={submitting}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            Flag Issues
          </button>
        </div>
      </div>
    </div>
  )
}
