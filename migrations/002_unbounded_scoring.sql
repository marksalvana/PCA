-- ============================================================
-- Migration 002: Unbounded Cumulative Scoring
-- Run in Supabase SQL Editor
--
-- Changes:
--   1. Widens objective_score column to support values > 100
--   2. Replaces compute_objective_score with a SUM-based model
--      - Education: each verified degree adds its institution score
--      - Track record: each verified term adds its COA/bills score
--      - Legal: -100 per pending/appeal, -300 per conviction
--      - No upper cap; floor at 0
--   3. Scores are computed entirely from enum values (ched_accreditation,
--      coa_finding) — no manual score input by admins or users
-- ============================================================

-- Widen the objective_score column to support values well above 100
ALTER TABLE public.politicians
  ALTER COLUMN objective_score TYPE numeric(10,2);

ALTER TABLE public.education_records
  ALTER COLUMN institution_score TYPE numeric(10,2);

ALTER TABLE public.track_records
  ALTER COLUMN performance_score TYPE numeric(10,2);

ALTER TABLE public.scoring_benchmarks
  ALTER COLUMN score TYPE numeric(10,2);

-- ============================================================
-- Updated scoring function: SUM-based, uncapped
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_objective_score(p_politician_id uuid)
RETURNS numeric AS $$
DECLARE
  edu_score   numeric := 0;
  track_score numeric := 0;
  legal_penalty numeric := 0;
  final_score numeric;
BEGIN
  -- ── Education: SUM across all verified records ──────────────
  -- Each degree contributes its full institution score.
  -- Incomplete degrees receive 75% of the base score.
  -- Score is derived directly from ched_accreditation — not from
  -- the stored institution_score column, which may be stale.
  SELECT COALESCE(SUM(
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
        ELSE 0  -- 'unknown': no verifiable quality rating → 0
      END
      * CASE WHEN is_completed THEN 1.0 ELSE 0.75 END
    )
  ), 0)
  INTO edu_score
  FROM public.education_records
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND ched_accreditation IS NOT NULL
    AND ched_accreditation <> 'unknown';

  -- ── Track record: SUM across all verified records ───────────
  -- Each position contributes its COA score, or a bills-based score
  -- for legislative roles without a COA finding.
  -- Positions with unknown/null COA and no bills data contribute 0
  -- (excluded) — we cannot fabricate a score for undocumented data.
  SELECT COALESCE(SUM(
    CASE
      WHEN coa_finding = 'unqualified' THEN 100
      WHEN coa_finding = 'qualified'   THEN 60
      WHEN coa_finding = 'adverse'     THEN 20
      WHEN coa_finding = 'disclaimer'  THEN 10
      -- Legislative role: no COA → use bills pass rate
      WHEN coa_finding IN ('not_applicable', 'unknown', NULL)
           AND bills_authored IS NOT NULL AND bills_authored > 0
        THEN LEAST(85, 30 + ROUND(
               (COALESCE(bills_passed, 0)::numeric / bills_authored::numeric) * 55
             ))
      ELSE 0  -- Unknown COA, no bills data → excluded
    END
  ), 0)
  INTO track_score
  FROM public.track_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Legal penalty: SUM across all verified records ──────────
  -- Penalties scale with the cumulative scoring model.
  -- A conviction (-300) wipes out ~3 clean terms of office.
  -- Pending cases (-100) and ongoing appeals (-100) are a
  -- material fact for voters, not a presumption of guilt.
  SELECT COALESCE(SUM(
    CASE
      WHEN status = 'pending'        THEN 100
      WHEN status = 'convicted'      THEN 300
      WHEN status = 'ongoing_appeal' THEN 100
      ELSE 0
    END
  ), 0)
  INTO legal_penalty
  FROM public.legal_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Final score ─────────────────────────────────────────────
  -- Education + Track − Legal Penalty. No upper cap.
  -- Floor at 0: a very negative legal record cannot go below zero.
  final_score := GREATEST(0, edu_score + track_score - legal_penalty);

  -- Persist to the politicians row
  UPDATE public.politicians
  SET objective_score = final_score,
      updated_at      = now()
  WHERE id = p_politician_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
