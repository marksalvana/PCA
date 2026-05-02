'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { PoliticianWithDetails, ScoreBreakdown } from '@/types/database'
import { computePersonalScore, type Lens } from '@/lib/scoring'

type Props = {
  a: PoliticianWithDetails
  b: PoliticianWithDetails
  lens: Lens
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

function CanonicalNumber({ score }: { score: number | null }) {
  return (
    <span className="text-2xl font-black tabular-nums text-slate-900">
      {score != null ? Math.round(score) : '—'}
    </span>
  )
}

function PersonalizedNumber({
  score,
  breakdown,
  lens,
}: {
  score: number | null
  breakdown: ScoreBreakdown | null
  lens: Lens
}) {
  const value = computePersonalScore(breakdown, score, lens)
  return (
    <div className="relative inline-block">
      <span className="text-2xl font-black tabular-nums italic text-amber-700">
        {value != null ? Math.round(value) : '—'}
      </span>
      {/* Diagonal watermark — survives moderate cropping */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[7px] font-bold tracking-widest text-amber-900/40 -rotate-12 whitespace-nowrap"
      >
        CUSTOM LENS
      </span>
    </div>
  )
}

function PoliticianCard({
  p,
  lens,
}: {
  p: PoliticianWithDetails
  lens: Lens
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {p.photo_url ? (
        <Image
          src={p.photo_url}
          alt={p.full_name}
          width={88}
          height={88}
          className="rounded-2xl border-2 border-amber-300 shadow-sm object-cover"
        />
      ) : (
        <div className="w-[88px] h-[88px] rounded-2xl bg-slate-100 border-2 border-amber-300 flex items-center justify-center text-3xl font-black text-slate-400">
          {p.full_name.charAt(0)}
        </div>
      )}
      <div>
        <Link
          href={`/profiles/${p.slug}`}
          className="font-black text-slate-900 hover:text-[#1B2A4A] transition-colors text-base"
        >
          {p.preferred_name ?? p.full_name}
        </Link>
        {p.current_position && (
          <p className="text-slate-500 text-xs mt-0.5">{p.current_position}</p>
        )}
      </div>

      {/* Side-by-side scores: canonical | custom */}
      <div className="grid grid-cols-2 gap-3 w-full mt-2">
        <div className="rounded-xl bg-white border border-slate-200 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Politiko Score
          </p>
          <CanonicalNumber score={p.objective_score} />
        </div>
        <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
            Custom Lens
          </p>
          <PersonalizedNumber
            score={p.objective_score}
            breakdown={p.score_breakdown}
            lens={lens}
          />
        </div>
      </div>
    </div>
  )
}

export default function CustomLensView({ a, b, lens }: Props) {
  const params = new URLSearchParams({ a: a.slug, b: b.slug }).toString()
  const sliderStrip = [
    { label: 'Education', value: lens.edu },
    { label: 'Track Record', value: lens.track },
    { label: 'Achievements', value: lens.achievement },
    { label: 'Awards', value: lens.awards },
  ]

  return (
    // Distinct page background tint — visible even in cropped screenshots
    <div className="bg-amber-50/60 -mx-4 px-4 py-6 rounded-2xl border-2 border-amber-200">

      {/* Mandatory undismissable warning banner */}
      <div className="bg-amber-900 text-amber-50 -mx-4 -mt-6 px-4 py-3 rounded-t-2xl border-b-2 border-amber-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-black text-sm">⚠ Custom Lens View</p>
          <p className="text-xs text-amber-100/90 mt-0.5">
            You&apos;re viewing this comparison with weights chosen by another user.
            These are not Politiko&apos;s official scores.
          </p>
        </div>
        <Link
          href={`/compare?${params}`}
          className="text-xs font-bold bg-amber-50 text-amber-900 hover:bg-white px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
        >
          View canonical comparison →
        </Link>
      </div>

      {/* Slider settings strip — transparent, always visible */}
      <div className="mt-5 mb-5 flex flex-wrap gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mr-2 self-center">
          Weights applied:
        </p>
        {sliderStrip.map(({ label, value }) => {
          const reduced = value < 1.0
          return (
            <span
              key={label}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                reduced
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {label} <span className="font-black tabular-nums">{pct(value)}</span>
            </span>
          )
        })}
      </div>

      {/* Side-by-side politician cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PoliticianCard p={a} lens={lens} />
        <PoliticianCard p={b} lens={lens} />
      </div>

      {/* Per-component breakdown so the custom score's reasoning is auditable */}
      <div className="mt-6 card p-4 bg-white">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
          Component breakdown — institutional, unchanged by lens
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[a, b].map((p) => (
            <div key={p.id} className="flex flex-col gap-1">
              <p className="font-bold text-slate-700 text-sm mb-1 truncate">
                {p.preferred_name ?? p.full_name}
              </p>
              {p.score_breakdown ? (
                <>
                  <Row label="Education" value={p.score_breakdown.edu} max={p.score_breakdown.edu_max} />
                  <Row label="Track Record" value={p.score_breakdown.track} max={p.score_breakdown.track_max} />
                  <Row label="Achievements" value={p.score_breakdown.achievement} max={p.score_breakdown.achievement_max} />
                  <Row label="Awards" value={p.score_breakdown.awards} max={p.score_breakdown.awards_max} />
                  <PenaltyRow label="Pending cases" value={p.score_breakdown.legal_pending} />
                  <PenaltyRow label="Convictions" value={p.score_breakdown.legal_conviction} />
                  <PenaltyRow label="Other legal" value={p.score_breakdown.legal_other} />
                  <PenaltyRow label="SALN integrity" value={p.score_breakdown.saln_penalty} />
                </>
              ) : (
                <p className="text-slate-400 italic">No breakdown — score not yet computed.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-amber-800/80 italic mt-5 text-center leading-relaxed">
        Penalties (legal cases, SALN integrity) are not adjustable by the lens —
        they remain at canonical institutional values.
      </p>
    </div>
  )
}

function Row({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="tabular-nums font-semibold text-slate-700">
        {Math.round(value)}<span className="text-slate-300"> / {max}</span>
      </span>
    </div>
  )
}

function PenaltyRow({ label, value }: { label: string; value: number }) {
  if (value === 0) return null
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="tabular-nums font-semibold text-red-700">−{Math.round(value)}</span>
    </div>
  )
}
