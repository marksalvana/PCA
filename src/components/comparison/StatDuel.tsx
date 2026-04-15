type Props = { label: string; scoreA: number | null; scoreB: number | null }

function barColor(score: number | null) {
  if (score == null) return '#e2e8f0'
  if (score >= 70) return '#16a34a'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function textColor(score: number | null) {
  if (score == null) return 'text-slate-400'
  if (score >= 70) return 'text-green-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-red-700'
}

export default function StatDuel({ label, scoreA, scoreB }: Props) {
  const aWins = scoreA != null && (scoreB == null || scoreA > scoreB)
  const bWins = scoreB != null && (scoreA == null || scoreB > scoreA)

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      {/* A side — reversed */}
      <div className="flex-1 flex flex-row-reverse items-center gap-2">
        <span className={`text-sm font-black tabular-nums w-7 text-right ${textColor(scoreA)} ${aWins ? 'opacity-100' : 'opacity-50'}`}>
          {scoreA != null ? Math.round(scoreA) : '—'}
        </span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full score-bar-fill ml-auto" style={{ width: `${scoreA ?? 0}%`, backgroundColor: barColor(scoreA) }} />
        </div>
      </div>

      <div className="w-28 shrink-0 text-center">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</span>
      </div>

      {/* B side */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full score-bar-fill" style={{ width: `${scoreB ?? 0}%`, backgroundColor: barColor(scoreB) }} />
        </div>
        <span className={`text-sm font-black tabular-nums w-7 ${textColor(scoreB)} ${bWins ? 'opacity-100' : 'opacity-50'}`}>
          {scoreB != null ? Math.round(scoreB) : '—'}
        </span>
      </div>
    </div>
  )
}
