'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLens } from './LensProvider'
import type { Lens } from '@/lib/scoring'

const SLIDERS: { key: keyof Lens; label: string; description: string; methodologyAnchor: string }[] = [
  {
    key: 'edu',
    label: 'Education',
    description: 'CHED accreditation tier of each verified degree',
    methodologyAnchor: 'education',
  },
  {
    key: 'track',
    label: 'Track Record',
    description: 'COA audit, attendance, bills enacted, DILG SGLG',
    methodologyAnchor: 'track-record',
  },
  {
    key: 'achievement',
    label: 'Achievements',
    description: 'Bills enacted into law and verified accomplishments',
    methodologyAnchor: 'achievements',
  },
  {
    key: 'awards',
    label: 'Awards',
    description: 'Magsaysay, Order of Lakandula, TOYM, other named awards',
    methodologyAnchor: 'awards',
  },
]

export default function LensPanel() {
  const { lens, setLens, reset, isCanonical, hydrated } = useLens()
  const [open, setOpen] = useState(false)

  if (!hydrated) {
    // Skeleton — server and initial client render match
    return null
  }

  function update(key: keyof Lens, value: number) {
    setLens({ ...lens, [key]: value })
  }

  return (
    <section className="card p-4 mt-5 border-l-4 border-l-amber-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
      >
        <div className="text-left">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Personal Lens</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">
            {isCanonical
              ? 'Adjust how much each category contributes to the score'
              : 'Lens active — composite score reflects your weighting'}
          </p>
        </div>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Each slider reduces how much that category can contribute to the composite Politiko Score (canonical = 100%).
            Reducing a category never goes below 0; you cannot increase past canonical.
            Penalties (legal cases, SALN integrity) stay fixed at institutional values.
          </p>

          {SLIDERS.map(({ key, label, description, methodologyAnchor }) => {
            const pct = Math.round((lens[key] ?? 1) * 100)
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <Link
                      href={`/methodology#${methodologyAnchor}`}
                      className="text-sm font-bold text-slate-900 hover:text-[#1B2A4A] hover:underline"
                    >
                      {label}
                    </Link>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                  <span className={`text-sm font-black tabular-nums ${pct === 100 ? 'text-slate-400' : 'text-amber-700'}`}>
                    {pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pct}
                  onChange={(e) => update(key, parseInt(e.target.value, 10) / 100)}
                  className="w-full accent-amber-500"
                  aria-label={`${label} weight`}
                />
              </div>
            )
          })}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Saved on this device only. Not shared.
            </p>
            <button
              type="button"
              onClick={reset}
              disabled={isCanonical}
              className="text-xs font-bold text-slate-500 hover:text-[#1B2A4A] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 hover:border-[#1B2A4A] px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset to canonical
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
