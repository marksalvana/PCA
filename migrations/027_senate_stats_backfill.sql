-- ============================================================
-- Migration 027: Senate.gov.ph stats backfill for 20th-Congress senators
-- Run in Supabase SQL Editor AFTER migration 026.
--
-- Updates the *current* (is_current=true) Senator-of-the-Philippines
-- track record for every sitting senator already on the platform with
-- the five senate.gov.ph per-senator counters:
--
--   bills_authored           (SCORED — principal author)
--   co_authored_bills        (biographical, migration 025)
--   resolutions_authored     (biographical, migration 025)
--   co_authored_resolutions  (biographical, migration 025)
--   bills_enacted_count      (SCORED — passed into law / RA)
--
-- Source: senate.gov.ph/senators/20-congress-senators stats block.
-- Numbers are LIFETIME (all-congress) totals — the senate.gov.ph view
-- aggregates across a senator's full career when "All" is selected.
--
-- The 9 senators not yet on the platform (Loren Legarda, Migz Zubiri,
-- Joel Villanueva, Jinggoy Estrada, Bong Go, Bato dela Rosa, Pia
-- Cayetano, Lito Lapid, Rodante Marcoleta) will receive their numbers
-- baked into their respective seed migrations (Batches 2–4).
--
-- Idempotent: safe to re-run.
-- ============================================================

-- Helper: update the current senate term for a given slug with the 5 stats.
-- Each statement is independent; if a slug isn't present, it silently no-ops.

-- alan-peter-cayetano: 20 / 5 / 3 / 9 / 0
UPDATE public.track_records
   SET bills_authored = 20,
       co_authored_bills = 5,
       resolutions_authored = 3,
       co_authored_resolutions = 9,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'alan-peter-cayetano')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- bam-aquino: 43 / 5 / 7 / 12 / 0
UPDATE public.track_records
   SET bills_authored = 43,
       co_authored_bills = 5,
       resolutions_authored = 7,
       co_authored_resolutions = 12,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bam-aquino')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- chiz-escudero: 53 / 4 / 2 / 9 / 0
UPDATE public.track_records
   SET bills_authored = 53,
       co_authored_bills = 4,
       resolutions_authored = 2,
       co_authored_resolutions = 9,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'chiz-escudero')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- win-gatchalian: 98 / 5 / 7 / 10 / 0
UPDATE public.track_records
   SET bills_authored = 98,
       co_authored_bills = 5,
       resolutions_authored = 7,
       co_authored_resolutions = 10,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'win-gatchalian')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- risa-hontiveros: 82 / 10 / 15 / 13 / 0
UPDATE public.track_records
   SET bills_authored = 82,
       co_authored_bills = 10,
       resolutions_authored = 15,
       co_authored_resolutions = 13,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'risa-hontiveros')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- ping-lacson: 25 / 1 / 0 / 13 / 0
UPDATE public.track_records
   SET bills_authored = 25,
       co_authored_bills = 1,
       resolutions_authored = 0,
       co_authored_resolutions = 13,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'ping-lacson')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- bong-go: 56 / 13 / 50 / 14 / 0   (added here in case profile exists; otherwise no-op)
UPDATE public.track_records
   SET bills_authored = 56,
       co_authored_bills = 13,
       resolutions_authored = 50,
       co_authored_resolutions = 14,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bong-go')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- imee-marcos: 106 / 5 / 13 / 10 / 0
UPDATE public.track_records
   SET bills_authored = 106,
       co_authored_bills = 5,
       resolutions_authored = 13,
       co_authored_resolutions = 10,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'imee-marcos')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- robin-padilla: 57 / 11 / 21 / 12 / 0
UPDATE public.track_records
   SET bills_authored = 57,
       co_authored_bills = 11,
       resolutions_authored = 21,
       co_authored_resolutions = 12,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'robin-padilla')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- kiko-pangilinan: 45 / 11 / 9 / 10 / 0
UPDATE public.track_records
   SET bills_authored = 45,
       co_authored_bills = 11,
       resolutions_authored = 9,
       co_authored_resolutions = 10,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'kiko-pangilinan')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- tito-sotto: 18 / 3 / 6 / 8 / 0
UPDATE public.track_records
   SET bills_authored = 18,
       co_authored_bills = 3,
       resolutions_authored = 6,
       co_authored_resolutions = 8,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'tito-sotto')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- raffy-tulfo: 77 / 13 / 17 / 11 / 0
UPDATE public.track_records
   SET bills_authored = 77,
       co_authored_bills = 13,
       resolutions_authored = 17,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'raffy-tulfo')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- erwin-tulfo: 68 / 11 / 29 / 11 / 0
UPDATE public.track_records
   SET bills_authored = 68,
       co_authored_bills = 11,
       resolutions_authored = 29,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'erwin-tulfo')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- jv-ejercito: 65 / 10 / 8 / 11 / 0
UPDATE public.track_records
   SET bills_authored = 65,
       co_authored_bills = 10,
       resolutions_authored = 8,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'jv-ejercito')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- camille-villar: 49 / 5 / 8 / 11 / 0
UPDATE public.track_records
   SET bills_authored = 49,
       co_authored_bills = 5,
       resolutions_authored = 8,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'camille-villar')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- mark-villar: 96 / 4 / 4 / 11 / 0
UPDATE public.track_records
   SET bills_authored = 96,
       co_authored_bills = 4,
       resolutions_authored = 4,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — 20th Congress Member Stats'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'mark-villar')
   AND is_current = true
   AND position ILIKE '%Senator%';


-- ── Recompute objective_score for every senator we just updated.
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT id FROM public.politicians
    WHERE slug IN (
      'alan-peter-cayetano', 'bam-aquino', 'chiz-escudero', 'win-gatchalian',
      'risa-hontiveros', 'ping-lacson', 'bong-go', 'imee-marcos',
      'robin-padilla', 'kiko-pangilinan', 'tito-sotto', 'raffy-tulfo',
      'erwin-tulfo', 'jv-ejercito', 'camille-villar', 'mark-villar'
    )
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
