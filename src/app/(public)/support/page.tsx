import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support Politiko',
  description: 'Help keep Politiko running. Every contribution goes directly to maintaining the platform and compensating the volunteers who make it possible.',
}

const PATREON_URL = 'https://patreon.com/politiko' // update when live

function Allocation({ pct, label, desc }: { pct: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-16 h-16 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#FBF5EB] font-black text-lg" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
        {pct}
      </div>
      <div>
        <p className="font-bold text-[#1B2A4A] mb-0.5">{label}</p>
        <p className="text-[#857F75] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="bg-[#FBF5EB] min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#1B2A4A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcd116]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ce1126]" />
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-20 text-center">
          <p className="label-mono text-[#C8304B] mb-4">Support Politiko</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-5" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
            Keep the lights on.<br />
            <span className="text-[#C8304B]">Keep the records honest.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Politiko is a volunteer-driven civic platform. No ads. No political sponsors. No hidden agenda. If it has been useful to you, consider helping keep it running.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-14">

        {/* ── What your support does ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Where It Goes</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-3" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            Every peso is accounted for.
          </h2>
          <p className="text-[#4A4540] leading-relaxed mb-8">
            We believe in the same transparency we demand from politicians. Here is exactly how contributions are allocated. Individual donor amounts are never disclosed publicly — only the total collected and how it was distributed.
          </p>

          <div className="card p-6 md:p-8 space-y-6">
            <Allocation
              pct="~30%"
              label="Platform infrastructure"
              desc="Web hosting, database, domain name, storage, and any third-party services required to keep the site live, fast, and secure."
            />
            <div className="border-t border-[#E8E4DC]" />
            <Allocation
              pct="~20%"
              label="Development and maintenance"
              desc="Compensation for the developers who build new features, fix bugs, improve performance, and keep the codebase healthy. These are real people giving real time."
            />
            <div className="border-t border-[#E8E4DC]" />
            <Allocation
              pct="50%"
              label="Vetters — the backbone of Politiko"
              desc="Half of all collected support goes directly to the vetters: the researchers, fact-checkers, and contributors who read government documents, verify records, and build the profiles you rely on. Without them, there is no data."
            />
          </div>

          <p className="text-xs label-mono text-[#857F75] mt-4">
            Allocation percentages are approximate and may be adjusted as platform costs change. Any changes will be posted here.
          </p>
        </section>

        {/* ── Anonymity ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Privacy</p>
          <h2 className="text-2xl font-black text-[#1B2A4A] mb-4" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            Your contribution is private.
          </h2>
          <div className="card p-6 border-l-4 border-[#1B2A4A] space-y-3 text-[#4A4540] leading-relaxed text-sm">
            <p>Individual donor names and amounts are <strong className="text-[#1B2A4A]">never published or shared</strong>. We do not maintain a public donor list. We do not thank supporters by name unless explicitly asked.</p>
            <p>What we do publish: the total amount collected per period and how it was distributed across the three categories above. You will be able to see that the money went where we said it would — just not who gave it.</p>
            <p>This is deliberate. We do not want any contributor — regardless of how much they give — to have any perceived influence over which profiles are built, how they are scored, or what records are included.</p>
          </div>
        </section>

        {/* ── Patreon CTA ── */}
        <section className="card p-8 md:p-10 bg-[#1B2A4A] text-white text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
            Support us on Patreon
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto mb-8">
            Contributions of any size help. Even a small monthly amount adds up to keeping the platform running and compensating the vetters who make it trustworthy.
          </p>
          <a
            href={PATREON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#C8304B] hover:bg-[#b52840] text-white font-black px-8 py-4 rounded-xl transition-colors text-lg"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M14.82 2.41C11.53 2.41 8.85 5.1 8.85 8.39c0 3.28 2.68 5.95 5.97 5.95 3.28 0 5.95-2.67 5.95-5.95 0-3.29-2.67-5.98-5.95-5.98M3.18 21.6h3.25V2.41H3.18V21.6z"/>
            </svg>
            Support on Patreon
          </a>
          <p className="text-white/40 text-xs label-mono mt-5">
            Opens Patreon in a new tab · No account required to view
          </p>
        </section>

        {/* ── Not in a position to donate ── */}
        <section className="text-center">
          <p className="label-mono text-[#857F75] mb-3">Can't donate right now?</p>
          <p className="text-[#4A4540] text-sm leading-relaxed max-w-lg mx-auto mb-6">
            That is completely fine. The best thing you can do is use the platform, share it with someone who will vote soon, and tell them to check the record before they decide. That costs nothing and it matters more than money.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/profiles"
              className="text-sm font-semibold bg-[#1B2A4A] text-[#FBF5EB] px-5 py-2.5 rounded-lg hover:bg-[#243761] transition-colors"
            >
              Browse Profiles
            </Link>
            <Link
              href="/compare"
              className="text-sm font-semibold border-2 border-[#1B2A4A] text-[#1B2A4A] px-5 py-2.5 rounded-lg hover:bg-[#1B2A4A] hover:text-[#FBF5EB] transition-colors"
            >
              Compare Candidates
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-[#857F75] hover:text-[#1B2A4A] px-5 py-2.5 rounded-lg transition-colors"
            >
              Read Our Story
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
