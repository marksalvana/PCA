import Link from 'next/link'
import type { Politician } from '@/types/database'

type Props = { profiles: Politician[] }

export default function VettingQueue({ profiles }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-16 border border-white/10 rounded-xl text-gray-500">
        No profiles in the vetting queue.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {profiles.map((p) => (
        <div key={p.id} className="bg-[#111827] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white">{p.full_name}</p>
            {p.current_position && <p className="text-gray-400 text-sm truncate">{p.current_position}</p>}
            <p className="text-gray-600 text-xs mt-1">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
          </div>
          <Link
            href={`/vetting/${p.id}`}
            className="shrink-0 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            Review →
          </Link>
        </div>
      ))}
    </div>
  )
}
