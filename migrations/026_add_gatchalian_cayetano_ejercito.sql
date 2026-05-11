-- ============================================================
-- Migration 026: 20th-Congress Batch 1 — Win Gatchalian, Alan Peter Cayetano, JV Ejercito
-- Run in Supabase SQL Editor AFTER migration 025.
--
-- Adds three sitting senators (2022–2028 cohort) of the 20th Congress
-- with full record set: education, track records, legal records,
-- achievements, and dynasty connections. All records cite Wikipedia
-- (vetters can promote to authoritative sources during review).
--
-- co_authored_bills / resolutions_authored / co_authored_resolutions
-- (migration 025) left NULL — admins fill in from senate.gov.ph stats
-- block via the admin form. Same for SALN.
--
-- Recomputes objective_score for all three at the end.
-- ============================================================

-- ============================================================
-- SECTION 1 — politicians table
-- ============================================================

INSERT INTO public.politicians (
  slug, full_name, preferred_name, current_position, party_affiliation,
  region, is_incumbent, is_candidate, status, birth_date, birth_place,
  dynasty_name, dynasty_generation
) VALUES
  ('win-gatchalian', 'Sherwin Ting Gatchalian', 'Win Gatchalian',
   'Senator of the Philippines', 'Nationalist People''s Coalition',
   'NCR', true, false, 'published', '1974-04-06', 'Manila',
   'Gatchalian', 1),

  ('alan-peter-cayetano', 'Alan Peter Schramm Cayetano', 'Alan Peter Cayetano',
   'Senator of the Philippines', 'Independent',
   'NCR', true, false, 'published', '1970-10-28', 'Mandaluyong, Rizal',
   'Cayetano', 2),

  ('jv-ejercito', 'Joseph Victor Gomez Ejercito', 'JV Ejercito',
   'Senator of the Philippines', 'Nationalist People''s Coalition',
   'NCR', true, false, 'published', '1969-12-26', 'Manila',
   'Ejercito-Estrada', 2)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 2 — education_records
-- ============================================================

-- Win Gatchalian
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'Boston University', 'Bachelor of Science', 'Finance and Operations Management',
       1991, 1995, true, 'foreign',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

-- Alan Peter Cayetano
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of the Philippines Diliman', 'Bachelor of Arts', 'Political Science',
       1989, 1993, true, 'autonomous',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'Ateneo de Manila University School of Law', 'Juris Doctor', 'Law',
       1994, 1997, true, 'autonomous',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

-- JV Ejercito
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'De La Salle University', 'Bachelor of Arts', 'Political Science',
       NULL, NULL, true, 'autonomous',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';


-- ============================================================
-- SECTION 3 — track_records (positions held)
-- ============================================================

-- ── Win Gatchalian — Rep, Mayor, Rep, Senator ──
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'House Representative — Valenzuela 1st District', '2001-06-30', '2004-06-30', false, 'unknown',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Mayor of Valenzuela', '2004-06-30', '2013-06-30', false, 'unknown',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'House Representative — Valenzuela 1st District', '2013-06-30', '2016-06-30', false, 'unknown',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2016-06-30', NULL, true, 'not_applicable',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

-- ── Alan Peter Cayetano — long career: councilor, vice mayor, rep, senator, DFA sec, speaker, senator ──
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'House Representative — Taguig–Pateros (at-large)', '1998-06-30', '2007-06-30', false, 'unknown',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2007-06-30', '2017-05-17', false, 'not_applicable',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, notes, source_url, source_label, is_verified)
SELECT id, 'Secretary of Foreign Affairs', '2017-05-18', '2018-10-17', false, 'unknown',
       'Appointed by President Rodrigo Duterte',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, notes, source_url, source_label, is_verified)
SELECT id, 'House Representative — Taguig–Pateros 1st District (incl. Speaker of the House 2019–2020)', '2019-06-30', '2022-06-30', false, 'unknown',
       'Served as 26th Speaker of the House July 22, 2019 – October 13, 2020 under term-sharing agreement',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, notes, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2022-06-30', NULL, true, 'not_applicable',
       'Elected 33rd President of the Senate May 11, 2026',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

-- ── JV Ejercito — Mayor, Rep (w/ bills data), Senator, Senator ──
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, notes, source_url, source_label, is_verified)
SELECT id, 'Mayor of San Juan', '2001-06-30', '2010-06-30', false, 'unknown',
       'Municipality of San Juan converted to highly urbanized city (2007) during his term',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, bills_authored, bills_passed, source_url, source_label, is_verified)
SELECT id, 'House Representative — San Juan (Lone District)', '2010-06-30', '2013-06-30', false, 'not_applicable',
       161, 5,
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2013-06-30', '2019-06-30', false, 'not_applicable',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';

INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2022-06-30', NULL, true, 'not_applicable',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';


-- ============================================================
-- SECTION 4 — legal_records
-- ============================================================

-- JV Ejercito — Sandiganbayan calamity funds case, acquitted 2017
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, resolution_date, resolution_summary, source_url, source_label, is_verified)
SELECT id,
       'Misuse of P2.1M Calamity Funds (San Juan mayoral term)',
       'criminal', 'acquitted',
       'Sandiganbayan, Fifth Division',
       'Alleged misuse of approximately P2.1 million in San Juan calamity funds during his term as mayor',
       NULL, '2017-08-01',
       'Sandiganbayan acquitted Ejercito and co-accused in August 2017 after arrest warrant was issued April 6, 2016',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';

-- Alan Peter Cayetano — 2007 citizenship disqualification case, resolved in favor
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, resolution_date, resolution_summary, source_url, source_label, is_verified)
SELECT id,
       'Citizenship Disqualification Petition (2007 elections)',
       'electoral', 'dismissed',
       'Commission on Elections, Second Division',
       'Petition alleging Cayetano held U.S. citizenship and was thus disqualified from holding office',
       '2007-03-08', '2007-04-19',
       'COMELEC ruled Cayetano is a natural-born Filipino citizen and dismissed the petition',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

-- Alan Peter Cayetano — 2019 residency disqualification case, dismissed
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, resolution_date, resolution_summary, source_url, source_label, is_verified)
SELECT id,
       'Residency Disqualification Petition (2019 elections)',
       'electoral', 'dismissed',
       'Commission on Elections, Second Division',
       'Petition alleging separate domiciles between Cayetano and his wife violated Family Code Article 69',
       '2018-11-01', '2019-05-07',
       'COMELEC denied the petition',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';


-- ============================================================
-- SECTION 5 — achievements (key authored laws, awards)
-- ============================================================

-- Win Gatchalian — RA 10931 (Universal Access to Quality Tertiary Education)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id,
       'Author — Universal Access to Quality Tertiary Education Act (RA 10931)',
       'Filed the original version (House Bill 5905) in July 2015 providing free tuition and other school fees in state universities, colleges, and TESDA-accredited institutions',
       'legislation', 2017, 'national_landmark',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

-- Win Gatchalian — Lee Kuan Yew Exchange Fellowship (international award)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id,
       'Lee Kuan Yew Exchange Fellow',
       'Named 69th Lee Kuan Yew Exchange Fellow by the government of Singapore',
       'international', 2019, 'national_standard',
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian', true
FROM public.politicians WHERE slug = 'win-gatchalian';

-- Alan Peter Cayetano — 2019 SEA Games organizing committee chair (large national event)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id,
       'Chairman — Philippine SEA Games Organizing Committee (PHISGOC)',
       'Chaired the organizing committee of the 30th Southeast Asian Games hosted by the Philippines, November 30 – December 11, 2019, with a ₱6-billion budget',
       'international', 2019, 'national_standard',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano', true
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

-- JV Ejercito — RA 11229 (Child Safety in Motor Vehicles Act)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id,
       'Principal Sponsor — Child Safety in Motor Vehicles Act (RA 11229)',
       'Authored and sponsored the law mandating child restraint systems (car seats) for children 12 years old and below or shorter than 1.50m',
       'legislation', 2019, 'national_standard',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito', true
FROM public.politicians WHERE slug = 'jv-ejercito';


-- ============================================================
-- SECTION 6 — dynasty_connections
-- ============================================================

-- Win Gatchalian — three brothers in politics
INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Rex Gatchalian', 'Brother',
       'Secretary of Social Welfare and Development (2023–present); former Mayor of Valenzuela',
       true, false, NULL,
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian'
FROM public.politicians WHERE slug = 'win-gatchalian';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Weslie ''Wes'' Gatchalian', 'Brother',
       'Incumbent Mayor of Valenzuela',
       true, false, NULL,
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian'
FROM public.politicians WHERE slug = 'win-gatchalian';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Kenneth Gatchalian', 'Brother',
       'Valenzuela City Councilor',
       true, false, NULL,
       'https://en.wikipedia.org/wiki/Sherwin_Gatchalian', 'Wikipedia — Sherwin Gatchalian'
FROM public.politicians WHERE slug = 'win-gatchalian';

-- Alan Peter Cayetano — father, sister, brother, wife
INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Rene Cayetano', 'Father',
       'Former Senator of the Philippines (1998–2003)',
       false, false, NULL,
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano'
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Pia Cayetano', 'Sister',
       'Incumbent Senator (2025–2031); served previous terms 2004–2016 and 2019–2025',
       true, false, NULL,
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano'
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Lino Cayetano', 'Younger brother',
       'Former House Representative and former Mayor of Taguig',
       false, false, NULL,
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano'
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Lani Cayetano', 'Wife',
       'Incumbent Mayor of Taguig (2022–present); former House Representative',
       true, true, 'lani-cayetano',
       'https://en.wikipedia.org/wiki/Alan_Peter_Cayetano', 'Wikipedia — Alan Peter Cayetano'
FROM public.politicians WHERE slug = 'alan-peter-cayetano';

-- JV Ejercito — father (Joseph Estrada), mother, half-brother (Jinggoy will be added in batch 3)
INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Joseph Ejercito Estrada', 'Father',
       '13th President of the Philippines (1998–2001); former Senator; former Mayor of Manila',
       false, true, 'joseph-estrada',
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito'
FROM public.politicians WHERE slug = 'jv-ejercito';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Guia Gomez', 'Mother',
       'Former Mayor of San Juan (2010–2019)',
       false, false, NULL,
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito'
FROM public.politicians WHERE slug = 'jv-ejercito';

INSERT INTO public.dynasty_connections (politician_id, related_name, relationship, position_held, is_current, in_dataset, related_slug, source_url, source_label)
SELECT id, 'Jose ''Jinggoy'' Ejercito Estrada Jr.', 'Half-brother (with Loi Ejercito)',
       'Incumbent Senator (2022–2028); former Senator (2004–2016); former Mayor of San Juan',
       true, false, NULL,
       'https://en.wikipedia.org/wiki/JV_Ejercito', 'Wikipedia — JV Ejercito'
FROM public.politicians WHERE slug = 'jv-ejercito';


-- ============================================================
-- SECTION 7 — Recompute objective_score for the three new senators
-- ============================================================

DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT id FROM public.politicians
    WHERE slug IN ('win-gatchalian', 'alan-peter-cayetano', 'jv-ejercito')
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
