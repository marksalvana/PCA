'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  regions: string[]
  parties: string[]
  totalCount: number
  filteredCount: number
}

const SORT_OPTIONS = [
  { value: 'score_desc', label: 'Points: High → Low' },
  { value: 'score_asc', label: 'Points: Low → High' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
]

export default function ProfileFilters({ regions, parties, totalCount, filteredCount }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sort = searchParams.get('sort') ?? 'score_desc'
  const region = searchParams.get('region') ?? ''
  const party = searchParams.get('party') ?? ''
  const q = searchParams.get('q') ?? ''
  const flags = searchParams.get('flags') === 'true'
  const incumbent = searchParams.get('incumbent') === 'true'

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/profiles?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const toggleBool = (key: string, current: boolean) =>
    update(key, current ? null : 'true')

  const hasActiveFilters = q || region || party || flags || incumbent

  function clearAll() {
    const params = new URLSearchParams()
    if (sort !== 'name_asc') params.set('sort', sort)
    router.push(`/profiles${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Search + Sort row */}
      <div className="flex gap-2 flex-col sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search politicians..."
            value={q}
            onChange={(e) => update('q', e.target.value || null)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors cursor-pointer text-slate-700 font-medium"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Quick-filter pills */}
        <button
          onClick={() => toggleBool('incumbent', incumbent)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
            incumbent
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
          }`}
        >
          {incumbent && <span>✓</span>} Incumbent
        </button>

        <button
          onClick={() => toggleBool('flags', flags)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
            flags
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-700'
          }`}
        >
          {flags && <span>✓</span>} ⚑ Has Legal Case
        </button>

        {/* Region select */}
        {regions.length > 1 && (
          <select
            value={region}
            onChange={(e) => update('region', e.target.value || null)}
            className={`text-xs font-medium border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 transition-colors cursor-pointer ${
              region
                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        {/* Party select */}
        {parties.length > 1 && (
          <select
            value={party}
            onChange={(e) => update('party', e.target.value || null)}
            className={`text-xs font-medium border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 transition-colors cursor-pointer ${
              party
                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <option value="">All Parties</option>
            {parties.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors ml-1"
          >
            Clear filters
          </button>
        )}

        {/* Result count */}
        <span className="text-xs text-slate-400 ml-auto">
          {filteredCount === totalCount
            ? `${totalCount} profiles`
            : `${filteredCount} of ${totalCount}`}
        </span>
      </div>
    </div>
  )
}
