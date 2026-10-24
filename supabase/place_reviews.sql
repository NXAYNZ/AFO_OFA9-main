-- =========================================================================
-- TripSure AI: attraction reviews & comments
-- Run this in Supabase SQL Editor AFTER auth_profiles.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_key TEXT NOT NULL, -- "จังหวัด|สถานที่"
    kind TEXT NOT NULL CHECK (kind IN ('review', 'comment')),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Reviews need a star rating, comments must not have one
    CHECK ((kind = 'review' AND rating IS NOT NULL) OR (kind = 'comment' AND rating IS NULL))
);

CREATE INDEX IF NOT EXISTS place_reviews_place_key_idx
    ON public.place_reviews (place_key, created_at DESC);

ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.place_reviews;
CREATE POLICY "Reviews are viewable by everyone"
    ON public.place_reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Members post their own reviews" ON public.place_reviews;
CREATE POLICY "Members post their own reviews"
    ON public.place_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Members delete their own reviews" ON public.place_reviews;
CREATE POLICY "Members delete their own reviews"
    ON public.place_reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = auth_user_id);

-- auth_user_id stays private; clients read display fields only
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.place_reviews FROM anon, authenticated;

GRANT SELECT (id, place_key, kind, rating, body, author_name, author_avatar, created_at)
    ON public.place_reviews TO anon, authenticated;

GRANT INSERT (place_key, kind, rating, body, author_name, author_avatar, auth_user_id)
    ON public.place_reviews TO authenticated;

GRANT DELETE ON public.place_reviews TO authenticated;
