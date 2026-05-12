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
-- Source: senate.gov.ph/senators/20-congress-senators stats block,
-- "Select Congress: All" view — the consolidated lifetime totals
-- across a senator's full career in the Senate. Numbers attach to the
-- current (in-office) Senate term row; previous Senate terms in
-- track_records keep their original (possibly null) bills data.
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

-- alan-peter-cayetano: 96 / 68 / 81 / 245 / 29
UPDATE public.track_records
   SET bills_authored = 96,
       co_authored_bills = 68,
       resolutions_authored = 81,
       co_authored_resolutions = 245,
       bills_enacted_count = 29,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'alan-peter-cayetano')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- bam-aquino: 275 / 70 / 118 / 148 / 42
UPDATE public.track_records
   SET bills_authored = 275,
       co_authored_bills = 70,
       resolutions_authored = 118,
       co_authored_resolutions = 148,
       bills_enacted_count = 42,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bam-aquino')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- chiz-escudero: 746 / 301 / 87 / 328 / 124
UPDATE public.track_records
   SET bills_authored = 746,
       co_authored_bills = 301,
       resolutions_authored = 87,
       co_authored_resolutions = 328,
       bills_enacted_count = 124,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'chiz-escudero')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- win-gatchalian: 506 / 232 / 206 / 309 / 122
UPDATE public.track_records
   SET bills_authored = 506,
       co_authored_bills = 232,
       resolutions_authored = 206,
       co_authored_resolutions = 309,
       bills_enacted_count = 122,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'win-gatchalian')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- risa-hontiveros: 337 / 127 / 196 / 323 / 60
UPDATE public.track_records
   SET bills_authored = 337,
       co_authored_bills = 127,
       resolutions_authored = 196,
       co_authored_resolutions = 323,
       bills_enacted_count = 60,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'risa-hontiveros')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- ping-lacson: 242 / 97 / 65 / 245 / 53
UPDATE public.track_records
   SET bills_authored = 242,
       co_authored_bills = 97,
       resolutions_authored = 65,
       co_authored_resolutions = 245,
       bills_enacted_count = 53,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'ping-lacson')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- bong-go: 190 / 136 / 113 / 216 / 64   (no-op until profile is added in Batch 3)
UPDATE public.track_records
   SET bills_authored = 190,
       co_authored_bills = 136,
       resolutions_authored = 113,
       co_authored_resolutions = 216,
       bills_enacted_count = 64,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'bong-go')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- imee-marcos: 790 / 120 / 142 / 226 / 58
UPDATE public.track_records
   SET bills_authored = 790,
       co_authored_bills = 120,
       resolutions_authored = 142,
       co_authored_resolutions = 226,
       bills_enacted_count = 58,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'imee-marcos')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- robin-padilla: 130 / 65 / 84 / 140 / 29
UPDATE public.track_records
   SET bills_authored = 130,
       co_authored_bills = 65,
       resolutions_authored = 84,
       co_authored_resolutions = 140,
       bills_enacted_count = 29,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'robin-padilla')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- kiko-pangilinan: 250 / 124 / 188 / 242 / 67
UPDATE public.track_records
   SET bills_authored = 250,
       co_authored_bills = 124,
       resolutions_authored = 188,
       co_authored_resolutions = 242,
       bills_enacted_count = 67,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'kiko-pangilinan')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- tito-sotto: 844 / 345 / 350 / 338 / 272
UPDATE public.track_records
   SET bills_authored = 844,
       co_authored_bills = 345,
       resolutions_authored = 350,
       co_authored_resolutions = 338,
       bills_enacted_count = 272,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'tito-sotto')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- raffy-tulfo: 218 / 71 / 104 / 140 / 29
UPDATE public.track_records
   SET bills_authored = 218,
       co_authored_bills = 71,
       resolutions_authored = 104,
       co_authored_resolutions = 140,
       bills_enacted_count = 29,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'raffy-tulfo')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- erwin-tulfo: 68 / 13 / 29 / 11 / 0   (only 1st senate term — newly elected 2025)
UPDATE public.track_records
   SET bills_authored = 68,
       co_authored_bills = 13,
       resolutions_authored = 29,
       co_authored_resolutions = 11,
       bills_enacted_count = 0,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'erwin-tulfo')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- jv-ejercito: 509 / 135 / 124 / 269 / 73
UPDATE public.track_records
   SET bills_authored = 509,
       co_authored_bills = 135,
       resolutions_authored = 124,
       co_authored_resolutions = 269,
       bills_enacted_count = 73,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'jv-ejercito')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- camille-villar: 196 / 76 / 75 / 59 / 24
UPDATE public.track_records
   SET bills_authored = 196,
       co_authored_bills = 76,
       resolutions_authored = 75,
       co_authored_resolutions = 59,
       bills_enacted_count = 24,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
 WHERE politician_id = (SELECT id FROM public.politicians WHERE slug = 'camille-villar')
   AND is_current = true
   AND position ILIKE '%Senator%';

-- mark-villar: 258 / 81 / 28 / 140 / 28
UPDATE public.track_records
   SET bills_authored = 258,
       co_authored_bills = 81,
       resolutions_authored = 28,
       co_authored_resolutions = 140,
       bills_enacted_count = 28,
       source_url = 'https://senate.gov.ph/senators/20-congress-senators',
       source_label = 'Senate of the Philippines — Lifetime Member Stats (All Congresses)'
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
