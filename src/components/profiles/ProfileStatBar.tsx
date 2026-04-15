type Props = {
  score: number
  label: string
}

export default function ProfileStatBar({ score, label }: Props) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className="text-xs text-gray-500 capitalize">{label.replace(/_/g, ' ')}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full score-bar-fill"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  )
}
