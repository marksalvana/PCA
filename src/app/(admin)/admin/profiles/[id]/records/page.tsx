import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecordsManager from '@/components/admin/RecordsManager'
import type { PoliticianWithDetails } from '@/types/database'

export const metadata = { title: 'Manage Records — Admin' }

export default async function RecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: politician } = await supabase
    .from('politicians')
    .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
    .eq('id', id)
    .single()

  if (!politician) notFound()

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">
        Records: {(politician as unknown as PoliticianWithDetails).full_name}
      </h1>
      <p className="text-gray-400 text-sm mb-6">Add education, track record, legal cases, and achievements.</p>
      <RecordsManager politician={politician as unknown as PoliticianWithDetails} />
    </div>
  )
}
