import { NextRequest, NextResponse } from 'next/server';
import { generateAiTripPlan } from '@/lib/gemini';
import { getThailandWeather } from '@/lib/weather';
import { TIER_CONFIGS, SubscriptionTier, isQuotaExhausted } from '@/lib/types';
import { sanitizePreferences } from '@/lib/tripPrompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      province = 'เกาะเสม็ด จ.ระยอง',
      travelDates = '14 - 16 พ.ย. 2026',
      totalBudget = 10500,
      travelersCount = 3,
      travelStyle = 'สายคาเฟ่',
      tier = 'FREE',
      currentQuotaUsed = 0,
      mustVisit = [],
      preferences,
    } = body;
    const safePreferences = sanitizePreferences(preferences, Math.max(1, Number(travelersCount) || 1));

    // Attractions picked on the map: plain strings only, capped to keep the prompt small
    const mustVisitList: string[] = Array.isArray(mustVisit)
      ? mustVisit.filter((s: unknown): s is string => typeof s === 'string').map((s) => s.slice(0, 80)).slice(0, 15)
      : [];

    const validatedTier = (tier in TIER_CONFIGS ? tier : 'FREE') as SubscriptionTier;
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

    // 1. Fetch Real-time or Fallback Weather
    const weather = await getThailandWeather(province, travelDates);

    // 2. Generate Structured Trip Plan & OTA Comparisons via Gemini 2.5 Flash / Fallback
    const tripResult = await generateAiTripPlan({
      province,
      travelDates,
      totalBudget: Number(totalBudget),
      travelersCount: Number(travelersCount),
      travelStyle,
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
      province,
      travelDates,
      travelStyle,
      travelersCount: Number(travelersCount),
      totalBudget: Number(totalBudget),
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
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลแผนการเดินทาง',
      },
      { status: 500 }
    );
  }
}
