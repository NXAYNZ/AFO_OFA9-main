import { GoogleGenAI } from '@google/genai';
import {
  TripPlanOption,
  OtaComparison,
  SubscriptionTier,
  WeatherForecast,
  TripPreferences,
  ActivityItem,
  TripDayPlan,
} from './types';
import {
  buildPreferencePrompt,
  preferenceNotes,
  transportLabel,
  buildGroundedContext,
} from './tripPrompt';
import { optimizeDailyRoute, calculateTripFeasibility } from './tripOptimizer';
import { SAMPLE_KOH_SAMET_PLANS, SAMPLE_OTA_COMPARISONS } from './mockData';

export interface GenerateTripPlanParams {
  province: string;
  travelDates: string;
  totalBudget: number;
  travelersCount: number;
  travelStyle: string; // e.g., 'สายคาเฟ่', 'สายลุยธรรมชาติ', 'สายปาร์ตี้', 'สายประหยัด'
  tier: SubscriptionTier;
  weather: WeatherForecast;
  mustVisit?: string[]; // attractions picked on the Thailand map
  preferences?: TripPreferences;
}

export interface GeneratedTripResult {
  plans: TripPlanOption[];
  otaComparisons: OtaComparison[];
  generatedFrom: 'GEMINI_2.5_FLASH' | 'FALLBACK_SERVICE';
  estimatedSavings: number;
}

/**
 * Fallback generator for instant, ultra-realistic Thai trip plans without waiting for API keys
 * Grounded with real attractions from thailandTravel.ts and optimized with Haversine & 2-Opt
 */
function generateThaiFallbackPlans(params: GenerateTripPlanParams): GeneratedTripResult {
  const { province, totalBudget, travelersCount, travelStyle, tier, weather, mustVisit = [], preferences } = params;
  const prefNotes = preferences ? preferenceNotes(preferences) : [];
  const costPerPerson = Math.round(totalBudget / Math.max(1, travelersCount));
  const grounded = buildGroundedContext(province);

  // Determine how many plans to return based on Tier:
  // Free: 1, Gold: 3, Platinum: 5
  let maxPlans = 1;
  if (tier === 'GOLD') maxPlans = 3;
  if (tier === 'PLATINUM') maxPlans = 5;

  const realPlaceNames = grounded.realPlaces.map((p) => p.name);

  // Tailor default plans to requested province, real attractions, and budget
  const tailoredPlans: TripPlanOption[] = SAMPLE_KOH_SAMET_PLANS.slice(0, maxPlans).map(
    (basePlan, idx) => {
      const budgetFactor = costPerPerson / 3500 || 1;
      const calculatedCost = Math.round(basePlan.totalEstimatedCost * budgetFactor);

      // Customize title according to province & style
      let title = basePlan.title;
      if (!title.includes(province)) {
        title = `แผน ${String.fromCharCode(65 + idx)}: ทริป ${province} (${travelStyle}) - ฉบับ AI TripSure`;
      }

      // Map base days with real attractions, rainyDayBackup, and logicReason
      const enhancedDays: TripDayPlan[] = basePlan.days.map((day, dIdx) => {
        const activities: ActivityItem[] = day.activities.map((act, actIdx) => {
          let locationName = act.location;
          let placeTitle = act.title;

          // Swap in real province attractions if available
          const realIdx = (dIdx * 3 + actIdx) % Math.max(1, realPlaceNames.length);
          if (realPlaceNames.length > 0 && !act.title.includes('เดินทาง') && !act.title.includes('เช็คอิน')) {
            const picked = realPlaceNames[realIdx];
            placeTitle = `เที่ยวชม ${picked}`;
            locationName = `${picked} จ.${grounded.provinceTravel?.name || province}`;
          }

          const isOutdoor = /หาด|ทะเล|ดอย|เขา|น้ำตก|ชมวิว|เกาะ|เดินป่า/.test(placeTitle + act.description);
          const backup = isOutdoor
            ? `คาเฟ่สไตล์โฮมมี่และอาร์ตแกลเลอรีในร่ม ${province}`
            : `ศูนย์การค้าและตลาดหัตถกรรมในร่ม ${province}`;

          return {
            ...act,
            title: placeTitle,
            location: locationName,
            isIndoor: !isOutdoor,
            rainyDayBackup: backup,
            logicReason: actIdx === 0 ? 'เริ่มทริปยามเช้า อากาศกำลังสบาย ไม่ร้อน' : actIdx === 1 ? 'แวะทานมื้อเที่ยงและหลบแดดตอนบ่าย' : 'ชมบรรยากาศยามเย็นก่อนมื้อค่ำ',
          };
        });

        // Run 2-Opt Route Optimization on activities
        const optimizedActivities = optimizeDailyRoute(activities);

        return {
          ...day,
          activities: optimizedActivities,
        };
      });

      const draftPlan: TripPlanOption = {
        ...basePlan,
        id: `plan_${idx + 1}_${Date.now()}`,
        title,
        tagline: `ปรับแต่งตามสไตล์ "${travelStyle}" สำหรับ ${travelersCount} ท่าน งบประมาณรวม ${totalBudget.toLocaleString()} บาท`,
        targetVibe: travelStyle,
        ...(preferences ? { recommendedTransport: transportLabel(preferences.transport) } : {}),
        totalEstimatedCost: Math.min(calculatedCost, costPerPerson),
        estimatedSavings: Math.round(Math.min(calculatedCost, costPerPerson) * 0.18),
        days: enhancedDays,
        savingsTips: [
          ...(mustVisit.length > 0 ? [`จุดที่คุณเลือกจากแผนที่: ${mustVisit.join(', ')}`] : []),
          ...prefNotes,
          ...basePlan.savingsTips,
          `ช่วงเดินทางตรวจพบว่าเป็นช่วง ${weather.season} Season: แนะนำจองตั๋วและที่พักล่วงหน้าผ่าน OTA เพื่อรับส่วนลด 15-25%`,
          `คำแนะนำสภาพอากาศ: ${weather.advisory}`,
        ],
      };

      draftPlan.feasibilityScore = calculateTripFeasibility(draftPlan, totalBudget, travelersCount);
      return draftPlan;
    }
  );

  // If Platinum tier, add 2 extra bespoke plans if needed
  if (tier === 'PLATINUM' && tailoredPlans.length < 5) {
    const platDays1: TripDayPlan[] = tailoredPlans[0].days.map((d) => ({
      ...d,
      theme: `${d.theme} (ระดับ Exclusive VIP)`,
      activities: optimizeDailyRoute(d.activities),
    }));

    const platPlan1: TripPlanOption = {
      id: `plan_plat_1_${Date.now()}`,
      title: `แผน D: ลักชูรี่ พรีเมียม Private Retreat ใน ${province}`,
      tagline: 'พักวิลล่าระดับ 5 ดาว อาหารไฟน์ไดนิ่ง และรถรับส่งส่วนตัวตลอดทริป',
      targetVibe: 'ลักชูรี่ พรีเมียม',
      recommendedTransport: 'รถตู้ VIP ส่วนตัว หรือ สายการบินพรีเมียม',
      recommendedLodging: 'Luxury Pool Villa 5 ดาว',
      totalEstimatedCost: Math.round(costPerPerson * 1.3),
      estimatedSavings: Math.round(costPerPerson * 0.25),
      savingsTips: [
        'สิทธิพิเศษสมาชิก Platinum: ฟรีค่าธรรมเนียมจัดทริป Escrow 0%',
        'จองดีลตรงกับทางโรงแรมรับฟรี Afternoon Tea และเครดิตสปา',
      ],
      days: platDays1,
    };
    platPlan1.feasibilityScore = calculateTripFeasibility(platPlan1, totalBudget, travelersCount);
    tailoredPlans.push(platPlan1);

    const platPlan2: TripPlanOption = {
      id: `plan_plat_2_${Date.now()}`,
      title: `แผน E: อันซีนโลคอล & วัฒนธรรมพื้นบ้าน ${province}`,
      tagline: 'สัมผัสวิถีชุมชน เวิร์กช็อปทำอาหารท้องถิ่น และสนับสนุนชุมชนอย่างยั่งยืน',
      targetVibe: 'สาย Unseen & ชุมชน',
      recommendedTransport: 'เช่ารถยนต์ขับเที่ยวเอง หรือ สกูตเตอร์',
      recommendedLodging: 'โฮมสเตย์ชุมชนระดับพรีเมียม',
      totalEstimatedCost: Math.round(costPerPerson * 0.8),
      estimatedSavings: Math.round(costPerPerson * 0.2),
      savingsTips: [
        'อุดหนุนชุมชนโดยตรง ลดค่าคนกลาง',
        'ท่องเที่ยวช่วง Green Season ค่าที่พักถูกกว่า High Season ถึง 35%',
      ],
      days: platDays1,
    };
    platPlan2.feasibilityScore = calculateTripFeasibility(platPlan2, totalBudget, travelersCount);
    tailoredPlans.push(platPlan2);
  }

  // Adjust OTA comparison according to province
  const tailoredOta = SAMPLE_OTA_COMPARISONS.map((item) => ({
    ...item,
    name: item.name.replace('เกาะเสม็ด', province).replace('ระยอง', province),
  }));

  return {
    plans: tailoredPlans,
    otaComparisons: tailoredOta,
    generatedFrom: 'FALLBACK_SERVICE',
    estimatedSavings: tailoredPlans[0]?.estimatedSavings || 650,
  };
}

/**
 * Service to generate AI Trip Plan using Google Gen AI SDK (gemini-2.5-flash)
 * Automatically falls back to high-fidelity Thai mock plans if API key is not present.
 */
export async function generateAiTripPlan(
  params: GenerateTripPlanParams
): Promise<GeneratedTripResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('TripSure AI: No GEMINI_API_KEY provided. Utilizing Instant Thai Fallback Engine with Grounded RAG.');
    return generateThaiFallbackPlans(params);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let planCount = 1;
    if (params.tier === 'GOLD') planCount = 3;
    if (params.tier === 'PLATINUM') planCount = 5;

    const grounded = buildGroundedContext(params.province);

    const prompt = `
คุณคือสุดยอด AI สถาปนิกและผู้เชี่ยวชาญการวางแผนท่องเที่ยวประเทศไทยของระบบ "TripSure AI (ทริปชัวร์)"
จงสร้างแผนการท่องเที่ยวภาษาไทยอย่างละเอียด และคุ้มค่างบประมาณที่สุด

${grounded.groundingPrompt}

ข้อมูลความต้องการจากผู้ใช้:
- จังหวัดปลายทาง: ${params.province}
- วันที่เดินทาง: ${params.travelDates}
- สภาพอากาศและฤดูกาล: ${params.weather.season} Season (อุณหภูมิ ${params.weather.currentTemp}°C, ${
      params.weather.sevenDays[0]?.rainMm !== undefined
        ? `ปริมาณฝนวันนี้ ${params.weather.sevenDays[0].rainMm} มม. ตามพยากรณ์กรมอุตุนิยมวิทยา`
        : params.weather.rainMetric === 'area'
          ? `ฝนร้อยละ ${params.weather.rainProbability} ของพื้นที่ ตามพยากรณ์กรมอุตุนิยมวิทยา`
          : `โอกาสฝน ${params.weather.rainProbability}%`
    }, คำแนะนำ: ${params.weather.advisory})
- งบประมาณรวม: ${params.totalBudget.toLocaleString()} บาท
- จำนวนผู้ร่วมทริป: ${params.travelersCount} คน (งบเฉลี่ยประมาณ ${Math.round(params.totalBudget / Math.max(1, params.travelersCount))} บาท/คน)
- สไตล์การเที่ยว: ${params.travelStyle}
${params.mustVisit && params.mustVisit.length > 0 ? `- สถานที่ที่ผู้ใช้อยากไป (ต้องจัดลงในแผนทุกแห่ง เรียงเส้นทางให้เหมาะสม): ${params.mustVisit.join(', ')}\n` : ''}- สิทธิ์ตามระดับสมาชิก (Tier): ${params.tier} (สร้างจำนวน ${planCount} แผนการเดินทางที่แตกต่างกัน)
${
  params.preferences
    ? `
ความต้องการเฉพาะของกลุ่มนี้ (ต้องปฏิบัติตามทุกข้อ และสะท้อนในกิจกรรม เวลา ค่าใช้จ่าย และ savingsTips):
${buildPreferencePrompt(params.preferences, params.travelersCount, Math.round(params.totalBudget / Math.max(1, params.travelersCount)))}
`
    : ''
}
โปรดตอบกลับในรูปแบบ JSON อย่างเคร่งครัดตามโครงสร้างนี้เท่านั้น:
{
  "plans": [
    {
      "id": "plan_1",
      "title": "ชื่อแผนท่องเที่ยวภาษาไทยที่น่าสนใจ",
      "tagline": "คำโปรยสั้นๆ อธิบายความโดดเด่น",
      "targetVibe": "${params.travelStyle}",
      "recommendedTransport": "วิธีเดินทางที่แนะนำ",
      "recommendedLodging": "ประเภทหรือย่านที่พักที่คุ้มค่า",
      "totalEstimatedCost": 3500,
      "estimatedSavings": 600,
      "savingsTips": ["ทิปประหยัดเงินข้อที่ 1", "ทิปประหยัดเงินข้อที่ 2"],
      "days": [
        {
          "dayNumber": 1,
          "date": "วันที่ 1",
          "theme": "ธีมของวัน",
          "dailyBudget": 1200,
          "activities": [
            {
              "time": "09:00 - 11:30",
              "title": "ชื่อกิจกรรมหรือสถานที่",
              "description": "คำอธิบายละเอียด",
              "estimatedCost": 300,
              "category": "ATTRACTION",
              "location": "ชื่อสถานที่ใน ${params.province}",
              "isIndoor": false,
              "rainyDayBackup": "สถานที่สำรองในร่มหากฝนตกหรือมีฝุ่น",
              "logicReason": "เหตุผลที่เลือกสถานที่นี้ในเวลานี้"
            }
          ]
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(responseText);
    if (!parsedData.plans || !Array.isArray(parsedData.plans)) {
      throw new Error('Invalid JSON structure from Gemini response');
    }

    // Enhance plans with proper IDs, Route Optimization, and Feasibility Scores
    const validatedPlans: TripPlanOption[] = parsedData.plans.map(
      (p: any, idx: number) => {
        const rawDays: TripDayPlan[] = Array.isArray(p.days) ? p.days : SAMPLE_KOH_SAMET_PLANS[0].days;
        const optimizedDays: TripDayPlan[] = rawDays.map((d) => ({
          ...d,
          activities: optimizeDailyRoute(
            (d.activities || []).map((act: any) => ({
              ...act,
              rainyDayBackup: act.rainyDayBackup || `คาเฟ่ในร่ม ${params.province}`,
              logicReason: act.logicReason || 'ช่วงเวลาเดินทางเหมาะสม ไม่ย้อนศร',
            }))
          ),
        }));

        const planObj: TripPlanOption = {
          id: p.id || `plan_gemini_${idx + 1}`,
          title: p.title || `แผนที่ ${idx + 1}: ท่องเที่ยว ${params.province}`,
          tagline: p.tagline || `แผนการเดินทางแบบ ${params.travelStyle}`,
          targetVibe: p.targetVibe || params.travelStyle,
          recommendedTransport: p.recommendedTransport || 'รถยนต์ส่วนบุคคล หรือ รถตู้โดยสาร',
          recommendedLodging: p.recommendedLodging || 'โรงแรมหรือรีสอร์ตใจกลางเมือง',
          totalEstimatedCost: Number(p.totalEstimatedCost) || Math.round(params.totalBudget / Math.max(1, params.travelersCount)),
          estimatedSavings: Number(p.estimatedSavings) || Math.round(params.totalBudget * 0.15),
          savingsTips: Array.isArray(p.savingsTips) ? p.savingsTips : ['จองตั๋วและที่พักล่วงหน้าผ่าน TripSure เพื่อรับดีลราคาพิเศษ'],
          days: optimizedDays,
        };

        planObj.feasibilityScore = calculateTripFeasibility(planObj, params.totalBudget, params.travelersCount);
        return planObj;
      }
    );

    return {
      plans: validatedPlans,
      otaComparisons: SAMPLE_OTA_COMPARISONS.map((ota) => ({
        ...ota,
        name: ota.name.replace('เกาะเสม็ด', params.province),
      })),
      generatedFrom: 'GEMINI_2.5_FLASH',
      estimatedSavings: validatedPlans[0]?.estimatedSavings || 800,
    };
  } catch (err) {
    console.warn('Gemini 2.5 Flash API error, smoothly defaulting to Grounded Thai fallback:', err);
    return generateThaiFallbackPlans(params);
  }
}

