import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContributorAppReview from '@/components/admin/ContributorAppReview'
import type { ContributorApplication } from '@/types/database'

export const metadata = { title: 'Contributor Applications — Admin' }

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  all: 'All',
}

export default async function ContributorApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const status = sp.status ?? 'pending'

  // Status counts
  const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, all: 0 }
  const { data: countRows } = await supabase
    .from('contributor_applications')
    .select('status')
    .returns<{ status: string }[]>()
  for (const r of countRows ?? []) {
    counts[r.status] = (counts[r.status] ?? 0) + 1
    counts.all += 1
  }

  let listQuery = supabase
    .from('contributor_applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (status !== 'all') listQuery = listQuery.eq('status', status)

  const { data: rows } = await listQuery.returns<ContributorApplication[]>()
  const list = rows ?? []

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Contributor Applications</h1>
      <p className="text-gray-400 text-sm mb-6">
        Review applications to upgrade members to <span className="text-emerald-300 font-semibold">contributor</span>.
        Approving an application promotes the applicant&apos;s account and notifies them.
      </p>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
        {(['pending', 'accepted', 'rejected', 'all'] as const).map((tab) => {
          const active = status === tab
          const count = counts[tab] ?? 0
          return (
            <a
              key={tab}
              href={tab === 'pending' ? '/admin/contributor-applications' : `/admin/contributor-applications?status=${tab}`}
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                active
                  ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {STATUS_LABEL[tab]}
              {count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/15' : 'bg-white/5'}`}>
                  {count}
                </span>
              )}
            </a>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-xl text-gray-500">
          {status === 'pending' ? 'No applications awaiting review.' : `No applications with status "${status}".`}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((app) => (
            <ContributorAppReview key={app.id} app={app} />
          ))}
        </div>
      )}

    </div>
  )
}
