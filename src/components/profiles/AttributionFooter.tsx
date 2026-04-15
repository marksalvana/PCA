import type { PoliticianWithDetails } from '@/types/database'

type Props = { politician: PoliticianWithDetails }

export default function AttributionFooter({ politician: p }: Props) {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row gap-2 text-xs text-slate-500">
        {p.creator && (
          <span>Created by <span className="font-semibold text-slate-700">{p.creator.display_name}</span></span>
        )}
        {p.vetters && p.vetters.length > 0 && (
          <span className={p.creator ? 'sm:before:content-["·"] sm:before:mx-2' : ''}>
            Vetted by{' '}
            <span className="font-semibold text-slate-700">{p.vetters.map((v) => v.display_name).join(', ')}</span>
          </span>
        )}
        {!p.creator && (!p.vetters || p.vetters.length === 0) && (
          <span className="italic text-slate-400">Attribution pending</span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">All data sourced from official public records. Scores computed from objective benchmarks.</p>
    </div>
  )
}
