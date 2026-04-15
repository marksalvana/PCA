import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecordReviewCard from '@/components/vetting/RecordReviewCard'
import type { PoliticianWithDetails } from '@/types/database'

export const metadata = { title: 'Review Profile — Admin' }

export default async function VettingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: politician } = await supabase
    .from('politicians')
    .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
    .eq('id', id)
    .single()

  if (!politician) notFound()

  const p = politician as unknown as PoliticianWithDetails

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black text-white mb-1">Review: {p.full_name}</h1>
      <p className="text-gray-400 text-sm mb-6">{p.current_position}</p>
      <RecordReviewCard politician={p} />
    </div>
  )
}
