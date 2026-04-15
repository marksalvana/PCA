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
                className="rounded-2xl object-cover border border-slate-200 shadow-sm"
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
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-purple-100 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-xs font-bold text-purple-400 leading-tight text-center">Be first</span>
                  <span className="text-xs font-bold text-purple-400 leading-tight text-center">to rate</span>
                </div>
              )}
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
            <span className="w-6 h-6 bg-[#0038a8] rounded-md flex items-center justify-center text-white text-xs">🎓</span>
            Education
          </h2>
          <div className="flex flex-col gap-2">
            {p.education_records.map((rec) => (
              <div key={rec.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{rec.institution}</p>
                      {rec.is_completed === false && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">Incomplete</span>
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
                  {rec.institution_score != null && (
                    <ProfileStatBar score={rec.institution_score} label={rec.ched_accreditation ?? 'unknown'} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track Record */}
      {p.track_records && p.track_records.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#0038a8] rounded-md flex items-center justify-center text-white text-xs">📋</span>
            Track Record
          </h2>
          <div className="flex flex-col gap-2">
            {p.track_records.map((rec) => (
              <div key={rec.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{rec.position}</p>
                    {(rec.start_date || rec.end_date) && (
                      <p className="text-slate-400 text-xs mt-0.5">
                        {rec.start_date?.slice(0, 4) ?? '?'} – {rec.is_current ? 'present' : (rec.end_date?.slice(0, 4) ?? '?')}
                      </p>
                    )}
                    {rec.coa_finding && rec.coa_finding !== 'not_applicable' && rec.coa_finding !== 'unknown' && (
                      <p className="text-xs mt-1">
                        COA:{' '}
                        <span className={rec.coa_finding === 'unqualified' ? 'text-green-700 font-semibold' : rec.coa_finding === 'qualified' ? 'text-amber-700 font-semibold' : 'text-red-700 font-semibold'}>
                          {rec.coa_finding.charAt(0).toUpperCase() + rec.coa_finding.slice(1)}
                        </span>
                      </p>
                    )}
                    {rec.bills_authored != null && (
                      <p className="text-slate-400 text-xs mt-1">{rec.bills_authored} bills authored · {rec.bills_passed ?? 0} passed</p>
                    )}
                    <SourceLink url={rec.source_url} label={rec.source_label} />
                  </div>
                  {rec.performance_score != null && (
                    <ProfileStatBar score={rec.performance_score} label={rec.coa_finding && rec.coa_finding !== 'not_applicable' && rec.coa_finding !== 'unknown' ? rec.coa_finding : 'not_applicable'} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {p.achievements && p.achievements.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center text-white text-xs">★</span>
            Achievements
          </h2>
          <div className="flex flex-col gap-2">
            {p.achievements.map((ach) => (
              <div key={ach.id} className="card p-4 border-l-4 border-l-amber-400">
                <p className="font-semibold text-slate-900">{ach.title}</p>
                {ach.description && <p className="text-slate-500 text-sm mt-1">{ach.description}</p>}
                {ach.year && <p className="text-slate-400 text-xs mt-0.5">{ach.year}</p>}
                <SourceLink url={ach.source_url} label={ach.source_label} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All legal */}
      {p.legal_records && p.legal_records.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center text-white text-xs">⚖</span>
            Legal Records
          </h2>
          <div className="flex flex-col gap-2">
            {p.legal_records.map((rec) => <LegalBadge key={rec.id} record={rec} expanded />)}
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
