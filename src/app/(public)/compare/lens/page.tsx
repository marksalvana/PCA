import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CustomLensView from '@/components/lens/CustomLensView'
import { clampLens, type Lens } from '@/lib/scoring'
import type { PoliticianWithDetails } from '@/types/database'

export const metadata = {
  title: 'Custom Lens Comparison — Politiko',
  description:
    'A custom-weighted comparison shared by another user. Not Politiko\'s official scores.',
}

// Parse a percentage string (e.g. "60") into a 0–1 multiplier, defaulting to 1.0.
function parsePct(value: string | undefined): number {
  if (!value) return 1.0
  const n = Number(value)
  if (!Number.isFinite(n)) return 1.0
  return n / 100
}

export default async function CustomLensComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    a?: string
    b?: string
    edu?: string
    track?: string
    ach?: string
    awards?: string
  }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  // Both politicians required
  if (!sp.a || !sp.b) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="card p-6">
          <p className="font-bold text-slate-900 mb-2">Missing comparison parameters</p>
          <p className="text-sm text-slate-600 mb-4">
            A custom lens link needs two politicians. The link you followed appears incomplete.
          </p>
          <Link
            href="/compare"
            className="text-sm text-[#1B2A4A] font-bold hover:underline"
          >
            Open the canonical compare page →
          </Link>
        </div>
      </div>
    )
  }

  // Clamp lens values from URL params — silently coerce out-of-range to canonical
  const lens: Lens = clampLens({
    edu: parsePct(sp.edu),
    track: parsePct(sp.track),
    achievement: parsePct(sp.ach),
    awards: parsePct(sp.awards),
  })

  const [{ data: aData }, { data: bData }] = await Promise.all([
    supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', sp.a)
      .eq('status', 'published')
      .single(),
    supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', sp.b)
      .eq('status', 'published')
      .single(),
  ])

  const a = aData as unknown as PoliticianWithDetails | null
  const b = bData as unknown as PoliticianWithDetails | null

  if (!a || !b) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="card p-6">
          <p className="font-bold text-slate-900 mb-2">Profile not found</p>
          <p className="text-sm text-slate-600 mb-4">
            One or both profiles in this custom lens link could not be found or are not published.
          </p>
          <Link
            href="/compare"
            className="text-sm text-[#1B2A4A] font-bold hover:underline"
          >
            Open the canonical compare page →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <CustomLensView a={a} b={b} lens={lens} />
    </div>
  )
}
