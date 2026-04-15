import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Politician } from '@/types/database'

export const metadata = { title: 'Manage Profiles — Admin' }

const statusColor: Record<string, string> = {
  draft: 'text-gray-400 bg-gray-400/10',
  under_review: 'text-amber-400 bg-amber-400/10',
  published: 'text-green-400 bg-green-400/10',
  flagged: 'text-red-400 bg-red-400/10',
}

export default async function AdminProfilesPage() {
  const supabase = await createClient()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">All Profiles</h1>
        <Link
          href="/admin/profiles/new"
          className="bg-[#0038a8] hover:bg-[#0038a8]/80 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Profile
        </Link>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
        {politicians && politicians.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Position</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-right text-gray-500 font-medium px-4 py-3">Score</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(politicians as Politician[]).map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{p.full_name}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{p.current_position ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${statusColor[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {p.objective_score != null ? p.objective_score : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/profiles/${p.id}/edit`}
                      className="text-[#60a5fa] hover:underline text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">No profiles yet.</div>
        )}
      </div>
    </div>
  )
}
