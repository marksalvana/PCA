-- ============================================================
-- Migration 021: Notifications + Contributor Applications
-- Run in Supabase SQL Editor AFTER migration 020.
--
-- Adds two tables:
--
-- 1. notifications — per-user notification feed surfaced on /me.
--    Sent when:
--      • A user's record submission is accepted or rejected
--      • A user's contributor application is approved or rejected
--      • A vetter approves or flags one of their records (TODO future)
--    System-only inserts (server actions); users can SELECT their own
--    and UPDATE the read_at timestamp.
--
-- 2. contributor_applications — mirrors vetter_applications. People who
--    want to add politiko profiles + submit records to the backend
--    apply here; admins approve and promote them to role='contributor'.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ── notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'submission_accepted',
    'submission_rejected',
    'submission_under_review',
    'contributor_app_approved',
    'contributor_app_rejected',
    'vetter_app_approved',
    'vetter_app_rejected',
    'record_verified',
    'record_flagged',
    'system'
  )),
  title text NOT NULL,
  body text,
  link_url text,           -- relative URL (e.g. /admin/submissions/<id>) the user can click through to
  read_at timestamptz,     -- NULL = unread
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx
  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications(user_id, read_at, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS notifications_user_recent_idx
  ON public.notifications(user_id, created_at DESC);

COMMENT ON TABLE public.notifications IS
  'Per-user notification feed. Inserted by server actions only;
   surfaced on /me and via a small unread-count badge in UserMenu.';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Mark-read updates: users can update read_at on their own rows
DROP POLICY IF EXISTS "Users can mark their notifications read" ON public.notifications;
CREATE POLICY "Users can mark their notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT is intentionally not exposed via RLS — server actions use
-- SECURITY DEFINER (or the service role on writes) so users can't
-- forge notifications for themselves or others.


-- ── contributor_applications ────────────────────────────────────
-- Mirrors vetter_applications shape.
CREATE TABLE IF NOT EXISTS public.contributor_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text NOT NULL,
  background text NOT NULL,        -- e.g. 'researcher' | 'journalist' | 'civic_org' | ...
  motivation text NOT NULL,
  profile_url text,
  public_display_consent boolean NOT NULL DEFAULT false,
  applicant_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  admin_notes text,
  reviewed_by uuid REFERENCES public.user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contributor_apps_status_idx
  ON public.contributor_applications(status);
CREATE INDEX IF NOT EXISTS contributor_apps_user_idx
  ON public.contributor_applications(applicant_user_id);

COMMENT ON TABLE public.contributor_applications IS
  'Self-applied contributor applications. Admin reviews and on accept
   promotes user_profiles.role from member to contributor.';

ALTER TABLE public.contributor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a contributor application" ON public.contributor_applications;
CREATE POLICY "Anyone can submit a contributor application"
  ON public.contributor_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contributor applications" ON public.contributor_applications;
CREATE POLICY "Admins can view contributor applications"
  ON public.contributor_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Applicants can view their own application" ON public.contributor_applications;
CREATE POLICY "Applicants can view their own application"
  ON public.contributor_applications FOR SELECT
  USING (applicant_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update contributor applications" ON public.contributor_applications;
CREATE POLICY "Admins can update contributor applications"
  ON public.contributor_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );
