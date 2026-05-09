-- ============================================================
-- Migration 017: Forum replies (3-level threading) + reply reactions
-- Run in Supabase SQL Editor AFTER migration 016.
--
-- Adds two tables:
--
-- 1. forum_replies — threaded replies on forum_posts.
--    - Top-level reply (depth=0): parent_reply_id IS NULL, post_id set.
--    - Nested reply (depth=1, 2): parent_reply_id points to a reply.
--    - depth is enforced both at the DB (CHECK <= 2) and at the action
--      layer (validates parent.depth + 1 <= 2 before insert).
--    - Allows anonymous posting (user_id NULL, author_name required) to
--      match the existing forum_posts pattern.
--
-- 2. forum_reply_reactions — like/dislike on individual replies, mirrors
--    forum_reactions exactly. Auth required to react.
-- ============================================================

-- ── forum_replies ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  parent_reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  depth integer NOT NULL CHECK (depth >= 0 AND depth <= 2),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS forum_replies_post_idx       ON public.forum_replies(post_id);
CREATE INDEX IF NOT EXISTS forum_replies_parent_idx     ON public.forum_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS forum_replies_created_idx    ON public.forum_replies(created_at);

COMMENT ON TABLE public.forum_replies IS
  'Threaded replies to forum posts. depth in {0,1,2} — replies to a post
   start at 0; nested replies at 1 and 2 only. Anonymous posting allowed
   (user_id NULL, author_name required). Maximum thread depth enforced at
   the action layer + this CHECK constraint as defense in depth.';

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum replies"
  ON public.forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can post a forum reply"
  ON public.forum_replies FOR INSERT
  WITH CHECK (
    -- Anonymous (user_id NULL) is allowed; if user_id is set, it must
    -- match the authenticated user (no impersonation).
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their own reply"
  ON public.forum_replies FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reply"
  ON public.forum_replies FOR DELETE
  USING (user_id = auth.uid());


-- ── forum_reply_reactions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_reply_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reply_id, user_id)
);

CREATE INDEX IF NOT EXISTS forum_reply_reactions_reply_idx ON public.forum_reply_reactions(reply_id);
CREATE INDEX IF NOT EXISTS forum_reply_reactions_user_idx  ON public.forum_reply_reactions(user_id);

COMMENT ON TABLE public.forum_reply_reactions IS
  'Like/dislike reactions on forum replies. Mirrors forum_reactions for
   the post-level table. One reaction per user per reply.';

ALTER TABLE public.forum_reply_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum reply reactions"
  ON public.forum_reply_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can react to replies"
  ON public.forum_reply_reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own reply reaction"
  ON public.forum_reply_reactions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reply reaction"
  ON public.forum_reply_reactions FOR DELETE
  USING (user_id = auth.uid());
