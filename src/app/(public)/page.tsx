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

  const { data: flagged } = await supabase
    .from('politicians')
    .select('*')
    .eq('status', 'published')
    .order('objective_score', { ascending: true })
    .limit(3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0038a8] text-white">
        {/* Flag stripe accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcd116]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ce1126]" />

        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            🇵🇭 Para sa mga Pilipinong Botante
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Sino talaga ang<br />
            <span className="text-[#fcd116]">iboboto mo?</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Ihambing ang mga pulitiko gamit ang <strong className="text-white">totoong datos</strong> mula sa opisyal na rekord —
            hindi tsismis, hindi propaganda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profiles"
              className="bg-[#fcd116] hover:bg-yellow-300 text-[#0038a8] font-black px-8 py-3.5 rounded-xl transition-colors text-lg shadow-lg"
            >
              Tingnan ang mga Profile →
            </Link>
            <Link
              href="/compare"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
            >
              Ikumpara ang Dalawa
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 -mt-6 mb-12">
          {[
            { num: '17', label: 'Politicians Profiled' },
            { num: '100%', label: 'Sourced Data' },
            { num: '0', label: 'Opinions' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4 px-2 shadow-md">
              <div className="text-2xl md:text-3xl font-black text-[#0038a8]">{s.num}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top profiles */}
        {featured && featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Featured Profiles</h2>
                <p className="text-sm text-slate-500">Ranked by objective score</p>
              </div>
              <Link href="/profiles" className="text-sm text-[#0038a8] font-semibold hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(featured as Politician[]).map((p) => (
                <ProfileCard key={p.id} politician={p} />
              ))}
            </div>
          </section>
        )}

        {/* Red flags section */}
        {flagged && flagged.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500 dynasty-badge" />
              <div>
                <h2 className="text-xl font-black text-slate-900">Lowest Objective Scores</h2>
                <p className="text-sm text-slate-500">Based on verified records, legal penalties applied</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(flagged as Politician[]).map((p) => (
                <ProfileCard key={p.id} politician={p} />
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-slate-900 mb-5 text-center">Paano gumagana ito?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🏛️',
                title: 'Official Sources Only',
                desc: 'COMELEC, COA, Senate, Congress, Sandiganbayan. Every data point links back to the source.',
              },
              {
                icon: '⚖️',
                title: 'Objective Scoring',
                desc: 'Scores are computed from CHED accreditation levels and COA audit findings — not our opinion.',
              },
              {
                icon: '✅',
                title: 'Named Vetters',
                desc: 'Every profile is reviewed by named contributors. The audit trail is public and permanent.',
              },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Score explanation */}
        <section className="mb-14 card p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-2">Ano ibig sabihin ng Score?</h2>
            <p className="text-slate-600 text-sm mb-5">
              Dalawang score ang ipinapakita — huwag pagsamahin ang dalawa.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0038a8] flex items-center justify-center text-white font-black text-lg shrink-0">OS</div>
                <div>
                  <p className="font-bold text-slate-900">Objective Score (0–100)</p>
                  <p className="text-sm text-slate-500">Computed from CHED accreditation (education) + COA audit findings (performance). Legal cases deduct points. <strong className="text-slate-700">This is fact-based.</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0">CT</div>
                <div>
                  <p className="font-bold text-slate-900">Community Trust (0–100)</p>
                  <p className="text-sm text-slate-500">Average of verified citizen ratings (1–5 stars). Reflects public sentiment. <strong className="text-slate-700">This is opinion — shown separately.</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-14 text-center bg-[#0038a8] text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Hindi mo kilala ang iboboto mo?</h2>
          <p className="text-white/70 mb-6">
            Huwag botuhin ang pangalan. Botuhin ang rekord.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/compare"
              className="bg-[#fcd116] hover:bg-yellow-300 text-[#0038a8] font-black px-8 py-3 rounded-xl transition-colors"
            >
              Ikumpara ngayon →
            </Link>
            <Link
              href="/petition"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Request a Profile
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
