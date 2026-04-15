'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Politician } from '@/types/database'

type Props = {
  politicians: Politician[]
  selectedA?: string
  selectedB?: string
}

export default function CompareSelector({ politicians, selectedA, selectedB }: Props) {
  const router = useRouter()

  function update(side: 'a' | 'b', slug: string) {
    const params = new URLSearchParams()
    if (side === 'a') {
      if (slug) params.set('a', slug)
      if (selectedB) params.set('b', selectedB)
    } else {
      if (selectedA) params.set('a', selectedA)
      if (slug) params.set('b', slug)
    }
    router.push(`/compare?${params.toString()}`)
  }

  function PoliticianOption({ p }: { p: Politician }) {
    return (
      <option key={p.id} value={p.slug}>
        {p.preferred_name ?? p.full_name}{p.current_position ? ` — ${p.current_position}` : ''}
      </option>
    )
  }

  const pA = politicians.find((p) => p.slug === selectedA)
  const pB = politicians.find((p) => p.slug === selectedB)

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Slot A */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Candidate A</label>
          <select
            value={selectedA ?? ''}
            onChange={(e) => update('a', e.target.value)}
            className="w-full bg-[#0a0a0f] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          >
            <option value="">Select a candidate…</option>
            {politicians.map((p) => <PoliticianOption key={p.id} p={p} />)}
          </select>
          {pA && (
            <div className="flex items-center gap-2 mt-2">
              {pA.photo_url ? (
                <Image src={pA.photo_url} alt={pA.full_name} width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1f2937] flex items-center justify-center text-xs font-bold text-gray-500">
                  {pA.full_name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-400">{pA.current_position}</span>
            </div>
          )}
        </div>

        {/* VS divider */}
        <div className="hidden sm:flex items-center justify-center absolute left-1/2 -translate-x-1/2 self-center">
        </div>

        {/* Slot B */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Candidate B</label>
          <select
            value={selectedB ?? ''}
            onChange={(e) => update('b', e.target.value)}
            className="w-full bg-[#0a0a0f] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          >
            <option value="">Select a candidate…</option>
            {politicians.map((p) => <PoliticianOption key={p.id} p={p} />)}
          </select>
          {pB && (
            <div className="flex items-center gap-2 mt-2">
              {pB.photo_url ? (
                <Image src={pB.photo_url} alt={pB.full_name} width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1f2937] flex items-center justify-center text-xs font-bold text-gray-500">
                  {pB.full_name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-400">{pB.current_position}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
