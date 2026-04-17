'use client'

import { useState, useTransition } from 'react'
import { submitRating } from '@/lib/actions/rating'

type Props = {
  politicianId: string
  slug: string
  userRating: number | null   // null = not yet rated
  isLoggedIn: boolean
}

const STARS = [1, 2, 3, 4, 5]

const LABELS: Record<number, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export default function RatingWidget({ politicianId, slug, userRating, isLoggedIn }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState<number | null>(userRating)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          <a href="/login" className="text-purple-600 hover:underline font-semibold">Log in</a>
          {' '}to rate this politician
        </p>
      </div>
    )
  }

  function handleRate(star: number) {
    setError(null)
    startTransition(async () => {
      const result = await submitRating(politicianId, slug, star)
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(star)
      }
    })
  }

  const displayRating = hovered ?? submitted ?? 0

  return (
    <div className="mt-3 pt-3 border-t border-slate-100" id="rate">
      <p className="text-xs text-slate-500 mb-2 text-center">
        {submitted ? 'Your rating — click to change' : 'Rate this politician'}
      </p>
      <div
        className="flex gap-1 justify-center"
        onMouseLeave={() => setHovered(null)}
      >
        {STARS.map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            disabled={isPending}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className={`text-2xl transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              star <= displayRating ? 'text-purple-500' : 'text-slate-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {displayRating > 0 && (
        <p className="text-xs text-center mt-1 text-slate-400">{LABELS[displayRating]}</p>
      )}
      {isPending && <p className="text-xs text-center mt-1 text-purple-500 animate-pulse">Saving…</p>}
      {error && <p className="text-xs text-center mt-1 text-red-500">{error}</p>}
    </div>
  )
}
