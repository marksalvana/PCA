-- ============================================================
-- Migration 024: Strip scoring from broadcasting / social-media-reach
-- Run in Supabase SQL Editor AFTER migration 023.
--
-- Extends the personal-achievements policy from migration 013 to cover
-- pre/non-political broadcasting careers and social-media audience metrics:
--
--   - "30 Million YouTube Subscribers"
--   - "Top-rated TV host", "Long-running news anchor"
--   - "Broadcasting career", "Investigative journalist"
--
-- These are personal accomplishments outside the office of politics — same
-- family as boxing titles, acting awards, etc. They remain visible on
-- profiles as biographical context but contribute 0 to the score.
--
-- Idempotent: safe to re-run.
-- ============================================================

WITH affected AS (
  SELECT id, politician_id, title, description
  FROM public.achievements
  WHERE impact_scope IS NOT NULL
    AND (
      -- YouTube / social-media reach metrics
      title ~* '\m(youtube|subscribers?|million\s+followers?|million\s+viewers?)\M'
      OR description ~* '\m(youtube\s+channel|youtube\s+subscribers?|million\s+subscribers?)\M'

      -- Pre/non-political TV / radio host roles
      OR title ~* '\m(tv\s+(host|anchor|reporter)|news\s+(host|anchor|reporter)|radio\s+(host|anchor|broadcaster))\M'

      -- Broadcasting / journalism career markers
      OR title ~* '\m(broadcasting\s+career|journalism\s+career|investigative\s+journalist|press\s+freedom\s+award)\M'
    )
)
UPDATE public.achievements a
SET impact_scope = NULL
FROM affected
WHERE a.id = affected.id;


-- Extend the column comment with the new examples under category 3.
COMMENT ON COLUMN public.achievements.impact_scope IS
  'Geographic / institutional scope of the accomplishment. NULL means
   the row is biographical context only and contributes 0 to the score.

   Policies — leave impact_scope NULL for these categories:

   1. Demographic firsts ("first female X", "youngest Y") — biographical
      facts about who the person is, not governance work.

   2. Electoral outcomes ("won 2022 election", "topped Senate race",
      "most votes in PH history", "Nth consecutive term", "re-elected
      as senator") — campaign results, not governance work.

   3. Personal / non-governance achievements (boxing titles, Olympic
      medals, acting awards, film/TV credits, music records, Hall of
      Fame inductions, business endorsements, broadcasting careers,
      YouTube / social-media reach metrics, journalism career markers,
      pre-political career milestones) — personal accomplishments
      outside the office of politics, not governance work.

   4. Religion / ethnicity / tenure-gap firsts ("first Muslim senator",
      "first Cebuano governor", "first X since 1995", "first X in 30
      years") — biographical facts about who the person is or about
      gaps between their tenure and the previous occupant, not work
      they themselves did in office.

   The Objective Score measures what the politician did in office.
   All four categories may still appear on a profile as biographical
   context but do not contribute to the score.';


-- Recompute scores for any politician whose achievements matched.
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT DISTINCT politician_id
    FROM public.achievements
    WHERE title ~* '\m(youtube|subscribers?|million\s+followers?|million\s+viewers?)\M'
       OR description ~* '\m(youtube\s+channel|youtube\s+subscribers?|million\s+subscribers?)\M'
       OR title ~* '\m(tv\s+(host|anchor|reporter)|news\s+(host|anchor|reporter)|radio\s+(host|anchor|broadcaster))\M'
       OR title ~* '\m(broadcasting\s+career|journalism\s+career|investigative\s+journalist|press\s+freedom\s+award)\M'
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
