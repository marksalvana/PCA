'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'collect' | 'verify'

/**
 * Two-step phone OTP verification form.
 *
 * Step 'collect': user enters PH phone number → we call
 *   supabase.auth.updateUser({ phone }) which sends an OTP to that number.
 *
 * Step 'verify': user enters the 6-digit code from SMS → we call
 *   supabase.auth.verifyOtp({ phone, token, type: 'phone_change' }).
 *
 * On success, the server-side update of user_profiles.phone_verified=true
 * and phone_e164=<phone> is performed via a Postgres trigger we wire in
 * the action layer; here we just refresh the route so middleware/page
 * guards re-evaluate.
 *
 * Phone normalization: any input is coerced to PH E.164 (+63...). Users
 * can paste 09xxxxxxxxx, 9xxxxxxxxx, or +639xxxxxxxxx — all become
 * +639xxxxxxxxx.
 */
function normalizeToE164PH(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (digits.length === 0) return null
  // 09171234567 → 9171234567
  if (digits.startsWith('09') && digits.length === 11) {
    return `+63${digits.slice(1)}`
  }
  // 639171234567 (with + already stripped)
  if (digits.startsWith('63') && digits.length === 12) {
    return `+${digits}`
  }
  // 9171234567 (10 digits, no leading 0)
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+63${digits}`
  }
  return null
}

export default function PhoneVerifyForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('collect')
  const [phoneInput, setPhoneInput] = useState('')
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const e164 = normalizeToE164PH(phoneInput)
    if (!e164) {
      setError('Please enter a valid PH mobile number (e.g. 0917 123 4567).')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ phone: e164 })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setNormalizedPhone(e164)
    setStep('verify')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!normalizedPhone) {
      setError('Phone number lost. Start over.')
      setStep('collect')
      return
    }
    if (!otp || otp.length < 6) {
      setError('Enter the 6-digit code from your SMS.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otp,
      type: 'phone_change',
    })

    if (verifyErr) {
      setLoading(false)
      setError(verifyErr.message)
      return
    }

    // Mark phone_verified + store the E.164 phone on the user_profiles row.
    // This goes through RLS as the authenticated user updating their own row.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await db
        .from('user_profiles')
        .update({ phone_verified: true, phone_e164: normalizedPhone })
        .eq('id', user.id)
    }

    setLoading(false)
    router.push('/dashboard')
    router.refresh()
  }

  async function handleResend() {
    if (!normalizedPhone) return
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ phone: normalizedPhone })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {step === 'collect' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">PH mobile number</label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
              placeholder="0917 123 4567"
              autoComplete="tel"
              className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              We&apos;ll text a 6-digit code. Standard SMS rates may apply.
              One phone number per Politiko account.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || phoneInput.trim().length === 0}
            className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Sending code…' : 'Send verification code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-300 mb-3">
              Enter the 6-digit code we sent to{' '}
              <span className="font-mono text-white">{normalizedPhone}</span>.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ''))}
              required
              placeholder="123456"
              autoComplete="one-time-code"
              autoFocus
              className="w-full bg-[#111827] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2.5 text-lg font-mono tracking-widest text-center outline-none transition-colors placeholder:text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={() => { setStep('collect'); setOtp(''); setError(null) }}
              className="hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              ← Use a different number
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
