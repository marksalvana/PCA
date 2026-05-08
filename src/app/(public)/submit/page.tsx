import { createClient } from '@/lib/supabase/server'
import SubmitForm from '@/components/SubmitForm'
import Link from 'next/link'
import type { SubmissionType } from '@/types/database'

export const metadata = {
  title: 'Submit a Record — Politiko',
  description: 'Help expand a politician\'s profile with sourced education, track record, or achievement records. Reviewed by named vetters before being added.',
}

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ politician?: string; type?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  type PoliticianOption = {
    id: string
    slug: string
    full_name: string
    preferred_name: string | null
    current_position: string | null
  }
  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, slug, full_name, preferred_name, current_position')
    .eq('status', 'published')
    .order('full_name', { ascending: true })
    .returns<PoliticianOption[]>()

  // Resolve ?politician=slug query param to an id for default selection
  const list: PoliticianOption[] = politicians ?? []
  const defaultPoliticianId = sp.politician
    ? list.find((p) => p.slug === sp.politician)?.id
    : undefined

  // Resolve ?type=education|track_record|achievement to pre-select section
  const allowedTypes: SubmissionType[] = ['education', 'track_record', 'achievement']
  const defaultType: SubmissionType | undefined =
    sp.type && (allowedTypes as string[]).includes(sp.type)
      ? (sp.type as SubmissionType)
      : undefined

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1B2A4A] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-4">
          Contribute
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">
          Submit a record
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Help expand a politician&apos;s profile with sourced education, track record, or
          achievement information. Submissions are reviewed by named vetters and converted
          into verified records when the source checks out.
        </p>
      </div>

      {/* What gets reviewed */}
      <div className="card p-5 mb-6 bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/20">
        <p className="text-xs font-bold text-[#1B2A4A] uppercase tracking-widest mb-3">How review works</p>
        <ol className="text-sm text-slate-700 space-y-2 leading-relaxed list-decimal list-inside">
          <li>You submit a record with a link to its primary source.</li>
          <li>A registered vetter reads the source and checks the claim.</li>
          <li>If verified, the record is added to the politician&apos;s profile and contributes
              to their Objective Score. If not, the submission is rejected with notes — we&apos;ll
              email you either way.</li>
        </ol>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Submissions without a credible source are not reviewed.
          See <Link href="/methodology" className="text-[#1B2A4A] underline hover:no-underline">methodology</Link>{' '}
          for accepted source authorities (CHED, COA, Sandiganbayan, Official Gazette, etc).
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-slate-500">No politicians published yet — nothing to submit against.</p>
        </div>
      ) : (
        <SubmitForm politicians={list} defaultPoliticianId={defaultPoliticianId} defaultType={defaultType} />
      )}

    </div>
  )
}
