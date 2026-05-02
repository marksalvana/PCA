-- ============================================================
-- Migration 008: Score breakdown column
-- Run in Supabase SQL Editor AFTER migration 007.
--
-- Adds politicians.score_breakdown jsonb to expose per-component
-- contributions alongside the canonical objective_score. Required
-- by the Personal Lens feature so the client can compute a
-- user-weighted score without re-fetching all sub-records.
--
-- Single source of truth — compute_objective_score writes both
-- objective_score and score_breakdown atomically to prevent drift.
--
-- Backfill at end re-runs the function for every politician so
-- existing rows pick up the new column without admin action.
-- ============================================================

ALTER TABLE public.politicians
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb;

COMMENT ON COLUMN public.politicians.score_breakdown IS
  'Per-component contributions to objective_score. Shape:
   {
     "edu": numeric, "edu_max": numeric,
     "track": numeric, "track_max": numeric,
     "achievement": numeric, "achievement_max": numeric,
     "awards": numeric, "awards_max": numeric,
     "legal_pending": numeric, "legal_conviction": numeric,
     "legal_other": numeric, "saln_penalty": numeric,
     "computed_at": iso-timestamp
   }
  Populated by compute_objective_score().';

-- ── Updated compute_objective_score writing breakdown ──
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
  -- conviction: convicted (final at this court level)
  -- other: ombudsman + comelec administrative penalties
  SELECT
    COALESCE(SUM(CASE
      WHEN status = 'pending'        THEN 75
      WHEN status = 'ongoing_appeal' THEN 75
      ELSE 0 END), 0),
    COALESCE(SUM(CASE
      WHEN status = 'convicted' THEN 350
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

-- ── Backfill: recompute for every politician ──
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN SELECT id FROM public.politicians LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
