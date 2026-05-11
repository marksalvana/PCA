'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initialDisplayName: string
  phoneVerified: boolean
  phoneE164: string | null
}

type PhoneStep = 'idle' | 'collect' | 'verify'

function normalizeToE164PH(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (digits.length === 0) return null
  if (digits.startsWith('09') && digits.length === 11) return `+63${digits.slice(1)}`
  if (digits.startsWith('63') && digits.length === 12) return `+${digits}`
  if (digits.length === 10 && digits.startsWith('9')) return `+63${digits}`
  return null
}

function maskPhone(e164: string): string {
  // +639171234567 → +63 917 ••• 4567
  if (!e164.startsWith('+63') || e164.length !== 13) return e164
  return `+63 ${e164.slice(3, 6)} ••• ${e164.slice(9)}`
}

export default function AccountSettings({
  initialDisplayName,
  phoneVerified,
  phoneE164,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  // ── Display name ──
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  async function saveDisplayName(e: React.FormEvent) {
    e.preventDefault()
    setNameMsg(null)
    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      setNameMsg({ tone: 'err', text: 'Display name must be at least 2 characters.' })
      return
    }
    if (trimmed === initialDisplayName) {
      setNameMsg({ tone: 'ok', text: 'No changes to save.' })
      return
    }
    setSavingName(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingName(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { error } = await db
      .from('user_profiles')
      .update({ display_name: trimmed })
      .eq('id', user.id)
    setSavingName(false)
    if (error) { setNameMsg({ tone: 'err', text: error.message }); return }
    setNameMsg({ tone: 'ok', text: 'Saved.' })
    router.refresh()
  }

  // ── Phone ──
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('idle')
  const [phoneInput, setPhoneInput] = useState('')
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [phoneMsg, setPhoneMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [phoneLoading, setPhoneLoading] = useState(false)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setPhoneMsg(null)
    const e164 = normalizeToE164PH(phoneInput)
    if (!e164) {
      setPhoneMsg({ tone: 'err', text: 'Enter a valid PH mobile number (e.g. 0917 123 4567).' })
      return
    }
    setPhoneLoading(true)
    const { error } = await supabase.auth.updateUser({ phone: e164 })
    setPhoneLoading(false)
    if (error) { setPhoneMsg({ tone: 'err', text: error.message }); return }
    setNormalizedPhone(e164)
    setPhoneStep('verify')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setPhoneMsg(null)
    if (!normalizedPhone) { setPhoneStep('collect'); return }
    if (otp.length < 6) {
      setPhoneMsg({ tone: 'err', text: 'Enter the 6-digit code from your SMS.' })
      return
    }
    setPhoneLoading(true)
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otp,
      type: 'phone_change',
    })
    if (verifyErr) {
      setPhoneLoading(false)
      setPhoneMsg({ tone: 'err', text: verifyErr.message })
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      await db
        .from('user_profiles')
        .update({ phone_verified: true, phone_e164: normalizedPhone })
        .eq('id', user.id)
    }
    setPhoneLoading(false)
    setPhoneMsg({ tone: 'ok', text: 'Mobile verified.' })
    setPhoneStep('idle')
    setPhoneInput('')
    setOtp('')
    setNormalizedPhone(null)
    router.refresh()
  }

  async function resendOtp() {
    if (!normalizedPhone) return
    setPhoneMsg(null)
    setPhoneLoading(true)
    const { error } = await supabase.auth.updateUser({ phone: normalizedPhone })
    setPhoneLoading(false)
    if (error) setPhoneMsg({ tone: 'err', text: error.message })
    else setPhoneMsg({ tone: 'ok', text: 'New code sent.' })
  }

  function startPhoneFlow() {
    setPhoneInput('')
    setOtp('')
    setNormalizedPhone(null)
    setPhoneMsg(null)
    setPhoneStep('collect')
  }

  function cancelPhoneFlow() {
    setPhoneStep('idle')
    setPhoneInput('')
    setOtp('')
    setNormalizedPhone(null)
    setPhoneMsg(null)
  }

  const inputClass =
    'w-full bg-white border border-slate-200 focus:border-[#1B2A4A] text-slate-900 rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400'

  return (
    <div className="card p-5 flex flex-col gap-6">

      {/* ── Display name ── */}
      <form onSubmit={saveDisplayName} className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="display-name">
          Display name
        </label>
        <div className="flex gap-2 flex-wrap">
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            required
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <button
            type="submit"
            disabled={savingName || displayName.trim() === initialDisplayName}
            className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {savingName ? 'Saving…' : 'Save'}
          </button>
        </div>
        {nameMsg && (
          <p className={`text-xs ${nameMsg.tone === 'err' ? 'text-red-600' : 'text-emerald-700'}`}>
            {nameMsg.text}
          </p>
        )}
      </form>

      {/* ── Mobile ── */}
      <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mobile</p>
          {phoneVerified && phoneE164 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              VERIFIED ✓
            </span>
          )}
        </div>

        {phoneStep === 'idle' && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm text-slate-700 font-mono">
              {phoneE164 ? maskPhone(phoneE164) : <span className="font-sans italic text-slate-400">No mobile on file</span>}
            </p>
            <button
              type="button"
              onClick={startPhoneFlow}
              className="text-xs font-bold border border-slate-200 bg-white hover:border-[#1B2A4A] hover:text-[#1B2A4A] px-3 py-1.5 rounded-lg transition-colors"
            >
              {phoneE164 ? (phoneVerified ? 'Change mobile' : 'Verify mobile') : 'Add mobile'}
            </button>
          </div>
        )}

        {phoneStep === 'collect' && (
          <form onSubmit={sendOtp} className="flex flex-col gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
              placeholder="0917 123 4567"
              autoComplete="tel"
              className={inputClass}
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              We&apos;ll text a 6-digit code. Standard SMS rates may apply. One phone number per Politiko account.
            </p>
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={phoneLoading || phoneInput.trim().length === 0}
                className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {phoneLoading ? 'Sending code…' : 'Send code'}
              </button>
              <button
                type="button"
                onClick={cancelPhoneFlow}
                disabled={phoneLoading}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {phoneStep === 'verify' && (
          <form onSubmit={verifyOtp} className="flex flex-col gap-2">
            <p className="text-sm text-slate-700">
              Enter the 6-digit code sent to{' '}
              <span className="font-mono font-semibold text-slate-900">{normalizedPhone}</span>.
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
              className={`${inputClass} text-lg font-mono tracking-widest text-center`}
            />
            <div className="flex gap-2 mt-1 flex-wrap">
              <button
                type="submit"
                disabled={phoneLoading || otp.length < 6}
                className="bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {phoneLoading ? 'Verifying…' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => { setPhoneStep('collect'); setOtp(''); setPhoneMsg(null) }}
                disabled={phoneLoading}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
              >
                ← Different number
              </button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={phoneLoading}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={cancelPhoneFlow}
                disabled={phoneLoading}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 ml-auto transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {phoneMsg && (
          <p className={`text-xs ${phoneMsg.tone === 'err' ? 'text-red-600' : 'text-emerald-700'}`}>
            {phoneMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}
