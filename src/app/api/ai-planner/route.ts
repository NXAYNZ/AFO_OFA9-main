import { NextRequest, NextResponse } from 'next/server';
import { generateAiTripPlan } from '@/lib/gemini';
import { getThailandWeather } from '@/lib/weather';
import { TIER_CONFIGS, SubscriptionTier, isQuotaExhausted } from '@/lib/types';
import { sanitizePreferences } from '@/lib/tripPrompt';

// In-Memory Rate Limiter: 10 requests per 15 minutes per IP
interface RateLimitRecord {
  timestamps: number[];
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { timestamps: [] };

  // Filter timestamps within the current sliding window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRateLimits.set(ip, { timestamps: activeTimestamps });
    return false; // Rate limit exceeded
  }

  activeTimestamps.push(now);
  ipRateLimits.set(ip, { timestamps: activeTimestamps });
  return true;
}

// Clean and truncate untrusted free-form text input
function sanitizeText(value: unknown, maxLength = 400): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          message: 'คุณเรียกใช้งานระบบ AI บ่อยเกินไป กรุณารอสักครู่ (จำกัดสูงสุด 10 ครั้งต่อ 15 นาที)',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawProvince = sanitizeText(body.province, 100) || 'เกาะเสม็ด จ.ระยอง';
    const rawDates = sanitizeText(body.travelDates, 100) || '14 - 16 พ.ย. 2026';
    const rawStyle = sanitizeText(body.travelStyle, 50) || 'สายคาเฟ่';

    const totalBudget = Math.min(1000000, Math.max(500, Number(body.totalBudget) || 10500));
    const travelersCount = Math.min(50, Math.max(1, Number(body.travelersCount) || 3));
    const currentQuotaUsed = Math.max(0, Number(body.currentQuotaUsed) || 0);

    const safePreferences = sanitizePreferences(body.preferences, travelersCount);

    // Attractions picked on the map: plain strings only, capped & sanitized
    const mustVisitList: string[] = Array.isArray(body.mustVisit)
      ? body.mustVisit
          .filter((s: unknown): s is string => typeof s === 'string')
          .map((s: string) => sanitizeText(s, 100))
          .filter((s: string) => s.length > 0)
          .slice(0, 15)
      : [];

    const tier = typeof body.tier === 'string' && body.tier in TIER_CONFIGS ? body.tier : 'FREE';
    const validatedTier = tier as SubscriptionTier;
    const tierConfig = TIER_CONFIGS[validatedTier];

    // Check Quota Paywall ("Make Me Money" Stream #1)
    if (isQuotaExhausted(validatedTier, currentQuotaUsed)) {
      return NextResponse.json(
        {
          success: false,
          quotaExceeded: true,
          message: `โควตาการใช้งาน AI รายเดือนของระดับ ${tierConfig.labelThai} หมดแล้ว (${currentQuotaUsed}/${tierConfig.maxQuotas} ครั้ง)`,
          tier: validatedTier,
          maxQuotas: tierConfig.maxQuotas,
        },
        { status: 403 }
      );
    }

    // 2. Fetch Real-time or Fallback Weather
    const weather = await getThailandWeather(rawProvince, rawDates);

    // 3. Generate Structured Trip Plan & OTA Comparisons via Gemini 2.5 Flash / Fallback
    const tripResult = await generateAiTripPlan({
      province: rawProvince,
      travelDates: rawDates,
      totalBudget,
      travelersCount,
      travelStyle: rawStyle,
      tier: validatedTier,
      weather,
      mustVisit: mustVisitList,
      preferences: safePreferences,
    });

    const newQuotaUsed = currentQuotaUsed + 1;
    // null = unlimited (Platinum)
    const remainingQuota = tierConfig.unlimitedQuota ? null : Math.max(0, tierConfig.maxQuotas - newQuotaUsed);

    return NextResponse.json({
      success: true,
      tripId: `trip_${Date.now()}`,
      province: rawProvince,
      travelDates: rawDates,
      travelStyle: rawStyle,
      travelersCount,
      totalBudget,
      season: weather.season,
      weather,
      plans: tripResult.plans,
      otaComparisons: tripResult.otaComparisons,
      estimatedSavings: tripResult.estimatedSavings,
      generatedFrom: tripResult.generatedFrom,
      tierUsed: validatedTier,
      quotaUsed: newQuotaUsed,
      remainingQuota,
      maxQuotas: tierConfig.unlimitedQuota ? null : tierConfig.maxQuotas,
      unlimitedQuota: tierConfig.unlimitedQuota,
    });
  } catch (error: any) {
    console.error('AI Planner route error:', error);
    // Mask internal server errors from leaking sensitive system info
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการประมวลผลแผนการเดินทาง กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    );
  }
}
