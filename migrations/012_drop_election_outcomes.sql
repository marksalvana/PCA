-- ============================================================
-- Migration 012: Strip scoring from election-outcome achievements
-- Run in Supabase SQL Editor AFTER migration 011.
--
-- Winning, topping, or being re-elected to an office is a CAMPAIGN
-- outcome, not a governance accomplishment. The score is meant to
-- measure what a politician did *while in office*, not the fact
-- that voters elected them. Same logic as demographic firsts.
--
-- Sets impact_scope = NULL on any achievement whose title or
-- description matches an electoral-outcome pattern. The row stays
-- visible on the profile as biographical context but contributes 0
-- to the Objective Score.
--
-- Recomputes objective_score for affected politicians at the end.
-- ============================================================

-- Electoral-outcome patterns (case-insensitive)
WITH affected AS (
  SELECT id, politician_id, title, description
  FROM public.achievements
  WHERE impact_scope IS NOT NULL
    AND (
      -- "Won 2022 election", "Won the presidential election", etc.
      title ~* '\m(won|topped|winner of)\M.*\m(election|presidential|senate|senatorial|gubernatorial|mayoral|congressional|midterm|race)\M'
      OR description ~* '\m(won|topped|winner of)\M.*\m(election|presidential|senate|senatorial|gubernatorial|mayoral|congressional|midterm|race)\M'

      -- "Re-elected", "Elected as Senator", "Elected to Senate"
      OR title ~* '\m(re-?elected|reelected)\M'
      OR title ~* '\melected\s+(as|to|in)\M'

      -- "Most votes", "Second-highest votes", "Highest number of votes"
      OR title ~* '\m(most|highest|second-highest|second\s+most|record-breaking)\s+(number\s+of\s+)?votes?\M'
      OR description ~* '\m(most|highest|second-highest|record-breaking)\s+(number\s+of\s+)?votes?\M'

      -- "Top vote-getter" / "Top placer"
      OR title ~* '\mtop\s+(vote-?getter|vote\s+getter|placer|finisher)\M'

      -- "Nth term", "Nth consecutive term"
      OR title ~* '\m\d+(st|nd|rd|th)\s+(consecutive\s+)?term\M'

      -- "Landslide victory" / "Sweeping win"
      OR title ~* '\m(landslide|sweeping)\s+(victory|win)\M'
    )
)
UPDATE public.achievements a
SET impact_scope = NULL
FROM affected
WHERE a.id = affected.id;

-- Update the column comment to consolidate both policies (demographic
-- firsts from migration 011 + election outcomes from this migration)
COMMENT ON COLUMN public.achievements.impact_scope IS
  'Geographic / institutional scope of the accomplishment. NULL means
   the row is biographical context only and contributes 0 to the score.

   Policies — leave impact_scope NULL for these categories:

   1. Demographic firsts ("first female X", "youngest Y", "first
      Filipino Z") — biographical facts, not governance work.

   2. Electoral outcomes ("won 2022 election", "topped Senate race",
      "most votes in PH history", "Nth consecutive term", "re-elected
      as senator") — campaign results, not governance work. The score
      measures what a politician did in office, not the fact that
      voters elected them.

   Both categories may still appear on a profile as biographical
   context but do not contribute to the Objective Score.';

-- Recompute scores for any politician whose achievements matched
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT DISTINCT politician_id
    FROM public.achievements
    WHERE title ~* '\m(won|topped|winner of)\M.*\m(election|presidential|senate|senatorial|gubernatorial|mayoral|congressional|midterm|race)\M'
       OR description ~* '\m(won|topped|winner of)\M.*\m(election|presidential|senate|senatorial|gubernatorial|mayoral|congressional|midterm|race)\M'
       OR title ~* '\m(re-?elected|reelected)\M'
       OR title ~* '\melected\s+(as|to|in)\M'
       OR title ~* '\m(most|highest|second-highest|second\s+most|record-breaking)\s+(number\s+of\s+)?votes?\M'
       OR description ~* '\m(most|highest|second-highest|record-breaking)\s+(number\s+of\s+)?votes?\M'
       OR title ~* '\mtop\s+(vote-?getter|vote\s+getter|placer|finisher)\M'
       OR title ~* '\m\d+(st|nd|rd|th)\s+(consecutive\s+)?term\M'
       OR title ~* '\m(landslide|sweeping)\s+(victory|win)\M'
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
