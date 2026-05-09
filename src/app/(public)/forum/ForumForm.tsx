'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { submitForumPost } from '@/lib/actions/forum'

const CATEGORIES = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback',   label: 'Feedback' },
  { value: 'question',   label: 'Question' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'general',    label: 'General' },
]

type Props = {
  /** Whether the viewer is signed in AND phone-verified. When false the
   *  form is replaced with a prompt to sign in / verify. */
  canPost: boolean
}

export default function ForumForm({ canPost }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  if (!canPost) {
    return (
      <div className="card p-5 mb-8 bg-slate-50 border-dashed border-slate-200">
        <h2 className="text-base font-black text-slate-900 mb-1">Share your thoughts</h2>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Sign in with a phone-verified account to post and reply. We require
          phone verification on a civic platform to make sure participants are
          real people, not bots.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/login?next=/forum"
            className="text-sm font-bold bg-[#1B2A4A] hover:bg-[#243761] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup?next=/forum"
            className="text-sm font-semibold text-[#1B2A4A] bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitForumPost(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="card p-5 mb-8">
      <h2 className="text-base font-black text-slate-900 mb-1">Share your thoughts</h2>
      <p className="text-xs text-slate-400 mb-4">Suggestions, feedback, and questions from the community help us improve.</p>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold">
          Thanks! Your message has been posted.
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            name="category"
            defaultValue="general"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors cursor-pointer text-slate-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <textarea
          name="content"
          placeholder="Write your message here…"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-colors resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-semibold bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors"
          >
            {isPending ? 'Posting…' : 'Post message'}
          </button>
        </div>
      </form>
    </div>
  )
}
