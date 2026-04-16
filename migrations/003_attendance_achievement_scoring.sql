-- ============================================================
-- Migration 003: Attendance Modifier + Achievement Scoring
-- Run in Supabase SQL Editor AFTER migration 002.
--
-- Changes:
--   1. Track record: adds attendance_rate as a per-record modifier
--      (+20 excellent, 0 decent, −20 poor, −50 very poor)
--      Applied per record; each record is floored at 0 before summing.
--   2. Achievements: verified achievements now contribute points
--      based on impact_scope (national 100, regional 50, local 20).
--      Only verified achievements with a set impact_scope count.
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

  -- ── Education: SUM — unchanged from migration 002 ────────────
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
        ELSE 0
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

  -- ── Track record: COA/bills base + attendance modifier ────────
  -- Each record contributes GREATEST(0, base + attendance_modifier)
  -- so a poor attendance on an already-zero record can't go negative.
  --
  -- Base (COA / bills):
  --   unqualified   → 100 pts
  --   qualified     → 60 pts
  --   adverse       → 20 pts
  --   disclaimer    → 10 pts
  --   not_applicable + bills → legislative formula (30–85 pts)
  --   unknown/no data        → 0 pts
  --
  -- Attendance modifier (if attendance_rate is set):
  --   ≥ 90%  → +20 pts
  --   75–89% →   0 pts
  --   50–74% → −20 pts
  --   < 50%  → −50 pts
  SELECT COALESCE(SUM(
    GREATEST(0,
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

  -- ── Achievements: SUM by impact scope ────────────────────────
  -- Only verified achievements with a set impact_scope count.
  -- national → 100 pts, regional → 50 pts, local → 20 pts.
  -- Achievements without an impact_scope set contribute 0 — admins
  -- must classify scope before it influences the score.
  SELECT COALESCE(SUM(
    CASE impact_scope
      WHEN 'national'  THEN 100
      WHEN 'regional'  THEN  50
      WHEN 'local'     THEN  20
      ELSE 0
    END
  ), 0)
  INTO achievement_score
  FROM public.achievements
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND impact_scope IS NOT NULL;

  -- ── Legal penalty: unchanged from migration 002 ───────────────
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
