-- ============================================================
-- Migration 028: Clean up duplicate records from a double-run of migration 026
-- Run in Supabase SQL Editor AFTER migration 027.
--
-- Migration 026 originally lacked NOT EXISTS guards on its sub-record
-- inserts. Running it twice inserted duplicate rows in:
--   education_records, track_records, legal_records, achievements,
--   dynasty_connections
-- ...for the three senators added in that migration:
--   win-gatchalian, alan-peter-cayetano, jv-ejercito.
--
-- This migration removes duplicates, keeping the earliest row (by
-- created_at, then id as tiebreaker) for each logical (politician,
-- key-columns) tuple. The scope is intentionally limited to those
-- three politicians so it can't accidentally delete rows from anyone
-- else.
--
-- Recomputes objective_score for the affected senators at the end so
-- their scores reflect the deduped data.
--
-- Idempotent: safe to re-run (subsequent runs find 0 duplicates).
-- ============================================================

-- ── 1. Dedupe education_records ────────────────────────────────
WITH targets AS (
  SELECT id FROM public.politicians
  WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY politician_id,
                        institution,
                        COALESCE(degree, ''),
                        COALESCE(year_ended, 0)
           ORDER BY created_at, id
         ) AS rn
  FROM public.education_records
  WHERE politician_id IN (SELECT id FROM targets)
)
DELETE FROM public.education_records
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


-- ── 2. Dedupe track_records ────────────────────────────────────
WITH targets AS (
  SELECT id FROM public.politicians
  WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY politician_id,
                        position,
                        COALESCE(start_date::text, '')
           ORDER BY created_at, id
         ) AS rn
  FROM public.track_records
  WHERE politician_id IN (SELECT id FROM targets)
)
DELETE FROM public.track_records
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


-- ── 3. Dedupe legal_records ────────────────────────────────────
WITH targets AS (
  SELECT id FROM public.politicians
  WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY politician_id, case_title
           ORDER BY created_at, id
         ) AS rn
  FROM public.legal_records
  WHERE politician_id IN (SELECT id FROM targets)
)
DELETE FROM public.legal_records
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


-- ── 4. Dedupe achievements ─────────────────────────────────────
WITH targets AS (
  SELECT id FROM public.politicians
  WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY politician_id, title
           ORDER BY created_at, id
         ) AS rn
  FROM public.achievements
  WHERE politician_id IN (SELECT id FROM targets)
)
DELETE FROM public.achievements
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


-- ── 5. Dedupe dynasty_connections ──────────────────────────────
WITH targets AS (
  SELECT id FROM public.politicians
  WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY politician_id, related_name
           ORDER BY created_at, id
         ) AS rn
  FROM public.dynasty_connections
  WHERE politician_id IN (SELECT id FROM targets)
)
DELETE FROM public.dynasty_connections
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


-- ── 6. Recompute objective_score for the deduped senators ──────
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT id FROM public.politicians
    WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
