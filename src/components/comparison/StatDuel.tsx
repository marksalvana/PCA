type Props = {
  label: string
  scoreA: number | null
  scoreB: number | null
}

function bar(score: number | null, winner: boolean) {
  const color = score == null ? '#374151'
    : score >= 70 ? '#22c55e'
    : score >= 40 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className={`h-2 rounded-full bg-[#1f2937] overflow-hidden`}>
        <div
          className="h-full rounded-full score-bar-fill"
          style={{ width: `${score ?? 0}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={`text-sm font-black tabular-nums ${winner ? 'text-white' : 'text-gray-500'}`}
        style={{ color: score != null ? color : undefined }}
      >
        {score != null ? Math.round(score) : '—'}
      </span>
    </div>
  )
}

export default function StatDuel({ label, scoreA, scoreB }: Props) {
  const aWins = scoreA != null && (scoreB == null || scoreA > scoreB)
  const bWins = scoreB != null && (scoreA == null || scoreB > scoreA)

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      {/* A side */}
      <div className="flex-1 flex flex-row-reverse items-center gap-2">
        {bar(scoreA, aWins)}
      </div>

      {/* Label */}
      <div className="w-28 shrink-0 text-center">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>

      {/* B side */}
      <div className="flex-1 flex items-center gap-2">
        {bar(scoreB, bWins)}
      </div>
    </div>
  )
}
