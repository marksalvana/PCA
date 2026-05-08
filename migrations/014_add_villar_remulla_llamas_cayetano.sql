-- ============================================================
-- Migration 014: Add 6 new politician profiles with full record data
-- Run in Supabase SQL Editor AFTER migration 013.
--
-- Politicians added (status='published'):
--   1. Mark Villar       — Senator (2022–present), former DPWH Sec
--   2. Camille Villar    — Senator (2025–present), former Las Piñas Rep
--   3. Jesus Crispin "Boying" Remulla — Ombudsman (2025–present),
--                          former Justice Sec, former Cavite Gov
--   4. Juanito Victor "Jonvic" Remulla — DILG Sec (2024–present),
--                          former Cavite Gov
--   5. Ronald Llamas     — former Pres. Adviser on Political Affairs
--                          (2011–2016), Akbayan founder
--   6. Lani Cayetano     — Mayor of Taguig (2022–present)
--
-- Each section cites Wikipedia + Official Gazette where applicable.
-- Records mark is_verified=true based on Wikipedia citation; vetters can
-- flag any specific record for re-review.
--
-- Recomputes objective_score for all 6 at the end.
-- ============================================================

-- ============================================================
-- SECTION 1 — politicians table
-- ============================================================

INSERT INTO public.politicians (
  slug, full_name, preferred_name, current_position, party_affiliation,
  region, is_incumbent, is_candidate, status, birth_date, dynasty_name, dynasty_generation
) VALUES
  ('mark-villar', 'Mark Aguilar Villar', 'Mark Villar',
   'Senator of the Philippines', 'Nacionalista Party',
   'NCR', true, false, 'published', '1978-08-14', 'Villar', 2),

  ('camille-villar', 'Camille Aguilar Villar-Genuino', 'Camille Villar',
   'Senator of the Philippines', 'Nacionalista Party',
   'NCR', true, false, 'published', '1985-01-25', 'Villar', 2),

  ('boying-remulla', 'Jesus Crispin Catibayan Remulla', 'Boying Remulla',
   'Ombudsman of the Philippines', 'National Unity Party',
   'CALABARZON', true, false, 'published', '1961-03-31', 'Remulla', 2),

  ('jonvic-remulla', 'Juanito Victor Catibayan Remulla Jr.', 'Jonvic Remulla',
   'Secretary of the Interior and Local Government', 'National Unity Party',
   'CALABARZON', true, false, 'published', '1967-10-23', 'Remulla', 2),

  ('ronald-llamas', 'Rolando M. Llamas', 'Ronald Llamas',
   'Political columnist (former Presidential Adviser, 2011–2016)', 'Akbayan',
   'NCR', false, false, 'published', NULL, NULL, NULL),

  ('lani-cayetano', 'Maria Laarni Clariño Lopez Cayetano', 'Lani Cayetano',
   'Mayor of Taguig', 'Nacionalista Party',
   'NCR', true, false, 'published', '1981-12-11', 'Cayetano', 2)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 2 — education_records
-- ============================================================

-- Mark Villar
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of Pennsylvania', 'Bachelor of Arts', 'Economics, Political Science, Philosophy', 1996, 2000, true, 'foreign', 'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';

INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of Chicago Booth School of Business', 'Master of Business Administration', NULL, 2000, 2002, true, 'foreign', 'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';

-- Camille Villar
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'Ateneo de Manila University', 'Bachelor of Science', 'Business Management', NULL, NULL, true, 'autonomous', 'https://en.wikipedia.org/wiki/Camille_Villar', 'Wikipedia — Camille Villar', true
FROM public.politicians WHERE slug='camille-villar';

INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'IESE Business School (Barcelona)', 'Master of Business Administration', NULL, NULL, NULL, true, 'foreign', 'https://en.wikipedia.org/wiki/Camille_Villar', 'Wikipedia — Camille Villar', true
FROM public.politicians WHERE slug='camille-villar';

-- Boying Remulla
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of the Philippines Diliman', 'Bachelor of Arts', 'Political Science', NULL, NULL, true, 'autonomous', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of the Philippines College of Law', 'Bachelor of Laws (LL.B.)', NULL, NULL, 1987, true, 'autonomous', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

-- Jonvic Remulla
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of the Philippines Diliman', 'Bachelor of Arts', 'Philosophy', NULL, NULL, true, 'autonomous', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- Ronald Llamas — left UST without graduating
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'University of Santo Tomas', 'Bachelor of Arts', 'Journalism', 1978, 1982, false, 'autonomous', 'https://en.wikipedia.org/wiki/Ronald_Llamas', 'Wikipedia — Ronald Llamas', true
FROM public.politicians WHERE slug='ronald-llamas';

-- Lani Cayetano
INSERT INTO public.education_records (politician_id, institution, degree, field_of_study, year_started, year_ended, is_completed, ched_accreditation, source_url, source_label, is_verified)
SELECT id, 'Centro Escolar University', 'Bachelor of Arts', 'Mass Communication', NULL, NULL, true, 'level_4', 'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';


-- ============================================================
-- SECTION 3 — track_records
-- ============================================================

-- ── Mark Villar ──

-- Representative, Las Piñas (2010–2016)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Representative, Las Piñas Lone District', '2010-06-30', '2016-08-01', false, 'not_applicable', NULL, NULL, NULL, 3, 'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';
-- bills_enacted_count=3: Negosyo Act (RA 10644), Lemon Law (RA 10642), Co-Loading Act

-- DPWH Secretary (2016–2021)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Secretary of Public Works and Highways', '2016-08-01', '2021-10-06', false, 'unknown', NULL, NULL, NULL, NULL, 'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';
-- TODO: pull DPWH COA Annual Audit Report opinion for 2016–2021

-- Senator (2022–present)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2022-06-30', NULL, true, 'not_applicable', 95.00, NULL, NULL, 5, 'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar; Manila Bulletin attendance coverage', true
FROM public.politicians WHERE slug='mark-villar';
-- attendance_rate≈95: 7 absences (6 on official mission) in Jul–Dec 2022 per Manila Bulletin (~50 sessions)
-- bills_enacted_count=5: Maharlika Investment Fund Bill + others (conservative)

-- ── Camille Villar ──

-- Representative, Las Piñas (2019–2025) — single row covering both 18th + 19th Congress
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Representative, Las Piñas Lone District', '2019-06-30', '2025-06-30', false, 'not_applicable', NULL, NULL, NULL, NULL, 'https://en.wikipedia.org/wiki/Camille_Villar', 'Wikipedia — Camille Villar', true
FROM public.politicians WHERE slug='camille-villar';

-- Senator (2025–present)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, attendance_rate, bills_authored, bills_passed, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Senator of the Philippines', '2025-06-30', NULL, true, 'not_applicable', NULL, NULL, NULL, NULL, 'https://en.wikipedia.org/wiki/Camille_Villar', 'Wikipedia — Camille Villar', true
FROM public.politicians WHERE slug='camille-villar';

-- ── Boying Remulla ──

-- Cavite Provincial Board (1992–1995)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Cavite Provincial Board Member', '1992-06-30', '1995-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

-- Representative, Cavite 3rd District (2004–2010)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, bills_enacted_count, source_url, source_label, is_verified)
SELECT id, 'Representative, Cavite 3rd District', '2004-06-30', '2010-06-30', false, 'not_applicable', 1, 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla; RA 9727 (Cavite Reapportionment 2009)', true
FROM public.politicians WHERE slug='boying-remulla';

-- Representative + Deputy Speaker, Cavite 7th District (2010–2013)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Deputy Speaker, House of Representatives (Cavite 7th District)', '2010-06-30', '2013-06-30', false, 'not_applicable', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

-- Governor of Cavite (2016–2019)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Governor of Cavite', '2016-06-30', '2019-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';
-- TODO: COA Annual Audit Report for Cavite 2016-2019

-- Representative, Cavite 7th District (2019–2022) Senior Deputy Majority Leader
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Representative, Cavite 7th District (Senior Deputy Majority Leader)', '2019-06-30', '2022-06-30', false, 'not_applicable', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

-- Secretary of Justice (2022–2025)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Secretary of Justice', '2022-06-30', '2025-10-09', false, 'unknown', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';
-- TODO: DOJ COA AAR opinion for 2022-2025

-- Ombudsman (2025–present)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Ombudsman of the Philippines', '2025-10-09', NULL, true, 'unknown', 'https://en.wikipedia.org/wiki/Jesus_Crispin_Remulla', 'Wikipedia — Jesus Crispin Remulla', true
FROM public.politicians WHERE slug='boying-remulla';

-- ── Jonvic Remulla ──

-- Cavite Provincial Board (1995–1998)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Cavite Provincial Board Member (2nd District)', '1995-06-30', '1998-02-06', false, 'unknown', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- Vice Governor of Cavite (1998–2007)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Vice Governor of Cavite', '1998-02-06', '2007-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- Governor of Cavite (2010–2016) — first term as governor
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Governor of Cavite', '2010-06-30', '2016-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla; ISO 9001:2008 certified province during this term', true
FROM public.politicians WHERE slug='jonvic-remulla';
-- TODO: COA AAR for Cavite 2010-2016

-- Governor of Cavite (2019–2024) — second term, ended early to take DILG
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Governor of Cavite', '2019-06-30', '2024-10-08', false, 'unknown', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- Secretary of the Interior and Local Government (2024–present)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Secretary of the Interior and Local Government', '2024-10-08', NULL, true, 'unknown', 'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- ── Ronald Llamas ──

-- DBP Board Member (2010–2011)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Member, Development Bank of the Philippines Board', '2010-06-30', '2011-01-20', false, 'unknown', 'https://en.wikipedia.org/wiki/Ronald_Llamas', 'Wikipedia — Ronald Llamas', true
FROM public.politicians WHERE slug='ronald-llamas';

-- Presidential Adviser on Political Affairs (2011–2016)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Presidential Adviser on Political Affairs', '2011-01-20', '2016-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Ronald_Llamas', 'Wikipedia — Ronald Llamas', true
FROM public.politicians WHERE slug='ronald-llamas';

-- ── Lani Cayetano ──

-- Representative, Taguig-Pateros 1st District (2007–2010)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Representative, Taguig-Pateros 1st District', '2007-06-30', '2010-06-30', false, 'not_applicable', 'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';

-- Mayor of Taguig (2010–2019)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Mayor of Taguig', '2010-06-30', '2019-06-30', false, 'unknown', 'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';
-- TODO: COA AAR for Taguig 2010-2019; SGLG history

-- Representative, Taguig 2nd District (2019–2022)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Representative, Taguig 2nd District', '2019-06-30', '2022-06-30', false, 'not_applicable', 'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';

-- Mayor of Taguig (2022–present)
INSERT INTO public.track_records (politician_id, position, start_date, end_date, is_current, coa_finding, source_url, source_label, is_verified)
SELECT id, 'Mayor of Taguig', '2022-06-30', NULL, true, 'unknown', 'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';
-- TODO: COA AAR for Taguig 2022-present; SGLG history


-- ============================================================
-- SECTION 4 — legal_records (active / serious cases only)
-- ============================================================

-- Mark Villar — SEC criminal complaint filed Jan 2026
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, ombudsman_disposition, comelec_disqualification, source_url, source_label, is_verified)
SELECT id, 'SEC v. Villar Land Holdings — Market Manipulation, Insider Trading',
  'criminal', 'pending', 'Securities and Exchange Commission',
  'Market manipulation, insider trading, misleading disclosures (insider trading on 73,600 shares purchased Dec 2017)',
  '2026-01-15', 'none', false,
  'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar; SEC Jan 2026 complaint', true
FROM public.politicians WHERE slug='mark-villar';

-- Mark Villar — DPWH flood control corruption / Ombudsman investigation Nov 2025
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, ombudsman_disposition, comelec_disqualification, source_url, source_label, is_verified)
SELECT id, 'Ombudsman Investigation — DPWH Flood Control Project Kickback Allegations',
  'administrative', 'pending', 'Office of the Ombudsman',
  'Allegations of 10% kickback scheme in flood-control projects (per former DPWH Undersec Bernardo)',
  '2025-11-15', 'pending_at_ombudsman', false,
  'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';

-- Camille Villar — same SEC complaint (co-defendant)
INSERT INTO public.legal_records (politician_id, case_title, case_type, status, court, charge, filing_date, ombudsman_disposition, comelec_disqualification, source_url, source_label, is_verified)
SELECT id, 'SEC v. Villar Land Holdings — Market Manipulation, Insider Trading',
  'criminal', 'pending', 'Securities and Exchange Commission',
  'Market manipulation, insider trading, misleading disclosures (co-defendant)',
  '2026-01-15', 'none', false,
  'https://en.wikipedia.org/wiki/Camille_Villar', 'Wikipedia — Camille Villar; SEC Jan 2026 complaint', true
FROM public.politicians WHERE slug='camille-villar';


-- ============================================================
-- SECTION 5 — achievements (governance work only — firsts/elections/personal excluded per policy)
-- ============================================================

-- Mark Villar — DPWH infrastructure build 2016-2021
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id, 'DPWH "Build Build Build" Infrastructure Output (2016–2021)',
  'As DPWH Secretary: completed 29,264 km of roads, 5,950 bridges, 11,340 flood control projects, 222 evacuation centers, 150,149 classrooms, generating 6.5 million jobs',
  'infrastructure', 2021, 'national_landmark',
  'https://en.wikipedia.org/wiki/Mark_Villar', 'Wikipedia — Mark Villar', true
FROM public.politicians WHERE slug='mark-villar';

-- Mark Villar — Negosyo Act co-author (House)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id, 'Co-Authored the Negosyo Act (RA 10644)',
  'Republic Act 10644 — Promotion of Microfinance and Small Business Development. Establishes Negosyo Centers nationwide for micro, small, and medium enterprises.',
  'legislation', 2014, 'national_standard',
  'https://www.officialgazette.gov.ph/2014/07/15/republic-act-no-10644/',
  'Official Gazette — RA 10644', true
FROM public.politicians WHERE slug='mark-villar';

-- Boying Remulla — RA 9727 Cavite Reapportionment
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id, 'Co-Authored the Cavite Congressional Reapportionment Act (RA 9727)',
  'Republic Act 9727 expanded Cavite representation from three to seven House districts (co-authored with Joseph Emilio Abaya and Elpidio Barzaga Jr.).',
  'legislation', 2009, 'regional',
  'https://www.officialgazette.gov.ph/2009/10/26/republic-act-no-9727/',
  'Official Gazette — RA 9727', true
FROM public.politicians WHERE slug='boying-remulla';

-- Jonvic Remulla — Cavite ISO 9001:2008 certification
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id, 'Cavite — First Province ISO 9001:2008 Certified Under His Tenure',
  'During first term as Governor (2010–2016), Cavite became the first and only province with ISO 9001:2008 certification.',
  'other', 2013, 'regional',
  'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';

-- Lani Cayetano — Embo barangay transfer (governance work)
INSERT INTO public.achievements (politician_id, title, description, category, year, impact_scope, source_url, source_label, is_verified)
SELECT id, 'Embo Barangay Transfer to Taguig (post-SC 2023 Boundary Ruling)',
  'During fourth mayoral term, Taguig received the transfer of Embo barangays from Makati following the Supreme Court 2023 ruling on the decades-long boundary dispute, expanding the city''s jurisdiction.',
  'other', 2023, 'regional',
  'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';


-- ============================================================
-- SECTION 6 — awards (named institutional honors only)
-- ============================================================

-- Lani Cayetano
INSERT INTO public.awards (politician_id, name, issuing_body, year, citation_text, source_url, source_label, is_verified)
SELECT id, 'United Nations Association of the Philippines — Recognition for Politics and Government Service',
  'United Nations Association of the Philippines', 2009,
  'Recognition for accomplishments in politics and government service',
  'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';

INSERT INTO public.awards (politician_id, name, issuing_body, year, citation_text, source_url, source_label, is_verified)
SELECT id, 'Distinguished Alumna Award',
  'Centro Escolar University', 2008,
  'Recognition for accomplishments as alumna in public service',
  'https://en.wikipedia.org/wiki/Lani_Cayetano', 'Wikipedia — Lani Cayetano', true
FROM public.politicians WHERE slug='lani-cayetano';

-- Jonvic Remulla
INSERT INTO public.awards (politician_id, name, issuing_body, year, citation_text, source_url, source_label, is_verified)
SELECT id, 'People of the Year',
  'People Asia Magazine', 2013,
  'Recognition for governance leadership in Cavite',
  'https://en.wikipedia.org/wiki/Juanito_Victor_Remulla', 'Wikipedia — Jonvic Remulla', true
FROM public.politicians WHERE slug='jonvic-remulla';


-- ============================================================
-- SECTION 7 — Recompute objective scores for the 6 new politicians
-- ============================================================
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN
    SELECT id FROM public.politicians
    WHERE slug IN ('mark-villar','camille-villar','boying-remulla','jonvic-remulla','ronald-llamas','lani-cayetano')
  LOOP
    PERFORM public.compute_objective_score(pid);
  END LOOP;
END $$;
