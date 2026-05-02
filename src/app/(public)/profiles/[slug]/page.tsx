import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileStatBar from '@/components/profiles/ProfileStatBar'
import LegalBadge from '@/components/profiles/LegalBadge'
import AttributionFooter from '@/components/profiles/AttributionFooter'
import DynastySection from '@/components/profiles/DynastySection'
import ScoreBadge from '@/components/ui/ScoreBadge'
import SourceLink from '@/components/ui/SourceLink'
import LensAwareScoreBadge from '@/components/lens/LensAwareScoreBadge'
import LensPanel from '@/components/lens/LensPanel'
import {
  computeTrackPts,
  computeAchievementPts,
  computeEducationPts,
  attendanceModifier,
  CHED_SCORES,
  LEGAL_PENALTIES,
} from '@/lib/scoring'
import RatingWidget from '@/components/profiles/RatingWidget'
import type { PoliticianWithDetails, VettingRecord, UserProfile } from '@/types/database'

type VettingWithVetter = VettingRecord & {
  vetter: Pick<UserProfile, 'id' | 'display_name' | 'role'> | null
}

const ACTION_LABEL: Record<string, string> = {
  approved: 'Approved',
  flagged: 'Flagged',
  rejected: 'Rejected',
  requested_correction: 'Requested correction',
}

const ACTION_COLOR: Record<string, string> = {
  approved: 'text-green-700 bg-green-50 border-green-200',
  flagged: 'text-amber-700 bg-amber-50 border-amber-200',
  rejected: 'text-red-700 bg-red-50 border-red-200',
  requested_correction: 'text-slate-600 bg-slate-50 border-slate-200',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = [
    'bg-blue-600', 'bg-indigo-600', 'bg-purple-600',
    'bg-teal-600', 'bg-emerald-600', 'bg-orange-600',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('politicians')
    .select('full_name, current_position')
    .eq('slug', slug)
    .single<{ full_name: string; current_position: string | null }>()
  if (!data) return { title: 'Profile Not Found' }
  return { title: `${data.full_name} — Politiko` }
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: politician } = await supabase
    .from('politicians')
    .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*), dynasty_connections(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!politician) notFound()

  const p = politician as unknown as PoliticianWithDetails

  // Auth session + vetting data in parallel
  const [{ data: { user } }, { data: vettingData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('vetting_records')
      .select('*, vetter:user_profiles!vetter_id(id, display_name, role)')
      .eq('politician_id', p.id)
      .order('vetted_at', { ascending: false }),
  ])

  // Fetch user's existing rating only if they're logged in
  let userRating: number | null = null
  if (user) {
    const { data: ratingRow } = await supabase
      .from('civic_trust_ratings')
      .select('rating')
      .eq('politician_id', p.id)
      .eq('user_id', user.id)
      .maybeSingle<{ rating: number }>()
    userRating = ratingRow?.rating ?? null
  }

  const vettingHistory = (vettingData ?? []) as VettingWithVetter[]

  // Unique vetters who approved (deduplicated by vetter_id)
  const approvedVetters = [
    ...new Map(
      vettingHistory
        .filter((v) => v.action === 'approved' && v.vetter)
        .map((v) => [v.vetter_id, v.vetter!])
    ).values(),
  ]

  const activeLegal = p.legal_records?.filter(
    (r) => r.status === 'pending' || r.status === 'convicted'
  ) ?? []

  const convictionCount = p.legal_records?.filter((r) => r.status === 'convicted' && r.is_verified).length ?? 0
  const hasActiveDynastyMember = p.dynasty_connections?.some((c) => c.is_current !== false) ?? false
  const hasDynasty = !!p.dynasty_name && hasActiveDynastyMember
  const redFlagCount = convictionCount + (hasDynasty ? 1 : 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-[1fr_272px] lg:gap-6 lg:items-start">

        {/* ── Main content ── */}
        <div>

          {/* Header card */}
          <div className="card p-6 mb-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo */}
              <div className="shrink-0">
                {p.photo_url ? (
                  <Image
                    src={p.photo_url}
                    alt={p.full_name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl font-black text-slate-400">
                    {p.full_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {p.is_incumbent && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">Incumbent</span>
                  )}
                  {p.is_candidate && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">Candidate</span>
                  )}
                  {p.party_affiliation && (
                    <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{p.party_affiliation}</span>
                  )}
                  {p.dynasty_name && (
                    <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">🏛 {p.dynasty_name}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{p.full_name}</h1>
                {p.current_position && <p className="text-slate-600 font-semibold">{p.current_position}</p>}
                {p.region && <p className="text-slate-400 text-sm mt-0.5">{p.region}</p>}
              </div>

              {/* Scores — Objective + Trust + Red Flags */}
              <div className="flex flex-row sm:flex-col gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Objective</div>
                  <LensAwareScoreBadge
                    score={p.objective_score}
                    breakdown={p.score_breakdown}
                    size="lg"
                  />
                  {p.objective_score == null && (
                    <p className="text-xs text-slate-400 mt-1 w-20">No data</p>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs text-purple-500 font-semibold uppercase tracking-wide mb-1">Trust</div>
                  {p.civic_trust_score != null ? (
                    <ScoreBadge score={p.civic_trust_score} size="lg" variant="trust" />
                  ) : (
                    <div className="w-20 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                      <span className="text-xs text-slate-400 text-center px-1 leading-tight">No ratings</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Red Flags</div>
                  <div className={`w-20 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 ${
                    redFlagCount > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-base leading-none">🚩</span>
                    <span className={`text-xl font-black leading-none tabular-nums ${redFlagCount > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                      {redFlagCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 w-20 leading-tight text-center">
                    {convictionCount > 0 ? `${convictionCount} convicted` : 'no convictions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active legal — always prominent */}
            {activeLegal.length > 0 && (
              <div className="mt-5 pt-5 border-t border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 dynasty-badge" />
                  <p className="text-red-700 text-xs font-bold uppercase tracking-widest">Active Legal Cases</p>
                </div>
                <div className="flex flex-col gap-2">
                  {activeLegal.map((r) => <LegalBadge key={r.id} record={r} />)}
                </div>
              </div>
            )}
          </div>

          {/* Compare CTA */}
          <Link
            href={`/compare?a=${p.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-lg transition-colors mb-3"
          >
            Compare {p.preferred_name ?? p.full_name} with another candidate →
          </Link>

          {/* Personal Lens — collapsible, optional */}
          <LensPanel />

          {/* Education */}
          {p.education_records && p.education_records.length > 0 && (
            <section className="mb-5">
              <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1B2A4A] rounded-md flex items-center justify-center text-white text-sm leading-none">🎓</span>
                Education
              </h2>
              <div className="flex flex-col gap-2">
                {p.education_records.map((rec) => {
                  const basePts = rec.ched_accreditation ? CHED_SCORES[rec.ched_accreditation] : 0
                  const pts = computeEducationPts(rec)
                  const showBar = rec.ched_accreditation && rec.ched_accreditation !== 'unknown'
                  return (
                    <div key={rec.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900">{rec.institution}</p>
                            {rec.is_completed === false && (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">Incomplete</span>
                            )}
                            {!rec.is_verified && (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">Unverified</span>
                            )}
                          </div>
                          {rec.degree && <p className="text-slate-500 text-sm">{rec.degree}{rec.field_of_study ? ` — ${rec.field_of_study}` : ''}</p>}
                          {(rec.year_started || rec.year_ended) && (
                            <p className="text-slate-400 text-xs mt-0.5">
                              {rec.year_started ?? '?'} – {rec.is_completed ? (rec.year_ended ?? '?') : 'present'}
                            </p>
                          )}
                          <SourceLink url={rec.source_url} label={rec.source_label} />
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {showBar && (
                            <ProfileStatBar score={basePts} label={rec.ched_accreditation ?? 'unknown'} />
                          )}
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums border ${rec.is_verified ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                            +{pts} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Track Record */}
          {p.track_records && p.track_records.length > 0 && (
            <section className="mb-5">
              <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1B2A4A] rounded-md flex items-center justify-center text-white text-sm leading-none">📋</span>
                Track Record
              </h2>
              <div className="flex flex-col gap-2">
                {p.track_records.map((rec) => {
                  const pts = computeTrackPts(rec)
                  const attMod = attendanceModifier(rec.attendance_rate)
                  const hasScorable = rec.coa_finding && rec.coa_finding !== 'unknown'
                  const coaLabel = rec.coa_finding && rec.coa_finding !== 'not_applicable' && rec.coa_finding !== 'unknown'
                    ? rec.coa_finding
                    : null
                  return (
                    <div key={rec.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900">{rec.position}</p>
                            {!rec.is_verified && (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">Unverified</span>
                            )}
                          </div>
                          {(rec.start_date || rec.end_date) && (
                            <p className="text-slate-400 text-xs mt-0.5">
                              {rec.start_date?.slice(0, 4) ?? '?'} – {rec.is_current ? 'present' : (rec.end_date?.slice(0, 4) ?? '?')}
                            </p>
                          )}
                          {coaLabel && (
                            <p className="text-xs mt-1">
                              COA:{' '}
                              <span className={coaLabel === 'unqualified' ? 'text-green-700 font-semibold' : coaLabel === 'qualified' ? 'text-amber-700 font-semibold' : 'text-red-700 font-semibold'}>
                                {coaLabel.charAt(0).toUpperCase() + coaLabel.slice(1)}
                              </span>
                            </p>
                          )}
                          {rec.bills_authored != null && (
                            <p className="text-slate-400 text-xs mt-1">{rec.bills_authored} bills authored · {rec.bills_passed ?? 0} passed</p>
                          )}
                          {rec.attendance_rate != null && (
                            <p className="text-xs mt-1 text-slate-500">
                              Attendance: <span className="font-semibold">{rec.attendance_rate}%</span>
                              <span className={`ml-1 font-bold ${attMod > 0 ? 'text-green-600' : attMod < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {attMod > 0 ? `+${attMod}` : attMod === 0 ? '±0' : attMod} pts
                              </span>
                            </p>
                          )}
                          <SourceLink url={rec.source_url} label={rec.source_label} />
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {hasScorable && (
                            <ProfileStatBar
                              score={rec.coa_finding === 'unqualified' ? 100 : rec.coa_finding === 'qualified' ? 60 : rec.coa_finding === 'adverse' ? 20 : rec.coa_finding === 'disclaimer' ? 10 : rec.performance_score ?? 0}
                              label={coaLabel ?? 'not_applicable'}
                            />
                          )}
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums border ${rec.is_verified ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                            +{pts} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Achievements */}
          {p.achievements && p.achievements.length > 0 && (
            <section className="mb-5">
              <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center text-white text-sm leading-none">★</span>
                Achievements
              </h2>
              <div className="flex flex-col gap-2">
                {p.achievements.map((ach) => {
                  const pts = computeAchievementPts(ach.impact_scope)
                  const scopeColor =
                    ach.impact_scope === 'national_landmark' ? 'text-blue-800 bg-blue-100 border-blue-300' :
                    ach.impact_scope === 'national_standard' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                    ach.impact_scope === 'national'          ? 'text-blue-700 bg-blue-50 border-blue-200' :
                    ach.impact_scope === 'regional'          ? 'text-indigo-700 bg-indigo-50 border-indigo-200' :
                    ach.impact_scope === 'local'             ? 'text-slate-600 bg-slate-100 border-slate-200' :
                    'text-amber-700 bg-amber-50 border-amber-200'
                  const scopeLabel: Record<string, string> = {
                    national_landmark: 'National Landmark',
                    national_standard: 'National Standard',
                    national: 'National',
                    regional: 'Regional',
                    local: 'Local',
                  }
                  return (
                    <div key={ach.id} className="card p-4 border-l-4 border-l-amber-400">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-slate-900">{ach.title}</p>
                            {!ach.is_verified && (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">Unverified</span>
                            )}
                          </div>
                          {ach.description && <p className="text-slate-500 text-sm mt-1">{ach.description}</p>}
                          {ach.year && <p className="text-slate-400 text-xs mt-0.5">{ach.year}</p>}
                          <SourceLink url={ach.source_url} label={ach.source_label} />
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {ach.impact_scope ? (
                            <span className={`text-xs font-bold border px-2 py-0.5 rounded-md ${scopeColor}`}>
                              {scopeLabel[ach.impact_scope] ?? ach.impact_scope}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              Scope needed
                            </span>
                          )}
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums border ${ach.is_verified ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                            +{pts} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Legal Records */}
          {p.legal_records && p.legal_records.length > 0 && (
            <section className="mb-5">
              <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center text-white text-sm leading-none">⚖</span>
                Legal Records
              </h2>
              <div className="flex flex-col gap-2">
                {p.legal_records.map((rec) => {
                  const penalty = LEGAL_PENALTIES[rec.status as keyof typeof LEGAL_PENALTIES] ?? 0
                  return (
                    <LegalBadge key={rec.id} record={rec} expanded penalty={penalty} />
                  )
                })}
              </div>
            </section>
          )}

          {/* Community Trust */}
          <section className="mb-5 card p-5" id="rate">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-0.5">
                  <span className="text-purple-600">★</span> Community Trust
                </h2>
                <p className="text-xs text-slate-400">
                  Citizen ratings (1–5). Kept separate from the objective score.
                </p>
              </div>
              {p.civic_trust_score != null && (
                <ScoreBadge score={p.civic_trust_score} size="lg" variant="trust" />
              )}
            </div>
            {p.civic_trust_score != null && (
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-400" style={{ width: `${p.civic_trust_score}%` }} />
              </div>
            )}
            <RatingWidget
              politicianId={p.id}
              slug={p.slug}
              userRating={userRating}
              isLoggedIn={!!user}
            />
          </section>

          {/* Dynasty */}
          <DynastySection
            politician={p}
            connections={p.dynasty_connections ?? []}
          />

          <AttributionFooter politician={p} />
        </div>

        {/* ── Sidebar ── */}
        <aside className="mt-6 lg:mt-0 space-y-4">

          {/* Vetters */}
          <div className="card p-4">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs">✓</span>
              Vetted By
            </h3>
            {approvedVetters.length > 0 ? (
              <ul className="space-y-2.5">
                {approvedVetters.map((v) => (
                  <li key={v.id} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${avatarColor(v.display_name)} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                      {initials(v.display_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{v.display_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{v.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No vetters recorded yet</p>
            )}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/vetter-apply"
                className="text-xs text-slate-400 hover:text-[#1B2A4A] transition-colors"
              >
                Want to help verify profiles? Apply as a vetter →
              </Link>
            </div>
          </div>

          {/* Revision History */}
          <div className="card p-4">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-600 rounded flex items-center justify-center text-white text-xs">↻</span>
              Revision History
            </h3>
            {vettingHistory.length > 0 ? (
              <ol className="space-y-3">
                {vettingHistory.map((v) => (
                  <li key={v.id} className="flex gap-2.5">
                    <div className={`w-7 h-7 rounded-full ${avatarColor(v.vetter?.display_name ?? 'A')} flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5`}>
                      {initials(v.vetter?.display_name ?? '?')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {v.vetter?.display_name ?? 'Unknown'}
                        </span>
                        <span className={`text-xs font-bold border px-1.5 py-0.5 rounded-md ${ACTION_COLOR[v.action] ?? ACTION_COLOR.requested_correction}`}>
                          {ACTION_LABEL[v.action] ?? v.action}
                        </span>
                      </div>
                      {v.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{v.notes}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(v.vetted_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-400 italic">No revision history yet</p>
            )}
          </div>

        </aside>
      </div>
    </div>
  )
}
