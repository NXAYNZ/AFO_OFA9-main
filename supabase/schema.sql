-- =========================================================================
-- TripSure AI (ทริปชัวร์) Database Schema
-- Thailand's First AI Budget Trip Planner & Anti-Flake Community Trip Escrow
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & TRUST METRICS
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'GOLD', 'PLATINUM')),
    monthly_ai_quota_used INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
    attendance_rate NUMERIC(5, 2) DEFAULT 100.00,
    trips_completed INTEGER DEFAULT 0,
    trips_cancelled INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    warning_tags TEXT[] DEFAULT ARRAY['✅ สมาชิกยืนยันตัวตนแล้ว', '🌟 ประวัติการร่วมทริปดีเยี่ยม']::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBSCRIPTION BILLING & QUOTAS ("Make Me Money" Stream #1)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('FREE', 'GOLD', 'PLATINUM')),
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_monthly_quotas INTEGER NOT NULL DEFAULT 2,
    plan_options_per_request INTEGER NOT NULL DEFAULT 1,
    has_deep_ota_comparison BOOLEAN DEFAULT false,
    has_price_alert BOOLEAN DEFAULT false,
    creation_fee_discount NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AI GENERATED TRIPS & OTA COMPARISONS
CREATE TABLE IF NOT EXISTS public.ai_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
    province TEXT NOT NULL,
    travel_dates TEXT NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('HIGH', 'LOW', 'SHOULDER')),
    travel_style TEXT NOT NULL,
    travelers_count INTEGER NOT NULL DEFAULT 1,
    budget_thb NUMERIC(12, 2) NOT NULL,
    weather_summary JSONB,
    generated_plans JSONB NOT NULL,
    ota_comparisons JSONB NOT NULL,
    estimated_savings_thb NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMMUNITY ESCROW TRIPS ("Make Me Money" Stream #2)
CREATE TABLE IF NOT EXISTS public.community_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    travel_dates TEXT NOT NULL,
    total_slots INTEGER NOT NULL DEFAULT 8,
    joined_slots INTEGER NOT NULL DEFAULT 1,
    cost_per_person NUMERIC(10, 2) NOT NULL,
    security_deposit_per_person NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    platform_creation_fee_rate NUMERIC(4, 2) DEFAULT 0.035, -- 3.5%
    cancellation_penalty_rate NUMERIC(4, 2) DEFAULT 0.10,  -- 10%
    trip_pool_balance NUMERIC(12, 2) DEFAULT 0.00,
    highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TRIP PARTICIPANTS & FLAKE STATUS
CREATE TABLE IF NOT EXISTS public.trip_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.community_trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    deposit_paid NUMERIC(10, 2) NOT NULL,
    escrow_status TEXT NOT NULL DEFAULT 'HELD' CHECK (escrow_status IN ('HELD', 'SETTLED', 'PENALIZED_CANCEL', 'REFUNDED')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    penalty_deducted NUMERIC(10, 2) DEFAULT 0.00,
    pool_compensation_added NUMERIC(10, 2) DEFAULT 0.00,
    UNIQUE(trip_id, user_id)
);

-- 6. ESCROW & REVENUE TRANSACTIONS ("Make Me Money" Revenue Ledger)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.community_trips(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEPOSIT_ESCROW', 'CREATION_FEE_3_5', 'PENALTY_PLATFORM_5', 'PENALTY_POOL_5', 'SUBSCRIPTION_UPGRADE', 'AFFILIATE_COMMISSION')),
    amount NUMERIC(10, 2) NOT NULL,
    platform_revenue NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TWO-WAY TRUST & REVIEW DIRECTORY
CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.community_trips(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    role_reviewed TEXT NOT NULL CHECK (role_reviewed IN ('HOST', 'PARTICIPANT')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    punctuality_rating INTEGER DEFAULT 5,
    honesty_rating INTEGER DEFAULT 5,
    comment TEXT,
    badges_awarded TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- SEED DATA FOR DEMO & HACKATHON JUDGES
-- =========================================================================

-- Seed Host & Participants
INSERT INTO public.users_profile (id, email, full_name, avatar_url, tier, monthly_ai_quota_used, trust_score, attendance_rate, trips_completed, trips_cancelled, is_verified, warning_tags)
VALUES 
('d0000001-0000-0000-0000-000000000001', 'somchai.trip@tripsure.ai', 'สมชาย วิจิตรศิลป์ (พี่ชายสายลุย)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'PLATINUM', 3, 98, 99.20, 24, 0, true, ARRAY['👑 Verified Super Host', '✅ ไม่เคยเททริป 24 ทริปติด', '🛡️ ประกันเงินคืน 100%']),
('d0000001-0000-0000-0000-000000000002', 'kanya.beach@tripsure.ai', 'กัญญา พักร้อน (น้องกิ๊ฟ)', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'GOLD', 1, 95, 96.50, 11, 0, true, ARRAY['✅ ตรงต่อเวลามาก', '🌟 สมาชิกดีเด่น 2025']),
('d0000001-0000-0000-0000-000000000003', 'krit.party@tripsure.ai', 'กริช สายปาร์ตี้ (บอย)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'FREE', 2, 82, 85.00, 6, 1, true, ARRAY['⚠️ เคยยกเลิกกระทันหัน 1 ครั้ง (โดนหัก 10%)', '⚡ ผ่านการยืนยันเบอร์โทร']),
('d0000001-0000-0000-0000-000000000004', 'pitcha.cafe@tripsure.ai', 'พิชชา สายคาเฟ่ (เมย์)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'FREE', 0, 100, 100.00, 8, 0, true, ARRAY['✅ ไม่เคยเททริป 8 ทริปติด', '📸 ตากล้องประจำกลุ่ม'])
ON CONFLICT (email) DO NOTHING;

-- Seed Hero Community Trip (Koh Samet 8-person trip)
INSERT INTO public.community_trips (
    id, host_id, title, destination, travel_dates, total_slots, joined_slots, cost_per_person, security_deposit_per_person, status, highlights, image_url, trip_pool_balance
) VALUES (
    'c0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    'ทริปหารเหมาเรือสปีดโบ๊ท & พูลวิลล่า เกาะเสม็ด 3 วัน 2 คืน (รับ 8 คน)',
    'เกาะเสม็ด จ.ระยอง',
    '14 - 16 พ.ย. 2026',
    8,
    6,
    3500.00,
    1500.00,
    'OPEN',
    ARRAY['🚤 เหมาเรือสปีดโบ๊ทส่วนตัวไป-กลับ', '🏡 พูลวิลล่าติดหาดทรายแก้ว คาราโอเกะครบ', '🦐 ปิ้งย่างซีฟู้ดไม่อั้นคืนที่ 2', '🛡️ สัญญา Escrow ล็อกมัดจำ ป้องกันเท 100%'],
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    9000.00
) ON CONFLICT (id) DO NOTHING;

-- Seed Participants for Koh Samet Trip
INSERT INTO public.trip_participants (trip_id, user_id, deposit_paid, escrow_status)
VALUES
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 1500.00, 'HELD'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000002', 1500.00, 'HELD'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000003', 1500.00, 'HELD'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000004', 1500.00, 'HELD')
ON CONFLICT DO NOTHING;

-- Seed Initial Revenue Transactions
INSERT INTO public.escrow_transactions (trip_id, user_id, transaction_type, amount, platform_revenue, description)
VALUES
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'CREATION_FEE_3_5', 980.00, 980.00, 'Platform Escrow Protection Fee (3.5% of total pool 28,000 THB)'),
(NULL, 'd0000001-0000-0000-0000-000000000001', 'SUBSCRIPTION_UPGRADE', 299.00, 299.00, 'Platinum Plan Monthly Subscription (สมชาย)'),
(NULL, 'd0000001-0000-0000-0000-000000000002', 'SUBSCRIPTION_UPGRADE', 149.00, 149.00, 'Gold Plan Monthly Subscription (กัญญา)'),
(NULL, 'd0000001-0000-0000-0000-000000000004', 'AFFILIATE_COMMISSION', 340.00, 340.00, 'Agoda Booking Commission (Hotel Samet Villa 4% on 8,500 THB)');
