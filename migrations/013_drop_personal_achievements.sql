-- ============================================================
-- Migration 013: Strip scoring from personal / non-governance achievements
-- Run in Supabase SQL Editor AFTER migration 012.
--
-- Sports titles (boxing, Olympic medals), entertainment work (acting,
-- music, film festivals), and other pre/non-political accomplishments
-- are personal achievements outside the office of politics. They are
-- biographical context, not governance work, and should not contribute
-- to the Objective Score.
--
-- Same approach as migrations 011 and 012: set impact_scope = NULL on
-- matching rows so they remain visible on profiles but contribute 0
-- to the score.
--
-- Recomputes objective_score for affected politicians at the end.
-- ============================================================

-- Personal / non-governance achievement patterns (case-insensitive)
WITH affected AS (
  SELECT id, politician_id, title, description
  FROM public.achievements
  WHERE impact_scope IS NOT NULL
    AND (
      -- Boxing / combat sports
      title ~* '\m(boxing|boxer|world\s+champion|division\s+world|knockout|wba|wbc|ibf|wbo|featherweight|welterweight|lightweight|heavyweight)\M'
      OR description ~* '\m(boxing|boxer|world\s+title|division\s+world|wba|wbc|ibf|wbo)\M'

      -- Olympic / international sports
      OR title ~* '\m(olympic|olympics|gold\s+medal|silver\s+medal|bronze\s+medal|fiba|sea\s+games|asian\s+games)\M'

      -- Hall of fame inductions (sports / entertainment)
      OR title ~* '\m(hall\s+of\s+fame)\M'

      -- Acting / film / television
      OR title ~* '\m(actor|actress|movie|film|television|tv\s+show|telenovela|cinema|famas|metro\s+manila\s+film)\M'
      OR title ~* '\mbest\s+(actor|actress|director|musical|picture|composer|recording|song)\M'

      -- Music / recording
      OR title ~* '\m(recording\s+artist|singer|album|hit\s+single|grammy|gold\s+record|platinum\s+record)\M'

      -- Business / endorsement careers
      OR title ~* '\m(brand\s+ambassador|product\s+endorsement|advertising\s+campaign)\M'

      -- Pre-political career markers
      OR title ~* '\mpre[- ]?political\M'
    )
)
UPDATE public.achievements a
SET impact_scope = NULL
FROM affected
WHERE a.id = affected.id;

-- Update column comment to consolidate all three policies
COMMENT ON COLUMN public.achievements.impact_scope IS
  'Geographic / institutional scope of the accomplishment. NULL means
   the row is biographical context only and contributes 0 to the score.

   Policies — leave impact_scope NULL for these categories:

   1. Demographic firsts ("first female X", "youngest Y", "first
      Filipino Z") — biographical facts, not governance work.

   2. Electoral outcomes ("won 2022 election", "topped Senate race",
      "most votes in PH history", "Nth consecutive term", "re-elected
      as senator") — campaign results, not governance work.

   3. Personal / non-governance achievements (boxing titles, Olympic
      medals, acting awards, film/TV credits, music records, Hall of
      Fame inductions, business endorsements, pre-political career
      milestones) — personal accomplishments outside the office of
      politics, not governance work.

   The Objective Score measures what the politician did in office.
   All three categories may still appear on a profile as biographical
   context but do not contribute to the score.';

-- Recompute scores for any politician whose achievements matched
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT DISTINCT politician_id
    FROM public.achievements
    WHERE title ~* '\m(boxing|boxer|world\s+champion|division\s+world|knockout|wba|wbc|ibf|wbo|featherweight|welterweight|lightweight|heavyweight)\M'
       OR description ~* '\m(boxing|boxer|world\s+title|division\s+world|wba|wbc|ibf|wbo)\M'
       OR title ~* '\m(olympic|olympics|gold\s+medal|silver\s+medal|bronze\s+medal|fiba|sea\s+games|asian\s+games)\M'
       OR title ~* '\m(hall\s+of\s+fame)\M'
       OR title ~* '\m(actor|actress|movie|film|television|tv\s+show|telenovela|cinema|famas|metro\s+manila\s+film)\M'
       OR title ~* '\mbest\s+(actor|actress|director|musical|picture|composer|recording|song)\M'
       OR title ~* '\m(recording\s+artist|singer|album|hit\s+single|grammy|gold\s+record|platinum\s+record)\M'
       OR title ~* '\m(brand\s+ambassador|product\s+endorsement|advertising\s+campaign)\M'
       OR title ~* '\mpre[- ]?political\M'
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
