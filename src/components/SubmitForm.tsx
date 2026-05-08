'use client'

import { useState } from 'react'
import { getMutationClient } from '@/lib/supabase/mutations'
import type {
  ChedAccreditation,
  CoaFinding,
  ImpactScope,
  RecordSubmissionPayload,
  SubmissionType,
} from '@/types/database'

type PoliticianOption = {
  id: string
  slug: string
  full_name: string
  preferred_name: string | null
  current_position: string | null
}

type Props = {
  politicians: PoliticianOption[]
  /** Optional pre-selected politician (e.g. from ?politician=slug query param) */
  defaultPoliticianId?: string
  /** Optional pre-selected submission type (e.g. from ?type=education) */
  defaultType?: SubmissionType
}

const inputClass =
  'w-full bg-white border border-slate-200 focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 text-slate-900 rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400'
const labelClass = 'block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5'
const helpClass = 'block text-xs text-slate-500 mt-1'

const TYPE_OPTIONS: { value: SubmissionType; label: string; description: string }[] = [
  {
    value: 'education',
    label: 'Education',
    description: 'A degree, diploma, or course of study from a school',
  },
  {
    value: 'track_record',
    label: 'Track Record',
    description: 'A position held — Senator, Mayor, Representative, etc.',
  },
  {
    value: 'achievement',
    label: 'Achievement',
    description: 'A landmark act, award, or major accomplishment',
  },
]

export default function SubmitForm({ politicians, defaultPoliticianId, defaultType }: Props) {
  const [politicianId, setPoliticianId] = useState(defaultPoliticianId ?? '')
  const [type, setType] = useState<SubmissionType>(defaultType ?? 'education')

  // Type-specific payload fields
  const [institution, setInstitution] = useState('')
  const [degree, setDegree] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [yearStarted, setYearStarted] = useState('')
  const [yearEnded, setYearEnded] = useState('')
  const [isCompleted, setIsCompleted] = useState(true)
  const [chedAccreditation, setChedAccreditation] = useState<ChedAccreditation | ''>('')

  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [coaFinding, setCoaFinding] = useState<CoaFinding | ''>('')
  const [billsAuthored, setBillsAuthored] = useState('')
  const [billsPassed, setBillsPassed] = useState('')
  const [billsEnacted, setBillsEnacted] = useState('')
  const [sglgAwarded, setSglgAwarded] = useState(false)
  const [attendanceRate, setAttendanceRate] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [year, setYear] = useState('')
  const [impactScope, setImpactScope] = useState<ImpactScope | ''>('')

  // Common fields
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceLabel, setSourceLabel] = useState('')
  const [supportingDocUrl, setSupportingDocUrl] = useState('')
  const [explanation, setExplanation] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function buildPayload(): RecordSubmissionPayload {
    if (type === 'education') {
      return {
        institution: institution.trim(),
        degree: degree.trim() || undefined,
        field_of_study: fieldOfStudy.trim() || undefined,
        year_started: yearStarted ? parseInt(yearStarted, 10) : undefined,
        year_ended: yearEnded ? parseInt(yearEnded, 10) : undefined,
        is_completed: isCompleted,
        ched_accreditation: chedAccreditation || undefined,
      }
    }
    if (type === 'track_record') {
      return {
        position: position.trim(),
        start_date: startDate || undefined,
        end_date: isCurrent ? undefined : endDate || undefined,
        is_current: isCurrent,
        coa_finding: coaFinding || undefined,
        bills_authored: billsAuthored ? parseInt(billsAuthored, 10) : undefined,
        bills_passed: billsPassed ? parseInt(billsPassed, 10) : undefined,
        bills_enacted_count: billsEnacted ? parseInt(billsEnacted, 10) : undefined,
        sglg_awarded: sglgAwarded,
        attendance_rate: attendanceRate ? parseFloat(attendanceRate) : undefined,
      }
    }
    return {
      title: title.trim(),
      description: description.trim() || undefined,
      year: year ? parseInt(year, 10) : undefined,
      impact_scope: impactScope || undefined,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!politicianId) {
      setError('Please select the politician this submission is about.')
      return
    }

    const payload = buildPayload()

    // Per-type required field validation
    if (type === 'education' && !payload.institution) {
      setError('Institution is required for education submissions.')
      return
    }
    if (type === 'track_record' && !payload.position) {
      setError('Position is required for track-record submissions.')
      return
    }
    if (type === 'achievement' && !payload.title) {
      setError('Title is required for achievement submissions.')
      return
    }

    setSubmitting(true)
    const supabase = getMutationClient()
    const { data: userData } = await supabase.auth.getUser()

    const { error: insertErr } = await supabase.from('record_submissions').insert({
      politician_id: politicianId,
      submission_type: type,
      payload,
      source_url: sourceUrl.trim(),
      source_label: sourceLabel.trim(),
      supporting_document_url: supportingDocUrl.trim() || null,
      explanation: explanation.trim(),
      submitter_name: submitterName.trim(),
      submitter_email: submitterEmail.trim(),
      submitter_user_id: userData.user?.id ?? null,
      status: 'pending',
    })

    setSubmitting(false)
    if (insertErr) {
      setError(insertErr.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="card p-8 text-center bg-green-50 border-green-200">
        <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-black text-lg text-green-900 mb-1">Submission received</p>
        <p className="text-sm text-green-800/80 mb-4 max-w-md mx-auto leading-relaxed">
          A vetter will review your submission against the source you provided.
          We&apos;ll email <strong>{submitterEmail}</strong> if we need clarification or
          when the record is added.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false)
            // Reset most fields but keep submitter info for repeat submissions
            setPoliticianId('')
            setType('education')
            setInstitution(''); setDegree(''); setFieldOfStudy('')
            setYearStarted(''); setYearEnded(''); setIsCompleted(true); setChedAccreditation('')
            setPosition(''); setStartDate(''); setEndDate(''); setIsCurrent(false)
            setCoaFinding(''); setBillsAuthored(''); setBillsPassed(''); setBillsEnacted('')
            setSglgAwarded(false); setAttendanceRate('')
            setTitle(''); setDescription(''); setYear(''); setImpactScope('')
            setSourceUrl(''); setSourceLabel(''); setSupportingDocUrl(''); setExplanation('')
          }}
          className="text-sm font-bold text-green-800 hover:text-green-900 underline"
        >
          Submit another record
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Politician */}
      <div className="card p-5">
        <label className={labelClass}>
          Which politician is this about? <span className="text-red-600">*</span>
        </label>
        <select
          value={politicianId}
          onChange={(e) => setPoliticianId(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">— Select a politician —</option>
          {politicians.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
              {p.current_position ? ` · ${p.current_position}` : ''}
            </option>
          ))}
        </select>
        <span className={helpClass}>
          Don&apos;t see them?{' '}
          <a href="/petition" className="text-[#1B2A4A] font-semibold hover:underline">
            Request a profile first
          </a>
          .
        </span>
      </div>

      {/* Type */}
      <div className="card p-5">
        <label className={labelClass}>
          What kind of record? <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const selected = type === opt.value
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`text-left p-3 rounded-xl border-2 transition-colors ${
                  selected
                    ? 'border-[#1B2A4A] bg-[#1B2A4A]/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className={`font-bold text-sm ${selected ? 'text-[#1B2A4A]' : 'text-slate-900'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{opt.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Type-specific fields */}
      {type === 'education' && (
        <div className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-black text-slate-900">Education details</p>
          <div>
            <label className={labelClass}>Institution <span className="text-red-600">*</span></label>
            <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} required className={inputClass} placeholder="University of the Philippines Diliman" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Degree</label>
              <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className={inputClass} placeholder="Bachelor of Laws" />
            </div>
            <div>
              <label className={labelClass}>Field of study</label>
              <input type="text" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className={inputClass} placeholder="Political Science" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Year started</label>
              <input type="number" min="1900" max="2099" value={yearStarted} onChange={(e) => setYearStarted(e.target.value)} className={inputClass} placeholder="1985" />
            </div>
            <div>
              <label className={labelClass}>Year ended</label>
              <input type="number" min="1900" max="2099" value={yearEnded} onChange={(e) => setYearEnded(e.target.value)} className={inputClass} placeholder="1989" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} className="accent-[#1B2A4A] w-4 h-4" />
            Completed (graduated, not just attended)
          </label>
          <div>
            <label className={labelClass}>CHED accreditation tier (if known)</label>
            <select value={chedAccreditation} onChange={(e) => setChedAccreditation(e.target.value as ChedAccreditation | '')} className={inputClass}>
              <option value="">— Don&apos;t know / leave blank —</option>
              <option value="deregulated">Deregulated</option>
              <option value="autonomous">Autonomous</option>
              <option value="foreign">Foreign institution</option>
              <option value="level_4">Level IV</option>
              <option value="level_3">Level III</option>
              <option value="level_2">Level II</option>
              <option value="level_1">Level I</option>
              <option value="unaccredited">Unaccredited</option>
            </select>
            <span className={helpClass}>The vetter will verify the tier against CHED records.</span>
          </div>
        </div>
      )}

      {type === 'track_record' && (
        <div className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-black text-slate-900">Position details</p>
          <div>
            <label className={labelClass}>Position <span className="text-red-600">*</span></label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} required className={inputClass} placeholder="Senator · Mayor of Quezon City · Representative for the 2nd District of Bulacan" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="accent-[#1B2A4A] w-4 h-4" />
            Currently serving in this position
          </label>
          <div>
            <label className={labelClass}>COA audit finding (most recent term, if known)</label>
            <select value={coaFinding} onChange={(e) => setCoaFinding(e.target.value as CoaFinding | '')} className={inputClass}>
              <option value="">— Don&apos;t know / leave blank —</option>
              <option value="unqualified">Unqualified (clean opinion)</option>
              <option value="qualified">Qualified</option>
              <option value="adverse">Adverse</option>
              <option value="disclaimer">Disclaimer</option>
              <option value="not_applicable">Not applicable (legislative role)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Bills authored</label>
              <input type="number" min="0" value={billsAuthored} onChange={(e) => setBillsAuthored(e.target.value)} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Bills passed</label>
              <input type="number" min="0" value={billsPassed} onChange={(e) => setBillsPassed(e.target.value)} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Bills enacted (RA)</label>
              <input type="number" min="0" value={billsEnacted} onChange={(e) => setBillsEnacted(e.target.value)} className={inputClass} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Attendance rate (%)</label>
              <input type="number" min="0" max="100" step="0.1" value={attendanceRate} onChange={(e) => setAttendanceRate(e.target.value)} className={inputClass} placeholder="95.2" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer self-end pb-2">
              <input type="checkbox" checked={sglgAwarded} onChange={(e) => setSglgAwarded(e.target.checked)} className="accent-[#1B2A4A] w-4 h-4" />
              Won DILG Seal of Good Local Governance
            </label>
          </div>
        </div>
      )}

      {type === 'achievement' && (
        <div className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-black text-slate-900">Achievement details</p>

          {/* Policy notice: biographical firsts, election outcomes, and personal achievements are not scoring */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">What counts as an achievement?</p>
            <p>
              Sourced governance accomplishments &mdash; bills enacted into law (RA-numbered),
              budget secured for projects, programs implemented, awards from named institutions
              with published criteria for governance work.
            </p>
            <p className="mt-2 font-bold">What doesn&apos;t count?</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                <span className="font-semibold">Demographic firsts</span> &mdash; &ldquo;first
                female VP&rdquo;, &ldquo;youngest senator&rdquo;, &ldquo;first Filipino to&hellip;&rdquo;
              </li>
              <li>
                <span className="font-semibold">Election outcomes</span> &mdash; &ldquo;Won 2016
                Presidential Election&rdquo;, &ldquo;Topped Senate race&rdquo;, &ldquo;most votes
                in PH history&rdquo;, &ldquo;re-elected for 3rd term&rdquo;.
              </li>
              <li>
                <span className="font-semibold">Personal accomplishments outside office</span>
                &mdash; boxing titles, Olympic medals, acting/music awards, film/TV credits,
                Hall of Fame inductions, brand endorsements. These are personal accomplishments
                outside the office of politics, not governance work.
              </li>
            </ul>
          </div>

          <div>
            <label className={labelClass}>Title <span className="text-red-600">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Authored the Universal Health Care Act" />
            {(() => {
              const t = title.trim()
              const isDemographicFirst = /^(first|youngest|oldest|sole|only)\s/i.test(t)
              const isElectionOutcome =
                /\b(won|topped|winner of)\b.*\b(election|presidential|senate|senatorial|gubernatorial|mayoral|midterm|race)\b/i.test(t)
                || /\b(re-?elected|reelected)\b/i.test(t)
                || /\belected\s+(as|to|in)\b/i.test(t)
                || /\b(most|highest|second-highest|record-breaking)\s+(number\s+of\s+)?votes?\b/i.test(t)
                || /\btop\s+(vote-?getter|placer)\b/i.test(t)
                || /\b\d+(st|nd|rd|th)\s+(consecutive\s+)?term\b/i.test(t)
                || /\b(landslide|sweeping)\s+(victory|win)\b/i.test(t)
              const isPersonal =
                /\b(boxing|boxer|world\s+champion|division\s+world|wba|wbc|ibf|wbo|olympic|gold\s+medal|silver\s+medal|bronze\s+medal)\b/i.test(t)
                || /\b(actor|actress|movie|film|television|telenovela|famas|metro\s+manila\s+film|hall\s+of\s+fame)\b/i.test(t)
                || /\bbest\s+(actor|actress|director|musical|picture|composer|recording|song)\b/i.test(t)
                || /\b(recording\s+artist|singer|album|grammy|gold\s+record|platinum\s+record)\b/i.test(t)
                || /\b(brand\s+ambassador|product\s+endorsement)\b/i.test(t)
              if (!isDemographicFirst && !isElectionOutcome && !isPersonal) return null
              const reason = isDemographicFirst
                ? 'a demographic first or biographical superlative'
                : isElectionOutcome
                  ? 'an electoral outcome / campaign result'
                  : 'a personal accomplishment outside the office of politics'
              return (
                <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                  ⚠ This looks like {reason}. Submissions like this are not scored as achievements
                  — vetters typically reject them. If this is actually a sourced governance
                  accomplishment, rephrase the title.
                </p>
              )
            })()}
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="What it did, why it matters" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Year</label>
              <input type="number" min="1900" max="2099" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2019" />
            </div>
            <div>
              <label className={labelClass}>Impact scope</label>
              <select value={impactScope} onChange={(e) => setImpactScope(e.target.value as ImpactScope | '')} className={inputClass}>
                <option value="">— Vetter will classify —</option>
                <option value="national_landmark">National — Landmark</option>
                <option value="national_standard">National — Standard</option>
                <option value="regional">Regional</option>
                <option value="local">Local</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Source — required */}
      <div className="card p-5 flex flex-col gap-4 border-l-4 border-l-[#1B2A4A]">
        <div>
          <p className="text-sm font-black text-slate-900">Source <span className="text-red-600">*</span></p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Every record on Politiko traces to an official source. Provide the URL of the
            primary source backing this submission — e.g. CHED accreditation list, COA audit
            report, Senate Journal, Sandiganbayan ruling, Official Gazette, or reputable news
            article citing such a record.
          </p>
        </div>
        <div>
          <label className={labelClass}>Source URL <span className="text-red-600">*</span></label>
          <input type="url" required value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={inputClass} placeholder="https://officialgazette.gov.ph/..." />
        </div>
        <div>
          <label className={labelClass}>Source label <span className="text-red-600">*</span></label>
          <input type="text" required value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} className={inputClass} placeholder="Official Gazette · Republic Act 11223" />
          <span className={helpClass}>A short human-readable label that will appear next to the link.</span>
        </div>
        <div>
          <label className={labelClass}>Supporting document URL (optional)</label>
          <input type="url" value={supportingDocUrl} onChange={(e) => setSupportingDocUrl(e.target.value)} className={inputClass} placeholder="https://drive.google.com/file/..." />
          <span className={helpClass}>
            If you have a PDF, scan, or additional document hosted somewhere (Google Drive,
            Dropbox, gov.ph site, archive.org), paste the URL here. Optional but speeds up review.
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="card p-5">
        <label className={labelClass}>
          Explain your submission <span className="text-red-600">*</span>
        </label>
        <textarea
          required
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="What this record claims and why it should be added. The reviewer reads this first, so be specific."
        />
      </div>

      {/* Submitter */}
      <div className="card p-5 flex flex-col gap-4">
        <p className="text-sm font-black text-slate-900">Your contact info</p>
        <p className="text-xs text-slate-500 -mt-2 leading-relaxed">
          Required so a vetter can ask follow-up questions. Your email is never shown publicly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Your name <span className="text-red-600">*</span></label>
            <input type="text" required value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} className={inputClass} placeholder="Juan dela Cruz" />
          </div>
          <div>
            <label className={labelClass}>Email <span className="text-red-600">*</span></label>
            <input type="email" required value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 text-white font-black px-6 py-3 rounded-lg transition-colors text-sm"
      >
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>

    </form>
  )
}
