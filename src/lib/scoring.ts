import type { ChedAccreditation, CoaFinding } from '@/types/database'

export const CHED_SCORES: Record<ChedAccreditation, number> = {
  deregulated: 100,
  autonomous: 95,
  foreign: 90,
  level_4: 85,
  level_3: 70,
  level_2: 55,
  level_1: 40,
  unaccredited: 20,
  unknown: 0,
}

export const COA_SCORES: Record<CoaFinding, number> = {
  unqualified: 100,
  qualified: 60,
  adverse: 20,
  disclaimer: 10,
  not_applicable: 0,
  unknown: 0,
}

export function scoreColor(score: number | null): string {
  if (score == null) return '#6b7280'
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function formatScore(score: number | null): string {
  if (score == null) return '—'
  return Math.round(score).toString()
}

// Scale 1-5 rating to 0-100
export function ratingToScore(rating: number): number {
  return ((rating - 1) / 4) * 100
}
