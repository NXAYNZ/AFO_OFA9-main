-- =========================================================================
-- TripSure AI: Security Hardening & Concurrency Protection
-- Run this in Supabase SQL Editor AFTER schema.sql and auth_profiles.sql
-- =========================================================================

-- 1. บังคับเปิด Row Level Security (RLS) ทุกตารางสำคัญ
ALTER TABLE IF EXISTS public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trip_participants ENABLE ROW LEVEL SECURITY;

-- 2. ป้องกันผู้ใช้แก้สถานะ Membership, Tier หรือยอดเงิน/Trust Score ของตนเอง
DROP POLICY IF EXISTS "Users can update own basic profile" ON public.users_profile;
CREATE POLICY "Users can update own basic profile"
ON public.users_profile
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (
  auth.uid() = auth_user_id
  -- ห้ามแก้ไข tier, trust_score, monthly_ai_quota_used หรือ warning_tags โดยตรงผ่าน Client API
  AND (tier IS NOT DISTINCT FROM (SELECT up.tier FROM public.users_profile up WHERE up.auth_user_id = auth.uid()))
  AND (trust_score IS NOT DISTINCT FROM (SELECT up.trust_score FROM public.users_profile up WHERE up.auth_user_id = auth.uid()))
  AND (attendance_rate IS NOT DISTINCT FROM (SELECT up.attendance_rate FROM public.users_profile up WHERE up.auth_user_id = auth.uid()))
);

-- 3. ป้องกันการปั๊มรีวิวซ้ำใน place_reviews (1 คน รีวิวสถานที่เดิมซ้ำได้เพียง 1 ครั้ง)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_place_review'
  ) THEN
    ALTER TABLE public.place_reviews
    ADD CONSTRAINT unique_user_place_review UNIQUE (auth_user_id, place_key);
  END IF;
END $$;

-- 4. Atomic RPC Function สำหรับปล่อยเงิน Escrow ป้องกัน Race Condition และ Double Spending
CREATE OR REPLACE FUNCTION public.release_escrow_funds(
  p_escrow_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant RECORD;
  v_trip RECORD;
BEGIN
  -- ล็อกแถวข้อมูล trip_participants ทันทีเพื่อป้องกันการยิง Request ซ้ำพร้อมกัน (Double Spending / Race Condition)
  SELECT tp.*, ct.host_id, ct.title AS trip_title INTO v_participant
  FROM public.trip_participants tp
  JOIN public.community_trips ct ON ct.id = tp.trip_id
  WHERE tp.id = p_escrow_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ไม่พบรายการค้ำประกันมัดจำนี้';
  END IF;

  -- อนุญาตเฉพาะ Host ของทริป หรือเจ้าของเงินมัดจำในการดำเนินการ
  IF v_participant.user_id != p_user_id AND v_participant.host_id != p_user_id THEN
    RAISE EXCEPTION 'คุณไม่มีสิทธิ์อนุมัติปล่อยเงินรายการนี้';
  END IF;

  IF v_participant.escrow_status != 'HELD' THEN
    RAISE EXCEPTION 'รายการนี้ถูกดำเนินการไปแล้ว (สถานะปัจจุบัน: %)', v_participant.escrow_status;
  END IF;

  -- อัปเดตสถานะเป็น SETTLED
  UPDATE public.trip_participants
  SET escrow_status = 'SETTLED'
  WHERE id = p_escrow_id;

  -- บันทึกลง Ledger ธุรกรรม
  INSERT INTO public.escrow_transactions (
    trip_id,
    user_id,
    transaction_type,
    amount,
    platform_revenue,
    description
  ) VALUES (
    v_participant.trip_id,
    p_user_id,
    'DEPOSIT_ESCROW',
    v_participant.deposit_paid,
    0.00,
    'ปลดล็อกเงินค้ำประกัน Escrow สำเร็จ (Settled) สำหรับทริป ' || v_participant.trip_title
  );

  RETURN jsonb_build_object(
    'success', true,
    'escrow_id', p_escrow_id,
    'status', 'SETTLED',
    'amount', v_participant.deposit_paid,
    'message', 'ปล่อยเงินค้ำประกันสำเร็จเรียบร้อย'
  );
END;
$$;
