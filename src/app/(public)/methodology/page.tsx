import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How Scores Work — Politiko',
  description: 'A transparent explanation of how every score on Politiko is calculated — education, track record, legal penalties, and civic trust.',
}

const CHED_TABLE = [
  { level: 'Deregulated', pts: 100, description: 'Highest CHED classification. Allowed to operate with maximum autonomy and set tuition independently. Awarded only to universities meeting the highest quality benchmarks.' },
  { level: 'Autonomous', pts: 95, description: 'Authorized to offer programs without prior CHED approval. Strong institutional track record, accreditation, and research output required.' },
  { level: 'Foreign', pts: 90, description: 'Degree earned abroad. Given a high base score reflecting international quality, as most Philippine politicians who studied abroad attended reputable universities.' },
  { level: 'Level IV', pts: 85, description: 'AACCUP/FAAP Level IV accredited. Top-tier domestic accreditation, demonstrating excellent faculty, research, and student outcomes.' },
  { level: 'Level III', pts: 70, description: 'AACCUP/FAAP Level III accredited. Good quality domestic institution with consistent performance across academic areas.' },
  { level: 'Level II', pts: 55, description: 'AACCUP/FAAP Level II accredited. Meets minimum quality standards; some areas still developing.' },
  { level: 'Level I', pts: 40, description: 'AACCUP/FAAP Level I accredited — the lowest accreditation tier. Basic quality standards met but limited track record.' },
  { level: 'Unaccredited', pts: 20, description: 'No CHED accreditation on record. Cannot confirm institutional quality through official channels.' },
  { level: 'Unknown', pts: 0, description: 'Accreditation status could not be verified. No points contributed — we do not fabricate quality ratings from unverifiable data.' },
]

const COA_TABLE = [
  { finding: 'Unqualified', pts: 100, color: 'text-green-700 bg-green-50 border-green-200', description: 'Clean audit opinion. The COA found financial statements to be presented fairly and in accordance with applicable standards. No material misstatements or irregularities.' },
  { finding: 'Qualified', pts: 60, color: 'text-amber-700 bg-amber-50 border-amber-200', description: 'COA found issues in specific areas but not pervasive enough to issue an adverse opinion. Some misstatements, limitations in scope, or departures from acceptable accounting standards.' },
  { finding: 'Adverse', pts: 20, color: 'text-red-700 bg-red-50 border-red-200', description: 'COA found the financial statements to be materially misstated and pervasively so. Serious financial management problems. Funds may have been misused or irregularly disbursed.' },
  { finding: 'Disclaimer', pts: 10, color: 'text-red-800 bg-red-100 border-red-300', description: 'COA was unable to form an opinion due to insufficient, unavailable, or unreliable records. Inability to audit is itself a serious governance red flag.' },
]

function PtsBar({ pts, max = 100 }: { pts: number; max?: number }) {
  const pct = Math.min(100, (pts / max) * 100)
  const color = pts >= 80 ? 'bg-green-500' : pts >= 50 ? 'bg-amber-400' : pts > 0 ? 'bg-red-500' : 'bg-slate-300'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-black tabular-nums w-12 text-right">+{pts} pts</span>
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
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1B2A4A] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-4">
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
      <div className="card p-6 mb-8 bg-[#1B2A4A]/[0.03] border-[#1B2A4A]/20">
        <h2 className="font-black text-slate-900 mb-4">Score at a glance</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-green-50 border-2 border-green-200 flex items-center justify-center font-black text-green-700 text-sm shrink-0">OBJ</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">Objective Score <span className="text-slate-400 font-normal">(no upper limit)</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Cumulative sum of Education + Track Record points, minus Legal Penalties · floor at 0 · null when no verified data exists</p>
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
        <SectionHeader icon="📊" label="Objective Score" color="bg-[#1B2A4A]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            The Objective Score is a <strong>cumulative sum</strong> of points earned from verified public records. It is calculated server-side and cannot be entered or overridden by any user or admin — the app derives it entirely from official data.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { label: 'Education', detail: 'sum of pts per verified degree (CHED accreditation)', color: 'bg-blue-500' },
              { label: 'Track Record', detail: 'sum of (COA/bills base + attendance modifier) per verified term', color: 'bg-[#1B2A4A]' },
              { label: 'Achievements', detail: 'sum of pts per verified achievement (impact scope)', color: 'bg-indigo-400' },
              { label: 'Legal Penalty', detail: 'deducted per verified active case', color: 'bg-red-500' },
            ].map(({ label, detail, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                <span className="text-sm font-semibold text-slate-700 w-28 shrink-0">{label}</span>
                <span className="text-xs text-slate-500">{detail}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600">
            score = SUM(edu_pts) + SUM(track_pts) + SUM(achievement_pts) − SUM(legal_penalties)<br />
            score = max(0, score) <span className="text-slate-400">// floor at 0</span><br /><br />
            <span className="text-slate-400">// No upper cap — more verified records = higher score</span><br />
            <span className="text-slate-400">// No verified data → score = null, displayed as "—"</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-300 mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Why cumulative instead of averaged</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            An average treats a politician with one degree the same as one with five, as long as the single degree is from a high-quality school. That is not a fair comparison. Under the cumulative model, every additional verified achievement adds real points — a richer, more complete record earns a genuinely higher score.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-l-slate-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">No data = no score</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            When a politician has no verified records with scorable data, their Objective Score shows <strong>"—"</strong> rather than a fabricated zero. A missing score is honest; a fake score is not. Unknown COA findings and unverified records do not contribute any points.
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
        <SectionHeader icon="🎓" label="Education Score" color="bg-[#1B2A4A]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Each verified degree a politician earned contributes a fixed number of points based on the school's <strong>CHED (Commission on Higher Education) accreditation status</strong>. Points are cumulative — a politician with three degrees earns points for all three. A single degree from a top school does not beat a politician who has three strong degrees.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Incomplete Degree Penalty</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Degrees that were not completed contribute <strong>75% of the base institution points</strong>. Attendance demonstrates access to quality education; failure to complete does not. A politician who dropped out of a top university does not earn the same points as one who graduated.
            </p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">CHED Accreditation → Points per degree</p>
          <div className="flex flex-col gap-2">
            {CHED_TABLE.map(({ level, pts, description }) => (
              <div key={level} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900 w-28 shrink-0">{level}</span>
                  <div className="flex-1">
                    <PtsBar pts={pts} />
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
          <a href="https://ched.gov.ph" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B2A4A] hover:underline mt-1 inline-block">ched.gov.ph ↗</a>
        </div>
      </section>

      {/* ── TRACK RECORD ── */}
      <section className="mb-10">
        <SectionHeader icon="📋" label="Track Record Score" color="bg-[#1B2A4A]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Each verified term in public office contributes points based on: a <strong>flat +15 term completion bonus</strong>, plus the <strong>COA (Commission on Audit) opinion</strong> for that term, plus an attendance modifier. Points are cumulative — a politician with ten clean terms earns more than one with a single clean term.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 mb-4">
            term_score = 15 + max(0, coa_or_legislative_pts) + attendance_modifier<br />
            <span className="text-slate-400">// the +15 applies only to completed (non-current) terms</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Term completion bonus</p>
            <p className="text-sm text-blue-800 leading-relaxed">Every verified <em>completed</em> term earns a flat <strong>+15 pts</strong> before any COA or attendance modifier is applied. This rewards finishing a term — not quitting and not being removed from office. Currently-serving positions do not yet receive this bonus.</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">COA Audit Opinion → Points per term</p>
          <div className="flex flex-col gap-3">
            {COA_TABLE.map(({ finding, pts, color, description }) => (
              <div key={finding} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${color} w-28 shrink-0 text-center`}>{finding}</span>
                  <div className="flex-1">
                    <PtsBar pts={pts} />
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
            Senators and Representatives do not receive COA audits the way governors and mayors do — COA audits the executing department, not the legislator. When <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">coa_finding</code> is <em>not_applicable</em> and bills data is available, we use a <strong>legislative effectiveness score</strong> instead:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 mb-3">
            pass_rate = bills_passed / bills_authored<br />
            legislative_score = pass_rate × 85<br />
            <span className="text-slate-400">// range: 0 (0% passed) to 85 (100% passed) — no floor gift</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Zero bills passed earns zero points — there is no floor. When no COA finding <em>and</em> no bills data is present, that position contributes 0 pts rather than a fabricated score.
          </p>
        </div>

        <div className="card p-5 mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Attendance modifier</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Attendance rate is verifiable from Senate and House of Representatives official records. It is applied as an <strong>additive modifier on top of the COA score</strong> for each term. A high-attendance, clean-audit term earns slightly more than a clean-audit term with no attendance data.
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {[
              { range: '95 – 100%', modifier: '+20 pts', color: 'text-green-700 bg-green-50 border-green-200' },
              { range: '90 – 94%',  modifier: '+10 pts', color: 'text-green-600 bg-green-50/60 border-green-100' },
              { range: '75 – 89%',  modifier: 'no change', color: 'text-slate-600 bg-slate-50 border-slate-200' },
              { range: '50 – 74%',  modifier: '−10 pts', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { range: '< 50%',     modifier: '−50 pts', color: 'text-red-700 bg-red-50 border-red-200' },
            ].map(({ range, modifier, color }) => (
              <div key={range} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${color}`}>
                <span className="text-sm font-bold w-24 shrink-0">{range}</span>
                <span className="text-sm font-black">{modifier}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Each term&apos;s contribution is floored at 0 — a very poor attendance on an already low-scoring term does not drag down points earned by other terms.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Source</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            COA audit opinions are published in annual audit reports for each government agency and local government unit. Reports are publicly available through the COA website.
          </p>
          <a href="https://www.coa.gov.ph" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B2A4A] hover:underline mt-1 inline-block">coa.gov.ph ↗</a>
        </div>
      </section>

      {/* ── ACHIEVEMENTS ── */}
      <section className="mb-10">
        <SectionHeader icon="🏅" label="Achievements Score" color="bg-[#1B2A4A]" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Verified achievements contribute points based on their <strong>impact scope</strong> — the geographic scale of the accomplishment. This is the most defensible objective classifier available: a Republic Act that applies to all 110 million Filipinos is categorically different from a municipal ordinance.
          </p>
          <div className="flex flex-col gap-3 mb-4">
            {[
              { scope: 'National — Landmark', pts: 100, color: 'text-blue-800 bg-blue-100 border-blue-300', examples: 'Landmark Republic Acts directly impacting millions — universal health care law, major reform legislation, acts affecting the entire population' },
              { scope: 'National — Standard', pts: 60,  color: 'text-blue-700 bg-blue-50 border-blue-200', examples: 'National awards, recognition, national programmes with narrower scope, minor Republic Acts' },
              { scope: 'Regional',             pts: 40,  color: 'text-indigo-700 bg-indigo-50 border-indigo-200', examples: 'Regional ordinances, provincial programmes, regional infrastructure projects' },
              { scope: 'Local',                pts: 20,  color: 'text-slate-700 bg-slate-50 border-slate-200', examples: 'City or municipal ordinances, barangay-level programmes, local infrastructure' },
            ].map(({ scope, pts, color, examples }) => (
              <div key={scope} className={`p-3 rounded-xl border ${color}`}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm font-bold w-36 shrink-0">{scope}</span>
                  <span className="text-sm font-black">+{pts} pts per achievement</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">{examples}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Achievements without a set impact scope contribute 0 pts. Admins must classify the scope before a record influences the score — leaving it blank is a prompt to research the correct classification, not a default.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Source</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Achievements are sourced from official government gazettes, COMELEC records, Senate and House journals, and COA reports. Each record requires a source URL pointing to the official document. The scope classification follows the jurisdictional level of the enacting or awarding body.
          </p>
        </div>
      </section>

      {/* ── LEGAL PENALTY ── */}
      <section className="mb-10">
        <SectionHeader icon="⚖" label="Legal Penalty" color="bg-red-500" />

        <div className="card p-5 mb-4">
          <p className="text-slate-700 leading-relaxed mb-4">
            Active legal cases reduce the Objective Score. Penalties are <strong>cumulative per case</strong> and scaled to be meaningful against the cumulative scoring model. The minimum Objective Score is always 0.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { status: 'Pending', deduction: '−50 per case', color: 'bg-amber-50 border-amber-200 text-amber-700', description: 'A case filed in court and currently being tried. Charges have not yet been proven beyond reasonable doubt, but the existence of an active case is a material fact for voters.' },
              { status: 'Convicted', deduction: '−200 per case', color: 'bg-red-50 border-red-200 text-red-700', description: 'A court has found the official guilty beyond reasonable doubt. This is the most serious status and carries the heaviest penalty. Appeals may be ongoing, but a conviction is a final finding at that court level.' },
              { status: 'On Appeal', deduction: '−50 per case', color: 'bg-amber-50 border-amber-200 text-amber-700', description: 'A conviction is being appealed. Treated the same as pending — the matter is still unresolved before a higher court.' },
              { status: 'Acquitted', deduction: '0', color: 'bg-green-50 border-green-200 text-green-700', description: 'Court found the official not guilty. No deduction is applied. The record is still displayed for transparency — voters can see what cases were filed and how they resolved.' },
              { status: 'Dismissed', deduction: '0', color: 'bg-slate-50 border-slate-200 text-slate-600', description: 'Case was dismissed before reaching a verdict. No deduction. Displayed for transparency.' },
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
              { range: '500+', label: 'Exceptional record', color: 'bg-green-50 border-green-200 text-green-800', bar: 'bg-green-500', pct: 100, description: 'Multiple degrees from strong institutions, sustained clean COA audits across many terms, no active legal cases. A rare, thoroughly documented public record.' },
              { range: '300 – 499', label: 'Strong record', color: 'bg-green-50/60 border-green-100 text-green-700', bar: 'bg-green-400', pct: 70, description: 'Good education credentials, clean or mostly clean track record across multiple terms, no serious legal issues.' },
              { range: '100 – 299', label: 'Limited or mixed record', color: 'bg-amber-50 border-amber-200 text-amber-800', bar: 'bg-amber-400', pct: 35, description: 'Some verified records but a short career, unknown COA data, or qualified audit findings. Warrants closer inspection.' },
              { range: '1 – 99', label: 'Thin or penalized record', color: 'bg-red-50 border-red-200 text-red-700', bar: 'bg-red-400', pct: 15, description: 'Very few verified achievements, adverse COA findings, and/or active legal penalties pulling the score down.' },
              { range: '0', label: 'Penalized to floor', color: 'bg-red-50 border-red-300 text-red-800', bar: 'bg-red-600', pct: 2, description: 'Legal penalties exceed all positive points. Multiple convictions or pending cases against a limited positive record.' },
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
      <div className="card p-6 bg-[#1B2A4A] text-white text-center">
        <p className="font-black text-xl mb-1">See it in action</p>
        <p className="text-blue-200 text-sm mb-5">Browse profiles and watch the scores come to life</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profiles" className="inline-flex items-center justify-center gap-2 bg-white text-[#1B2A4A] font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
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
