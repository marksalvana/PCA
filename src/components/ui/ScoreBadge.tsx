type Props = {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
  variant?: 'objective' | 'trust'
}

function scoreColor(score: number | null, variant: 'objective' | 'trust'): string {
  if (score == null) return 'text-gray-600 bg-gray-600/10 border-gray-600/20'
  if (score >= 70) return variant === 'trust'
    ? 'text-purple-400 bg-purple-400/10 border-purple-400/30'
    : 'text-green-400 bg-green-400/10 border-green-400/30'
  if (score >= 40) return variant === 'trust'
    ? 'text-purple-400/70 bg-purple-400/5 border-purple-400/20'
    : 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  return variant === 'trust'
    ? 'text-purple-300/50 bg-purple-300/5 border-purple-300/10'
    : 'text-red-400 bg-red-400/10 border-red-400/30'
}

const sizeClass = {
  sm: 'text-sm w-10 h-10',
  md: 'text-lg w-12 h-12',
  lg: 'text-2xl w-16 h-16',
}

export default function ScoreBadge({ score, size = 'md', variant = 'objective' }: Props) {
  return (
    <div
      className={`rounded-xl border font-black flex items-center justify-center tabular-nums ${scoreColor(score, variant)} ${sizeClass[size]}`}
    >
      {score != null ? Math.round(score) : '—'}
    </div>
  )
}
