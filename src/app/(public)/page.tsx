import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/profiles/ProfileCard'
import HomeContent from './HomeContent'
import type { Politician } from '@/types/database'

type PoliticianWithLegal = Politician & {
  legal_records: { id: string; status: string }[]
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featured } = await supabase
    .from('politicians')
    .select('*, legal_records(id, status)')
    .eq('status', 'published')
    .order('objective_score', { ascending: false })
    .limit(6)

  const { data: flagged } = await supabase
    .from('politicians')
    .select('*, legal_records(id, status)')
    .eq('status', 'published')
    .order('objective_score', { ascending: true })
    .limit(3)

  const { count: profileCount } = await supabase
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const featuredSlot = (featured as PoliticianWithLegal[] | null)?.map((p) => (
    <ProfileCard key={p.id} politician={p} legalFlags={p.legal_records} />
  ))

  const flaggedSlot = (flagged as PoliticianWithLegal[] | null)?.map((p) => (
    <ProfileCard key={p.id} politician={p} legalFlags={p.legal_records} />
  ))

  return (
    <HomeContent
      featuredSlot={featuredSlot}
      flaggedSlot={flaggedSlot}
      profileCount={profileCount ?? 0}
    />
  )
}
