import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileStatBar from '@/components/profiles/ProfileStatBar'
import LegalBadge from '@/components/profiles/LegalBadge'
import AttributionFooter from '@/components/profiles/AttributionFooter'
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
    .select(`
      *,
      education_records(*),
      track_records(*),
      legal_records(*),
      achievements(*),
      net_worth_records(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!politician) notFound()

  const p = politician as unknown as PoliticianWithDetails

  const activeLegal = p.legal_records?.filter(
    (r) => r.status === 'pending' || r.status === 'convicted'
  ) ?? []

  return (
    <div className="px-4 py-10 max-w-4xl mx-auto">
      {/* Header card */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Photo */}
          <div className="shrink-0">
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt={p.full_name}
                width={100}
                height={100}
                className="rounded-full object-cover border-2 border-[#0038a8]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1f2937] border-2 border-white/10 flex items-center justify-center text-3xl font-black text-gray-600">
                {p.full_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              {p.is_incumbent && (
                <span className="bg-[#0038a8]/20 text-[#60a5fa] text-xs font-semibold px-2 py-0.5 rounded">
                  Incumbent
                </span>
              )}
              {p.is_candidate && (
                <span className="bg-[#fcd116]/10 text-[#fcd116] text-xs font-semibold px-2 py-0.5 rounded">
                  Candidate
                </span>
              )}
              {p.party_affiliation && (
                <span className="bg-white/5 text-gray-400 text-xs px-2 py-0.5 rounded">
                  {p.party_affiliation}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{p.full_name}</h1>
            {p.current_position && (
              <p className="text-gray-400 font-medium">{p.current_position}</p>
            )}
            {p.region && <p className="text-gray-500 text-sm mt-1">{p.region}</p>}
          </div>

          {/* Scores */}
          <div className="flex flex-row sm:flex-col gap-3 shrink-0">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Objective</div>
              <ScoreBadge score={p.objective_score} size="lg" />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Trust</div>
              <ScoreBadge score={p.civic_trust_score} size="lg" variant="trust" />
            </div>
          </div>
        </div>

        {/* Legal alerts — always prominent */}
        {activeLegal.length > 0 && (
          <div className="mt-6 pt-6 border-t border-red-500/20">
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
              Active Legal Cases
            </p>
            <div className="flex flex-col gap-2">
              {activeLegal.map((r) => (
                <LegalBadge key={r.id} record={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compare CTA */}
      <div className="mb-6">
        <Link
          href={`/compare?a=${p.slug}`}
          className="inline-flex items-center gap-2 border border-white/20 hover:border-[#0038a8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Compare with another candidate →
        </Link>
      </div>

      {/* Education */}
      {p.education_records && p.education_records.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Education</h2>
          <div className="flex flex-col gap-3">
            {p.education_records.map((rec) => (
              <div key={rec.id} className="bg-[#111827] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{rec.institution}</p>
                    {rec.degree && <p className="text-gray-400 text-sm">{rec.degree}{rec.field_of_study ? ` — ${rec.field_of_study}` : ''}</p>}
                    {(rec.year_started || rec.year_ended) && (
                      <p className="text-gray-500 text-xs mt-1">
                        {rec.year_started ?? '?'} – {rec.is_completed ? (rec.year_ended ?? '?') : 'present'}
                      </p>
                    )}
                  </div>
                  {rec.institution_score != null && (
                    <ProfileStatBar score={rec.institution_score} label={rec.ched_accreditation ?? 'unknown'} />
                  )}
                </div>
                <SourceLink url={rec.source_url} label={rec.source_label} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track Record */}
      {p.track_records && p.track_records.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Track Record</h2>
          <div className="flex flex-col gap-3">
            {p.track_records.map((rec) => (
              <div key={rec.id} className="bg-[#111827] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{rec.position}</p>
                    {(rec.start_date || rec.end_date) && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {rec.start_date?.slice(0, 4) ?? '?'} – {rec.is_current ? 'present' : (rec.end_date?.slice(0, 4) ?? '?')}
                      </p>
                    )}
                    {rec.coa_finding && rec.coa_finding !== 'not_applicable' && rec.coa_finding !== 'unknown' && (
                      <p className="text-xs mt-1">
                        COA Audit:{' '}
                        <span className={
                          rec.coa_finding === 'unqualified' ? 'text-green-400' :
                          rec.coa_finding === 'qualified' ? 'text-amber-400' : 'text-red-400'
                        }>
                          {rec.coa_finding.charAt(0).toUpperCase() + rec.coa_finding.slice(1)}
                        </span>
                      </p>
                    )}
                    {rec.bills_authored != null && (
                      <p className="text-gray-500 text-xs mt-1">
                        {rec.bills_authored} bills authored · {rec.bills_passed ?? 0} passed
                      </p>
                    )}
                  </div>
                  {rec.performance_score != null && (
                    <ProfileStatBar score={rec.performance_score} label="performance" />
                  )}
                </div>
                <SourceLink url={rec.source_url} label={rec.source_label} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {p.achievements && p.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Achievements</h2>
          <div className="flex flex-col gap-3">
            {p.achievements.map((ach) => (
              <div key={ach.id} className="bg-[#111827] border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-[#fcd116] mt-0.5">★</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{ach.title}</p>
                    {ach.description && <p className="text-gray-400 text-sm mt-1">{ach.description}</p>}
                    {ach.year && <p className="text-gray-500 text-xs mt-1">{ach.year}</p>}
                    <SourceLink url={ach.source_url} label={ach.source_label} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All legal records */}
      {p.legal_records && p.legal_records.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Legal Records</h2>
          <div className="flex flex-col gap-3">
            {p.legal_records.map((rec) => (
              <LegalBadge key={rec.id} record={rec} expanded />
            ))}
          </div>
        </section>
      )}

      <AttributionFooter politician={p} />
    </div>
  )
}
