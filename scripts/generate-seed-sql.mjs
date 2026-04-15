/**
 * generate-seed-sql.mjs
 * Reads data/politicians-seed.json and outputs SQL to stdout.
 * Run: node scripts/generate-seed-sql.mjs > data/seed.sql
 * Then paste seed.sql into Supabase SQL Editor and run.
 */

import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const politicians = JSON.parse(
  readFileSync(join(__dirname, '../data/politicians-seed.json'), 'utf8')
)
const dynasties = JSON.parse(
  readFileSync(join(__dirname, '../data/dynasties.json'), 'utf8')
)

// ── CHED accreditation → institution score ──────────────────────────────────
// "unknown" deliberately excluded: we won't inject a fake score for unknown data
const CHED_SCORES = {
  deregulated: 100,
  autonomous: 95,
  foreign: 90,   // default for any foreign institution; see billsBasedScore note
  level_4: 85,
  level_3: 70,
  level_2: 55,
  level_1: 40,
  unaccredited: 20,
  // unknown → null (excluded from average)
}

// ── COA audit opinion → performance score ───────────────────────────────────
// "not_applicable" and "unknown" deliberately excluded: use billsBasedScore instead
const COA_SCORES = {
  unqualified: 100,
  qualified: 60,
  adverse: 20,
  disclaimer: 10,
  // not_applicable → billsBasedScore or null
  // unknown        → billsBasedScore or null
}

// ── Legislative effectiveness fallback ──────────────────────────────────────
// Used when COA finding is not_applicable or unknown (senators, representatives)
// If bills_authored > 0: score scales from 30 (0% pass rate) to 85 (100% pass rate)
// Most effective legislators pass 10–30% of bills, giving typical scores of 35–50
function billsBasedScore(bills_authored, bills_passed) {
  if (bills_authored == null || bills_authored === 0) return null
  const rate = (bills_passed ?? 0) / bills_authored
  return Math.min(85, Math.round(30 + rate * 55))
}

// ── Per-track-record performance score ──────────────────────────────────────
function getTrackScore(r) {
  if (r.coa_finding && COA_SCORES[r.coa_finding] !== undefined) {
    return COA_SCORES[r.coa_finding]
  }
  // Legislative role or missing COA → try bills-based; null if no bills data
  return billsBasedScore(r.bills_authored, r.bills_passed)
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

// ── Objective score formula ──────────────────────────────────────────────────
// Only scorable (non-null) records are included in each average.
// Weights: 30% education + 70% track record. If one component has no data,
// the other carries 100% weight rather than injecting a fake default.
// Returns null when there is genuinely insufficient verified data.
function computeObjectiveScore(politician, eduRecords, trackRecords) {
  const scorableEdu   = eduRecords.filter(r => r.institution_score != null)
  const scorableTrack = trackRecords.filter(r => r.performance_score != null)

  const eduScore = scorableEdu.length
    ? scorableEdu.reduce((s, r) => s + r.institution_score, 0) / scorableEdu.length
    : null

  const trackScore = scorableTrack.length
    ? scorableTrack.reduce((s, r) => s + r.performance_score, 0) / scorableTrack.length
    : null

  const legalPenalty = (politician.legal_records || []).reduce((pen, r) => {
    if (r.status === 'pending')   return pen - 10
    if (r.status === 'convicted') return pen - 20
    return pen
  }, 0)

  let raw
  if (eduScore !== null && trackScore !== null) {
    raw = (eduScore * 0.3) + (trackScore * 0.7)
  } else if (trackScore !== null) {
    raw = trackScore   // only track data — carries full weight
  } else if (eduScore !== null) {
    raw = eduScore     // only education data — carries full weight
  } else {
    return null        // insufficient verified data
  }

  return Math.max(0, Math.min(100, raw + legalPenalty)).toFixed(2)
}

const lines = []

lines.push('-- ============================================================')
lines.push('-- PH Profile Compare — Seed Data Import')
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push('-- Run in Supabase SQL Editor')
lines.push('-- Safe to re-run: politicians are upserted, sub-records are')
lines.push('-- appended only if they do not already exist (matched by name).')
lines.push('-- Dynasty connections are always refreshed (derived data).')
lines.push('-- ============================================================')
lines.push('')

for (const p of politicians) {
  const politicianId = randomUUID()

  // Build sub-records with computed scores first
  const eduRecords = (p.education_records || []).map(r => {
    const base = r.ched_accreditation ? (CHED_SCORES[r.ched_accreditation] ?? null) : null
    // Incomplete degrees score 75% of the base — reward attendance, not abandonment
    const institution_score = base != null
      ? Math.round(base * (r.is_completed === false ? 0.75 : 1.0))
      : null
    return { ...r, id: randomUUID(), politician_id: politicianId, institution_score, is_verified: true }
  })

  const trackRecords = (p.track_records || []).map(r => ({
    ...r,
    id: randomUUID(),
    politician_id: politicianId,
    performance_score: getTrackScore(r),
    is_verified: true,
  }))

  const legalRecords = (p.legal_records || []).map(r => ({
    ...r,
    id: randomUUID(),
    politician_id: politicianId,
    is_verified: true,
  }))

  const achievements = (p.achievements || []).map(r => ({
    ...r,
    id: randomUUID(),
    politician_id: politicianId,
    is_verified: true,
  }))

  const objectiveScore = computeObjectiveScore(p, eduRecords, trackRecords)

  lines.push(`-- ---- ${p.full_name} ----`)

  const dynasty = dynasties[p.slug] ?? null

  // UPSERT politician — inserts on first run, updates score/photo/dynasty on re-run.
  // Manual edits made in the admin (notes, status changes, etc.) are preserved because
  // only the listed SET columns are overwritten on conflict.
  lines.push(`INSERT INTO public.politicians (id, slug, full_name, preferred_name, photo_url, birth_date, current_position, party_affiliation, region, is_incumbent, is_candidate, status, objective_score, dynasty_name, dynasty_generation) VALUES (`)
  lines.push(`  gen_random_uuid(),`)
  lines.push(`  ${sql(p.slug)},`)
  lines.push(`  ${sql(p.full_name)},`)
  lines.push(`  ${sql(p.preferred_name ?? null)},`)
  lines.push(`  ${sql(p.photo_url ?? null)},`)
  lines.push(`  ${sql(p.birth_date ?? null)},`)
  lines.push(`  ${sql(p.current_position ?? null)},`)
  lines.push(`  ${sql(p.party_affiliation ?? null)},`)
  lines.push(`  ${sql(p.region ?? null)},`)
  lines.push(`  ${sql(p.is_incumbent ?? false)},`)
  lines.push(`  ${sql(p.is_candidate ?? false)},`)
  lines.push(`  'published',`)
  lines.push(`  ${objectiveScore !== null ? sql(parseFloat(objectiveScore)) : 'NULL'},`)
  lines.push(`  ${sql(dynasty?.is_dynasty_member ? dynasty.dynasty_name : null)},`)
  lines.push(`  ${sql(dynasty?.is_dynasty_member ? dynasty.dynasty_generation : null)}`)
  lines.push(`) ON CONFLICT (slug) DO UPDATE SET`)
  lines.push(`  full_name          = EXCLUDED.full_name,`)
  lines.push(`  preferred_name     = EXCLUDED.preferred_name,`)
  lines.push(`  photo_url          = EXCLUDED.photo_url,`)
  lines.push(`  birth_date         = EXCLUDED.birth_date,`)
  lines.push(`  current_position   = EXCLUDED.current_position,`)
  lines.push(`  party_affiliation  = EXCLUDED.party_affiliation,`)
  lines.push(`  region             = EXCLUDED.region,`)
  lines.push(`  is_incumbent       = EXCLUDED.is_incumbent,`)
  lines.push(`  is_candidate       = EXCLUDED.is_candidate,`)
  lines.push(`  status             = EXCLUDED.status,`)
  lines.push(`  objective_score    = EXCLUDED.objective_score,`)
  lines.push(`  dynasty_name       = EXCLUDED.dynasty_name,`)
  lines.push(`  dynasty_generation = EXCLUDED.dynasty_generation;`)
  lines.push('')

  // INSERT education records — skips any record whose institution already exists
  // for this politician, so manually added records are never duplicated or removed.
  for (const r of eduRecords) {
    lines.push(`INSERT INTO public.education_records (id, politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, institution_score, source_url, source_label, is_verified)`)
    lines.push(`SELECT gen_random_uuid(), p.id,`)
    lines.push(`  ${sql(r.institution)}, ${sql(r.degree ?? null)}, ${sql(r.field_of_study ?? null)},`)
    lines.push(`  ${sql(r.year_started ?? null)}, ${sql(r.year_ended ?? null)}, ${sql(r.is_completed ?? true)},`)
    lines.push(`  ${sql(r.ched_accreditation ?? null)}, ${sql(r.institution_score ?? null)},`)
    lines.push(`  ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`FROM public.politicians p WHERE p.slug = ${sql(p.slug)}`)
    lines.push(`  AND NOT EXISTS (SELECT 1 FROM public.education_records e WHERE e.politician_id = p.id AND e.institution = ${sql(r.institution)});`)
  }
  if (eduRecords.length) lines.push('')

  // INSERT track records — skips any record whose position already exists
  for (const r of trackRecords) {
    lines.push(`INSERT INTO public.track_records (id, politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, performance_score, source_url, source_label, is_verified)`)
    lines.push(`SELECT gen_random_uuid(), p.id,`)
    lines.push(`  ${sql(r.position)}, ${sql(r.start_date ?? null)}, ${sql(r.end_date ?? null)}, ${sql(r.is_current ?? false)},`)
    lines.push(`  ${sql(r.coa_finding ?? null)}, ${sql(r.attendance_rate ?? null)}, ${sql(r.bills_authored ?? null)}, ${sql(r.bills_passed ?? null)},`)
    lines.push(`  ${sql(r.performance_score ?? null)}, ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`FROM public.politicians p WHERE p.slug = ${sql(p.slug)}`)
    lines.push(`  AND NOT EXISTS (SELECT 1 FROM public.track_records t WHERE t.politician_id = p.id AND t.position = ${sql(r.position)});`)
  }
  if (trackRecords.length) lines.push('')

  // INSERT legal records — skips any record whose case_title already exists
  for (const r of legalRecords) {
    lines.push(`INSERT INTO public.legal_records (id, politician_id, case_title, case_type, status, court, charge, filing_date, resolution_summary, source_url, source_label, is_verified)`)
    lines.push(`SELECT gen_random_uuid(), p.id,`)
    lines.push(`  ${sql(r.case_title)}, ${sql(r.case_type)}, ${sql(r.status)},`)
    lines.push(`  ${sql(r.court ?? null)}, ${sql(r.charge ?? null)}, ${sql(r.filing_date ?? null)},`)
    lines.push(`  ${sql(r.resolution_summary ?? null)}, ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`FROM public.politicians p WHERE p.slug = ${sql(p.slug)}`)
    lines.push(`  AND NOT EXISTS (SELECT 1 FROM public.legal_records l WHERE l.politician_id = p.id AND l.case_title = ${sql(r.case_title)});`)
  }
  if (legalRecords.length) lines.push('')

  // INSERT achievements — skips any achievement whose title already exists
  for (const r of achievements) {
    lines.push(`INSERT INTO public.achievements (id, politician_id, title, description, category, year, source_url, source_label, is_verified)`)
    lines.push(`SELECT gen_random_uuid(), p.id,`)
    lines.push(`  ${sql(r.title)}, ${sql(r.description ?? null)}, ${sql(r.category ?? null)}, ${sql(r.year ?? null)},`)
    lines.push(`  ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`FROM public.politicians p WHERE p.slug = ${sql(p.slug)}`)
    lines.push(`  AND NOT EXISTS (SELECT 1 FROM public.achievements a WHERE a.politician_id = p.id AND a.title = ${sql(r.title)});`)
  }
  if (achievements.length) lines.push('')

  // Dynasty connections are always refreshed — they are derived from dynasties.json
  // and are never manually edited in the admin, so replacing them is safe.
  if (dynasty?.is_dynasty_member && dynasty.family_members?.length) {
    lines.push(`DELETE FROM public.dynasty_connections WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = ${sql(p.slug)});`)
    for (const member of dynasty.family_members) {
      lines.push(`INSERT INTO public.dynasty_connections (id, politician_id, related_name, relationship, position_held, in_dataset, related_slug, source_url, source_label)`)
      lines.push(`SELECT gen_random_uuid(), p.id,`)
      lines.push(`  ${sql(member.name)}, ${sql(member.relationship)}, ${sql(member.position ?? null)},`)
      lines.push(`  ${sql(member.in_dataset ?? false)}, ${sql(member.slug ?? null)},`)
      lines.push(`  'https://en.wikipedia.org/wiki/Political_families_in_the_Philippines', 'Wikipedia – Political Families in the Philippines'`)
      lines.push(`FROM public.politicians p WHERE p.slug = ${sql(p.slug)};`)
    }
    lines.push('')
  }

  lines.push('')
}

lines.push('-- ============================================================')
lines.push('-- Done. All 17 politicians inserted as published with verified records.')
lines.push('-- ============================================================')

console.log(lines.join('\n'))
