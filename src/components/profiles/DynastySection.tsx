import Link from 'next/link'
import type { DynastyConnection, Politician } from '@/types/database'

type Props = {
  politician: Pick<Politician, 'dynasty_name' | 'dynasty_generation' | 'preferred_name' | 'full_name'>
  connections: DynastyConnection[]
}

const generationLabel: Record<number, string> = {
  1: '1st Generation (Patriarch/Matriarch)',
  2: '2nd Generation',
  3: '3rd Generation',
}

export default function DynastySection({ politician: p, connections }: Props) {
  if (!p.dynasty_name && connections.length === 0) return null

  return (
    <section className="mb-5">
      <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 bg-rose-600 rounded-md flex items-center justify-center text-white text-xs">👑</span>
        Political Dynasty
      </h2>

      <div className="card border-l-4 border-l-rose-400 overflow-hidden">
        {/* Dynasty header */}
        <div className="p-4 bg-rose-50/50">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-black text-slate-900 text-lg">
                {p.dynasty_name ?? 'Political Family'}
              </p>
              {p.dynasty_generation && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {p.preferred_name ?? p.full_name} — {generationLabel[p.dynasty_generation] ?? `Generation ${p.dynasty_generation}`}
                </p>
              )}
            </div>
            <span className="text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full dynasty-badge">
              Political Dynasty
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            A political dynasty occurs when multiple members of the same family hold public office.
            The 1987 Philippine Constitution calls on Congress to prohibit political dynasties, but no law has been passed.
          </p>
        </div>

        {/* Family members */}
        {connections.length > 0 && (
          <div className="divide-y divide-slate-100">
            {connections.map((c) => (
              <div key={c.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                      {c.relationship}
                    </span>
                    {c.in_dataset && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                        In this platform
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 mt-1">{c.related_name}</p>
                  {c.position_held && (
                    <p className="text-slate-500 text-sm">{c.position_held}</p>
                  )}
                </div>
                {c.in_dataset && c.related_slug && (
                  <Link
                    href={`/profiles/${c.related_slug}`}
                    className="shrink-0 text-xs font-semibold text-[#1B2A4A] hover:underline"
                  >
                    View profile →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <a
            href="https://www.officialgazette.gov.ph/constitutions/the-1987-constitution-of-the-republic-of-the-philippines/the-1987-constitution-of-the-republic-of-the-philippines-article-ii/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-[#1B2A4A] transition-colors"
          >
            Source: 1987 Philippine Constitution, Article II Section 26 — Official Gazette ↗
          </a>
        </div>
      </div>
    </section>
  )
}
