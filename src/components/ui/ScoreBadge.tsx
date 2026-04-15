type Props = {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
  variant?: 'objective' | 'trust'
}

function scoreColor(score: number | null, variant: 'objective' | 'trust') {
  if (score == null) return { bg: 'bg-slate-100', text: 'text-slate-400', border: 'border-slate-200' }
  if (variant === 'trust') {
    if (score >= 70) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    if (score >= 40) return { bg: 'bg-purple-50/50', text: 'text-purple-500', border: 'border-purple-100' }
    return { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200' }
  }
  if (score >= 70) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

const sizes = {
  sm: 'text-sm w-10 h-10 rounded-lg',
  md: 'text-lg w-12 h-12 rounded-xl',
  lg: 'text-2xl w-16 h-16 rounded-2xl',
}

export default function ScoreBadge({ score, size = 'md', variant = 'objective' }: Props) {
  const { bg, text, border } = scoreColor(score, variant)
  return (
    <div className={`border-2 font-black flex items-center justify-center tabular-nums ${bg} ${text} ${border} ${sizes[size]}`}>
      {score != null ? Math.round(score) : '—'}
    </div>
  )
}
