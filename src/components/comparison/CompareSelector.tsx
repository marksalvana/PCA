'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Politician } from '@/types/database'

type Props = { politicians: Politician[]; selectedA?: string; selectedB?: string }

export default function CompareSelector({ politicians, selectedA, selectedB }: Props) {
  const router = useRouter()

  function update(side: 'a' | 'b', slug: string) {
    const params = new URLSearchParams()
    if (side === 'a') { if (slug) params.set('a', slug); if (selectedB) params.set('b', selectedB) }
    else { if (selectedA) params.set('a', selectedA); if (slug) params.set('b', slug) }
    router.push(`/compare?${params.toString()}`)
  }

  const pA = politicians.find((p) => p.slug === selectedA)
  const pB = politicians.find((p) => p.slug === selectedB)

  return (
    <div className="card p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {(['a', 'b'] as const).map((side) => {
          const selected = side === 'a' ? pA : pB
          const selectedSlug = side === 'a' ? selectedA : selectedB
          return (
            <div key={side}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Candidate {side.toUpperCase()}
              </label>
              <select
                value={selectedSlug ?? ''}
                onChange={(e) => update(side, e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#1B2A4A] focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
              >
                <option value="">Select a candidate…</option>
                {politicians.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.preferred_name ?? p.full_name}{p.current_position ? ` — ${p.current_position}` : ''}
                  </option>
                ))}
              </select>
              {selected && (
                <div className="flex items-center gap-2 mt-2">
                  {selected.photo_url ? (
                    <Image src={selected.photo_url} alt={selected.full_name} width={28} height={28} className="rounded-lg border border-slate-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                      {selected.full_name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-slate-500 truncate">{selected.current_position}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
