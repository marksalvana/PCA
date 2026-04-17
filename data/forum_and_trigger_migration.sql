-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Forum posts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name  text        NOT NULL CHECK (char_length(author_name) >= 2),
  content      text        NOT NULL CHECK (char_length(content) >= 10),
  category     text        NOT NULL DEFAULT 'general'
               CHECK (category IN ('suggestion', 'feedback', 'question', 'bug_report', 'general')),
  user_id      uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  is_pinned    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete" ON public.forum_posts;

CREATE POLICY "forum_posts_select" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert" ON public.forum_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "forum_posts_delete" ON public.forum_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 2. Civic trust score auto-update trigger
-- ============================================================
-- Automatically recalculates politicians.civic_trust_score
-- whenever a civic_trust_rating is inserted or updated.
-- Rating 1–5 is scaled to 0–100 (multiply avg by 20).

CREATE OR REPLACE FUNCTION public.update_civic_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.politicians
  SET civic_trust_score = (
    SELECT ROUND(AVG(rating) * 20)
    FROM public.civic_trust_ratings
    WHERE politician_id = NEW.politician_id
  )
  WHERE id = NEW.politician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON public.civic_trust_ratings;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON public.civic_trust_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_trust_score();
