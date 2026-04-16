import { objectiveScoreColor, OBJECTIVE_DISPLAY_MAX } from '@/lib/scoring'

type Props = {
  label: string
  scoreA: number | null
  scoreB: number | null
  /** Pass true for the total objective score row so bars are scaled relatively */
  isObjective?: boolean
}

function barColor(score: number | null, isObjective: boolean) {
  if (score == null) return '#e2e8f0'
  if (isObjective) return objectiveScoreColor(score)
  // Per-record bars keep the 0–100 scale thresholds
  if (score >= 70) return '#16a34a'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function textColor(score: number | null, isObjective: boolean) {
  if (score == null) return 'text-slate-400'
  if (isObjective) {
    if (score >= 300) return 'text-green-700'
    if (score >= 100) return 'text-amber-700'
    return 'text-red-700'
  }
  if (score >= 70) return 'text-green-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-red-700'
}

export default function StatDuel({ label, scoreA, scoreB, isObjective = false }: Props) {
  const aWins = scoreA != null && (scoreB == null || scoreA > scoreB)
  const bWins = scoreB != null && (scoreA == null || scoreB > scoreA)

  // For objective score bars: scale relative to the higher of the two scores
  // (the winner always fills the bar; the other is proportional).
  // For per-record bars (0–100), use raw value directly as a percentage.
  const refMax = isObjective
    ? Math.max(scoreA ?? 0, scoreB ?? 0, OBJECTIVE_DISPLAY_MAX)
    : 100
  const pctA = refMax > 0 ? Math.min(100, ((scoreA ?? 0) / refMax) * 100) : 0
  const pctB = refMax > 0 ? Math.min(100, ((scoreB ?? 0) / refMax) * 100) : 0

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      {/* A side — reversed */}
      <div className="flex-1 flex flex-row-reverse items-center gap-2">
        <span className={`text-sm font-black tabular-nums w-10 text-right ${textColor(scoreA, isObjective)} ${aWins ? 'opacity-100' : 'opacity-50'}`}>
          {scoreA != null ? Math.round(scoreA) : '—'}
        </span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full score-bar-fill ml-auto" style={{ width: `${pctA}%`, backgroundColor: barColor(scoreA, isObjective) }} />
        </div>
      </div>

      <div className="w-28 shrink-0 text-center">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</span>
      </div>

      {/* B side */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full score-bar-fill" style={{ width: `${pctB}%`, backgroundColor: barColor(scoreB, isObjective) }} />
        </div>
        <span className={`text-sm font-black tabular-nums w-10 ${textColor(scoreB, isObjective)} ${bWins ? 'opacity-100' : 'opacity-50'}`}>
          {scoreB != null ? Math.round(scoreB) : '—'}
        </span>
      </div>
    </div>
  )
}
