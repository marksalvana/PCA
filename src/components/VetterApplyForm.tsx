'use client'

import { useState } from 'react'
import { getMutationClient } from '@/lib/supabase/mutations'

const BACKGROUND_OPTIONS = [
  { value: 'researcher', label: 'Researcher / Analyst' },
  { value: 'journalist', label: 'Journalist / Writer' },
  { value: 'educator', label: 'Teacher / Educator' },
  { value: 'fact_checker', label: 'Fact-checker' },
  { value: 'legal', label: 'Lawyer / Legal Professional' },
  { value: 'government', label: 'Government Employee (current / former)' },
  { value: 'other', label: 'Other' },
]

const inputClass =
  'w-full bg-white border border-[rgba(27,42,74,0.2)] focus:border-[#1B2A4A] text-[#1B2A4A] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#857F75]'

export default function VetterApplyForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [background, setBackground] = useState('')
  const [motivation, setMotivation] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!consent) {
      setError('You must agree to the public display terms before submitting.')
      return
    }

    setLoading(true)

    const supabase = getMutationClient()
    const { error: dbError } = await supabase.from('vetter_applications').insert({
      full_name: fullName,
      email,
      background,
      motivation,
      profile_url: profileUrl || null,
      public_display_consent: consent,
      status: 'pending',
    })

    if (dbError) {
      setError(dbError.message)
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
          Thank you for volunteering. We review applications manually and will reach out to you at the email you provided.
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

      {/* Full name */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Full name <span className="text-[#C8304B]">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Juan dela Cruz"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Email address <span className="text-[#C8304B]">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className={inputClass}
        />
        <p className="text-xs text-[#857F75] mt-1.5">Used to notify you about your application. Not published anywhere.</p>
      </div>

      {/* Background */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Your background <span className="text-[#C8304B]">*</span>
        </label>
        <select
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          required
          className={inputClass}
        >
          <option value="" disabled>Select your background…</option>
          {BACKGROUND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Motivation */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          Why do you want to be a vetter? <span className="text-[#C8304B]">*</span>
        </label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          required
          rows={4}
          placeholder="Tell us what draws you to this work, what skills or experience you bring, and what you hope to contribute."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Professional profile */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
          LinkedIn or professional profile <span className="text-[#857F75] font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className={inputClass}
        />
      </div>

      {/* Consent checkbox */}
      <div className="card p-4 border-l-4 border-[#1B2A4A] bg-[#F4F2EE]">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="w-4 h-4 accent-[#1B2A4A] cursor-pointer"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B2A4A] mb-1">
              I agree to be publicly listed as a vetter. <span className="text-[#C8304B]">*</span>
            </p>
            <p className="text-xs text-[#4A4540] leading-relaxed">
              If accepted, my name will appear on every profile page I help verify — visible to all visitors. This is part of Politiko&apos;s transparency commitment: every verified record carries the name of the person who checked it. I understand and accept this.
            </p>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !consent}
        className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-40 disabled:cursor-not-allowed text-[#FBF5EB] font-black px-6 py-3 rounded-xl transition-colors text-sm"
        style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
      >
        {loading ? 'Submitting…' : 'Submit Application'}
      </button>

      <p className="text-xs text-center text-[#857F75] label-mono">
        Applications are reviewed manually · We respond within 1–2 weeks
      </p>
    </form>
  )
}
