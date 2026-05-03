import { createClient } from '@/lib/supabase/server'
import CompareSelector from '@/components/comparison/CompareSelector'
import CompareGrid from '@/components/comparison/CompareGrid'
import LensLink from '@/components/lens/LensLink'
import ShareLensButton from '@/components/lens/ShareLensButton'
import type { Politician, PoliticianWithDetails } from '@/types/database'

export const metadata = {
  title: 'Compare Candidates — Politiko',
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const { a, b } = await searchParams
  const supabase = await createClient()

  const { data: allPoliticians } = await supabase
    .from('politicians')
    .select('id, slug, full_name, preferred_name, current_position, photo_url, objective_score, civic_trust_score, is_incumbent, is_candidate, party_affiliation, region')
    .eq('status', 'published')
    .order('full_name')

  let politicianA: PoliticianWithDetails | null = null
  let politicianB: PoliticianWithDetails | null = null

  if (a) {
    const { data } = await supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', a).eq('status', 'published').single()
    politicianA = data as unknown as PoliticianWithDetails
  }

  if (b) {
    const { data } = await supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', b).eq('status', 'published').single()
    politicianB = data as unknown as PoliticianWithDetails
  }

  const bothSelected = politicianA && politicianB
  const oneSelected = (a && !b) || (!a && b)

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Compare Candidates</h1>
        <p className="text-slate-500 text-sm">
          Pick two politicians to see their education, track record, and legal history side-by-side.
        </p>
      </div>

      {/* Selector */}
      <CompareSelector
        politicians={(allPoliticians ?? []) as Politician[]}
        selectedA={a}
        selectedB={b}
      />

      {/* State: nothing selected yet */}
      {!a && !b && (
        <div className="mt-6">
          <ComparePreview />
        </div>
      )}

      {/* State: only one selected */}
      {oneSelected && !bothSelected && (
        <div className="mt-6 card p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-lg">👆</div>
          <p className="font-bold text-slate-900">Now pick the second candidate</p>
          <p className="text-slate-500 text-sm">Choose someone to compare against from the second dropdown above.</p>
        </div>
      )}

      {/* State: both selected */}
      {bothSelected && politicianA && politicianB && (
        <div className="mt-8">
          <CompareGrid a={politicianA} b={politicianB} />
          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            <LensLink />
            <ShareLensButton slugA={politicianA.slug} slugB={politicianB.slug} />
          </div>
        </div>
      )}

      {/* Error */}
      {((a && !politicianA) || (b && !politicianB)) && (
        <p className="text-red-600 text-sm mt-4 card p-3">One or both selected profiles could not be found.</p>
      )}
    </div>
  )
}

function ComparePreview() {
  return (
    <div className="card overflow-hidden">
      {/* Explanation header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">What you'll see</p>
        <p className="text-sm text-slate-600">A side-by-side breakdown of every metric — education quality, COA audit findings, legislative output, and active legal cases.</p>
      </div>

      {/* Mock comparison preview */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Mock candidate A */}
          <div className="flex flex-col items-center gap-2 text-center opacity-40">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300" />
            <div className="h-3 w-24 bg-slate-200 rounded-full" />
            <div className="h-2 w-16 bg-slate-100 rounded-full" />
          </div>
          {/* VS */}
          <div className="flex flex-col items-center gap-2 text-center opacity-40">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300" />
            <div className="h-3 w-24 bg-slate-200 rounded-full" />
            <div className="h-2 w-16 bg-slate-100 rounded-full" />
          </div>
        </div>

        {/* Mock stat rows */}
        <div className="space-y-2">
          {[
            { label: 'Objective Score', colorA: 'bg-green-400', wA: '82%', colorB: 'bg-amber-400', wB: '45%' },
            { label: 'Education',       colorA: 'bg-green-400', wA: '90%', colorB: 'bg-green-300', wB: '70%' },
            { label: 'Track Record',    colorA: 'bg-green-400', wA: '80%', colorB: 'bg-amber-400', wB: '40%' },
            { label: 'Legal Penalty',   colorA: 'bg-green-400', wA: '0%',  colorB: 'bg-red-400',   wB: '30%' },
          ].map(({ label, colorA, wA, colorB, wB }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colorA} opacity-50`} style={{ width: wA }} />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 w-28 text-center shrink-0">{label}</span>
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colorB} opacity-50`} style={{ width: wB }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-slate-400">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs font-semibold uppercase tracking-widest">Select two candidates above to compare</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
      </div>

      {/* What's included */}
      <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '🎓', label: 'Education quality' },
          { icon: '📋', label: 'COA audit findings' },
          { icon: '⚖', label: 'Legal cases' },
          { icon: '🗳', label: 'Community trust' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
