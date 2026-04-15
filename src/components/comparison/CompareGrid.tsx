import Image from 'next/image'
import Link from 'next/link'
import type { PoliticianWithDetails } from '@/types/database'
import StatDuel from './StatDuel'
import ScoreBadge from '@/components/ui/ScoreBadge'
import LegalBadge from '@/components/profiles/LegalBadge'

type Props = {
  a: PoliticianWithDetails
  b: PoliticianWithDetails
}

function Avatar({ p }: { p: PoliticianWithDetails }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {p.photo_url ? (
        <Image
          src={p.photo_url}
          alt={p.full_name}
          width={72}
          height={72}
          className="rounded-full border-2 border-[#0038a8]"
        />
      ) : (
        <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-[#1f2937] border-2 border-white/10 flex items-center justify-center text-2xl font-black text-gray-600">
          {p.full_name.charAt(0)}
        </div>
      )}
      <div>
        <Link href={`/profiles/${p.slug}`} className="font-bold text-white hover:text-[#60a5fa] transition-colors text-sm">
          {p.preferred_name ?? p.full_name}
        </Link>
        {p.current_position && (
          <p className="text-gray-500 text-xs">{p.current_position}</p>
        )}
      </div>
    </div>
  )
}

export default function CompareGrid({ a, b }: Props) {
  // Compute average education score
  const avgEdScore = (p: PoliticianWithDetails) => {
    const verified = p.education_records?.filter((r) => r.is_verified && r.institution_score != null)
    if (!verified?.length) return null
    return verified.reduce((sum, r) => sum + (r.institution_score ?? 0), 0) / verified.length
  }

  const avgTrackScore = (p: PoliticianWithDetails) => {
    const verified = p.track_records?.filter((r) => r.is_verified && r.performance_score != null)
    if (!verified?.length) return null
    return verified.reduce((sum, r) => sum + (r.performance_score ?? 0), 0) / verified.length
  }

  const legalPenalty = (p: PoliticianWithDetails) => {
    const pending = p.legal_records?.filter((r) => r.status === 'pending').length ?? 0
    const convicted = p.legal_records?.filter((r) => r.status === 'convicted').length ?? 0
    return pending * 10 + convicted * 20
  }

  const activeLegalA = a.legal_records?.filter((r) => r.status === 'pending' || r.status === 'convicted') ?? []
  const activeLegalB = b.legal_records?.filter((r) => r.status === 'pending' || r.status === 'convicted') ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <Avatar p={a} />
          <Avatar p={b} />
        </div>

        {/* Overall scores */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {[a, b].map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Objective Score</div>
                <ScoreBadge score={p.objective_score} size="lg" />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Community Trust</div>
                <ScoreBadge score={p.civic_trust_score} size="md" variant="trust" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat duels */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 md:p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Score Breakdown</h3>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 text-right text-xs font-bold text-white truncate">{a.preferred_name ?? a.full_name}</div>
          <div className="w-28 shrink-0" />
          <div className="flex-1 text-xs font-bold text-white truncate">{b.preferred_name ?? b.full_name}</div>
        </div>

        <StatDuel label="Objective" scoreA={a.objective_score} scoreB={b.objective_score} />
        <StatDuel label="Education" scoreA={avgEdScore(a)} scoreB={avgEdScore(b)} />
        <StatDuel label="Track Record" scoreA={avgTrackScore(a)} scoreB={avgTrackScore(b)} />
        <StatDuel label="Legal Penalty" scoreA={-legalPenalty(a) || null} scoreB={-legalPenalty(b) || null} />
        <StatDuel label="Community Trust" scoreA={a.civic_trust_score} scoreB={b.civic_trust_score} />
      </div>

      {/* Legal alerts — side by side */}
      {(activeLegalA.length > 0 || activeLegalB.length > 0) && (
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 md:p-6">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Active Legal Cases</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">{a.preferred_name ?? a.full_name}</p>
              {activeLegalA.length > 0
                ? activeLegalA.map((r) => <LegalBadge key={r.id} record={r} />)
                : <p className="text-xs text-gray-600">None</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">{b.preferred_name ?? b.full_name}</p>
              {activeLegalB.length > 0
                ? activeLegalB.map((r) => <LegalBadge key={r.id} record={r} />)
                : <p className="text-xs text-gray-600">None</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
