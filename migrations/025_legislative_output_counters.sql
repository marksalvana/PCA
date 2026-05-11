-- ============================================================
-- Migration 025: Unscored legislative output counters
-- Run in Supabase SQL Editor AFTER migration 024.
--
-- Adds three counters to track_records that mirror the senate.gov.ph
-- per-senator stats block:
--
--   co_authored_bills        — bills the senator co-authored
--   resolutions_authored     — resolutions filed as principal author
--   co_authored_resolutions  — resolutions the senator co-authored
--
-- These are *biographical context only* — they appear on the profile so
-- voters can see legislative output, but they do NOT contribute to the
-- Objective Score (compute_objective_score reads bills_authored and
-- bills_enacted_count for scoring; the new fields are intentionally not
-- referenced there). Reason: co-authorship in PH practice is often a
-- courtesy / cohort signal, and resolutions are largely symbolic — both
-- can be inflated and don't track governance quality.
--
-- Idempotent: safe to re-run.
-- ============================================================

ALTER TABLE public.track_records
  ADD COLUMN IF NOT EXISTS co_authored_bills        integer,
  ADD COLUMN IF NOT EXISTS resolutions_authored     integer,
  ADD COLUMN IF NOT EXISTS co_authored_resolutions  integer;

COMMENT ON COLUMN public.track_records.co_authored_bills IS
  'Number of bills the official co-authored during this term.
   Biographical context only — does NOT contribute to objective_score.';

COMMENT ON COLUMN public.track_records.resolutions_authored IS
  'Number of resolutions the official filed as principal author during
   this term. Biographical context only — does NOT contribute to
   objective_score (resolutions are largely symbolic in PH practice).';

COMMENT ON COLUMN public.track_records.co_authored_resolutions IS
  'Number of resolutions the official co-authored during this term.
   Biographical context only — does NOT contribute to objective_score.';
