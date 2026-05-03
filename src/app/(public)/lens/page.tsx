import { createClient } from '@/lib/supabase/server'
import LensPageContent from '@/components/lens/LensPageContent'
import type { ScoreBreakdown } from '@/types/database'

export const metadata = {
  title: 'Personal Lens — Politiko',
  description: 'Adjust how each scoring category contributes to the Politiko Score on your view. Settings save on this device only.',
}

export default async function LensPage() {
  // Pick a representative politician with a populated breakdown for the live preview.
  // Falls through to no-preview state if none is available yet (pre-migration-008).
  const supabase = await createClient()
  const { data } = await supabase
    .from('politicians')
    .select('slug, full_name, preferred_name, objective_score, score_breakdown')
    .eq('status', 'published')
    .not('score_breakdown', 'is', null)
    .order('objective_score', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle<{
      slug: string
      full_name: string
      preferred_name: string | null
      objective_score: number | null
      score_breakdown: ScoreBreakdown | null
    }>()

  const preview = data
    ? {
        slug: data.slug,
        name: data.preferred_name ?? data.full_name,
        score: data.objective_score,
        breakdown: data.score_breakdown,
      }
    : null

  return <LensPageContent preview={preview} />
}
