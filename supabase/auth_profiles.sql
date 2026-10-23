-- =========================================================================
-- TripSure AI: Google Sign-in member profiles
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =========================================================================

-- 1. Link profiles to Supabase Auth users + editable profile fields
ALTER TABLE public.users_profile
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS nickname TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 300),
    ADD COLUMN IF NOT EXISTS home_province TEXT,
    ADD COLUMN IF NOT EXISTS travel_styles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Row Level Security
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.users_profile;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.users_profile FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Members create their own profile" ON public.users_profile;
CREATE POLICY "Members create their own profile"
    ON public.users_profile FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = auth_user_id AND email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Members update their own profile" ON public.users_profile;
CREATE POLICY "Members update their own profile"
    ON public.users_profile FOR UPDATE
    TO authenticated
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- 3. Column-level permissions
--    Members may only write their own display fields. Tier, trust score, attendance,
--    trip counts and warning tags keep their defaults and are changed server-side only.
--    Email is not readable by other users.
REVOKE SELECT, INSERT, UPDATE ON public.users_profile FROM anon, authenticated;

GRANT SELECT (
    id, auth_user_id, full_name, nickname, avatar_url, bio, home_province, travel_styles,
    tier, monthly_ai_quota_used, trust_score, attendance_rate, trips_completed, trips_cancelled,
    is_verified, warning_tags, created_at
) ON public.users_profile TO anon, authenticated;

GRANT INSERT (
    auth_user_id, email, full_name, nickname, avatar_url, bio, home_province, travel_styles
) ON public.users_profile TO authenticated;

GRANT UPDATE (
    full_name, nickname, avatar_url, bio, home_province, travel_styles, updated_at
) ON public.users_profile TO authenticated;

-- New Google members start with a Google-verified tag instead of the demo defaults
ALTER TABLE public.users_profile
    ALTER COLUMN warning_tags SET DEFAULT ARRAY['✅ ยืนยันตัวตนด้วย Google']::TEXT[];
