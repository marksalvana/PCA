-- ============================================================
-- Migration 011: Strip scoring from demographic-firsts achievements
-- Run in Supabase SQL Editor AFTER migrations 001–010.
--
-- "First female X", "youngest Y", "first Filipino Z" and similar
-- biographical superlatives are demographic facts, not governance
-- accomplishments. They should not contribute to the Objective Score.
--
-- This migration sets impact_scope = NULL on any achievement whose
-- title matches a demographic-first pattern. Per the existing scoring
-- rule (achievements without an impact_scope contribute 0), the row
-- still appears on the politician's profile as biographical context
-- but no longer counts toward the score.
--
-- Recomputes objective_score for affected politicians at the end.
-- ============================================================

-- Demographic-first / superlative patterns (case-insensitive)
WITH affected AS (
  SELECT id, politician_id, title
  FROM public.achievements
  WHERE impact_scope IS NOT NULL
    AND (
      title ~* '\m(first)\s+(female|woman|man|male|filipino|filipina|fil-am|asian|gay|lgbt|trans)\M'
      OR title ~* '\m(youngest|oldest)\s'
      OR title ~* '\m(first|sole|only)\s+\w+\s+(to be|elected|appointed|to serve|in office|to win)'
      OR title ~* '\m(first)\s+(senator|representative|governor|mayor|vice president|president)\s+(to|who|from)'
    )
)
UPDATE public.achievements a
SET impact_scope = NULL
FROM affected
WHERE a.id = affected.id;

-- Document the policy on the table itself for future reviewers
COMMENT ON COLUMN public.achievements.impact_scope IS
  'Geographic / institutional scope of the accomplishment. NULL means
   the row is biographical context only and contributes 0 to the score.

   Policy: demographic firsts ("first female X", "youngest Y", "first
   Filipino Z") and biographical superlatives are NOT governance
   accomplishments. Vetters must leave impact_scope NULL for such rows.';

-- Recompute scores for any politician whose achievements were affected
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT DISTINCT politician_id
    FROM public.achievements
    WHERE title ~* '\m(first)\s+(female|woman|man|male|filipino|filipina|fil-am|asian|gay|lgbt|trans)\M'
       OR title ~* '\m(youngest|oldest)\s'
       OR title ~* '\m(first|sole|only)\s+\w+\s+(to be|elected|appointed|to serve|in office|to win)'
       OR title ~* '\m(first)\s+(senator|representative|governor|mayor|vice president|president)\s+(to|who|from)'
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
