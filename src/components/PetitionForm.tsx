'use client'

import { useState } from 'react'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import { submitPetition } from '@/lib/actions/petitions'

export default function PetitionForm() {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!captchaToken) {
      setError('Please complete the CAPTCHA challenge.')
      return
    }

    setLoading(true)
    const result = await submitPetition({
      politicianName: name,
      currentPosition: position,
      reason,
      email,
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
      <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-6 text-center">
        <p className="font-bold text-lg">Request submitted!</p>
        <p className="text-sm mt-1 text-green-400/70">
          Our team will review your petition and prioritize profiles based on demand.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          Politician Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Juan dela Cruz"
          className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Current Position</label>
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="e.g. Senator, Representative for Quezon City 2nd District"
          className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Why should this person be profiled?</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Running for a major position, high public interest, etc."
          className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Your email (optional — for updates)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
        />
      </div>
      <div>
        <TurnstileWidget onToken={setCaptchaToken} theme="dark" />
      </div>
      <button
        type="submit"
        disabled={loading || !captchaToken}
        className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  )
}
