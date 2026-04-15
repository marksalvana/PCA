import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How Scores Work — PH Profile Compare',
  description: 'A transparent explanation of how every score on PH Profile Compare is calculated — education, track record, legal penalties, and civic trust.',
}

const CHED_TABLE = [
  { level: 'Deregulated', score: 100, description: 'Highest CHED classification. Allowed to operate with maximum autonomy and set tuition independently. Awarded only to universities meeting the highest quality benchmarks.' },
  { level: 'Autonomous', score: 95, description: 'Authorized to offer programs without prior CHED approval. Strong institutional track record, accreditation, and research output required.' },
  { level: 'Foreign', score: 90, description: 'Degree earned abroad. Given a high default score reflecting international quality, as most Philippine politicians who studied abroad attended reputable universities.' },
  { level: 'Level IV', score: 85, description: 'AACCUP/FAAP Level IV accredited. Top-tier domestic accreditation, demonstrating excellent faculty, research, and student outcomes.' },
  { level: 'Level III', score: 70, description: 'AACCUP/FAAP Level III accredited. Good quality domestic institution with consistent performance across academic areas.' },
  { level: 'Level II', score: 55, description: 'AACCUP/FAAP Level II accredited. Meets minimum quality standards; some areas still developing.' },
  { level: 'Level I', score: 40, description: 'AACCUP/FAAP Level I accredited — the lowest accreditation tier. Basic quality standards met but limited track record.' },
  { level: 'Unaccredited', score: 20, description: 'No CHED accreditation on record. Cannot confirm institutional quality through official channels.' },
]

const COA_TABLE = [
  { finding: 'Unqualified', score: 100, color: 'text-green-700 bg-green-50 border-green-200', description: 'Clean audit opinion. The COA found financial statements to be presented fairly and in accordance with applicable standards. No material misstatements or irregularities.' },
  { finding: 'Qualified', score: 60, color: 'text-amber-700 bg-amber-50 border-amber-200', description: 'COA found issues in specific areas but not pervasive enough to issue an adverse opinion. Some misstatements, limitations in scope, or departures from acceptable accounting standards.' },
  { finding: 'Adverse', score: 20, color: 'text-red-700 bg-red-50 border-red-200', description: 'COA found the financial statements to be materially misstated and pervasively so. Serious financial management problems. Funds may have been misused or irregularly disbursed.' },
  { finding: 'Disclaimer', score: 10, color: 'text-red-800 bg-red-100 border-red-300', description: 'COA was unable to form an opinion due to insufficient, unavailable, or unreliable records. Inability to audit is itself a serious governance red flag.' },
]

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = (score / max) * 100
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-black tabular-nums w-8 text-right">{score}</span>
    </div>
  )
}

function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center text-white text-base`}>{icon}</span>
      <h2 className="text-xl font-black text-slate-900">{label}</h2>
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0038a8] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-4">
          Transparency
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">
          How scores are calculated
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Every number on this platform traces back to a verifiable public record. Here is exactly how each score is derived — no black boxes, no opinions.
        </p>
      </div>

      {/* Quick overview card */}
      <div className="card p-6 mb-8 bg-[#0038a8]/[0.03] border-[#0038a8]/20">
        <h2 className="font-black text-slate-900 mb-4">Score at a glance</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-green-50 border-2 border-green-200 flex items-center justify-center font-black text-green-700 text-sm shrink-0">OBJ</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">Objective Score <span className="text-slate-400 font-normal">(0–100)</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Education + Track Record − Legal Penalties · weights renormalize when only one component has data · null when no verified data exists</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border-2 border-purple-200 flex items-center justify-center font-black text-purple-700 text-sm shrink-0">TRU</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">Civic Trust Score <span className="text-slate-400 font-normal">(0–100)</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Community ratings from registered users — kept separate from Objective Score</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          The two scores are always displayed separately. Objective Score measures verifiable credentials and performance. Civic Trust Score measures public sentiment. Mixing them would let popularity mask poor governance records — so we never blend them.
        </p>
      </div>

      {/* ── OBJECTIVE SCORE ── */}
      <section className="mb-10">
        <SectionHeader icon="📊" label="Objective Score" color="bg-[#0038a8]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            The Objective Score is a composite of three factors drawn entirely from official Philippine government records. It is calculated server-side and cannot be overridden by any user or admin.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Education', weight: '30%', color: 'bg-blue-500' },
              { label: 'Track Record', weight: '70%', color: 'bg-[#0038a8]' },
              { label: 'Legal Penalty', weight: 'deducted', color: 'bg-red-500' },
            ].map(({ label, weight, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                <span className="text-sm text-slate-700 flex-1">{label}</span>
                <span className="text-sm font-bold text-slate-900">{weight}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600">
            <span className="text-slate-400">// Both components available:</span><br />
            score = (edu_avg × 0.30) + (track_avg × 0.70) − legal_penalty<br /><br />
            <span className="text-slate-400">// Only one component has data:</span><br />
            score = available_component − legal_penalty<br /><br />
            <span className="text-slate-400">// No verified data at all:</span><br />
            score = null <span className="text-slate-400">// displayed as "—"</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-300 mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Insufficient Data</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            When a politician has no verified records with scorable data, their Objective Score shows <strong>"—"</strong> rather than a fabricated midpoint. A missing score is honest; a fake 50 is not. This typically happens when all track records have unknown COA findings and no legislative data is available.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-l-slate-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Verified records only</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Only <strong>verified</strong> records count toward the Objective Score. A record is marked verified after a registered vetter has reviewed the source document. Unverified records are displayed on the profile but do not influence the score.
          </p>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section className="mb-10">
        <SectionHeader icon="🎓" label="Education Score" color="bg-[#0038a8]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Each school a politician attended is scored based on its <strong>CHED (Commission on Higher Education) accreditation status</strong> — the official Philippine government quality rating for universities. Foreign institutions receive a high base score reflecting that most Philippine politicians who studied abroad attended established universities.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            When a politician attended multiple schools, the education component is the <strong>average institution score</strong> across all verified education records.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Incomplete Degree Penalty</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Degrees that were not completed are scored at <strong>75% of the base institution score</strong>. Attendance demonstrates access to quality education; failure to complete does not. A politician who dropped out of a top university does not receive the same score as one who graduated from it.
            </p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">CHED Accreditation → Score</p>
          <div className="flex flex-col gap-2">
            {CHED_TABLE.map(({ level, score, description }) => (
              <div key={level} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900 w-28 shrink-0">{level}</span>
                  <div className="flex-1">
                    <ScoreBar score={score} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-0.5">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Source</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            CHED accreditation levels come from the Commission on Higher Education's official list of accredited institutions. AACCUP (Accrediting Agency of Chartered Colleges and Universities in the Philippines) and FAAP (Federation of Accrediting Agencies of the Philippines) are CHED-recognized accrediting bodies.
          </p>
          <a href="https://ched.gov.ph" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0038a8] hover:underline mt-1 inline-block">ched.gov.ph ↗</a>
        </div>
      </section>

      {/* ── TRACK RECORD ── */}
      <section className="mb-10">
        <SectionHeader icon="📋" label="Track Record Score" color="bg-[#0038a8]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Each position a politician held is scored based on the <strong>COA (Commission on Audit) opinion</strong> issued for that term. The COA audits all government offices and issues an annual opinion on their financial statements — this is the most objective available measure of how responsibly a public official managed public funds.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            When a politician held multiple positions, the track record component is the <strong>average performance score</strong> across all verified position records.
          </p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">COA Audit Opinion → Score</p>
          <div className="flex flex-col gap-3">
            {COA_TABLE.map(({ finding, score, color, description }) => (
              <div key={finding} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${color} w-28 shrink-0 text-center`}>{finding}</span>
                  <div className="flex-1">
                    <ScoreBar score={score} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 mb-3 border-l-4 border-l-blue-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Legislative roles: bills-based scoring</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Senators and Representatives do not receive COA audits the way governors and mayors do — COA audits the executing department, not the legislator. Applying a fake score here would systematically penalize legislators relative to executives.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            When <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">coa_finding</code> is <em>not_applicable</em> and bills data is available, we use a <strong>legislative effectiveness score</strong> instead:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 mb-3">
            pass_rate = bills_passed / bills_authored<br />
            legislative_score = 30 + (pass_rate × 55)<br />
            <span className="text-slate-400">// range: 30 (0% passed) to 85 (100% passed)</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            When no COA finding <em>and</em> no bills data is present, that position contributes <strong>null</strong> to the average — it is excluded rather than injecting a fake score.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Source</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            COA audit opinions are published in annual audit reports for each government agency and local government unit. Reports are publicly available through the COA website.
          </p>
          <a href="https://www.coa.gov.ph" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0038a8] hover:underline mt-1 inline-block">coa.gov.ph ↗</a>
        </div>
      </section>

      {/* ── LEGAL PENALTY ── */}
      <section className="mb-10">
        <SectionHeader icon="⚖" label="Legal Penalty" color="bg-red-500" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Active legal cases reduce the Objective Score. This is a <strong>direct deduction</strong> from the composite score, not a weighted component. The total deduction is capped — the minimum Objective Score is always 0.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { status: 'Pending', deduction: '−10 per case', color: 'bg-amber-50 border-amber-200 text-amber-700', description: 'A case that has been filed in court and is currently being tried. Charges have not yet been proven beyond reasonable doubt, but the existence of an active case is a material fact for voters.' },
              { status: 'Convicted', deduction: '−20 per case', color: 'bg-red-50 border-red-200 text-red-700', description: 'A court has found the official guilty beyond reasonable doubt. This is the most serious status. Appeals may be ongoing, but a conviction is a final finding at that court level.' },
              { status: 'Acquitted', deduction: '0', color: 'bg-green-50 border-green-200 text-green-700', description: 'Court found the official not guilty. No deduction is applied. The record is still displayed for transparency — voters can see what cases were filed and how they resolved.' },
              { status: 'Dismissed', deduction: '0', color: 'bg-slate-50 border-slate-200 text-slate-600', description: 'Case was dismissed before reaching a verdict. No deduction. Displayed for transparency.' },
              { status: 'On Appeal', deduction: '−10', color: 'bg-amber-50 border-amber-200 text-amber-700', description: 'A conviction is being appealed. Treated the same as pending — the matter is still unresolved before a higher court.' },
            ].map(({ status, deduction, color, description }) => (
              <div key={status} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${color}`}>{status}</span>
                  <span className="text-sm font-black text-slate-900">{deduction}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-red-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Source</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Legal records are sourced from the Sandiganbayan (anti-graft court), Supreme Court of the Philippines, Court of Appeals, and published COMELEC disqualification rulings. Each record requires a source URL pointing to the official court document or a reliable news source citing it.
          </p>
        </div>
      </section>

      {/* ── CIVIC TRUST ── */}
      <section className="mb-10">
        <SectionHeader icon="🗳" label="Civic Trust Score" color="bg-purple-600" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            The Civic Trust Score captures <strong>community sentiment</strong> — how much registered users of this platform trust a politician. It is the only score that reflects public opinion rather than official records.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 mb-4">
            trust_score = (average_rating − 1) / (5 − 1) × 100<br />
            <span className="text-slate-400">// ratings are 1–5; scaled to 0–100</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { rating: '5 / 5', score: 100, label: 'Fully trusted' },
              { rating: '4 / 5', score: 75, label: 'Mostly trusted' },
              { rating: '3 / 5', score: 50, label: 'Mixed trust' },
              { rating: '2 / 5', score: 25, label: 'Low trust' },
              { rating: '1 / 5', score: 0, label: 'Not trusted' },
            ].map(({ rating, score, label }) => (
              <div key={rating} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-bold text-purple-700 w-12 shrink-0">{rating}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-400" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-sm font-black tabular-nums w-8 text-right">{score}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-24 text-right shrink-0">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-purple-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Why it's kept separate</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Blending community sentiment with the Objective Score would allow popularity to mask corruption, or allow unpopularity to penalize clean officials. A well-performing but controversial politician would be unfairly penalized. An incompetent but well-liked official would be artificially boosted. We display both prominently — but never combine them.
          </p>
        </div>
      </section>

      {/* ── POLITICAL DYNASTY ── */}
      <section className="mb-10">
        <SectionHeader icon="👑" label="Political Dynasty" color="bg-rose-600" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            A political dynasty is identified when multiple members of the same family have held or currently hold public office. This section is <strong>not scored</strong> — it is purely informational.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            The 1987 Philippine Constitution (Article II, Section 26) explicitly calls on Congress to prohibit political dynasties, yet no implementing law has been passed as of 2026. The dynasty section exists to ensure voters have this context when evaluating a candidate.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { gen: '1st Generation', label: 'Patriarch / Matriarch', description: 'Founded the family\'s political career.' },
              { gen: '2nd Generation', label: 'Child of founder', description: 'Son or daughter who followed into politics.' },
              { gen: '3rd Generation', label: 'Grandchild of founder', description: 'Third generation in political office.' },
              { gen: '4th Generation', label: 'Great-grandchild of founder', description: 'Four generations of uninterrupted political presence.' },
            ].map(({ gen, label, description }) => (
              <div key={gen} className="flex items-start gap-3 p-3 bg-rose-50/40 rounded-xl border border-rose-100">
                <span className="text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-1 rounded-md shrink-0 w-28 text-center">{gen}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA QUALITY ── */}
      <section className="mb-10">
        <SectionHeader icon="✅" label="Data Quality & Vetting" color="bg-slate-700" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Every data point on this platform goes through a two-step process before it appears on a published profile:
          </p>
          <div className="flex flex-col gap-3">
            {[
              { step: '1', title: 'Admin creates the record', description: 'An admin user enters the data point — a school, a COA finding, a legal case — and attaches a source URL pointing to the official document or news report. No record can be saved without a source.' },
              { step: '2', title: 'Vetter reviews and approves', description: 'A separate vetter user checks the source URL against the entered data. If the source confirms the data, the record is marked verified. Only verified records influence the Objective Score.' },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-black shrink-0">{step}</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-4">
            The vetting history is immutable — it is an append-only audit trail. Every approval, flag, and correction is permanently recorded alongside the vetter's name and timestamp. This is visible at the bottom of every profile page.
          </p>
        </div>
      </section>

      {/* ── SCORE BANDS ── */}
      <section className="mb-10">
        <SectionHeader icon="🎯" label="Score Interpretation" color="bg-slate-700" />

        <div className="card p-5">
          <p className="text-slate-700 leading-relaxed mb-4">
            Use these bands as a rough guide. Context always matters — a low score may reflect a single controversial term in a long career, or a genuine pattern of poor governance.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { range: '80 – 100', label: 'Strong record', color: 'bg-green-50 border-green-200 text-green-800', bar: 'bg-green-500', pct: 90, description: 'High-quality education, clean COA audits, no active legal cases.' },
              { range: '60 – 79', label: 'Decent record', color: 'bg-green-50/60 border-green-100 text-green-700', bar: 'bg-green-400', pct: 70, description: 'Mostly clean record with some qualified COA opinions or minor gaps.' },
              { range: '40 – 59', label: 'Mixed record', color: 'bg-amber-50 border-amber-200 text-amber-800', bar: 'bg-amber-400', pct: 50, description: 'Combination of stronger and weaker elements; warrants closer inspection.' },
              { range: '20 – 39', label: 'Concerning', color: 'bg-red-50 border-red-200 text-red-700', bar: 'bg-red-400', pct: 30, description: 'Adverse COA findings, legal cases, or significantly weak education record.' },
              { range: '0 – 19', label: 'Serious red flags', color: 'bg-red-50 border-red-300 text-red-800', bar: 'bg-red-600', pct: 10, description: 'Multiple adverse findings and/or convictions. Requires careful scrutiny before voting.' },
            ].map(({ range, label, color, bar, pct, description }) => (
              <div key={range} className={`flex items-start gap-3 p-3 rounded-xl border ${color}`}>
                <div className="shrink-0 w-16 text-center">
                  <p className="text-sm font-black tabular-nums">{range}</p>
                  <div className="h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs opacity-80 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="card p-6 bg-[#0038a8] text-white text-center">
        <p className="font-black text-xl mb-1">See it in action</p>
        <p className="text-blue-200 text-sm mb-5">Browse profiles and watch the scores come to life</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profiles" className="inline-flex items-center justify-center gap-2 bg-white text-[#0038a8] font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
            Browse profiles →
          </Link>
          <Link href="/compare" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm border border-white/20">
            Compare candidates
          </Link>
        </div>
      </div>

    </div>
  )
}
