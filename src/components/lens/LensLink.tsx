'use client'

import Link from 'next/link'
import { useLens } from './LensProvider'

/**
 * Small contextual link to /lens. Reflects whether the user's lens is
 * canonical or active so the entry point is obvious from any page.
 */
export default function LensLink() {
  const { lens, isCanonical, hydrated } = useLens()

  // Until hydrated, show the canonical CTA (server-safe).
  const showActive = hydrated && !isCanonical

  // Count how many sliders are reduced from canonical
  const reduced = hydrated
    ? Object.values(lens).filter((v) => v < 1.0).length
    : 0

  return (
    <Link
      href="/lens"
      className={`inline-flex items-center gap-2 text-xs font-bold border px-3 py-1.5 rounded-lg transition-colors ${
        showActive
          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#1B2A4A]'
      }`}
    >
      {showActive ? (
        <>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dynasty-badge" />
          Personal Lens active
          <span className="text-amber-700/70">· {reduced} adjusted</span>
        </>
      ) : (
        <>
          🎚 Personalize
          <span className="text-slate-400">your weighting →</span>
        </>
      )}
    </Link>
  )
}
