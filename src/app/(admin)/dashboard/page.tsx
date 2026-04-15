import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — PH Profile Compare Admin' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalPoliticians },
    { count: drafts },
    { count: pendingVetting },
    { count: petitions },
  ] = await Promise.all([
    supabase.from('politicians').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('politicians').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('politicians').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
    supabase.from('petitions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Published Profiles', value: totalPoliticians ?? 0, href: '/profiles', color: 'text-green-400' },
    { label: 'Drafts', value: drafts ?? 0, href: '/admin/profiles', color: 'text-amber-400' },
    { label: 'Awaiting Vetting', value: pendingVetting ?? 0, href: '/vetting', color: 'text-[#60a5fa]' },
    { label: 'Pending Petitions', value: petitions ?? 0, href: '/admin/petitions', color: 'text-[#fcd116]' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[#111827] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-colors"
          >
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/profiles/new"
          className="bg-[#0038a8] hover:bg-[#0038a8]/80 text-white font-bold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          + New Profile
        </Link>
        <Link
          href="/vetting"
          className="border border-white/20 hover:border-white/40 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Review Vetting Queue
        </Link>
      </div>
    </div>
  )
}
