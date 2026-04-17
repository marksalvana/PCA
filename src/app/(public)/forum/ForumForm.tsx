'use client'

import { useState, useTransition, useRef } from 'react'
import { submitForumPost } from '@/lib/actions/forum'

const CATEGORIES = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback',   label: 'Feedback' },
  { value: 'question',   label: 'Question' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'general',    label: 'General' },
]

export default function ForumForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

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
          <input
            name="author_name"
            type="text"
            placeholder="Your name"
            required
            minLength={2}
            maxLength={60}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0038a8]/20 focus:border-[#0038a8] transition-colors"
          />
          <select
            name="category"
            defaultValue="general"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0038a8]/20 focus:border-[#0038a8] transition-colors cursor-pointer text-slate-700"
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
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0038a8]/20 focus:border-[#0038a8] transition-colors resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-semibold bg-[#0038a8] hover:bg-blue-800 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors"
          >
            {isPending ? 'Posting…' : 'Post message'}
          </button>
        </div>
      </form>
    </div>
  )
}
