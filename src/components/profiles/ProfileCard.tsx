import Link from 'next/link'
import Image from 'next/image'
import type { Politician } from '@/types/database'
import ScoreBadge from '@/components/ui/ScoreBadge'
import { objectiveScoreBarPct, objectiveScoreColor } from '@/lib/scoring'

type Props = { politician: Politician }

function scoreBorderColor(score: number | null) {
  if (score == null) return 'border-slate-200'
  if (score >= 300) return 'border-l-green-400'
  if (score >= 100) return 'border-l-amber-400'
  return 'border-l-red-400'
}

export default function ProfileCard({ politician: p }: Props) {
  const borderColor = scoreBorderColor(p.objective_score)

  return (
    <Link
      href={`/profiles/${p.slug}`}
      className={`card card-hover group block border-l-4 ${borderColor} transition-all duration-150`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0">
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt={p.full_name}
                width={64}
                height={64}
                className="rounded-xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400">
                {p.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 flex-wrap mb-1">
              {p.is_incumbent && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">Incumbent</span>
              )}
              {p.is_candidate && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">Candidate</span>
              )}
            </div>
            <p className="font-black text-slate-900 text-base leading-tight group-hover:text-[#0038a8] transition-colors">
              {p.preferred_name ?? p.full_name}
            </p>
            {p.current_position && (
              <p className="text-slate-500 text-xs mt-0.5 leading-snug">{p.current_position}</p>
            )}
            {p.party_affiliation && (
              <p className="text-slate-400 text-xs truncate">{p.party_affiliation}</p>
            )}
          </div>
        </div>

        {/* Objective Score */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Objective Score</span>
              <span className="text-xs text-slate-300" title="Education + COA audit + legal record">ⓘ</span>
            </div>
            <ScoreBadge score={p.objective_score} size="sm" />
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full score-bar-fill"
              style={{
                width: `${objectiveScoreBarPct(p.objective_score)}%`,
                backgroundColor: objectiveScoreColor(p.objective_score),
              }}
            />
          </div>
          {p.objective_score == null && (
            <p className="text-xs text-slate-400 italic">Insufficient verified data</p>
          )}
        </div>

        {/* Community Trust */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          {p.civic_trust_score != null ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Community Trust</span>
                <ScoreBadge score={p.civic_trust_score} size="sm" variant="trust" />
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-400 score-bar-fill" style={{ width: `${p.civic_trust_score}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Community Trust</span>
              <span className="text-xs text-[#0038a8] font-semibold">Rate this politician →</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
