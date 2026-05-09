-- ============================================================
-- Migration 018: Phone OTP verification gate
-- Run in Supabase SQL Editor AFTER migration 017.
--
-- Adds phone_verified + phone_e164 columns to user_profiles, an
-- is_verified_user() helper function, and tightens INSERT policies on
-- civic_trust_ratings, forum_reactions, and forum_reply_reactions so
-- only phone-verified accounts can take those actions.
--
-- Forum posts and replies are tightened in migration 019 (Phase 3).
-- record_submissions and petitions stay anonymous-friendly per plan.
--
-- Idempotent: safe to re-run. Existing users are NOT flipped to
-- verified — they'll go through /verify-phone on next login.
-- ============================================================

-- ── Schema additions ────────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_e164 text;

COMMENT ON COLUMN public.user_profiles.phone_verified IS
  'True when the user has completed Phone OTP verification via Supabase
   Auth. Required before they can rate politicians, react to forum
   posts, or post in the forum (per migration 019).';

COMMENT ON COLUMN public.user_profiles.phone_e164 IS
  'E.164-formatted phone number captured at verification (e.g. +639171234567).
   Stored for audit + de-duplication; not displayed publicly.';


-- ── is_verified_user() helper function ──────────────────────────
-- SECURITY DEFINER lets RLS policies invoke this without needing direct
-- SELECT on user_profiles for the authenticated role.
CREATE OR REPLACE FUNCTION public.is_verified_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
      AND phone_verified = true
  );
$$;

COMMENT ON FUNCTION public.is_verified_user() IS
  'Returns true when the calling auth.uid() has phone_verified=true in
   user_profiles. Used in RLS policies to gate write actions to
   phone-verified accounts only.';

GRANT EXECUTE ON FUNCTION public.is_verified_user() TO authenticated, anon;


-- ── Tighten civic_trust_ratings ─────────────────────────────────
-- Insert: must be authenticated AND phone-verified.
-- Update: existing rows can still be updated by their owner (no extra
-- gate; once you''ve rated, you''re trusted enough to change it).
DROP POLICY IF EXISTS "Authenticated users can rate" ON public.civic_trust_ratings;
CREATE POLICY "Verified users can rate"
  ON public.civic_trust_ratings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND public.is_verified_user());


-- ── Tighten forum_reactions ─────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can react" ON public.forum_reactions;
CREATE POLICY "Verified users can react"
  ON public.forum_reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid() AND public.is_verified_user());


-- ── Tighten forum_reply_reactions ───────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can react to replies" ON public.forum_reply_reactions;
CREATE POLICY "Verified users can react to replies"
  ON public.forum_reply_reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid() AND public.is_verified_user());


-- ── Note for the application layer ──────────────────────────────
-- Server actions that wrap the same writes (rating.ts, forum.ts) should
-- additionally check is_verified_user() at the action layer for clearer
-- error messages — RLS rejection alone surfaces as a generic
-- "permission denied" otherwise. Action-layer guard added in the
-- accompanying TypeScript work.
