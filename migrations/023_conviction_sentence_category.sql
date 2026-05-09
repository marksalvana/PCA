-- ============================================================
-- Migration 023: Tiered conviction penalties by PH penal classification
-- Run in Supabase SQL Editor AFTER migration 022.
--
-- Replaces the fixed -350 penalty per conviction (migrations 006 / 008)
-- with a tiered schedule keyed off the Philippine penal classification.
-- A conviction for plunder (reclusión perpetua) and a conviction for
-- failing to file a tax return (fines only) should not score the same.
--
-- Penalty schedule (per verified conviction row):
--   civil         -50    Civil judgment, contempt order, no PH imprisonment
--   arresto       -100   Arresto menor / mayor (1 day – 6 months)
--   correccional  -200   Prisión correccional (6 months – 6 years)
--   mayor         -350   Prisión mayor (6 – 12 years)         [DEFAULT]
--   temporal      -500   Reclusión temporal (12 – 20 years)
--   perpetua      -700   Reclusión perpetua / life
--
-- Policy:
--   - Pardons do not reduce the penalty. The court's finding is the fact;
--     pardons are political acts that don't erase the conviction.
--   - Civil judgments (incl. foreign-court contempt) score at the floor,
--     not zero. A finding of wrongdoing in any court matters.
--   - Multi-count cases use the highest category across the counts.
--   - 'mayor' is the fallback when status='convicted' but category is NULL,
--     matching the historical fixed -350 penalty so legacy rows don't drift.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ── 1. Schema: add sentence_category column with CHECK ─────────
ALTER TABLE public.legal_records
  ADD COLUMN IF NOT EXISTS sentence_category text;

ALTER TABLE public.legal_records
  DROP CONSTRAINT IF EXISTS legal_records_sentence_category_check;
ALTER TABLE public.legal_records
  ADD CONSTRAINT legal_records_sentence_category_check
  CHECK (sentence_category IS NULL OR sentence_category IN (
    'civil', 'arresto', 'correccional', 'mayor', 'temporal', 'perpetua'
  ));

COMMENT ON COLUMN public.legal_records.sentence_category IS
  'Severity tier of the conviction sentence per PH penal classification.
   One of: civil, arresto, correccional, mayor, temporal, perpetua.
   Required when status = ''convicted''; ignored otherwise.
   Default fallback when status=''convicted'' but column is NULL is ''mayor''
   (matching the historical fixed -350 penalty).';


-- ── 2. Backfill the 5 seeded convictions ───────────────────────
-- Estrada — Plunder (Sandiganbayan, reclusión perpetua)
UPDATE public.legal_records
   SET sentence_category = 'perpetua'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'joseph-estrada')
   AND case_title ILIKE '%Plunder%'
   AND status = 'convicted';

-- BBM — Failure to File Income Tax Returns 1982–1985
-- (CA modified to fines only — no prison terms upheld)
UPDATE public.legal_records
   SET sentence_category = 'civil'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bongbong-marcos')
   AND case_title ILIKE '%Failure to File%'
   AND status = 'convicted';

-- BBM — Hawaii Human Rights Reparations Contempt Order (US civil)
UPDATE public.legal_records
   SET sentence_category = 'civil'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bongbong-marcos')
   AND case_title ILIKE '%Human Rights Reparations%'
   AND status = 'convicted';

-- Imee Marcos — Trajano (US civil tort)
UPDATE public.legal_records
   SET sentence_category = 'civil'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'imee-marcos')
   AND case_title ILIKE '%Trajano%'
   AND status = 'convicted';

-- Robin Padilla — Illegal Possession of Firearms
-- (1994, 17–21 yrs sentence; pardoned 1998 — pardon does not reduce per policy)
UPDATE public.legal_records
   SET sentence_category = 'temporal'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'robin-padilla')
   AND case_title ILIKE '%Illegal Possession of Firearms%'
   AND status = 'convicted';


-- ── 3. Replace compute_objective_score with the tiered penalty ──
CREATE OR REPLACE FUNCTION public.compute_objective_score(p_politician_id uuid)
RETURNS numeric AS $$
DECLARE
  edu_score          numeric := 0;
  track_score        numeric := 0;
  achievement_score  numeric := 0;
  awards_score       numeric := 0;
  legal_pending      numeric := 0;
  legal_conviction   numeric := 0;
  legal_other        numeric := 0;
  saln_penalty       numeric := 0;
  final_score        numeric;
  breakdown          jsonb;
BEGIN

  -- ── Education: SUM, capped at 200 ─────────────────────────────
  SELECT LEAST(200, COALESCE(SUM(
    ROUND(
      CASE ched_accreditation
        WHEN 'deregulated'  THEN 100
        WHEN 'autonomous'   THEN 95
        WHEN 'foreign'      THEN 90
        WHEN 'level_4'      THEN 85
        WHEN 'level_3'      THEN 70
        WHEN 'level_2'      THEN 55
        WHEN 'level_1'      THEN 40
        WHEN 'unaccredited' THEN 20
        ELSE 0
      END
      * CASE WHEN is_completed THEN 1.0 ELSE 0.75 END
    )
  ), 0))
  INTO edu_score
  FROM public.education_records
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND ched_accreditation IS NOT NULL
    AND ched_accreditation <> 'unknown';

  -- ── Track record ──────────────────────────────────────────────
  SELECT COALESCE(SUM(
    GREATEST(0,
      CASE WHEN is_current = false THEN 40 ELSE 0 END
      +
      CASE WHEN sglg_awarded = true THEN 30 ELSE 0 END
      +
      CASE
        WHEN coa_finding = 'unqualified' THEN 100
        WHEN coa_finding = 'qualified'   THEN 60
        WHEN coa_finding = 'adverse'     THEN 20
        WHEN coa_finding = 'disclaimer'  THEN 10
        WHEN coa_finding IN ('not_applicable', 'unknown')
             AND bills_authored IS NOT NULL AND bills_authored > 0
          THEN LEAST(95, 30 + ROUND(
                 (COALESCE(bills_passed, 0)::numeric / bills_authored::numeric) * 55
                 + COALESCE(bills_enacted_count, 0)::numeric * 5
               ))
        ELSE 0
      END
      +
      CASE
        WHEN attendance_rate >= 95 THEN  20
        WHEN attendance_rate >= 90 THEN  10
        WHEN attendance_rate >= 75 THEN   0
        WHEN attendance_rate >= 50 THEN -10
        WHEN attendance_rate IS NOT NULL THEN -50
        ELSE 0
      END
    )
  ), 0)
  INTO track_score
  FROM public.track_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Achievements: capped at 300 ───────────────────────────────
  SELECT LEAST(300, COALESCE(SUM(
    CASE impact_scope
      WHEN 'national_landmark' THEN 100
      WHEN 'national_standard' THEN  60
      WHEN 'national'          THEN 100
      WHEN 'regional'          THEN  40
      WHEN 'local'             THEN  20
      ELSE 0
    END
  ), 0))
  INTO achievement_score
  FROM public.achievements
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND impact_scope IS NOT NULL;

  -- ── Awards: capped at 150 ─────────────────────────────────────
  SELECT LEAST(150, COALESCE(SUM(
    CASE
      WHEN lower(name) LIKE '%magsaysay%'           THEN 100
      WHEN lower(name) LIKE '%order of lakandula%'  THEN  80
      WHEN lower(name) LIKE '%order of national%'   THEN  80
      WHEN lower(name) LIKE '%toym%'                THEN  60
      WHEN lower(name) LIKE '%outstanding young%'   THEN  60
      WHEN lower(name) LIKE '%medal of valor%'      THEN  90
      ELSE 25
    END
  ), 0))
  INTO awards_score
  FROM public.awards
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Legal: split into three buckets so lens can treat distinctly ──
  -- pending: appeal + pending_court (fixable / unproven)
  -- conviction: tiered by PH penal classification (see migration 023)
  -- other: ombudsman + comelec administrative penalties
  SELECT
    COALESCE(SUM(CASE
      WHEN status = 'pending'        THEN 75
      WHEN status = 'ongoing_appeal' THEN 75
      ELSE 0 END), 0),
    COALESCE(SUM(CASE
      WHEN status = 'convicted' AND sentence_category = 'civil'        THEN  50
      WHEN status = 'convicted' AND sentence_category = 'arresto'      THEN 100
      WHEN status = 'convicted' AND sentence_category = 'correccional' THEN 200
      WHEN status = 'convicted' AND sentence_category = 'mayor'        THEN 350
      WHEN status = 'convicted' AND sentence_category = 'temporal'     THEN 500
      WHEN status = 'convicted' AND sentence_category = 'perpetua'     THEN 700
      WHEN status = 'convicted'                                        THEN 350
      ELSE 0 END), 0),
    COALESCE(SUM(
      CASE ombudsman_disposition
        WHEN 'admin_penalty'        THEN 50
        WHEN 'criminal_filed'       THEN 100
        WHEN 'pending_at_ombudsman' THEN 25
        ELSE 0
      END
      + CASE WHEN comelec_disqualification = true THEN 100 ELSE 0 END
    ), 0)
  INTO legal_pending, legal_conviction, legal_other
  FROM public.legal_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── SALN integrity ────────────────────────────────────────────
  SELECT COALESCE(SUM(
    CASE WHEN saln_filed_on_time = false THEN 25 ELSE 0 END
  ), 0)
  INTO saln_penalty
  FROM public.net_worth_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Final ─────────────────────────────────────────────────────
  final_score := GREATEST(0,
    edu_score + track_score + achievement_score + awards_score
    - legal_pending - legal_conviction - legal_other - saln_penalty
  );

  breakdown := jsonb_build_object(
    'edu',              edu_score,
    'edu_max',          200,
    'track',            track_score,
    'track_max',        500,
    'achievement',      achievement_score,
    'achievement_max',  300,
    'awards',           awards_score,
    'awards_max',       150,
    'legal_pending',    legal_pending,
    'legal_conviction', legal_conviction,
    'legal_other',      legal_other,
    'saln_penalty',     saln_penalty,
    'computed_at',      to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  UPDATE public.politicians
  SET objective_score = final_score,
      score_breakdown = breakdown,
      updated_at      = now()
  WHERE id = p_politician_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 4. Recompute every politician's objective_score so the new
--      tier takes effect immediately. ────────────────────────────
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN SELECT id FROM public.politicians LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
