import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VettingQueue from '@/components/vetting/VettingQueue'
import type { Politician } from '@/types/database'

export const metadata = { title: 'Vetting Queue — Admin' }

export default async function VettingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['vetter', 'superadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

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
