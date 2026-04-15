type Props = { score: number; label: string }

// Map DB label values to human-readable display labels
const LABEL_MAP: Record<string, string> = {
  performance: 'COA Audit',
  institution: 'Institution',
  foreign: 'Foreign Univ.',
  deregulated: 'Deregulated',
  autonomous: 'Autonomous',
  level_4: 'CHED Level IV',
  level_3: 'CHED Level III',
  level_2: 'CHED Level II',
  level_1: 'CHED Level I',
  unaccredited: 'Unaccredited',
  unknown: 'Unverified',
  unqualified: 'Clean Audit',
  qualified: 'Qualified Audit',
  adverse: 'Adverse Audit',
  disclaimer: 'Disclaimer',
  not_applicable: 'Legislative',
}

export default function ProfileStatBar({ score, label }: Props) {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
  const textColor = score >= 70 ? 'text-green-700' : score >= 40 ? 'text-amber-700' : 'text-red-700'
  const displayLabel = LABEL_MAP[label] ?? label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{displayLabel}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full score-bar-fill"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className={`text-xs font-black tabular-nums w-6 text-right ${textColor}`}>{score}</span>
      </div>
    </div>
  )
}
