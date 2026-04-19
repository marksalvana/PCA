import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/profiles/ProfileCard'
import ProfileFilters from './ProfileFilters'
import type { Politician } from '@/types/database'

export const metadata = { title: 'All Profiles — Politiko' }

type PoliticianWithLegal = Politician & {
  legal_records: { id: string; status: string }[]
}

type SearchParams = {
  sort?: string
  q?: string
  region?: string
  party?: string
  flags?: string
  incumbent?: string
}

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const sort = params.sort ?? 'score_desc'
  const q = params.q ?? ''
  const region = params.region ?? ''
  const party = params.party ?? ''
  const flagsOnly = params.flags === 'true'
  const incumbentOnly = params.incumbent === 'true'

  const supabase = await createClient()

  // Build sort order for DB query
  let query = supabase
    .from('politicians')
    .select('*, legal_records(id, status)')
    .eq('status', 'published')

  if (sort === 'score_desc') {
    query = query.order('objective_score', { ascending: false, nullsFirst: false })
  } else if (sort === 'score_asc') {
    query = query.order('objective_score', { ascending: true, nullsFirst: true })
  } else if (sort === 'name_desc') {
    query = query.order('full_name', { ascending: false })
  } else {
    query = query.order('full_name', { ascending: true })
  }

  const { data } = await query
  const all = (data ?? []) as PoliticianWithLegal[]

  // JS-side filters (Supabase can't filter on joined columns cleanly)
  let list = all

  if (q) {
    const lower = q.toLowerCase()
    list = list.filter(
      (p) =>
        p.full_name.toLowerCase().includes(lower) ||
        (p.preferred_name?.toLowerCase().includes(lower) ?? false) ||
        (p.current_position?.toLowerCase().includes(lower) ?? false)
    )
  }

  if (region) {
    list = list.filter((p) => p.region === region)
  }

  if (party) {
    list = list.filter((p) => p.party_affiliation === party)
  }

  if (flagsOnly) {
    list = list.filter((p) =>
      p.legal_records.some((r) => r.status === 'pending' || r.status === 'convicted')
    )
  }

  if (incumbentOnly) {
    list = list.filter((p) => p.is_incumbent)
  }

  // Build unique region + party lists for filter dropdowns
  const regions = [...new Set(all.map((p) => p.region).filter(Boolean))].sort() as string[]
  const parties = [...new Set(all.map((p) => p.party_affiliation).filter(Boolean))].sort() as string[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 mb-1">All Profiles</h1>
        <p className="text-slate-500 text-sm">
          Verified politician profiles sourced from official public records
        </p>
      </div>

      <Suspense>
        <ProfileFilters
          regions={regions}
          parties={parties}
          totalCount={all.length}
          filteredCount={list.length}
        />
      </Suspense>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <ProfileCard key={p.id} politician={p} legalFlags={p.legal_records} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <p className="text-slate-400 text-lg mb-2">No profiles match your filters.</p>
          <p className="text-slate-400 text-sm">Try adjusting or clearing the filters above.</p>
        </div>
      )}
    </div>
  )
}
