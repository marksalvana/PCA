-- ============================================================
-- Migration 019: Forum posts + replies require phone-verified auth
-- Run in Supabase SQL Editor AFTER migration 018.
--
-- Closes the open-insert loophole on forum_posts and forum_replies that
-- allowed anonymous posting (just a name + content). With phone-verified
-- auth required, every new post and reply is tied to a real account
-- that paid the SMS cost — and rate limits in Phase 4 can attach to
-- user_id.
--
-- Existing rows with user_id = NULL (legacy anonymous posts) stay as-is
-- and remain readable. We don't ALTER COLUMN ... SET NOT NULL because
-- that would fail in the presence of legacy NULL rows; the new INSERT
-- policy enforces user_id = auth.uid() so all future rows have a user.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ── forum_posts ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can submit a forum post" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can post" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can post to forum" ON public.forum_posts;
DROP POLICY IF EXISTS "Verified users can post" ON public.forum_posts;

CREATE POLICY "Verified users can post"
  ON public.forum_posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND public.is_verified_user()
  );

-- ── forum_replies ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can post a forum reply" ON public.forum_replies;
DROP POLICY IF EXISTS "Verified users can reply" ON public.forum_replies;

CREATE POLICY "Verified users can reply"
  ON public.forum_replies FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND public.is_verified_user()
  );
