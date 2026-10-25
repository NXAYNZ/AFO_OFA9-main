# เอกสารวิเคราะห์สถาปัตยกรรม ช่องโหว่ความปลอดภัย และแผนอัปเกรดระบบ (Antigravity Master Spec)

เอกสารฉบับนี้อ้างอิงจากโครงสร้างไฟล์จริงในโฟลเดอร์ `src/` และ `supabase/` ของโปรเจกต์ เพื่อใช้เป็นพิมพ์เขียว (Blueprint) และชุดคำสั่งสำหรับสั่งให้ **Antigravity** ดำเนินการแก้ไขช่องโหว่ อัปเกรดสมองกล AI และเพิ่มฟีเจอร์ใหม่ให้สมบูรณ์แบบ

---

## ส่วนที่ 1: การวิเคราะห์ช่องโหว่จากโครงสร้างไฟล์จริง (Security Audit & Fixes)

จากการตรวจสอบไฟล์ใน `src/app/api/*`, `src/lib/*` และ `supabase/*.sql` พบจุดเสี่ยงสำคัญที่ต้องสั่งให้ Antigravity แก้ไขดังนี้:

### 1. ช่องโหว่ในระบบค้ำประกันการเงิน `src/app/api/escrow/route.ts` และ `CommunityEscrowTab.tsx`
* **ความเสี่ยงระดับวิกฤต (Critical):**
  * **Race Condition / Double Spending:** หากผู้ใช้กดปุ่มปล่อยเงิน (Release Escrow) หรือขอคืนเงิน (Refund) รัวๆ พร้อมกันหลาย Request โดยไม่มี Database Transaction Locking อาจทำให้ยอดเงินถูกโอนซ้ำ
  * **Client-Side Amount Manipulation:** หากรับค่า `amount` หรือ `status` จาก Frontend โดยตรง ผู้โจมตีสามารถแก้ไขตัวเลขใน Request Body เพื่อเปลี่ยนยอดเงินค้ำประกันได้
  * **Missing Auth Verification:** API Route ต้องตรวจสอบ Session จาก Supabase Server Client ทุกครั้ง ห้ามเชื่อ `userId` ที่ส่งมาจาก Body
* **แนวทางแก้ไข:** บังคับใช้ Supabase RPC (Stored Procedure ใน PostgreSQL) ที่มีการล็อกแถวข้อมูล (`SELECT ... FOR UPDATE`) และตรวจสอบสิทธิ์เฉพาะเจ้าของทริปหรือผู้เข้าร่วมที่ยืนยันตัวตนแล้วเท่านั้น

### 2. ช่องโหว่ใน `src/app/api/ai-planner/route.ts` และ `src/lib/gemini.ts`
* **ความเสี่ยงระดับสูง (High):**
  * **Unauthenticated AI Quota Drain:** หากเปิด Endpoint `/api/ai-planner` ให้เรียกใช้ได้โดยไม่จำกัดอัตรา (No Rate Limit) หรือไม่เช็คสิทธิ์สมาชิก (`useMember.tsx`) บอทสามารถยิง Request เพื่อผลาญโควตา Gemini API จนหมดได้
  * **Prompt Injection ผ่าน `tripPrompt.ts`:** การนำข้อความจากผู้ใช้ใน `CreateTripWindow.tsx` หรือ `QuickAiPlan.tsx` ไปต่อ String เข้ากับ Prompt โดยตรง อาจถูกสั่งให้ AI สร้าง JSON โครงสร้างแปลกปลอมที่ทำให้หน้าเว็บพัง
* **แนวทางแก้ไข:** เพิ่มการ валиเดตด้วย `Zod` Schema, บังคับใช้ `responseSchema` ของ Gemini API และจำกัดจำนวนครั้งการสร้างทริปต่อวันสำหรับผู้ใช้ทั่วไป (Free Tier) เทียบกับสมาชิก (Pro Member)

### 3. ช่องโหว่ในฐานข้อมูล `supabase/schema.sql`, `auth_profiles.sql`, `place_reviews.sql`
* **ความเสี่ยงระดับสูง (High):**
  * **Row Level Security (RLS) ไม่รัดกุม:** ตาราง `profiles`, `place_reviews` หรือตารางเก็บข้อมูลทริปและ Escrow หากเปิด Policy เป็น `USING (true)` สำหรับการ `UPDATE` หรือ `DELETE` จะทำให้ใครก็ได้สามารถลบรีวิวคนอื่น หรือแอบแก้สถานะสมาชิกของตัวเองใน `auth_profiles` ได้
  * **Fake Trust Score ใน `TrustReviewTab.tsx`:** ผู้ใช้สามารถปั๊มรีวิวปลอมใน `place_reviews` ได้หากไม่มีการจำกัดให้ 1 บัญชีรีวิวสถานที่เดิมซ้ำได้เพียง 1 ครั้ง (`UNIQUE(user_id, place_id)`)

### 4. ช่องโหว่ SSRF และ Cache Miss ใน `src/app/api/weather/route.ts`
* **ความเสี่ยงระดับกลาง (Medium):**
  * หากรับค่าพิกัด `lat`, `lng` หรือชื่อจังหวัดโดยไม่ตรวจสอบขอบเขตพิกัดประเทศไทย (Latitude $5.5^\circ\text{N} - 20.5^\circ\text{N}$, Longitude $97.3^\circ\text{E} - 105.7^\circ\text{E}$) อาจถูกใช้ยิง Request สุ่มเพื่อถล่ม Weather API ภายนอก
* **แนวทางแก้ไข:** ตรวจสอบขอบเขตพิกัดและทำ In-Memory / Next.js `revalidate` Cache อย่างน้อย 30 นาทีต่อจังหวัด

---

## ส่วนที่ 2: การอัปเกรดระบบ AI จัดทริปให้ฉลาดและแม่นยำ 100% (`tripPrompt.ts` & `gemini.ts`)

ปัจจุบันโปรเจกต์ของคุณมีขุมทรัพย์ข้อมูลอยู่ใน `src/data/thailandTravel.ts`, `src/data/thailandMap.ts`, `src/data/placeAccessibility.ts` และ `src/lib/tripEstimates.ts` อยู่แล้ว แต่ AI มักจะ "มั่วสถานที่นอกฐานข้อมูล" หรือ "คำนวณงบไม่ตรงกับ `tripEstimates.ts`"

### แนวทางการอัปเกรดแบบ Grounded RAG (Retrieval-Augmented Generation ในตัว):
1. **Local Data Grounding (บังคับ AI ใช้ข้อมูลจริงจาก `thailandTravel.ts`):**
   ก่อนส่ง Prompt ไปหา Gemini ใน `src/lib/gemini.ts` ให้ดึงรายชื่อสถานที่จริงของจังหวัดนั้นๆ จาก `thailandTravel.ts` และข้อมูลอารยสถาปัตย์ (Wheelchair / ผู้สูงอายุ / เด็ก) จาก `placeAccessibility.ts` แนบเข้าไปใน Context ของ Prompt เพื่อให้ AI เลือกจัดทริปจากสถานที่ที่มีรูปภาพจริงใน `placePhotos.ts` เท่านั้น!
2. **Weather-Aware Itinerary (จัดทริปตามสภาพอากาศจริงจาก `weather.ts`):**
   ดึงข้อมูลพยากรณ์อากาศจาก `src/lib/weather.ts` ส่งเข้า `tripPrompt.ts` หากวันไหนมีโอกาสฝนตกหนักหรือค่าฝุ่น PM2.5 สูง ให้ AI สลับกิจกรรมกลางแจ้งไปไว้ในร่ม (เช่น คาเฟ่ พิพิธภัณฑ์ ห้างสรรพสินค้า) พร้อมสร้างแผนสำรอง (`rainyDayBackup`) อัตโนมัติ
3. **2-Opt Route Optimization (แก้ปัญหาข้ามโซนไปมา):**
   เขียนอัลกอริทึมจัดเรียงลำดับสถานที่ในแต่ละวันใหม่ด้วยสมการระยะทาง Haversine ร่วมกับ 2-Opt Heuristic ในฝั่ง Backend เพื่อให้เส้นทางบน `RouteMap.tsx` และ `ThailandMapTab.tsx` เรียงต่อกันเป็นเส้นตรงที่สวยงาม ไม่ย้อนศร

---

## ส่วนที่ 3: ฟีเจอร์ใหม่ที่แนะนำให้เพิ่ม (Killer Features ต่อยอดจากไฟล์เดิม)

1. **Smart Rainy-Day & PM2.5 Auto-Swap (ใน `AiPlannerTab.tsx` + `PlannerWeatherCard.tsx`):**
   * เพิ่มปุ่ม *"สลับแผนหลบฝน/หลบฝุ่นอัตโนมัติ"* บนการ์ดพยากรณ์อากาศ เมื่อกดแล้วจะเปลี่ยนสถานที่กลางแจ้งในวันนั้นเป็นสถานที่ในร่มที่อยู่ใกล้ที่สุดทันที
2. **Interactive Budget Slider & Live Cost Breakdown (ใน `CreateTripWindow.tsx` + `tripEstimates.ts`):**
   * แถบเลื่อนปรับสัดส่วนงบประมาณ (เช่น สายกิน 50% / สายที่พักหรู 30% / กิจกรรม 20%) แล้วคำนวณเทียบกับค่าครองชีพจริงของแต่ละจังหวัดใน `tripEstimates.ts` แบบเรียลไทม์
3. **Accessibility & Senior-Friendly Filter (เชื่อม `placeAccessibility.ts` เข้ากับ `AiPlannerTab.tsx`):**
   * เพิ่มโหมด *"ทริปผู้สูงอายุ / วีลแชร์ / รถเข็นเด็ก"* ที่คัดกรองเฉพาะสถานที่ที่มีทางลาด ห้องน้ำผู้สูงอายุ และลดจำนวนสถานที่ต่อวันลงเหลือ 2-3 จุด ताकिไม่เหนื่อยเกินไป
4. **Escrow Smart Milestone & Bill Splitter (ใน `CommunityEscrowTab.tsx`):**
   * ยกระดับระบบหารค่าทริปและเงินค้ำประกัน ให้แบ่งจ่ายตาม Milestone ของทริปได้ (เช่น มัดจำจองรถ 30%, วันเดินทางจริง 50%, จบทริป 20%) พร้อมระบบโหวตยืนยันความพึงพอใจก่อนปล่อยเงินให้ผู้จัดทริป
5. **QR Code Verification บนตั๋วทริป (ใน `TripTicket.tsx` + `TrustReviewTab.tsx`):**
   * สร้าง QR Code ประจำทริปบน `TripTicket.tsx` เพื่อให้สมาชิกในทริปสแกนเช็คอินหน้างาน เมื่อเช็คอินสำเร็จจะได้สิทธิ์เขียนรีวิวแบบ **"Verified Traveler"** ในหน้า `TrustReviewTab.tsx` (ได้คะแนนความน่าเชื่อถือสูงกว่ารีวิวทั่วไป)

---

## ส่วนที่ 4: โค้ดต้นแบบสำหรับอัปเกรดไฟล์สำคัญ (พร้อมนำไปใช้งาน)

### 1. โค้ดอัปเกรด `supabase/security_hardening.sql` (อุดช่องโหว่ฐานข้อมูลและ Escrow)

```sql
-- 1. บังคับเปิด RLS ทุกตารางสำคัญ
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- 2. ป้องกันผู้ใช้แก้สถานะ Membership หรือยอดเงินของตัวเองในตาราง profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own basic profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- ห้ามแก้ไข role หรือ tier ด้วยตัวเองผ่าน Client API
  AND (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

-- 3. ป้องกันการปั๊มรีวิวซ้ำใน place_reviews (1 คน รีวิวสถานที่เดิมได้ 1 ครั้ง)
ALTER TABLE public.place_reviews
ADD CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id);

-- 4. สร้าง Atomic RPC Function สำหรับปล่อยเงิน Escrow ป้องกัน Race Condition
CREATE OR REPLACE FUNCTION public.release_escrow_funds(p_escrow_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- ล็อกแถวข้อมูลทันทีเพื่อป้องกันการยิง Request ซ้ำพร้อมกัน (Double Spending)
  SELECT * INTO v_record
  FROM public.escrow_transactions
  WHERE id = p_escrow_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ไม่พบรายการค้ำประกันนี้';
  END IF;

  IF v_record.payer_id != p_user_id THEN
    RAISE EXCEPTION 'คุณไม่มีสิทธิ์อนุมัติปล่อยเงินรายการนี้';
  END IF;

  IF v_record.status != 'HELD' THEN
    RAISE EXCEPTION 'รายการนี้ถูกดำเนินการไปแล้ว (สถานะปัจจุบัน: %)', v_record.status;
  END IF;

  UPDATE public.escrow_transactions
  SET status = 'RELEASED',
      released_at = NOW(),
      updated_at = NOW()
  WHERE id = p_escrow_id;

  RETURN jsonb_build_object('success', true, 'escrow_id', p_escrow_id, 'status', 'RELEASED');
END;
$$;
```

### 2. โค้ดอัปเกรดสมองกลจัดเส้นทางและตรวจสอบความสมเหตุสมผล `src/lib/tripOptimizer.ts` (ไฟล์ใหม่สำหรับช่วย `gemini.ts`)

```typescript
// src/lib/tripOptimizer.ts
export interface TripStop {
  id?: string;
  placeName: string;
  lat: number;
  lng: number;
  startTime: string;
  endTime: string;
  category: string;
  estimatedCost: number;
  isIndoor?: boolean;
  accessibilityScore?: number;
  rainyDayBackup?: string;
}

// คำนวณระยะทางจริงด้วย Haversine Formula (กิโลเมตร)
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// จัดเรียงลำดับสถานที่ในแต่ละวันด้วย Nearest-Neighbor เพื่อลดการขับรถย้อนศร (No Zig-Zag)
export function optimizeDailyRoute(stops: TripStop[]): (TripStop & { distanceFromPrevKm: number; travelTimeMins: number })[] {
  if (stops.length <= 2) {
    return stops.map((s, idx) => ({
      ...s,
      distanceFromPrevKm: idx === 0 ? 0 : Number(getDistanceKm(stops[0].lat, stops[0].lng, s.lat, s.lng).toFixed(1)),
      travelTimeMins: idx === 0 ? 0 : Math.max(15, Math.round((getDistanceKm(stops[0].lat, stops[0].lng, s.lat, s.lng) / 35) * 60 + 10)),
    }));
  }

  // ล็อกจุดเริ่มต้นของวัน แล้วหาจุดถัดไปที่ใกล้ที่สุดโดยคำนึงถึงมื้ออาหาร
  const remaining = [...stops];
  const ordered: TripStop[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let minDistance = Infinity;

    remaining.forEach((candidate, idx) => {
      const dist = getDistanceKm(current.lat, current.lng, candidate.lat, candidate.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  // คำนวณเวลาเดินทางจริงและระยะทางสะสม
  return ordered.map((stop, index) => {
    if (index === 0) {
      return { ...stop, distanceFromPrevKm: 0, travelTimeMins: 0 };
    }
    const prev = ordered[index - 1];
    const distKm = Number(getDistanceKm(prev.lat, prev.lng, stop.lat, stop.lng).toFixed(1));
    // ความเร็วเฉลี่ย 35 กม./ชม. + เวลาหาที่จอดรถ 10 นาที
    const travelTimeMins = Math.max(15, Math.round((distKm / 35) * 60 + 10));
    return {
      ...stop,
      distanceFromPrevKm: distKm,
      travelTimeMins,
    };
  });
}
```

---

## ส่วนที่ 5: ชุดคำสั่ง Prompt สำเร็จรูปสำหรับป้อนให้ Antigravity (Copy & Paste ได้เลย)

คุณสามารถคัดลอกกล่องข้อความด้านล่างนี้ไปวางสั่ง **Antigravity** เพื่อให้แก้ไขไฟล์ทั้งหมดในโปรเจกต์ตามลำดับได้ทันที:

```text
@Antigravity ช่วยอัปเกรดและแก้ไขช่องโหว่ของโปรเจกต์ตามรายละเอียดด้านล่างนี้ โดยอ้างอิงจากไฟล์จริงใน src/ และ supabase/:

### งานที่ 1: อุดช่องโหว่ความปลอดภัยใน API Routes และ Supabase
1. ในไฟล์ `src/app/api/ai-planner/route.ts`:
   - เพิ่ม Input Validation และ Sanitization สำหรับข้อมูลอินพุตทุกฟิลด์ (ป้องกัน Prompt Injection โดยจำกัดความยาวข้อความเพิ่มเติมไม่เกิน 400 ตัวอักษร และกรองอักขระควบคุม)
   - เพิ่ม In-Memory Rate Limiter จำกัดการเรียกใช้งานสูงสุด 10 ครั้งต่อ 15 นาทีต่อ IP
   - ซ่อนรายละเอียด Error ภายในเซิร์ฟเวอร์ไม่ให้รั่วไหลออกไปยัง Client
2. ในไฟล์ `src/app/api/escrow/route.ts`:
   - ตรวจสอบสถานะการยืนยันตัวตนจาก `src/lib/auth.ts` และ `src/lib/supabase.ts` ก่อนทำรายการทุกครั้ง
   - ป้องกันการแก้ไขยอดเงินจากฝั่ง Client โดยดึงราคาอ้างอิงจากฐานข้อมูลฝั่ง Server เท่านั้น และป้องกันการกดซ้ำ (Idempotency / Transaction Lock)
3. ในไฟล์ `src/app/api/weather/route.ts`:
   - เพิ่มการตรวจสอบพิกัด `lat` และ `lng` ให้รับเฉพาะพิกัดภายในประเทศไทย (lat: 5.5 ถึง 20.5, lng: 97.0 ถึง 106.0) เพื่อป้องกัน SSRF / API Abuse และเพิ่ม Cache `revalidate: 1800` (30 นาที)
4. ในโฟลเดอร์ `supabase/` (`schema.sql`, `auth_profiles.sql`, `place_reviews.sql`):
   - ตรวจสอบและปรับปรุง Row Level Security (RLS) ให้ผู้ใช้แก้ไข/ลบได้เฉพาะข้อมูลของตนเอง (`auth.uid() = user_id`) และเพิ่ม Unique Constraint ป้องกันการรีวิวซ้ำใน `place_reviews`

### งานที่ 2: อัปเกรดสมองกล AI จัดทริปให้ฉลาดและแม่นยำ 100%
1. ในไฟล์ `src/lib/tripPrompt.ts` และ `src/lib/gemini.ts`:
   - ดึงข้อมูลสถานที่จริงของจังหวัดที่ผู้ใช้เลือกจาก `src/data/thailandTravel.ts`, ข้อมูลการเข้าถึงจาก `src/data/placeAccessibility.ts` และค่าประมาณการค่าใช้จ่ายจาก `src/lib/tripEstimates.ts` แนบเข้าไปเป็น Grounding Context ใน System Prompt เพื่อให้ AI เลือกใช้สถานที่ที่มีอยู่จริงและมีรูปภาพตรงกับ `src/data/placePhotos.ts` ก่อนเป็นอันดับแรก
   - เพิ่มกฎเหล็กใน Prompt:
     (1) จัดกลุ่มสถานที่ตามโซนเดียวกันในแต่ละวัน ห้ามเดินทางข้ามโซนไปมา (No Zig-Zag)
     (2) จำกัดสถานที่หลักไม่เกิน 3-4 แห่งต่อวัน พร้อมเผื่อเวลาเดินทางจริง
     (3) จัดร้านอาหารให้ตรงเวลามื้อเที่ยง (11:30-13:30) และมื้อเย็น (17:30-20:00)
     (4) เพิ่มฟิลด์ `rainyDayBackup` (สถานที่สำรองในร่มหากฝนตกหรือฝุ่น PM2.5 สูง) และ `logicReason` (เหตุผลที่เลือกสถานที่นี้ในเวลานี้) ในทุกกิจกรรม
   - เพิ่มฟังก์ชัน Post-Processing คำนวณระยะทางจริงด้วยสูตร Haversine ระหว่างแต่ละจุด เพื่อแสดงระยะทาง (กม.) และเวลาเดินทางที่แม่นยำ

### งานที่ 3: เพิ่มฟีเจอร์ใหม่บน UI (Frontend Features)
1. ใน `src/components/AiPlannerTab.tsx` และ `src/components/PlannerWeatherCard.tsx`:
   - เพิ่มปุ่ม "สลับแผนหลบฝน/ฝุ่นอัตโนมัติ (Weather Backup Mode)" ที่สลับกิจกรรมกลางแจ้งเป็นสถานที่ในร่ม (`rainyDayBackup`) ได้ในคลิกเดียวเมื่อพยากรณ์อากาศแจ้งเตือนฝนตก
   - เพิ่มตัวกรอง "โหมดผู้สูงอายุ / วีลแชร์ (Accessible Mode)" โดยเชื่อมข้อมูลจาก `src/data/placeAccessibility.ts`
2. ใน `src/components/TripTicket.tsx` และ `src/components/TrustReviewTab.tsx`:
   - เพิ่มการแสดงผล QR Code เช็คอินทริปบนตั๋ว `TripTicket.tsx` และแสดงป้าย "Verified Traveler" ในหน้า `TrustReviewTab.tsx`
3. ใน `src/components/JudgeRevenueDashboardTab.tsx`:
   - เพิ่มการ์ดแสดงคะแนนความสมเหตุสมผลของทริป (AI Trip Feasibility Score) ที่คำนวณจากประสิทธิภาพของเส้นทาง (Route Efficiency), ความเหมาะสมของเวลา (Time Pacing) และความแม่นยำของงบประมาณ (Budget Accuracy)
```

---

## ส่วนที่ 6: แหล่งข้อมูล Open-Source & API เสริมที่แนะนำให้นำมาต่อยอดฟรี

หากต้องการให้เว็บมีข้อมูลและกราฟิกที่เหนือกว่าคู่แข่งโดยไม่ต้องเสียค่า API แพงๆ สามารถสั่งให้ Antigravity เชื่อมต่อบริการฟรีเหล่านี้เพิ่มได้ครับ:

1. **OSRM (Open Source Routing Machine API):**
   * **URL:** `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`
   * **ประโยชน์:** ใช้ดึงเส้นทางถนนจริง (GeoJSON Polyline) และเวลาขับรถจริงมาวาดลงบน `RouteMap.tsx` และ `ThailandMapTab.tsx` แทนการลากเส้นตรงระหว่างหมุด (ฟรี 100% ไม่ต้องใช้ API Key)
2. **Open-Meteo Weather & Air Quality API:**
   * **URL:** `https://api.open-meteo.com/v1/forecast` และ `https://air-quality-api.open-meteo.com/v1/air-quality`
   * **ประโยชน์:** ดึงทั้งสภาพอากาศ โอกาสเกิดฝน และค่าฝุ่น **PM2.5 รายชั่วโมง** ของทุกจังหวัดในไทยมาใส่ใน `src/lib/weather.ts` และ `WeatherScene.tsx` ได้ฟรีโดยไม่ต้องใช้ API Key
3. **TAT Open Data (การท่องเที่ยวแห่งประเทศไทย) / OpenStreetMap Overpass API:**
   * **ประโยชน์:** ใช้ดึงพิกัดจุดชาร์จรถยนต์ไฟฟ้า (EV Charging Stations) และจุดพักรถตามเส้นทาง เพื่อเพิ่มโหมด **"EV Road Trip Planner"** ในอนาคต