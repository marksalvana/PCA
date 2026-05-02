'use client'

import { useLens } from './LensProvider'
import { computePersonalScore } from '@/lib/scoring'
import type { ScoreBreakdown } from '@/types/database'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  /** Canonical objective_score (server value) */
  score: number | null
  /** Per-component breakdown — required for personal-lens math */
  breakdown: ScoreBreakdown | null
  size?: Size
}

const sizes: Record<Size, string> = {
  sm: 'text-xs w-14 h-10 rounded-lg px-1',
  md: 'text-sm w-16 h-12 rounded-xl px-1',
  lg: 'text-xl w-20 h-16 rounded-2xl px-1',
}

const labelSizes: Record<Size, string> = {
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
}

function objectiveColors(score: number | null) {
  if (score == null) return { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200' }
  if (score >= 300) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (score >= 100) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

export default function LensAwareScoreBadge({ score, breakdown, size = 'md' }: Props) {
  const { lens, isCanonical, hydrated } = useLens()

  // Until localStorage hydrates, render the canonical score so SSR matches.
  const display = !hydrated || isCanonical
    ? score
    : computePersonalScore(breakdown, score, lens)

  const lensActive = hydrated && !isCanonical

  // When lens is active, we use a distinct amber-tinted treatment so a
  // screenshot can't pass off a personalized number as the canonical score.
  const colors = lensActive
    ? { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' }
    : objectiveColors(display)

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className={`border-2 font-black flex items-center justify-center tabular-nums ${colors.bg} ${colors.text} ${colors.border} ${sizes[size]} ${lensActive ? 'italic' : ''}`}
        title={lensActive ? `Personal Lens · canonical = ${score ?? '—'}` : undefined}
      >
        {display != null ? Math.round(display) : '—'}
      </div>
      {lensActive && (
        <span className={`mt-1 ${labelSizes[size]} font-bold uppercase tracking-widest text-amber-700`}>
          Lens
        </span>
      )}
    </div>
  )
}
