import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PoliticianForm from '@/components/admin/PoliticianForm'
import RecordsManager from '@/components/admin/RecordsManager'
import type { Politician, PoliticianWithDetails } from '@/types/database'

export const metadata = { title: 'Edit Profile — Admin' }

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-4xl space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{p.full_name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{p.current_position ?? 'No position set'}</p>
        </div>
        <Link
          href={`/profiles/${p.slug}`}
          target="_blank"
          className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          View public profile ↗
        </Link>
      </div>

      {/* Basic info form */}
      <section>
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Basic Information</h2>
        <PoliticianForm politician={p as unknown as Politician} />
      </section>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Records */}
      <section>
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Records</h2>
        <RecordsManager politician={p} />
      </section>
    </div>
  )
}
