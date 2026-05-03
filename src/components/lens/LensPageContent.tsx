'use client'

import Link from 'next/link'
import { useLens } from './LensProvider'
import { computePersonalScore, type Lens } from '@/lib/scoring'
import type { ScoreBreakdown } from '@/types/database'

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

type Preview = {
  slug: string
  name: string
  score: number | null
  breakdown: ScoreBreakdown | null
} | null

export default function LensPageContent({ preview }: { preview: Preview }) {
  const { lens, setLens, reset, isCanonical, hydrated } = useLens()

  function update(key: keyof Lens, value: number) {
    setLens({ ...lens, [key]: value })
  }

  const previewPersonal = preview
    ? computePersonalScore(preview.breakdown, preview.score, lens)
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-4">
          Personal Lens
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">
          Adjust your weighting
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Choose how much each category contributes to the Politiko Score on your view.
          Reduce-only — canonical is the maximum. Penalties (legal cases, SALN integrity)
          stay fixed at institutional values. Settings save on this device only and are
          never shared.
        </p>
      </div>

      {/* Sliders */}
      <div className="card p-6 mb-5">
        {!hydrated ? (
          <p className="text-sm text-slate-400 italic py-8 text-center">Loading your lens…</p>
        ) : (
          <div className="flex flex-col gap-5">
            {SLIDERS.map(({ key, label, description, methodologyAnchor }) => {
              const pct = Math.round((lens[key] ?? 1) * 100)
              const reduced = pct < 100
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <Link
                        href={`/methodology#${methodologyAnchor}`}
                        className="text-base font-bold text-slate-900 hover:text-[#1B2A4A] hover:underline"
                      >
                        {label}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <span
                      className={`text-base font-black tabular-nums ${reduced ? 'text-amber-700' : 'text-slate-400'}`}
                    >
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {isCanonical
                  ? 'No changes — your view matches Politiko\'s canonical scores.'
                  : 'Lens active — your view differs from canonical.'}
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
      </div>

      {/* Live preview */}
      {preview && hydrated && (
        <div className="card p-5 mb-5 border-l-4 border-l-amber-300">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
            Preview — {preview.name}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Politiko Score
              </p>
              <p className="text-3xl font-black tabular-nums text-slate-900">
                {preview.score != null ? Math.round(preview.score) : '—'}
              </p>
            </div>
            <div className={`rounded-xl border-2 p-4 text-center ${isCanonical ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-300'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCanonical ? 'text-slate-500' : 'text-amber-700'}`}>
                Your Lens
              </p>
              <p className={`text-3xl font-black tabular-nums ${isCanonical ? 'text-slate-700' : 'text-amber-800 italic'}`}>
                {previewPersonal != null ? Math.round(previewPersonal) : '—'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic mt-3 text-center">
            Drag a slider to see this number change. Per-component values come from {preview.name}&apos;s verified records.
          </p>
        </div>
      )}

      {/* Where it applies */}
      <div className="card p-5 mb-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Where your lens applies
        </p>
        <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
          <li>• <Link href="/profiles" className="text-[#1B2A4A] hover:underline">All profiles</Link> — Objective Score in each card reflects your weights</li>
          <li>• Individual profile pages — header score and bar reflect your weights</li>
          <li>• <Link href="/compare" className="text-[#1B2A4A] hover:underline">Compare page</Link> — both candidates&apos; objective scores reflect your weights</li>
          <li>• Per-component data (Education, Track Record, etc.) is institutional — never modified</li>
          <li>• Civic Trust Score is community sentiment — never affected by lens</li>
        </ul>
      </div>

      {/* CTA back */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Link
          href="/profiles"
          className="text-sm font-semibold text-[#1B2A4A] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to profiles
        </Link>
        <Link
          href="/compare"
          className="text-sm font-semibold text-[#1B2A4A] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          Compare with this lens →
        </Link>
      </div>
    </div>
  )
}
