'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    callbackError === 'auth_callback_failed' ? 'Email confirmation failed. Try signing up again.' : null
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition-colors mt-1"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-gray-500">
        No account?{' '}
        <Link href="/signup" className="text-[#60a5fa] hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
