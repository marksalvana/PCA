import type { Metadata } from 'next'
import VetterApplyForm from '@/components/VetterApplyForm'

export const metadata: Metadata = {
  title: 'Apply as a Vetter — Politiko',
  description: 'Join Politiko as a vetter. Help verify politician records, fact-check data, and ensure every profile is accurate and sourced. Your name appears on every profile you verify.',
}

export default function VetterApplyPage() {
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
            Become a vetter.<br />
            <span className="text-[#C8304B]">Put your name on the truth.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Vetters are the backbone of Politiko. They read government documents, verify records against official sources, and approve or flag each data point before it goes live. If accepted, your name appears publicly on every profile you verify — that is the accountability we ask for, and the recognition you deserve.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10">

        {/* ── What vetters actually do ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">What the work looks like</p>
          <h2
            className="text-2xl font-black text-[#1B2A4A] mb-6"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            Real document checking. Real accountability.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: '📄',
                title: 'Read source documents',
                desc: 'COA audit reports, Senate attendance sheets, COMELEC filings, SALN records. We link to originals — you verify the data matches.',
              },
              {
                icon: '✓',
                title: 'Approve or flag records',
                desc: 'Each data point on a profile goes through vetter review before it\'s published. You approve accurate records and flag anything off.',
              },
              {
                icon: '👁️',
                title: 'Go on the record',
                desc: 'Your name appears publicly on every profile you help verify. That transparency is what makes Politiko credible.',
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
              <strong className="text-[#1B2A4A]">This is volunteer work.</strong> We ask for whatever time you can give — even reviewing one profile helps. If the platform ever generates enough support, vetters receive a share of contributions. See the{' '}
              <a href="/support" className="text-[#C8304B] font-semibold hover:underline">Support page</a> for how that works.
            </p>
          </div>
        </section>

        {/* ── Who we're looking for ── */}
        <section>
          <p className="label-mono text-[#C8304B] mb-3">Who we need</p>
          <h2
            className="text-2xl font-black text-[#1B2A4A] mb-4"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            No specific degree required. Just rigor.
          </h2>
          <p className="text-[#4A4540] leading-relaxed mb-5">
            We welcome researchers, journalists, educators, lawyers, government employees, and anyone else who knows how to read a government document and tell the truth about what it says. What matters is attention to detail, commitment to accuracy, and willingness to be named.
          </p>
          <div className="card p-5 bg-[#1B2A4A] text-white">
            <p className="text-sm font-bold mb-2">We will ask you not to apply if:</p>
            <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
              <li>You are currently working for any political campaign or party</li>
              <li>You have a direct personal relationship with any politician on the platform</li>
              <li>You cannot commit to honest, source-based review regardless of your political views</li>
            </ul>
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
          <VetterApplyForm />
        </section>

      </div>
    </div>
  )
}
