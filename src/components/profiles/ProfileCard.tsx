import Link from 'next/link'
import Image from 'next/image'
import type { Politician } from '@/types/database'
import ScoreBadge from '@/components/ui/ScoreBadge'

type Props = { politician: Politician }

export default function ProfileCard({ politician: p }: Props) {
  return (
    <Link
      href={`/profiles/${p.slug}`}
      className="group bg-[#111827] border border-white/10 hover:border-[#0038a8]/60 rounded-2xl p-4 flex flex-col gap-4 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {p.photo_url ? (
            <Image
              src={p.photo_url}
              alt={p.full_name}
              width={52}
              height={52}
              className="rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#1f2937] border border-white/10 flex items-center justify-center text-xl font-black text-gray-600">
              {p.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate group-hover:text-[#60a5fa] transition-colors">
            {p.preferred_name ?? p.full_name}
          </p>
          {p.current_position && (
            <p className="text-gray-500 text-xs mt-0.5 truncate">{p.current_position}</p>
          )}
          {p.party_affiliation && (
            <p className="text-gray-600 text-xs truncate">{p.party_affiliation}</p>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">Objective Score</div>
          <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full score-bar-fill"
              style={{
                width: `${p.objective_score ?? 0}%`,
                backgroundColor: p.objective_score != null && p.objective_score >= 70 ? '#22c55e'
                  : p.objective_score != null && p.objective_score >= 40 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
        <ScoreBadge score={p.objective_score} size="sm" />
      </div>

      {/* Trust score — visually distinct */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">Community Trust</div>
          <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 score-bar-fill"
              style={{ width: `${p.civic_trust_score ?? 0}%` }}
            />
          </div>
        </div>
        <ScoreBadge score={p.civic_trust_score} size="sm" variant="trust" />
      </div>
    </Link>
  )
}
