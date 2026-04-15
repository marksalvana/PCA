import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/profiles/ProfileCard'
import type { Politician } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featured } = await supabase
    .from('politicians')
    .select('*')
    .eq('status', 'published')
    .order('objective_score', { ascending: false })
    .limit(6)

  return (
    <div className="px-4 py-12 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-[#0038a8]/20 border border-[#0038a8]/40 text-[#60a5fa] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          Philippine Civic Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Know Who You're{' '}
          <span className="text-[#fcd116]">Voting For</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Compare politicians side-by-side using verified, sourced data.
          Every score derived from official benchmarks — not opinions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profiles"
            className="bg-[#0038a8] hover:bg-[#0038a8]/80 text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Browse Profiles
          </Link>
          <Link
            href="/compare"
            className="border border-white/20 hover:border-white/40 text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Compare Two Candidates
          </Link>
        </div>
      </section>

      {/* Featured profiles */}
      {featured && featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Featured Profiles</h2>
            <Link href="/profiles" className="text-sm text-[#60a5fa] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(featured as Politician[]).map((politician) => (
              <ProfileCard key={politician.id} politician={politician} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!featured || featured.length === 0) && (
        <section className="text-center py-24 border border-white/10 rounded-xl">
          <p className="text-gray-500 text-lg">No published profiles yet.</p>
          <p className="text-gray-600 text-sm mt-2">
            Check back soon or{' '}
            <Link href="/petition" className="text-[#60a5fa] hover:underline">
              submit a petition
            </Link>{' '}
            to request a profile.
          </p>
        </section>
      )}

      {/* How it works */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '🏛️',
            title: 'Official Sources Only',
            desc: 'COMELEC, COA, Senate, Congress, Sandiganbayan. No Wikipedia edits, no self-reported data.',
          },
          {
            icon: '✅',
            title: 'Named Vetters',
            desc: 'Every profile is reviewed and approved by named contributors. The audit trail is public and permanent.',
          },
          {
            icon: '⚖️',
            title: 'Objective Scoring',
            desc: 'Scores are computed from CHED accreditation levels and COA audit findings — not our opinions.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-[#111827] border border-white/10 rounded-xl p-6">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
