-- ============================================================
-- Migration 016: Like / dislike reactions on forum posts
-- Run in Supabase SQL Editor AFTER migration 015.
--
-- Adds public.forum_reactions so authenticated users can react to
-- forum posts with a like or a dislike. Each user can have at most
-- one reaction per post (toggling the same reaction removes it,
-- choosing the opposite reaction switches it).
--
-- Comments don't exist as a separate concept yet — the forum is
-- top-level posts only. When comments ship, they'll need their own
-- reactions table (or this one converts to polymorphic via a
-- target_type discriminator).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.forum_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- One reaction per user per post; switching reaction does an UPDATE,
  -- removing does a DELETE. Enforces one-vote integrity at the DB.
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS forum_reactions_post_idx
  ON public.forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS forum_reactions_user_idx
  ON public.forum_reactions(user_id);

COMMENT ON TABLE public.forum_reactions IS
  'Like/dislike reactions on forum posts. One reaction per user per post.
   Toggling the same reaction removes the row (handled at the action layer).';

-- ── RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authed) can read reactions to compute aggregate counts
CREATE POLICY "Anyone can view forum reactions"
  ON public.forum_reactions FOR SELECT
  USING (true);

-- Authenticated users can insert their own reaction
CREATE POLICY "Authenticated users can react"
  ON public.forum_reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Users can update their own reaction (switching like ↔ dislike)
CREATE POLICY "Users can update their own reaction"
  ON public.forum_reactions FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own reaction (toggling off)
CREATE POLICY "Users can delete their own reaction"
  ON public.forum_reactions FOR DELETE
  USING (user_id = auth.uid());
