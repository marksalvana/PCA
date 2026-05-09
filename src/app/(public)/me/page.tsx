import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarkAllReadButton from '@/components/me/MarkAllReadButton'
import type {
  Notification,
  RecordSubmission,
  CivicTrustRating,
  ForumPost,
  ForumReply,
  Politician,
  UserRole,
} from '@/types/database'

export const metadata = { title: 'Your dashboard — Politiko' }

type RatingWithPolitician = CivicTrustRating & {
  politician: Pick<Politician, 'slug' | 'full_name' | 'preferred_name'> | null
}

type SubmissionRow = Pick<
  RecordSubmission,
  'id' | 'submission_type' | 'status' | 'created_at' | 'resolved_at'
> & {
  politician: Pick<Politician, 'slug' | 'full_name'> | null
}

const NOTIFICATION_ICON: Record<string, string> = {
  submission_accepted: '✓',
  submission_rejected: '✕',
  submission_under_review: '◐',
  contributor_app_approved: '✓',
  contributor_app_rejected: '✕',
  vetter_app_approved: '✓',
  vetter_app_rejected: '✕',
  record_verified: '✓',
  record_flagged: '⚑',
  system: 'ℹ',
}

const NOTIFICATION_TONE: Record<string, string> = {
  submission_accepted: 'bg-green-50 text-green-800 border-green-200',
  submission_rejected: 'bg-red-50 text-red-800 border-red-200',
  submission_under_review: 'bg-blue-50 text-blue-800 border-blue-200',
  contributor_app_approved: 'bg-green-50 text-green-800 border-green-200',
  contributor_app_rejected: 'bg-red-50 text-red-800 border-red-200',
  vetter_app_approved: 'bg-green-50 text-green-800 border-green-200',
  vetter_app_rejected: 'bg-red-50 text-red-800 border-red-200',
  record_verified: 'bg-green-50 text-green-800 border-green-200',
  record_flagged: 'bg-amber-50 text-amber-800 border-amber-200',
  system: 'bg-slate-50 text-slate-700 border-slate-200',
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const SUBMISSION_TYPE_LABEL: Record<string, string> = {
  education: 'Education',
  track_record: 'Track Record',
  achievement: 'Achievement',
}

const SUBMISSION_STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  duplicate: 'bg-slate-50 text-slate-600 border-slate-200',
}

export default async function MePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me')

  // Profile (display_name + role)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single<{ display_name: string; role: UserRole }>()

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'You'
  const role = (profile?.role ?? 'member') as UserRole

  // Notifications (most recent 20) + count of unread
  const { data: notifData, count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<Notification[]>()
  const notifications = notifData ?? []
  const unread = unreadCount ?? 0

  // Activity: parallel fetch of recent submissions, ratings, forum posts, replies
  const [
    { data: submissions },
    { data: ratings },
    { data: posts },
    { data: replies },
  ] = await Promise.all([
    supabase
      .from('record_submissions')
      .select('id, submission_type, status, created_at, resolved_at, politician:politicians!politician_id(slug, full_name)')
      .eq('submitter_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<SubmissionRow[]>(),
    supabase
      .from('civic_trust_ratings')
      .select('*, politician:politicians!politician_id(slug, full_name, preferred_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<RatingWithPolitician[]>(),
    supabase
      .from('forum_posts')
      .select('id, content, category, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<Pick<ForumPost, 'id' | 'content' | 'category' | 'created_at'>[]>(),
    supabase
      .from('forum_replies')
      .select('id, content, post_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<Pick<ForumReply, 'id' | 'content' | 'post_id' | 'created_at'>[]>(),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your dashboard</p>
        <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">{user.email}</p>
      </div>

      {/* Notifications */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unread} unread
              </span>
            )}
          </h2>
          {unread > 0 && <MarkAllReadButton />}
        </div>
        {notifications.length === 0 ? (
          <div className="card p-5 text-center text-sm text-slate-500">
            No notifications yet. We&apos;ll let you know when there&apos;s news on your activity.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationCard notification={n} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity: submissions */}
      <section className="mb-8">
        <h2 className="text-base font-black text-slate-900 mb-3">Your record submissions</h2>
        {!submissions || submissions.length === 0 ? (
          <div className="card p-5 text-center text-sm text-slate-500">
            No submissions yet.{' '}
            <Link href="/submit" className="text-[#1B2A4A] font-semibold hover:underline">Submit a record</Link>{' '}
            to help build a profile.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {submissions.map((s) => (
              <li key={s.id} className="card p-3 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded ${SUBMISSION_STATUS_TONE[s.status] ?? SUBMISSION_STATUS_TONE.pending}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                      {SUBMISSION_TYPE_LABEL[s.submission_type] ?? s.submission_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-semibold">
                    {s.politician
                      ? <Link href={`/profiles/${s.politician.slug}`} className="hover:underline">{s.politician.full_name}</Link>
                      : <span className="italic text-slate-500">— politician removed —</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    submitted {relativeTime(s.created_at)}
                    {s.resolved_at && <> · resolved {relativeTime(s.resolved_at)}</>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity: ratings */}
      <section className="mb-8">
        <h2 className="text-base font-black text-slate-900 mb-3">Politicians you&apos;ve rated</h2>
        {!ratings || ratings.length === 0 ? (
          <div className="card p-5 text-center text-sm text-slate-500">
            You haven&apos;t rated any politicians yet.{' '}
            <Link href="/profiles" className="text-[#1B2A4A] font-semibold hover:underline">Browse profiles</Link>.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {ratings.map((r) => (
              <li key={r.id} className="card p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {r.politician
                      ? <Link href={`/profiles/${r.politician.slug}`} className="hover:underline">{r.politician.preferred_name ?? r.politician.full_name}</Link>
                      : <span className="italic text-slate-500">— politician removed —</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{relativeTime(r.created_at)}</p>
                </div>
                <span className="text-base font-black text-purple-700 tabular-nums shrink-0">
                  {r.rating}
                  <span className="text-xs text-purple-300 font-normal">/5</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity: forum */}
      <section className="mb-8">
        <h2 className="text-base font-black text-slate-900 mb-3">Your forum activity</h2>
        {(!posts || posts.length === 0) && (!replies || replies.length === 0) ? (
          <div className="card p-5 text-center text-sm text-slate-500">
            No forum activity yet. Share your thoughts on the{' '}
            <Link href="/forum" className="text-[#1B2A4A] font-semibold hover:underline">community forum</Link>.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {(posts ?? []).map((p) => (
              <li key={p.id} className="card p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Posted · {relativeTime(p.created_at)}</p>
                <p className="text-sm text-slate-700 line-clamp-2">{p.content}</p>
              </li>
            ))}
            {(replies ?? []).map((r) => (
              <li key={r.id} className="card p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Replied · {relativeTime(r.created_at)}</p>
                <p className="text-sm text-slate-700 line-clamp-2">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Settings link footer */}
      <section className="mb-8 card p-5 bg-slate-50/60">
        <h2 className="text-sm font-black text-slate-900 mb-2">Account</h2>
        <p className="text-xs text-slate-500 mb-3">
          Role: <span className="font-semibold text-slate-700 capitalize">{role}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {role === 'member' && (
            <>
              <Link href="/contributor-apply" className="text-xs font-bold border border-slate-200 bg-white hover:border-emerald-300 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-colors">
                Apply as contributor
              </Link>
              <Link href="/vetter-apply" className="text-xs font-bold border border-slate-200 bg-white hover:border-amber-300 hover:text-amber-700 px-3 py-1.5 rounded-lg transition-colors">
                Apply as vetter
              </Link>
            </>
          )}
          <Link href="/" className="text-xs font-bold border border-slate-200 bg-white hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
            ← Back to site
          </Link>
        </div>
      </section>

    </div>
  )
}

function NotificationCard({ notification: n }: { notification: Notification }) {
  const tone = NOTIFICATION_TONE[n.type] ?? NOTIFICATION_TONE.system
  const icon = NOTIFICATION_ICON[n.type] ?? 'ℹ'
  const isUnread = !n.read_at

  const inner = (
    <div className={`card p-3 border ${isUnread ? 'shadow-sm' : 'opacity-70'}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 w-7 h-7 rounded-lg border ${tone} flex items-center justify-center text-sm font-black`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900">
              {n.title}
              {isUnread && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-red-500 align-middle" aria-label="unread" />}
            </p>
            <time className="text-[10px] text-slate-400 shrink-0">{relativeTime(n.created_at)}</time>
          </div>
          {n.body && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>}
        </div>
      </div>
    </div>
  )

  if (n.link_url) {
    return <Link href={n.link_url} className="block hover:opacity-90 transition-opacity">{inner}</Link>
  }
  return inner
}
