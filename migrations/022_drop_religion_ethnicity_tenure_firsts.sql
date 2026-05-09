-- ============================================================
-- Migration 022: Strip scoring from religion / ethnicity / tenure-gap firsts
-- Run in Supabase SQL Editor AFTER migration 021.
--
-- Extends the demographic-first policy from migrations 011 / 012 / 013
-- to additional dimensions:
--
--   1. Religious firsts        — "First Muslim Senator", "First Catholic VP"
--   2. Ethnic / regional firsts — "First Cebuano Senator", "First Lumad Rep"
--   3. Tenure-gap firsts        — "First X Since 1995", "First X in 30 years"
--
-- These are biographical facts about who the person is or about gaps
-- between their tenure and the previous occupant — not what they did
-- in office. Same treatment as before: set impact_scope = NULL on
-- matching rows; the row stays visible as biographical context but
-- contributes 0 to the score.
--
-- Idempotent: safe to re-run.
-- ============================================================

WITH affected AS (
  SELECT id, politician_id, title, description
  FROM public.achievements
  WHERE impact_scope IS NOT NULL
    AND (
      -- Religious firsts
      title ~* '\m(first|sole|only)\s+(muslim|catholic|christian|protestant|jewish|hindu|buddhist|atheist|secular|aglipayan|inc|iglesia|born[- ]?again|methodist|baptist|evangelical|mormon|adventist|jehovah)\M'
      OR description ~* '\m(first|sole|only)\s+(muslim|catholic|christian|protestant|jewish|hindu|buddhist|atheist|aglipayan|iglesia|born[- ]?again)\M'

      -- Ethnic / regional firsts (PH-specific peoples + regions)
      OR title ~* '\m(first|sole|only)\s+(visayan|cebuano|ilocano|kapampangan|bicolano|waray|hiligaynon|moro|maranao|tausug|maguindanao|sama|badjao|igorot|ifugao|ibanag|lumad|aeta|negrito|mestizo|mindanaoan|chinese[- ]?filipino|fil[- ]?chinese|spanish[- ]?filipino|fil[- ]?spanish)\M'
      OR title ~* '\m(first|sole|only)\s+(senator|representative|governor|mayor|vice\s+president|president)\s+from\s+(mindanao|visayas|luzon|the\s+south|the\s+north|cordillera|bangsamoro|barmm|armm)\M'

      -- Tenure-gap firsts: "first X since 1995", "first X in 30 years",
      -- "first X after 2010"
      OR title ~* '\m(first|sole|only)\s+.+?\s+(since|after)\s+\d{4}\M'
      OR title ~* '\m(first|sole|only)\s+.+?\s+in\s+\d+\s+years?\M'
      OR description ~* '\m(first|sole|only)\s+.+?\s+(since|after)\s+\d{4}\M'
    )
)
UPDATE public.achievements a
SET impact_scope = NULL
FROM affected
WHERE a.id = affected.id;


-- Update the column comment to consolidate all four exclusion categories.
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
      Fame inductions, business endorsements, pre-political career
      milestones) — personal accomplishments outside the office of
      politics, not governance work.

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
    WHERE title ~* '\m(first|sole|only)\s+(muslim|catholic|christian|protestant|jewish|hindu|buddhist|atheist|secular|aglipayan|inc|iglesia|born[- ]?again|methodist|baptist|evangelical|mormon|adventist|jehovah)\M'
       OR description ~* '\m(first|sole|only)\s+(muslim|catholic|christian|protestant|jewish|hindu|buddhist|atheist|aglipayan|iglesia|born[- ]?again)\M'
       OR title ~* '\m(first|sole|only)\s+(visayan|cebuano|ilocano|kapampangan|bicolano|waray|hiligaynon|moro|maranao|tausug|maguindanao|sama|badjao|igorot|ifugao|ibanag|lumad|aeta|negrito|mestizo|mindanaoan|chinese[- ]?filipino|fil[- ]?chinese|spanish[- ]?filipino|fil[- ]?spanish)\M'
       OR title ~* '\m(first|sole|only)\s+(senator|representative|governor|mayor|vice\s+president|president)\s+from\s+(mindanao|visayas|luzon|the\s+south|the\s+north|cordillera|bangsamoro|barmm|armm)\M'
       OR title ~* '\m(first|sole|only)\s+.+?\s+(since|after)\s+\d{4}\M'
       OR title ~* '\m(first|sole|only)\s+.+?\s+in\s+\d+\s+years?\M'
       OR description ~* '\m(first|sole|only)\s+.+?\s+(since|after)\s+\d{4}\M'
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
