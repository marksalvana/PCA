import Link from 'next/link'
import Image from 'next/image'
import type { Politician } from '@/types/database'
import ScoreBadge from '@/components/ui/ScoreBadge'

type Props = { politician: Politician }

function scoreBarColor(score: number | null) {
  if (score == null) return '#e2e8f0'
  if (score >= 70) return '#16a34a'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

export default function ProfileCard({ politician: p }: Props) {
  const hasLegalIssues = false // Will be enhanced when legal_records are joined

  return (
    <Link
      href={`/profiles/${p.slug}`}
      className="card card-hover group block transition-all duration-150"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0">
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt={p.full_name}
                width={56}
                height={56}
                className="rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-black text-slate-400">
                {p.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 flex-wrap mb-0.5">
              {p.is_incumbent && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">Incumbent</span>
              )}
              {p.is_candidate && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">Candidate</span>
              )}
            </div>
            <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-[#0038a8] transition-colors">
              {p.preferred_name ?? p.full_name}
            </p>
            {p.current_position && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{p.current_position}</p>
            )}
            {p.party_affiliation && (
              <p className="text-slate-400 text-xs truncate">{p.party_affiliation}</p>
            )}
          </div>
        </div>

        {/* Objective Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Objective Score</span>
            <ScoreBadge score={p.objective_score} size="sm" />
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full score-bar-fill"
              style={{
                width: `${p.objective_score ?? 0}%`,
                backgroundColor: scoreBarColor(p.objective_score),
              }}
            />
          </div>
        </div>

        {/* Community Trust */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Community Trust</span>
            <ScoreBadge score={p.civic_trust_score} size="sm" variant="trust" />
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-400 score-bar-fill"
              style={{ width: `${p.civic_trust_score ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
