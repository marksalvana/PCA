import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Politician, RecordSubmission, SubmissionStatus, SubmissionType } from '@/types/database'

export const metadata = { title: 'Submissions Queue — Admin' }

const STATUS_TABS: { value: SubmissionStatus | 'all'; label: string }[] = [
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted',     label: 'Accepted' },
  { value: 'rejected',     label: 'Rejected' },
  { value: 'duplicate',    label: 'Duplicate' },
  { value: 'all',          label: 'All' },
]

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  pending:      'bg-amber-500/15 text-amber-300 border-amber-500/30',
  under_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  accepted:     'bg-green-500/15 text-green-300 border-green-500/30',
  rejected:     'bg-red-500/15 text-red-300 border-red-500/30',
  duplicate:    'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

const TYPE_LABEL: Record<SubmissionType, string> = {
  education:    'Education',
  track_record: 'Track Record',
  achievement:  'Achievement',
}

type SubmissionRow = RecordSubmission & {
  politician: Pick<Politician, 'id' | 'slug' | 'full_name' | 'preferred_name'> | null
}

export default async function SubmissionsQueuePage({
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

  if (!profile || !['admin', 'vetter', 'superadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const status = (sp.status ?? 'pending') as SubmissionStatus | 'all'

  // Counts per status (for tab badges)
  const counts: Record<SubmissionStatus | 'all', number> = {
    pending: 0, under_review: 0, accepted: 0, rejected: 0, duplicate: 0, all: 0,
  }
  const { data: countRows } = await supabase
    .from('record_submissions')
    .select('status')
    .returns<{ status: SubmissionStatus }[]>()
  for (const r of countRows ?? []) {
    counts[r.status] = (counts[r.status] ?? 0) + 1
    counts.all += 1
  }

  // Filtered list
  let listQuery = supabase
    .from('record_submissions')
    .select('*, politician:politicians!politician_id(id, slug, full_name, preferred_name)')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    listQuery = listQuery.eq('status', status)
  }

  const { data: rows } = await listQuery.returns<SubmissionRow[]>()
  const list = rows ?? []

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Submissions Queue</h1>
      <p className="text-gray-400 text-sm mb-6">
        Citizen-submitted records awaiting review. Accepting a submission inserts a new
        record into the appropriate table; verification still flows through the normal
        vetting workflow unless you mark it verified at accept time.
      </p>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value
          const count = counts[tab.value] ?? 0
          return (
            <Link
              key={tab.value}
              href={tab.value === 'pending' ? '/admin/submissions' : `/admin/submissions?status=${tab.value}`}
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                active
                  ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/15' : 'bg-white/5'}`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-xl text-gray-500">
          {status === 'pending'
            ? 'No submissions awaiting review.'
            : `No submissions with status "${status}".`}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="bg-[#111827] border border-white/10 hover:border-white/20 rounded-xl p-4 flex items-start justify-between gap-4 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md ${STATUS_COLOR[s.status]}`}>
                    {s.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                    {TYPE_LABEL[s.submission_type]}
                  </span>
                </div>
                <p className="font-bold text-white">
                  {s.politician?.full_name ?? '— politician deleted —'}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {summarizePayload(s)}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Submitted by {s.submitter_name} ·{' '}
                  {new Date(s.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className="shrink-0 text-[#60a5fa] text-sm font-semibold">Review →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function summarizePayload(s: SubmissionRow): string {
  const p = s.payload
  if (s.submission_type === 'education') {
    const parts = [p.institution, p.degree, p.field_of_study].filter(Boolean)
    return parts.join(' · ') || '(no details)'
  }
  if (s.submission_type === 'track_record') {
    const dates = [p.start_date?.slice(0, 4), p.end_date?.slice(0, 4)].filter(Boolean).join('–')
    return [p.position, dates].filter(Boolean).join(' · ') || '(no details)'
  }
  return [p.title, p.year].filter(Boolean).join(' · ') || '(no details)'
}
