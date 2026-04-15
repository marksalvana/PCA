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

// Scoring maps (mirrors scoring_benchmarks seed data)
const CHED_SCORES = {
  deregulated: 100,
  autonomous: 95,
  foreign: 90,
  level_4: 85,
  level_3: 70,
  level_2: 55,
  level_1: 40,
  unaccredited: 20,
  unknown: 30,
}

const COA_SCORES = {
  unqualified: 100,
  qualified: 60,
  adverse: 20,
  disclaimer: 10,
  not_applicable: 50,
  unknown: 30,
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  // Escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`
}

function computeObjectiveScore(politician, eduRecords, trackRecords) {
  const verifiedEdu = eduRecords.filter(r => r.institution_score != null)
  const verifiedTrack = trackRecords.filter(r => r.performance_score != null)

  const eduScore = verifiedEdu.length
    ? verifiedEdu.reduce((s, r) => s + r.institution_score, 0) / verifiedEdu.length
    : 50

  const trackScore = verifiedTrack.length
    ? verifiedTrack.reduce((s, r) => s + r.performance_score, 0) / verifiedTrack.length
    : 50

  const legalPenalty = (politician.legal_records || []).reduce((pen, r) => {
    if (r.status === 'pending') return pen - 10
    if (r.status === 'convicted') return pen - 20
    return pen
  }, 0)

  const raw = (eduScore * 0.3) + (trackScore * 0.7) + legalPenalty
  return Math.max(0, Math.min(100, raw)).toFixed(2)
}

const lines = []

lines.push('-- ============================================================')
lines.push('-- PH Profile Compare — Seed Data Import')
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push('-- Run in Supabase SQL Editor')
lines.push('-- ============================================================')
lines.push('')

for (const p of politicians) {
  const politicianId = randomUUID()

  // Build sub-records with computed scores first
  const eduRecords = (p.education_records || []).map(r => ({
    ...r,
    id: randomUUID(),
    politician_id: politicianId,
    institution_score: r.ched_accreditation ? (CHED_SCORES[r.ched_accreditation] ?? null) : null,
    is_verified: true,
  }))

  const trackRecords = (p.track_records || []).map(r => ({
    ...r,
    id: randomUUID(),
    politician_id: politicianId,
    performance_score: r.coa_finding ? (COA_SCORES[r.coa_finding] ?? null) : null,
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

  // INSERT politician
  lines.push(`INSERT INTO public.politicians (id, slug, full_name, preferred_name, photo_url, birth_date, current_position, party_affiliation, region, is_incumbent, is_candidate, status, objective_score) VALUES (`)
  lines.push(`  ${sql(politicianId)},`)
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
  lines.push(`  ${sql(parseFloat(objectiveScore))}`)
  lines.push(`);`)
  lines.push('')

  // INSERT education records
  for (const r of eduRecords) {
    lines.push(`INSERT INTO public.education_records (id, politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, institution_score, source_url, source_label, is_verified) VALUES (`)
    lines.push(`  ${sql(r.id)}, ${sql(r.politician_id)},`)
    lines.push(`  ${sql(r.institution)}, ${sql(r.degree ?? null)}, ${sql(r.field_of_study ?? null)},`)
    lines.push(`  ${sql(r.year_started ?? null)}, ${sql(r.year_ended ?? null)}, ${sql(r.is_completed ?? true)},`)
    lines.push(`  ${sql(r.ched_accreditation ?? null)}, ${sql(r.institution_score ?? null)},`)
    lines.push(`  ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`);`)
  }
  if (eduRecords.length) lines.push('')

  // INSERT track records
  for (const r of trackRecords) {
    lines.push(`INSERT INTO public.track_records (id, politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, performance_score, source_url, source_label, is_verified) VALUES (`)
    lines.push(`  ${sql(r.id)}, ${sql(r.politician_id)},`)
    lines.push(`  ${sql(r.position)}, ${sql(r.start_date ?? null)}, ${sql(r.end_date ?? null)}, ${sql(r.is_current ?? false)},`)
    lines.push(`  ${sql(r.coa_finding ?? null)}, ${sql(r.attendance_rate ?? null)}, ${sql(r.bills_authored ?? null)}, ${sql(r.bills_passed ?? null)},`)
    lines.push(`  ${sql(r.performance_score ?? null)}, ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`);`)
  }
  if (trackRecords.length) lines.push('')

  // INSERT legal records
  for (const r of legalRecords) {
    lines.push(`INSERT INTO public.legal_records (id, politician_id, case_title, case_type, status, court, charge, filing_date, resolution_summary, source_url, source_label, is_verified) VALUES (`)
    lines.push(`  ${sql(r.id)}, ${sql(r.politician_id)},`)
    lines.push(`  ${sql(r.case_title)}, ${sql(r.case_type)}, ${sql(r.status)},`)
    lines.push(`  ${sql(r.court ?? null)}, ${sql(r.charge ?? null)}, ${sql(r.filing_date ?? null)},`)
    lines.push(`  ${sql(r.resolution_summary ?? null)}, ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`);`)
  }
  if (legalRecords.length) lines.push('')

  // INSERT achievements
  for (const r of achievements) {
    lines.push(`INSERT INTO public.achievements (id, politician_id, title, description, category, year, source_url, source_label, is_verified) VALUES (`)
    lines.push(`  ${sql(r.id)}, ${sql(r.politician_id)},`)
    lines.push(`  ${sql(r.title)}, ${sql(r.description ?? null)}, ${sql(r.category ?? null)}, ${sql(r.year ?? null)},`)
    lines.push(`  ${sql(r.source_url)}, ${sql(r.source_label)}, true`)
    lines.push(`);`)
  }
  if (achievements.length) lines.push('')

  lines.push('')
}

lines.push('-- ============================================================')
lines.push('-- Done. All 17 politicians inserted as published with verified records.')
lines.push('-- ============================================================')

console.log(lines.join('\n'))
