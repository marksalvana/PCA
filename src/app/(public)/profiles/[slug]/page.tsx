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
import {
  computeTrackPts,
  computeAchievementPts,
  computeEducationPts,
  attendanceModifier,
  CHED_SCORES,
  LEGAL_PENALTIES,
} from '@/lib/scoring'
import type { PoliticianWithDetails } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('politicians')
    .select('full_name, current_position')
    .eq('slug', slug)
    .single<{ full_name: string; current_position: string | null }>()
  if (!data) return { title: 'Profile Not Found' }
  return { title: `${data.full_name} — PH Profile Compare` }
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

  const activeLegal = p.legal_records?.filter(
    (r) => r.status === 'pending' || r.status === 'convicted'
  ) ?? []

  const convictionCount = p.legal_records?.filter((r) => r.status === 'convicted' && r.is_verified).length ?? 0
  const hasDynasty = !!p.dynasty_name
  const redFlagCount = convictionCount + (hasDynasty ? 1 : 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

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

          {/* Scores */}
          <div className="flex flex-row sm:flex-col gap-3 shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Objective</div>
              <ScoreBadge score={p.objective_score} size="lg" />
              {p.objective_score == null && (
                <p className="text-xs text-slate-400 mt-1 w-16">No data</p>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Trust</div>
              {p.civic_trust_score != null ? (
                <ScoreBadge score={p.civic_trust_score} size="lg" variant="trust" />
              ) : (
                <div className="w-20 h-16 rounded-2xl bg-purple-50 border-2 border-purple-100 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-xs font-bold text-purple-400 leading-tight text-center">Be first</span>
                  <span className="text-xs font-bold text-purple-400 leading-tight text-center">to rate</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Red Flags</div>
              <div className={`w-20 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 ${
                redFlagCount > 0
                  ? 'bg-red-50 border-red-300'
                  : 'bg-slate-50 border-slate-200'
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0038a8] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-lg transition-colors mb-6"
      >
        Compare {p.preferred_name ?? p.full_name} with another candidate →
      </Link>

      {/* Education */}
      {p.education_records && p.education_records.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#0038a8] rounded-md flex items-center justify-center text-white text-sm leading-none">🎓</span>
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
            <span className="w-6 h-6 bg-[#0038a8] rounded-md flex items-center justify-center text-white text-sm leading-none">📋</span>
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

      {/* All legal */}
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
                <div key={rec.id} className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <LegalBadge record={rec} expanded />
                  </div>
                  <div className="shrink-0 pt-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums border ${
                      penalty > 0
                        ? rec.is_verified ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-400 bg-slate-50 border-slate-200'
                        : 'text-slate-400 bg-slate-50 border-slate-200'
                    }`}>
                      {penalty > 0 ? `−${penalty} pts` : '0 pts'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Dynasty */}
      <DynastySection
        politician={p}
        connections={p.dynasty_connections ?? []}
      />

      <AttributionFooter politician={p} />
    </div>
  )
}
