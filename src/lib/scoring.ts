import type { ChedAccreditation, CoaFinding, OmbudsmanDisposition } from '@/types/database'

// Points contributed per education record (base score; multiply by 0.75 for incomplete)
export const CHED_SCORES: Record<ChedAccreditation, number> = {
  deregulated: 100,
  autonomous: 95,
  foreign: 90,
  level_4: 85,
  level_3: 70,
  level_2: 55,
  level_1: 40,
  unaccredited: 20,
  unknown: 0,   // unverifiable — contributes 0
}

// Points contributed per track record
export const COA_SCORES: Record<CoaFinding, number> = {
  unqualified: 100,
  qualified: 60,
  adverse: 20,
  disclaimer: 10,
  not_applicable: 0,  // use bills-based formula instead
  unknown: 0,         // no verifiable data — contributes 0
}

// Legal penalty per case
export const LEGAL_PENALTIES = {
  pending: 75,
  convicted: 350,
  ongoing_appeal: 75,
} as const

// Additional Ombudsman penalty (per case, additive on top of court status)
export const OMBUDSMAN_PENALTIES: Record<OmbudsmanDisposition, number> = {
  dismissed: 0,
  none: 0,
  pending_at_ombudsman: 25,
  admin_penalty: 50,
  criminal_filed: 100,
}

// COMELEC disqualification adds a flat penalty when present on a legal record
export const COMELEC_DISQUALIFICATION_PENALTY = 100

// SALN integrity: late or non-filing adds a small penalty per occurrence
export const SALN_LATE_PENALTY = 25

// SGLG (DILG Seal of Good Local Governance) bonus per term
export const SGLG_BONUS = 30

// Caps on total points per category
export const EDUCATION_CAP = 200
export const ACHIEVEMENT_CAP = 300
export const AWARDS_CAP = 150

// Awards: per-award scoring keyed off well-known PH award names
// Source: lower-cased substring match against the award name
export function computeAwardPts(name: string | null | undefined): number {
  if (!name) return 0
  const n = name.toLowerCase()
  if (n.includes('magsaysay')) return 100
  if (n.includes('order of lakandula')) return 80
  if (n.includes('order of national')) return 80
  if (n.includes('medal of valor')) return 90
  if (n.includes('toym') || n.includes('outstanding young')) return 60
  return 25
}

// Points per achievement based on impact scope
export const ACHIEVEMENT_SCORES: Record<string, number> = {
  national_landmark: 100,
  national_standard: 60,
  national: 100,  // legacy — treat as national_landmark
  regional: 40,
  local: 20,
}

// Attendance rate modifier per track record term
export const ATTENDANCE_MODIFIERS = [
  { label: '95–100%',  minPct: 95,  modifier: +20, description: 'Exceptional attendance' },
  { label: '90–94%',   minPct: 90,  modifier: +10, description: 'Good attendance' },
  { label: '75–89%',   minPct: 75,  modifier:   0, description: 'Adequate — no change' },
  { label: '50–74%',   minPct: 50,  modifier: -10, description: 'Poor but majority-present' },
  { label: '< 50%',    minPct:  0,  modifier: -50, description: 'Majority-absent — serious failure' },
] as const

// Bar display reference: a bar fills completely at this score.
// Scores above this still display as a full bar (with the number shown).
export const OBJECTIVE_DISPLAY_MAX = 500

// Color for individual record bars (per-record scores are still 0–100)
export function scoreColor(score: number | null): string {
  if (score == null) return '#6b7280'
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

// Color for total objective score (cumulative — can exceed 100)
export function objectiveScoreColor(score: number | null): string {
  if (score == null) return '#6b7280'
  if (score >= 300) return '#22c55e'   // strong multi-record history
  if (score >= 100) return '#f59e0b'   // some verified records
  return '#ef4444'                      // limited or penalized record
}

export function formatScore(score: number | null): string {
  if (score == null) return '—'
  return Math.round(score).toString()
}

// Normalize an objective score to a 0–100 percentage for bar display
export function objectiveScoreBarPct(score: number | null): number {
  if (score == null || score <= 0) return 0
  return Math.min(100, (score / OBJECTIVE_DISPLAY_MAX) * 100)
}

// Scale 1-5 rating to 0-100
export function ratingToScore(rating: number): number {
  return ((rating - 1) / 4) * 100
}

// Compute the point contribution for a single track record.
// Mirrors the SQL logic in compute_objective_score exactly.
export function computeTrackPts(rec: {
  coa_finding: CoaFinding | null
  bills_authored: number | null
  bills_passed: number | null
  bills_enacted_count?: number | null
  sglg_awarded?: boolean | null
  attendance_rate: number | null
  is_current?: boolean
}): number {
  // +40 flat bonus for completed terms (not still-serving positions)
  const completionBonus = rec.is_current === true ? 0 : 40

  // +30 SGLG bonus per term that won DILG Seal of Good Local Governance
  const sglgBonus = rec.sglg_awarded === true ? SGLG_BONUS : 0

  let base = 0
  if (rec.coa_finding === 'unqualified') base = 100
  else if (rec.coa_finding === 'qualified') base = 60
  else if (rec.coa_finding === 'adverse') base = 20
  else if (rec.coa_finding === 'disclaimer') base = 10
  else if (
    (rec.coa_finding === 'not_applicable' || rec.coa_finding === 'unknown' || rec.coa_finding == null) &&
    rec.bills_authored != null && rec.bills_authored > 0
  ) {
    const passRate = (rec.bills_passed ?? 0) / rec.bills_authored
    const enactedBonus = (rec.bills_enacted_count ?? 0) * 5
    base = Math.min(95, 30 + Math.round(passRate * 55) + enactedBonus)
  }

  let mod = 0
  if (rec.attendance_rate != null) {
    if (rec.attendance_rate >= 95) mod = 20
    else if (rec.attendance_rate >= 90) mod = 10
    else if (rec.attendance_rate >= 75) mod = 0
    else if (rec.attendance_rate >= 50) mod = -10
    else mod = -50
  }

  return Math.max(0, completionBonus + sglgBonus + base + mod)
}

// Compute additional legal penalty contributions from Ombudsman + COMELEC fields
export function computeExtraLegalPenalty(rec: {
  ombudsman_disposition?: OmbudsmanDisposition | null
  comelec_disqualification?: boolean | null
}): number {
  const omb = rec.ombudsman_disposition ? OMBUDSMAN_PENALTIES[rec.ombudsman_disposition] ?? 0 : 0
  const comelec = rec.comelec_disqualification === true ? COMELEC_DISQUALIFICATION_PENALTY : 0
  return omb + comelec
}

// Compute SALN integrity penalty for a single net-worth record
export function computeSalnPenalty(rec: { saln_filed_on_time?: boolean | null }): number {
  return rec.saln_filed_on_time === false ? SALN_LATE_PENALTY : 0
}

export function attendanceModifier(rate: number | null): number {
  if (rate == null) return 0
  if (rate >= 95) return 20
  if (rate >= 90) return 10
  if (rate >= 75) return 0
  if (rate >= 50) return -10
  return -50
}

// Compute the point contribution for a single achievement.
export function computeAchievementPts(scope: string | null | undefined): number {
  return ACHIEVEMENT_SCORES[scope ?? ''] ?? 0
}

// Compute the point contribution for a single education record.
export function computeEducationPts(rec: {
  ched_accreditation: ChedAccreditation | null
  is_completed: boolean
}): number {
  if (!rec.ched_accreditation || rec.ched_accreditation === 'unknown') return 0
  const base = CHED_SCORES[rec.ched_accreditation]
  return Math.round(base * (rec.is_completed ? 1.0 : 0.75))
}
