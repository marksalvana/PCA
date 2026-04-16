import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/profiles/ProfileCard'
import type { Politician } from '@/types/database'

export const metadata = { title: 'All Profiles — PH Profile Compare' }

type PoliticianWithLegal = Politician & {
  legal_records: { id: string; status: string }[]
}

export default async function ProfilesPage() {
  const supabase = await createClient()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('*, legal_records(id, status)')
    .eq('status', 'published')
    .order('full_name', { ascending: true })

  const list = politicians as PoliticianWithLegal[] | null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-1">All Profiles</h1>
        <p className="text-slate-500">
          {list?.length ?? 0} published profile{list?.length !== 1 ? 's' : ''} — sourced from official records
        </p>
      </div>

      {list && list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <ProfileCard key={p.id} politician={p} legalFlags={p.legal_records} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <p className="text-slate-400 text-lg">No published profiles yet.</p>
        </div>
      )}
    </div>
  )
}
