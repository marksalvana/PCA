import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PoliticianForm from '@/components/admin/PoliticianForm'
import type { Politician } from '@/types/database'

export const metadata = { title: 'Edit Profile — Admin' }

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: politician } = await supabase
    .from('politicians')
    .select('*')
    .eq('id', id)
    .single()

  if (!politician) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-6">
        Edit: {(politician as Politician).full_name}
      </h1>
      <PoliticianForm politician={politician as Politician} />
    </div>
  )
}
