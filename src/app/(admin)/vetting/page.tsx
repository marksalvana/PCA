import { createClient } from '@/lib/supabase/server'
import VettingQueue from '@/components/vetting/VettingQueue'
import type { Politician } from '@/types/database'

export const metadata = { title: 'Vetting Queue — Admin' }

export default async function VettingPage() {
  const supabase = await createClient()

  const { data: queue } = await supabase
    .from('politicians')
    .select('*')
    .eq('status', 'under_review')
    .order('updated_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Vetting Queue</h1>
      <p className="text-gray-400 text-sm mb-6">
        {queue?.length ?? 0} profile{queue?.length !== 1 ? 's' : ''} awaiting review
      </p>
      <VettingQueue profiles={(queue ?? []) as Politician[]} />
    </div>
  )
}
