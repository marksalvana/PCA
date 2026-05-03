-- ============================================================
-- Migration 009: Citizen record submissions
-- Run in Supabase SQL Editor AFTER migration 008.
--
-- Adds a queue table for citizen-submitted record proposals
-- (education, track record, achievement). Submissions are NOT
-- automatically applied — admins/vetters review and convert
-- accepted submissions into the corresponding records tables.
--
-- Anonymous submissions are allowed (no auth required) but
-- require name + email so the platform can follow up.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.record_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id uuid REFERENCES public.politicians(id) ON DELETE CASCADE NOT NULL,

  submission_type text NOT NULL CHECK (submission_type IN (
    'education', 'track_record', 'achievement'
  )),

  -- Per-type fields stored as jsonb so the schema doesn't fork per type.
  -- Admin reviewer reads payload + source + supporting doc to verify and
  -- convert to a real education_records / track_records / achievements row.
  payload jsonb NOT NULL,

  -- Sourcing — required, mirroring records-table policy
  source_url text NOT NULL,
  source_label text NOT NULL,

  -- Optional supporting document (URL to a hosted PDF, scan, news article,
  -- gov.ph page, etc). For MVP we accept URLs only — file upload can be
  -- added later via Supabase Storage if needed.
  supporting_document_url text,

  -- Submitter explanation — what the submission claims and why it should
  -- be added. Helps reviewers prioritize.
  explanation text NOT NULL,

  -- Submitter contact (allow anonymous via NULL user_id, but require
  -- name + email so we can follow up with reviewer questions)
  submitter_name text NOT NULL,
  submitter_email text NOT NULL,
  submitter_user_id uuid REFERENCES public.user_profiles(id),

  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'accepted', 'rejected', 'duplicate'
  )),
  admin_notes text,
  reviewed_by uuid REFERENCES public.user_profiles(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS record_submissions_politician_idx
  ON public.record_submissions(politician_id);
CREATE INDEX IF NOT EXISTS record_submissions_status_idx
  ON public.record_submissions(status);
CREATE INDEX IF NOT EXISTS record_submissions_created_idx
  ON public.record_submissions(created_at DESC);

COMMENT ON TABLE public.record_submissions IS
  'Citizen-submitted record proposals. Reviewed by admins/vetters before being converted into education_records / track_records / achievements rows.';

-- ── RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.record_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (auth not required — anonymous citizen submissions allowed)
CREATE POLICY "Anyone can insert a record submission"
  ON public.record_submissions FOR INSERT
  WITH CHECK (true);

-- Admins and vetters can read all submissions (review queue)
CREATE POLICY "Admins and vetters can view all submissions"
  ON public.record_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'vetter')
    )
  );

-- Admins and vetters can update (review, accept, reject)
CREATE POLICY "Admins and vetters can update submissions"
  ON public.record_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'vetter')
    )
  );

-- Submitters who created an account can see their own submissions
CREATE POLICY "Submitters can view their own submissions"
  ON public.record_submissions FOR SELECT
  USING (submitter_user_id = auth.uid());
