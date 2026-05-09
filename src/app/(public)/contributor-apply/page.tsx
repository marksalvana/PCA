import type { Metadata } from 'next'
import ContributorApplyForm from '@/components/ContributorApplyForm'

export const metadata: Metadata = {
  title: 'Apply as a Contributor — Politiko',
  description: 'Help build Politiko by adding politiko profiles and submitting sourced records (education, track record, achievements). Vetters review your work before it publishes.',
}

export default function ContributorApplyPage() {
  return (
    <div className="bg-[#FBF5EB] min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#1B2A4A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcd116]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ce1126]" />
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-20">
          <p className="label-mono text-[#C8304B] mb-4">Volunteer</p>
          <h1
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-5"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}
          >
            Become a contributor.<br />
            <span className="text-[#C8304B]">Build the record.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Contributors do the field work. They add politiko profiles, dig up education and track-record data, find COA reports and Senate Journals, and submit records with sources cited. Vetters then verify each record before it&apos;s published. Two roles, one check-and-balance loop.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10">

        {/* ── What contributors do ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">What the work looks like</p>
          <h2
            className="text-2xl font-black text-[#1B2A4A] mb-6"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            Find the data. Cite the source.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: '👤',
                title: 'Add new profiles',
                desc: 'Create politiko profiles for politicians who aren\'t on the platform yet — bio, party, current position.',
              },
              {
                icon: '📋',
                title: 'Submit records',
                desc: 'Add education, track record, achievements, and legal records. Every record needs an official source URL.',
              },
              {
                icon: '🤝',
                title: 'Hand off to vetters',
                desc: 'Your records sit unverified until a vetter reviews and approves. Two pairs of eyes on every data point.',
              },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-[#1B2A4A] text-sm mb-1">{item.title}</p>
                <p className="text-[#857F75] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="card p-5 border-l-4 border-[#C8304B] bg-[#F4F2EE]">
            <p className="text-[#4A4540] text-sm leading-relaxed">
              <strong className="text-[#1B2A4A]">Contributors and vetters are different roles by design.</strong> A contributor adds and edits records; a vetter approves them. The same person can apply to be both, but a single submission needs both — that&apos;s the check and balance.
            </p>
          </div>
        </section>

        {/* ── Application form ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Apply</p>
          <h2
            className="text-2xl font-black text-[#1B2A4A] mb-6"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            Ready to help? Fill out this form.
          </h2>
          <ContributorApplyForm />
        </section>

      </div>
    </div>
  )
}
