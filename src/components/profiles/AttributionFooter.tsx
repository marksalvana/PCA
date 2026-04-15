import type { PoliticianWithDetails } from '@/types/database'

type Props = { politician: PoliticianWithDetails }

export default function AttributionFooter({ politician: p }: Props) {
  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
        {p.creator && (
          <span>
            Created by <span className="text-gray-400">{p.creator.display_name}</span>
          </span>
        )}
        {p.vetters && p.vetters.length > 0 && (
          <span className={p.creator ? 'sm:before:content-["·"] sm:before:mx-2' : ''}>
            Vetted by{' '}
            <span className="text-gray-400">
              {p.vetters.map((v) => v.display_name).join(', ')}
            </span>
          </span>
        )}
        {(!p.creator && (!p.vetters || p.vetters.length === 0)) && (
          <span className="italic">Attribution pending</span>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1">
        All data sourced from official public records. Scores computed from objective benchmarks.
      </p>
    </div>
  )
}
