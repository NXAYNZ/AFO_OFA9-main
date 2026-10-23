import { GoogleGenAI } from '@google/genai';
import {
  TripPlanOption,
  OtaComparison,
  SubscriptionTier,
  WeatherForecast,
} from './types';
import { SAMPLE_KOH_SAMET_PLANS, SAMPLE_OTA_COMPARISONS } from './mockData';

export interface GenerateTripPlanParams {
  province: string;
  travelDates: string;
  totalBudget: number;
  travelersCount: number;
  travelStyle: string; // e.g., 'สายคาเฟ่', 'สายลุยธรรมชาติ', 'สายปาร์ตี้', 'สายประหยัด'
  tier: SubscriptionTier;
  weather: WeatherForecast;
}

export interface GeneratedTripResult {
  plans: TripPlanOption[];
  otaComparisons: OtaComparison[];
  generatedFrom: 'GEMINI_2.5_FLASH' | 'FALLBACK_SERVICE';
  estimatedSavings: number;
}

/**
 * Fallback generator for instant, ultra-realistic Thai trip plans without waiting for API keys
 */
function generateThaiFallbackPlans(params: GenerateTripPlanParams): GeneratedTripResult {
  const { province, totalBudget, travelersCount, travelStyle, tier, weather } = params;
  const costPerPerson = Math.round(totalBudget / Math.max(1, travelersCount));

  // Determine how many plans to return based on Tier:
  // Free: 1, Gold: 3, Platinum: 5
  let maxPlans = 1;
  if (tier === 'GOLD') maxPlans = 3;
  if (tier === 'PLATINUM') maxPlans = 5;

  // Tailor default plans to requested province and budget
  const tailoredPlans: TripPlanOption[] = SAMPLE_KOH_SAMET_PLANS.slice(0, maxPlans).map(
    (basePlan, idx) => {
      const budgetFactor = (costPerPerson / 3500) || 1;
      const calculatedCost = Math.round(basePlan.totalEstimatedCost * budgetFactor);

      // Customize title according to province & style
      let title = basePlan.title;
      if (!title.includes(province)) {
        title = `แผน ${String.fromCharCode(65 + idx)}: ทริป ${province} (${travelStyle}) - ฉบับ AI TripSure`;
      }

      return {
        ...basePlan,
        id: `plan_${idx + 1}_${Date.now()}`,
        title,
        tagline: `ปรับแต่งตามสไตล์ "${travelStyle}" สำหรับ ${travelersCount} ท่าน งบประมาณรวม ${totalBudget.toLocaleString()} บาท`,
        targetVibe: travelStyle,
        totalEstimatedCost: calculatedCost,
        estimatedSavings: Math.round(calculatedCost * 0.18),
        savingsTips: [
          ...basePlan.savingsTips,
          `ช่วงเดินทางตรวจพบว่าเป็นช่วง ${weather.season} Season: แนะนำจองตั๋วและที่พักล่วงหน้าผ่าน OTA เพื่อรับส่วนลด 15-25%`,
          `คำแนะนำสภาพอากาศ: ${weather.advisory}`,
        ],
      };
    }
  );

  // If Platinum tier, add 2 extra bespoke plans if needed
  if (tier === 'PLATINUM' && tailoredPlans.length < 5) {
    tailoredPlans.push({
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
      days: SAMPLE_KOH_SAMET_PLANS[0].days,
    });
    tailoredPlans.push({
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
      days: SAMPLE_KOH_SAMET_PLANS[0].days,
    });
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
    console.log('TripSure AI: No GEMINI_API_KEY provided. Utilizing Instant Thai Fallback Engine.');
    return generateThaiFallbackPlans(params);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let planCount = 1;
    if (params.tier === 'GOLD') planCount = 3;
    if (params.tier === 'PLATINUM') planCount = 5;

    const prompt = `
คุณคือสุดยอด AI สถาปนิกและผู้เชี่ยวชาญการวางแผนท่องเที่ยวประเทศไทยของระบบ "TripSure AI (ทริปชัวร์)"
จงสร้างแผนการท่องเที่ยวภาษาไทยอย่างละเอียด และคุ้มค่างบประมาณที่สุด

ข้อมูลความต้องการจากผู้ใช้:
- จังหวัดปลายทาง: ${params.province}
- วันที่เดินทาง: ${params.travelDates}
- สภาพอากาศและฤดูกาล: ${params.weather.season} Season (อุณหภูมิ ${params.weather.currentTemp}°C, โอกาสฝน ${params.weather.rainProbability}%, คำแนะนำ: ${params.weather.advisory})
- งบประมาณรวม: ${params.totalBudget.toLocaleString()} บาท
- จำนวนผู้ร่วมทริป: ${params.travelersCount} คน (งบเฉลี่ยประมาณ ${Math.round(params.totalBudget / Math.max(1, params.travelersCount))} บาท/คน)
- สไตล์การเที่ยว: ${params.travelStyle}
- สิทธิ์ตามระดับสมาชิก (Tier): ${params.tier} (สร้างจำนวน ${planCount} แผนการเดินทางที่แตกต่างกัน)

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
              "time": "09:00 - 12:00",
              "title": "ชื่อกิจกรรมหรือสถานที่",
              "description": "คำอธิบายละเอียด",
              "estimatedCost": 300,
              "category": "TRANSPORT",
              "location": "ชื่อสถานที่ใน ${params.province}"
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

    // Enhance plans with proper IDs and styling
    const validatedPlans: TripPlanOption[] = parsedData.plans.map(
      (p: any, idx: number) => ({
        id: p.id || `plan_gemini_${idx + 1}`,
        title: p.title || `แผนที่ ${idx + 1}: ท่องเที่ยว ${params.province}`,
        tagline: p.tagline || `แผนการเดินทางแบบ ${params.travelStyle}`,
        targetVibe: p.targetVibe || params.travelStyle,
        recommendedTransport: p.recommendedTransport || 'รถยนต์ส่วนบุคคล หรือ รถตู้โดยสาร',
        recommendedLodging: p.recommendedLodging || 'โรงแรมหรือรีสอร์ตใจกลางเมือง',
        totalEstimatedCost: Number(p.totalEstimatedCost) || Math.round(params.totalBudget / Math.max(1, params.travelersCount)),
        estimatedSavings: Number(p.estimatedSavings) || Math.round(params.totalBudget * 0.15),
        savingsTips: Array.isArray(p.savingsTips) ? p.savingsTips : ['จองตั๋วและที่พักล่วงหน้าผ่าน TripSure เพื่อรับดีลราคาพิเศษ'],
        days: Array.isArray(p.days) ? p.days : SAMPLE_KOH_SAMET_PLANS[0].days,
      })
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
    console.warn('Gemini 2.5 Flash API error, smoothly defaulting to Thai fallback:', err);
    return generateThaiFallbackPlans(params);
  }
}
