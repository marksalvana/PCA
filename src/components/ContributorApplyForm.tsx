'use client'

import { useState } from 'react'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import { submitContributorApplication } from '@/lib/actions/applications'

const BACKGROUND_OPTIONS = [
  { value: 'researcher',     label: 'Researcher / Analyst' },
  { value: 'journalist',     label: 'Journalist / Writer' },
  { value: 'civic_org',      label: 'Civic society / NGO' },
  { value: 'educator',       label: 'Teacher / Educator' },
  { value: 'student',        label: 'Student' },
  { value: 'fact_checker',   label: 'Fact-checker' },
  { value: 'legal',          label: 'Lawyer / Legal Professional' },
  { value: 'government',     label: 'Government Employee (current / former)' },
  { value: 'other',          label: 'Other' },
]

const inputClass =
  'w-full bg-white border border-[rgba(27,42,74,0.2)] focus:border-[#1B2A4A] text-[#1B2A4A] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#857F75]'

export default function ContributorApplyForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [background, setBackground] = useState('')
  const [motivation, setMotivation] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [consent, setConsent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!consent) {
      setError('Please agree to the contributor terms before submitting.')
      return
    }
    if (!captchaToken) {
      setError('Please complete the CAPTCHA challenge.')
      return
    }

    setLoading(true)
    const result = await submitContributorApplication({
      fullName,
      email,
      background,
      motivation,
      profileUrl: profileUrl || null,
      publicDisplayConsent: consent,
      captchaToken,
    })

    if ('error' in result) {
      setError(result.error)
      setCaptchaToken(null)
      setLoading(false)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-[#1B2A4A] mb-2" style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}>
          Application received.
        </h3>
        <p className="text-[#4A4540] text-sm leading-relaxed max-w-sm mx-auto">
          We review applications manually. If approved, your account is upgraded to{' '}
          <span className="font-semibold text-[#1B2A4A]">Contributor</span> and you&apos;ll get access to add politiko profiles and submit records from the backend. We&apos;ll notify you at <span className="font-mono text-[#1B2A4A]">{email}</span>.
        </p>
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

      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Full name <span className="text-[#C8304B]">*</span>
        </label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Juan dela Cruz" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Email address <span className="text-[#C8304B]">*</span>
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
        <p className="text-xs text-[#857F75] mt-1.5">Used to notify you about your application. Not published anywhere.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Your background <span className="text-[#C8304B]">*</span>
        </label>
        <select value={background} onChange={(e) => setBackground(e.target.value)} required className={inputClass}>
          <option value="" disabled>Select your background…</option>
          {BACKGROUND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Why do you want to be a contributor? <span className="text-[#C8304B]">*</span>
        </label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          required
          minLength={30}
          rows={4}
          placeholder="What politicians or records do you want to help add? Any research methods, sources, or experience you bring? (Min 30 characters.)"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          LinkedIn or professional profile <span className="text-[#857F75] font-normal">(optional)</span>
        </label>
        <input type="url" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={inputClass} />
      </div>

      <div className="card p-4 border-l-4 border-[#1B2A4A] bg-[#F4F2EE]">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="shrink-0 mt-0.5">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="w-4 h-4 accent-[#1B2A4A] cursor-pointer" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B2A4A] mb-1">
              I&apos;ll cite a source for every record I submit. <span className="text-[#C8304B]">*</span>
            </p>
            <p className="text-xs text-[#4A4540] leading-relaxed">
              I understand contributors create records that vetters review before publication. Every record needs a verifiable public source (gov.ph documents, court rulings, official gazette, reputable news). Submissions without sources will be rejected.
            </p>
          </div>
        </label>
      </div>

      <div>
        <TurnstileWidget onToken={setCaptchaToken} />
      </div>

      <button
        type="submit"
        disabled={loading || !consent || !captchaToken}
        className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-40 disabled:cursor-not-allowed text-[#FBF5EB] font-black px-6 py-3 rounded-xl transition-colors text-sm"
        style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
      >
        {loading ? 'Submitting…' : 'Submit Application'}
      </button>

      <p className="text-xs text-center text-[#857F75]">
        Applications are reviewed manually · We respond within 1–2 weeks
      </p>
    </form>
  )
}
