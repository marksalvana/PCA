import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/profiles/ProfileCard'
import type { Politician } from '@/types/database'

export const metadata = {
  title: 'All Profiles — PH Profile Compare',
}

export default async function ProfilesPage() {
  const supabase = await createClient()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('*')
    .eq('status', 'published')
    .order('full_name', { ascending: true })

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">All Profiles</h1>
        <p className="text-gray-400">
          {politicians?.length ?? 0} published profile{politicians?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {politicians && politicians.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(politicians as Politician[]).map((politician) => (
            <ProfileCard key={politician.id} politician={politician} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-white/10 rounded-xl">
          <p className="text-gray-500">No published profiles yet.</p>
        </div>
      )}
    </div>
  )
}
