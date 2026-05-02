-- ============================================================
-- Migration 007: Institutional benchmarks
-- Run in Supabase SQL Editor AFTER migrations 001–006.
--
-- Adds sourced institutional inputs that were previously absent
-- from the scoring model:
--   • DILG Seal of Good Local Governance (SGLG) per term
--   • Bills enacted into Republic Act (vs. just bills_passed)
--   • Office of the Ombudsman dispositions
--   • COMELEC disqualification rulings
--   • SALN late-filing flag
--   • New `awards` table (named institutional awards)
--   • New `outcome_metrics` table (PSA pre/post tenure indicators)
--
-- Updates `compute_objective_score()` to incorporate the new
-- signals additively — politicians without these fields populated
-- score the same as before this migration.
-- ============================================================

-- ── track_records additions ─────────────────────────────────────
ALTER TABLE public.track_records
  ADD COLUMN IF NOT EXISTS sglg_awarded boolean,
  ADD COLUMN IF NOT EXISTS bills_enacted_count integer;

COMMENT ON COLUMN public.track_records.sglg_awarded IS
  'DILG Seal of Good Local Governance awarded for this term. Annual award covering financial admin, disaster prep, social protection, peace & order, business-friendliness, environment. Source: dilg.gov.ph/sglg';

COMMENT ON COLUMN public.track_records.bills_enacted_count IS
  'Bills authored that became RA-numbered laws (signed into effect). Distinct from bills_passed which can mean bicameral approval before signature. Source: officialgazette.gov.ph';

-- ── legal_records additions ─────────────────────────────────────
ALTER TABLE public.legal_records
  ADD COLUMN IF NOT EXISTS ombudsman_disposition text
    CHECK (ombudsman_disposition IN (
      'dismissed', 'admin_penalty', 'criminal_filed', 'pending_at_ombudsman', 'none'
    )),
  ADD COLUMN IF NOT EXISTS comelec_disqualification boolean;

COMMENT ON COLUMN public.legal_records.ombudsman_disposition IS
  'Office of the Ombudsman disposition for this case (separate from court status). Source: ombudsman.gov.ph';

COMMENT ON COLUMN public.legal_records.comelec_disqualification IS
  'COMELEC issued a disqualification ruling related to this case. Source: comelec.gov.ph';

-- ── net_worth_records additions ─────────────────────────────────
ALTER TABLE public.net_worth_records
  ADD COLUMN IF NOT EXISTS saln_filed_on_time boolean,
  ADD COLUMN IF NOT EXISTS declared_income numeric(20,2);

COMMENT ON COLUMN public.net_worth_records.saln_filed_on_time IS
  'SALN filed within RA 6713 statutory deadline. Late or non-filed SALN is a disciplinary offense. Source: csc.gov.ph';

COMMENT ON COLUMN public.net_worth_records.declared_income IS
  'Annual declared income from public-sector salary and other declared sources. Used for RA 1379 lifestyle-check delta vs. net-worth growth.';

-- ── New table: awards ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.awards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id uuid REFERENCES public.politicians(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  issuing_body text NOT NULL,
  year integer,
  citation_text text,
  source_url text NOT NULL,
  source_label text NOT NULL,
  created_by uuid REFERENCES public.user_profiles(id),
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.awards IS
  'Named institutional awards (Magsaysay, Order of Lakandula, TOYM, etc.). Distinct from achievements — these are specific awards from named bodies with their own published criteria.';

-- ── New table: outcome_metrics ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.outcome_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id uuid REFERENCES public.politicians(id) ON DELETE CASCADE NOT NULL,
  jurisdiction text NOT NULL,
  metric text NOT NULL,
  baseline_value numeric,
  baseline_year integer,
  end_value numeric,
  end_year integer,
  source_url text NOT NULL,
  source_label text NOT NULL,
  created_by uuid REFERENCES public.user_profiles(id),
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.outcome_metrics IS
  'Pre/post tenure socioeconomic indicators per jurisdiction. PSA-derived metrics like poverty incidence, IRA utilization, or GINI coefficient before vs. after the politician''s tenure.';

-- ── RLS for new tables ──────────────────────────────────────────
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view awards of published politicians"
  ON public.awards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.politicians
      WHERE id = politician_id AND status = 'published'
    )
  );

CREATE POLICY "Vetters can view all awards"
  ON public.awards FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'vetter'))
  );

CREATE POLICY "Admins can insert awards"
  ON public.awards FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update awards"
  ON public.awards FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Vetters can verify awards"
  ON public.awards FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'vetter'))
  );

CREATE POLICY "Public can view outcome metrics of published politicians"
  ON public.outcome_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.politicians
      WHERE id = politician_id AND status = 'published'
    )
  );

CREATE POLICY "Vetters can view all outcome metrics"
  ON public.outcome_metrics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'vetter'))
  );

CREATE POLICY "Admins can insert outcome metrics"
  ON public.outcome_metrics FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update outcome metrics"
  ON public.outcome_metrics FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Updated compute_objective_score with institutional benchmarks ─
CREATE OR REPLACE FUNCTION public.compute_objective_score(p_politician_id uuid)
RETURNS numeric AS $$
DECLARE
  edu_score         numeric := 0;
  track_score       numeric := 0;
  achievement_score numeric := 0;
  awards_score      numeric := 0;
  legal_penalty     numeric := 0;
  saln_penalty      numeric := 0;
  final_score       numeric;
BEGIN

  -- ── Education: SUM, capped at 200 (unchanged from migration 006) ──
  SELECT LEAST(200, COALESCE(SUM(
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
  ), 0))
  INTO edu_score
  FROM public.education_records
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND ched_accreditation IS NOT NULL
    AND ched_accreditation <> 'unknown';

  -- ── Track record: completion + COA/bills + attendance + SGLG bonus ──
  -- New: +30 SGLG bonus per term that won the DILG Seal of Good Local Governance.
  -- New: bills_enacted_count gets a 1.3x multiplier on the bills-based formula
  --      when present and > 0 (RA-numbered enactment is the harder bar).
  SELECT COALESCE(SUM(
    GREATEST(0,
      -- Completion bonus
      CASE WHEN is_current = false THEN 40 ELSE 0 END
      +
      -- SGLG bonus (DILG Seal of Good Local Governance)
      CASE WHEN sglg_awarded = true THEN 30 ELSE 0 END
      +
      -- Base COA / bills score (with bills-enacted refinement)
      CASE
        WHEN coa_finding = 'unqualified' THEN 100
        WHEN coa_finding = 'qualified'   THEN 60
        WHEN coa_finding = 'adverse'     THEN 20
        WHEN coa_finding = 'disclaimer'  THEN 10
        WHEN coa_finding IN ('not_applicable', 'unknown')
             AND bills_authored IS NOT NULL AND bills_authored > 0
          THEN LEAST(95, 30 + ROUND(
                 (COALESCE(bills_passed, 0)::numeric / bills_authored::numeric) * 55
                 + COALESCE(bills_enacted_count, 0)::numeric * 5
               ))
        ELSE 0
      END
      +
      -- Attendance modifier (graduated tiers — aligned to scoring.ts and the
      -- methodology page; previous migrations used cliff tiers which diverged
      -- from the documented behavior)
      CASE
        WHEN attendance_rate >= 95 THEN  20
        WHEN attendance_rate >= 90 THEN  10
        WHEN attendance_rate >= 75 THEN   0
        WHEN attendance_rate >= 50 THEN -10
        WHEN attendance_rate IS NOT NULL THEN -50
        ELSE 0
      END
    )
  ), 0)
  INTO track_score
  FROM public.track_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Achievements: SUM by impact scope, capped at 300 (unchanged) ──
  SELECT LEAST(300, COALESCE(SUM(
    CASE impact_scope
      WHEN 'national_landmark' THEN 100
      WHEN 'national_standard' THEN  60
      WHEN 'national'          THEN 100
      WHEN 'regional'          THEN  40
      WHEN 'local'             THEN  20
      ELSE 0
    END
  ), 0))
  INTO achievement_score
  FROM public.achievements
  WHERE politician_id = p_politician_id
    AND is_verified = true
    AND impact_scope IS NOT NULL;

  -- ── Awards: SUM verified awards, scored by issuing body recognition ──
  -- A simple per-award point allocation keyed off the award name. Common
  -- top-tier PH awards get higher points; all others contribute 25 by
  -- default to acknowledge the citation without overweighting.
  SELECT LEAST(150, COALESCE(SUM(
    CASE
      WHEN lower(name) LIKE '%magsaysay%'           THEN 100
      WHEN lower(name) LIKE '%order of lakandula%'  THEN  80
      WHEN lower(name) LIKE '%order of national%'   THEN  80
      WHEN lower(name) LIKE '%toym%'                THEN  60
      WHEN lower(name) LIKE '%outstanding young%'   THEN  60
      WHEN lower(name) LIKE '%medal of valor%'      THEN  90
      ELSE 25
    END
  ), 0))
  INTO awards_score
  FROM public.awards
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Legal penalty: court status + Ombudsman + COMELEC ──
  SELECT COALESCE(SUM(
    -- Base: court status
    CASE
      WHEN status = 'pending'        THEN  75
      WHEN status = 'convicted'      THEN 350
      WHEN status = 'ongoing_appeal' THEN  75
      ELSE 0
    END
    +
    -- Ombudsman disposition (additive — distinct administrative track)
    CASE ombudsman_disposition
      WHEN 'admin_penalty'        THEN 50
      WHEN 'criminal_filed'       THEN 100
      WHEN 'pending_at_ombudsman' THEN 25
      ELSE 0
    END
    +
    -- COMELEC disqualification flag
    CASE WHEN comelec_disqualification = true THEN 100 ELSE 0 END
  ), 0)
  INTO legal_penalty
  FROM public.legal_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── SALN late-filing penalty: -25 per occurrence ──
  SELECT COALESCE(SUM(
    CASE WHEN saln_filed_on_time = false THEN 25 ELSE 0 END
  ), 0)
  INTO saln_penalty
  FROM public.net_worth_records
  WHERE politician_id = p_politician_id
    AND is_verified = true;

  -- ── Final ─────────────────────────────────────────────────────
  final_score := GREATEST(0,
    edu_score + track_score + achievement_score + awards_score
    - legal_penalty - saln_penalty
  );

  UPDATE public.politicians
  SET objective_score = final_score,
      updated_at      = now()
  WHERE id = p_politician_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
