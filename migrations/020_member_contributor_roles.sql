-- ============================================================
-- Migration 020: Member + Contributor roles
-- Run in Supabase SQL Editor AFTER migration 019.
--
-- Restructures the role hierarchy from {admin, vetter, superadmin, public}
-- to a 4-tier model:
--
--   admin       — full backend access; promotes vetters/contributors
--   vetter      — backend access; verifies records submitted by contributors
--   contributor — backend access; submits records and adds politiko profiles
--                 (records they create are unverified until vetters approve)
--   member      — frontend only; can post in forum, rate politicians,
--                 submit petitions / records via the public forms
--
-- Existing 'public' rows are migrated to 'member'. 'superadmin' is kept
-- as a synonym for 'admin' for backward compatibility but new code paths
-- should use 'admin'.
--
-- handle_new_user() trigger updated so new auth.users rows land as
-- 'member' (was 'public') so the default tier reads naturally in UI.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ── 1. Update user_profiles.role CHECK constraint ───────────────
-- The original CHECK was: role in ('admin', 'vetter', 'public').
-- New CHECK accepts the four primary roles plus legacy 'superadmin'
-- and 'public' so we don't break any in-flight rows during migration.
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN (
    'admin', 'vetter', 'contributor', 'member',
    'superadmin',  -- legacy synonym for admin; phased out gradually
    'public'       -- legacy default; migrated to 'member' below
  ));

-- ── 2. Migrate existing 'public' rows to 'member' ───────────────
UPDATE public.user_profiles
SET role = 'member'
WHERE role = 'public';

-- ── 3. Update the handle_new_user() trigger so new rows default to 'member' ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'member'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger itself already exists from schema.sql; CREATE OR REPLACE FUNCTION
-- updates the body without re-creating the trigger.

-- ── 4. RLS — give contributors INSERT on records + politicians ──
-- Records they create default is_verified=false; vetters (the existing
-- "Vetters can verify X records" policies) approve them after review.
--
-- Politicians: contributors can INSERT new politician rows with
-- status='draft'. Admins can publish; vetters can change status to
-- under_review during workflow.

-- politicians: contributors can insert drafts
DROP POLICY IF EXISTS "Contributors can insert politicians" ON public.politicians;
CREATE POLICY "Contributors can insert politicians"
  ON public.politicians FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin', 'contributor')
    )
  );

-- politicians: contributors can update their own drafts
DROP POLICY IF EXISTS "Contributors can update their own drafts" ON public.politicians;
CREATE POLICY "Contributors can update their own drafts"
  ON public.politicians FOR UPDATE
  USING (
    created_by = auth.uid()
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin', 'contributor')
    )
  );

-- record tables: contributors can INSERT (existing admin INSERT policies stay)
DO $$
DECLARE
  rec_table text;
BEGIN
  FOR rec_table IN
    SELECT unnest(ARRAY[
      'education_records',
      'track_records',
      'legal_records',
      'achievements',
      'net_worth_records',
      'awards',
      'outcome_metrics'
    ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "Contributors can insert %1$s" ON public.%1$s',
      rec_table
    );
    EXECUTE format(
      'CREATE POLICY "Contributors can insert %1$s" ON public.%1$s FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
            AND role IN (''admin'', ''superadmin'', ''contributor'')
        )
      )',
      rec_table
    );
  END LOOP;
END $$;

-- record tables: contributors can update records they created (until vetted)
DO $$
DECLARE
  rec_table text;
BEGIN
  FOR rec_table IN
    SELECT unnest(ARRAY[
      'education_records',
      'track_records',
      'legal_records',
      'achievements',
      'net_worth_records',
      'awards',
      'outcome_metrics'
    ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "Contributors update own unvetted %1$s" ON public.%1$s',
      rec_table
    );
    EXECUTE format(
      'CREATE POLICY "Contributors update own unvetted %1$s" ON public.%1$s FOR UPDATE USING (
        created_by = auth.uid()
        AND is_verified = false
        AND EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
            AND role IN (''admin'', ''superadmin'', ''contributor'')
        )
      )',
      rec_table
    );
  END LOOP;
END $$;
