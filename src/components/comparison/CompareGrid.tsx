import Image from 'next/image'
import Link from 'next/link'
import type { PoliticianWithDetails } from '@/types/database'
import StatDuel from './StatDuel'
import ScoreBadge from '@/components/ui/ScoreBadge'
import LegalBadge from '@/components/profiles/LegalBadge'

type Props = { a: PoliticianWithDetails; b: PoliticianWithDetails }

function Avatar({ p }: { p: PoliticianWithDetails }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {p.photo_url ? (
        <Image src={p.photo_url} alt={p.full_name} width={72} height={72}
          className="rounded-2xl border border-slate-200 shadow-sm object-cover" />
      ) : (
        <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400">
          {p.full_name.charAt(0)}
        </div>
      )}
      <div>
        <Link href={`/profiles/${p.slug}`} className="font-bold text-slate-900 hover:text-[#0038a8] transition-colors text-sm">
          {p.preferred_name ?? p.full_name}
        </Link>
        {p.current_position && <p className="text-slate-400 text-xs">{p.current_position}</p>}
      </div>
    </div>
  )
}

export default function CompareGrid({ a, b }: Props) {
  const avgEdScore = (p: PoliticianWithDetails) => {
    const v = p.education_records?.filter((r) => r.is_verified && r.institution_score != null)
    return v?.length ? v.reduce((s, r) => s + (r.institution_score ?? 0), 0) / v.length : null
  }
  const avgTrackScore = (p: PoliticianWithDetails) => {
    const v = p.track_records?.filter((r) => r.is_verified && r.performance_score != null)
    return v?.length ? v.reduce((s, r) => s + (r.performance_score ?? 0), 0) / v.length : null
  }
  const legalPenalty = (p: PoliticianWithDetails) => {
    const n = (p.legal_records?.filter((r) => r.status === 'pending').length ?? 0) * 10
      + (p.legal_records?.filter((r) => r.status === 'convicted').length ?? 0) * 20
    return n > 0 ? n : null
  }

  const activeLegalA = a.legal_records?.filter((r) => r.status === 'pending' || r.status === 'convicted') ?? []
  const activeLegalB = b.legal_records?.filter((r) => r.status === 'pending' || r.status === 'convicted') ?? []

  return (
    <div className="flex flex-col gap-5">
      {/* VS Header */}
      <div className="card p-6">
        <div className="grid grid-cols-2 gap-6">
          <Avatar p={a} />
          <Avatar p={b} />
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
          {[a, b].map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Objective</div>
                <ScoreBadge score={p.objective_score} size="lg" />
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Trust</div>
                <ScoreBadge score={p.civic_trust_score} size="md" variant="trust" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat duels */}
      <div className="card p-5 md:p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Score Breakdown</h3>
        <div className="flex items-center gap-3 mb-2 text-xs font-bold text-slate-700">
          <div className="flex-1 text-right truncate">{a.preferred_name ?? a.full_name}</div>
          <div className="w-28 shrink-0" />
          <div className="flex-1 truncate">{b.preferred_name ?? b.full_name}</div>
        </div>
        <StatDuel label="Objective" scoreA={a.objective_score} scoreB={b.objective_score} />
        <StatDuel label="Education" scoreA={avgEdScore(a)} scoreB={avgEdScore(b)} />
        <StatDuel label="Track Record" scoreA={avgTrackScore(a)} scoreB={avgTrackScore(b)} />
        <StatDuel label="Legal Penalty" scoreA={legalPenalty(a) ? -legalPenalty(a)! : null} scoreB={legalPenalty(b) ? -legalPenalty(b)! : null} />
        <StatDuel label="Trust" scoreA={a.civic_trust_score} scoreB={b.civic_trust_score} />
      </div>

      {/* Legal alerts */}
      {(activeLegalA.length > 0 || activeLegalB.length > 0) && (
        <div className="card p-5 border-red-100 bg-red-50/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 dynasty-badge" />
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest">Active Legal Cases</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ p: a, legal: activeLegalA }, { p: b, legal: activeLegalB }].map(({ p, legal }) => (
              <div key={p.id}>
                <p className="text-xs font-semibold text-slate-500 mb-2">{p.preferred_name ?? p.full_name}</p>
                {legal.length > 0
                  ? legal.map((r) => <LegalBadge key={r.id} record={r} />)
                  : <p className="text-xs text-slate-400 italic">None on record</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
