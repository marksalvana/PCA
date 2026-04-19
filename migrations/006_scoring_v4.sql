-- ============================================================
-- Migration 006: Scoring v4
-- Run in Supabase SQL Editor AFTER migrations 001–005.
--
-- Changes vs migration 003:
--   1. Education cap:          uncapped  → LEAST(SUM, 200)
--   2. Term completion bonus:  +15       → +40 per completed term
--   3. Achievements cap:       uncapped  → LEAST(SUM, 300)
--   4. Conviction penalty:     300       → 350
--   5. Pending / on appeal:    100       → 75
-- ============================================================

CREATE OR REPLACE FUNCTION public.compute_objective_score(p_politician_id uuid)
RETURNS numeric AS $$
DECLARE
  edu_score         numeric := 0;
  track_score       numeric := 0;
  achievement_score numeric := 0;
  legal_penalty     numeric := 0;
  final_score       numeric;
BEGIN

  -- ── Education: SUM, capped at 200 ────────────────────────────
  -- Prevents degree-stacking from dominating the governance record.
  -- Each verified degree contributes its CHED-accreditation score.
  -- Incomplete degrees receive 75% of the base.
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

  -- ── Track record: COA/bills base + attendance modifier + completion bonus ──
  -- Completion bonus: +40 for completed (non-current) terms.
  -- Attendance modifier applied on top of COA score per term.
  -- Each term is floored at 0 before summing.
  SELECT COALESCE(SUM(
    GREATEST(0,
      -- Completion bonus: only for finished terms
      CASE WHEN is_current = false THEN 40 ELSE 0 END
      +
      -- Base COA / bills score
      CASE
        WHEN coa_finding = 'unqualified' THEN 100
        WHEN coa_finding = 'qualified'   THEN 60
        WHEN coa_finding = 'adverse'     THEN 20
        WHEN coa_finding = 'disclaimer'  THEN 10
        WHEN coa_finding IN ('not_applicable', 'unknown')
             AND bills_authored IS NOT NULL AND bills_authored > 0
          THEN LEAST(85, 30 + ROUND(
                 (COALESCE(bills_passed, 0)::numeric / bills_authored::numeric) * 55
               ))
        ELSE 0
      END
      +
      -- Attendance modifier
      CASE
        WHEN attendance_rate >= 90 THEN  20
        WHEN attendance_rate >= 75 THEN   0
        WHEN attendance_rate >= 50 THEN -20
        WHEN attendance_rate IS NOT NULL THEN -50
        ELSE 0
      END
    )
  ), 0)
  INTO track_score
  FROM public.track_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Achievements: SUM by impact scope, capped at 300 ─────────
  -- Prevents landmark legislation from inflating scores
  -- the same way degree-stacking did before the education cap.
  SELECT LEAST(300, COALESCE(SUM(
    CASE impact_scope
      WHEN 'national_landmark' THEN 100
      WHEN 'national_standard' THEN  60
      WHEN 'national'          THEN 100  -- legacy: treat as landmark
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

  -- ── Legal penalty ─────────────────────────────────────────────
  -- Conviction (−350): must cost more than 2 full clean terms to offset.
  -- Pending / on appeal (−75): proportionate alongside conviction increase.
  SELECT COALESCE(SUM(
    CASE
      WHEN status = 'pending'        THEN  75
      WHEN status = 'convicted'      THEN 350
      WHEN status = 'ongoing_appeal' THEN  75
      ELSE 0
    END
  ), 0)
  INTO legal_penalty
  FROM public.legal_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Final: Education + Track + Achievements − Penalties ───────
  final_score := GREATEST(0,
    edu_score + track_score + achievement_score - legal_penalty
  );

  UPDATE public.politicians
  SET objective_score = final_score,
      updated_at      = now()
  WHERE id = p_politician_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
