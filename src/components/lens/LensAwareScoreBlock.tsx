'use client'

import { useLens } from './LensProvider'
import { computePersonalScore, objectiveScoreBarPct, objectiveScoreColor } from '@/lib/scoring'
import type { ScoreBreakdown } from '@/types/database'

type Props = {
  /** Canonical objective_score (server value) */
  score: number | null
  /** Per-component breakdown — required for personal-lens math */
  breakdown: ScoreBreakdown | null
}

function badgeColors(score: number | null) {
  if (score == null) return { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200' }
  if (score >= 300) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (score >= 100) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

/**
 * Score badge + bar for ProfileCard. Renders the canonical score on the
 * server and during initial client render (so SSR matches), then swaps
 * to the lens-adjusted score after localStorage hydrates.
 */
export default function LensAwareScoreBlock({ score, breakdown }: Props) {
  const { lens, isCanonical, hydrated } = useLens()

  const display = !hydrated || isCanonical
    ? score
    : computePersonalScore(breakdown, score, lens)

  const lensActive = hydrated && !isCanonical
  const colors = lensActive
    ? { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' }
    : badgeColors(display)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {lensActive ? 'Your Lens' : 'Objective Score'}
          </span>
          <span className="text-xs text-slate-300" title="Education + COA audit + legal record">ⓘ</span>
        </div>
        <div
          className={`border-2 font-black flex items-center justify-center tabular-nums text-xs w-14 h-10 rounded-lg px-1 ${colors.bg} ${colors.text} ${colors.border} ${lensActive ? 'italic' : ''}`}
          title={lensActive ? `Personal Lens · canonical = ${score ?? '—'}` : undefined}
        >
          {display != null ? Math.round(display) : '—'}
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill"
          style={{
            width: `${objectiveScoreBarPct(display)}%`,
            backgroundColor: lensActive ? '#d97706' : objectiveScoreColor(display),
          }}
        />
      </div>
      {display == null && (
        <p className="text-xs text-slate-400 italic">Insufficient verified data</p>
      )}
    </div>
  )
}
