import { createClient } from '@/lib/supabase/server'
import CompareSelector from '@/components/comparison/CompareSelector'
import CompareGrid from '@/components/comparison/CompareGrid'
import type { Politician, PoliticianWithDetails } from '@/types/database'

export const metadata = {
  title: 'Compare Candidates — PH Profile Compare',
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const { a, b } = await searchParams
  const supabase = await createClient()

  // Load all published politicians for the selector
  const { data: allPoliticians } = await supabase
    .from('politicians')
    .select('id, slug, full_name, current_position, photo_url')
    .eq('status', 'published')
    .order('full_name')

  // Load full data for selected politicians
  let politicianA: PoliticianWithDetails | null = null
  let politicianB: PoliticianWithDetails | null = null

  if (a) {
    const { data } = await supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', a)
      .eq('status', 'published')
      .single()
    politicianA = data as unknown as PoliticianWithDetails
  }

  if (b) {
    const { data } = await supabase
      .from('politicians')
      .select('*, education_records(*), track_records(*), legal_records(*), achievements(*), net_worth_records(*)')
      .eq('slug', b)
      .eq('status', 'published')
      .single()
    politicianB = data as unknown as PoliticianWithDetails
  }

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Compare Candidates</h1>
        <p className="text-gray-400">Select two politicians to compare side-by-side.</p>
      </div>

      <CompareSelector
        politicians={(allPoliticians ?? []) as Politician[]}
        selectedA={a}
        selectedB={b}
      />

      {politicianA && politicianB && (
        <div className="mt-10">
          <CompareGrid a={politicianA} b={politicianB} />
        </div>
      )}

      {(a && !politicianA) || (b && !politicianB) ? (
        <p className="text-red-400 text-sm mt-4">One or both selected profiles could not be found.</p>
      ) : null}
    </div>
  )
}
