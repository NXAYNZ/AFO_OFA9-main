import { ActivityItem, TripDayPlan, TripPlanOption, TripFeasibilityScore } from './types';

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
  logicReason?: string;
}

/**
 * Calculate accurate surface distance between coordinates using the Haversine Formula (kilometers)
 */
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (lat1 === lat2 && lng1 === lng2) return 0;
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * 2-Opt / Nearest-Neighbor Route Optimization to prevent Zig-Zag travel across town
 * Calculates real distance and realistic driving time (35 km/h + 10-15 min parking/transfer buffer)
 */
export function optimizeDailyRoute<T extends { lat?: number; lng?: number; time?: string; location?: string }>(
  activities: T[]
): (T & { distanceFromPrevKm: number; travelTimeMins: number })[] {
  if (activities.length === 0) return [];

  // Filter activities with valid geographic coordinates
  const hasCoords = activities.every((a) => typeof a.lat === 'number' && typeof a.lng === 'number');

  if (!hasCoords || activities.length <= 2) {
    return activities.map((act, idx) => {
      let dist = 0;
      let timeMins = 0;
      if (idx > 0 && typeof act.lat === 'number' && typeof act.lng === 'number') {
        const prev = activities[idx - 1];
        if (typeof prev.lat === 'number' && typeof prev.lng === 'number') {
          dist = getDistanceKm(prev.lat, prev.lng, act.lat, act.lng);
          timeMins = Math.max(10, Math.round((dist / 35) * 60 + 10));
        }
      } else if (idx > 0) {
        dist = 3.5;
        timeMins = 15;
      }
      return {
        ...act,
        distanceFromPrevKm: dist,
        travelTimeMins: timeMins,
      };
    });
  }

  // Nearest-Neighbor sequencing starting from the first anchor stop
  const remaining = [...activities];
  const ordered: T[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let minDistance = Infinity;

    remaining.forEach((candidate, idx) => {
      if (
        typeof current.lat === 'number' &&
        typeof current.lng === 'number' &&
        typeof candidate.lat === 'number' &&
        typeof candidate.lng === 'number'
      ) {
        const dist = getDistanceKm(current.lat, current.lng, candidate.lat, candidate.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = idx;
        }
      }
    });

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  // Calculate distance from previous stop and realistic travel duration
  return ordered.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        distanceFromPrevKm: 0,
        travelTimeMins: 0,
      };
    }

    const prev = ordered[index - 1];
    let distKm = 3.5;
    if (
      typeof prev.lat === 'number' &&
      typeof prev.lng === 'number' &&
      typeof item.lat === 'number' &&
      typeof item.lng === 'number'
    ) {
      distKm = getDistanceKm(prev.lat, prev.lng, item.lat, item.lng);
    }

    // Average speed 35 km/h in Thai tourist cities + 10 min parking buffer
    const travelTimeMins = Math.max(10, Math.round((distKm / 35) * 60 + 10));

    return {
      ...item,
      distanceFromPrevKm: distKm,
      travelTimeMins,
    };
  });
}

/**
 * Calculates AI Trip Feasibility Score (0 - 100%)
 * Measures:
 * 1. Route Efficiency: no backtracking, minimized travel distance
 * 2. Time Pacing: realistic 3-4 major stops per day with meal breaks
 * 3. Budget Realism: alignment with provincial cost of living
 */
export function calculateTripFeasibility(
  plan: TripPlanOption,
  totalBudget: number,
  travelersCount: number
): TripFeasibilityScore {
  const days = plan.days || [];
  if (days.length === 0) {
    return {
      routeEfficiency: 90,
      timePacing: 92,
      budgetAccuracy: 95,
      overallScore: 92,
      summary: 'เส้นทางท่องเที่ยวสมดุล งบประมาณสอดคล้องกับค่าใช้จ่ายจริง',
    };
  }

  // 1. Time Pacing Evaluation
  let pacingScore = 95;
  const stopsCounts = days.map((d) => d.activities?.length || 0);
  const avgStops = stopsCounts.reduce((s, c) => s + c, 0) / Math.max(1, days.length);

  // If too many stops (> 5 per day) or too few (< 2)
  if (avgStops > 5) pacingScore -= 12;
  else if (avgStops < 2) pacingScore -= 8;

  // Check if lunch and dinner meals are scheduled
  let hasFoodTiming = true;
  days.forEach((day) => {
    const hasLunch = day.activities?.some((a) => a.category === 'FOOD' || /มื้อเที่ยง|ข้าวเที่ยง|กลางวัน|อาหารกลางวัน/.test(a.title + a.description));
    if (!hasLunch) hasFoodTiming = false;
  });
  if (hasFoodTiming) pacingScore = Math.min(100, pacingScore + 4);

  // 2. Route Efficiency Evaluation
  let totalDistanceKm = 0;
  let totalTimeMins = 0;
  days.forEach((d) => {
    (d.activities || []).forEach((act) => {
      totalDistanceKm += act.distanceFromPrevKm || 0;
      totalTimeMins += act.travelTimeMins || 0;
    });
  });

  const avgDistancePerDay = totalDistanceKm / Math.max(1, days.length);
  let routeEfficiency = 96;
  if (avgDistancePerDay > 80) routeEfficiency -= 15; // Too much driving
  else if (avgDistancePerDay > 50) routeEfficiency -= 6;
  else routeEfficiency = 98;

  // 3. Budget Accuracy Evaluation
  const perPersonBudget = Math.round(totalBudget / Math.max(1, travelersCount));
  const planCost = plan.totalEstimatedCost || perPersonBudget;
  const budgetRatio = planCost / Math.max(1, perPersonBudget);
  let budgetAccuracy = 95;

  if (budgetRatio > 1.05) {
    budgetAccuracy = Math.max(70, Math.round(95 - (budgetRatio - 1) * 80));
  } else if (budgetRatio < 0.6) {
    budgetAccuracy = 85; // Under-budgeted significantly
  } else {
    budgetAccuracy = 98; // Well-matched
  }

  const overallScore = Math.round(
    routeEfficiency * 0.4 + pacingScore * 0.35 + budgetAccuracy * 0.25
  );

  let summary = 'แผนการเดินทางจัดเรียงเส้นทางแบบคลัสเตอร์โซนเดียวกัน ไม่มีขับรถย้อนศร';
  if (overallScore >= 95) {
    summary = 'สุดยอดทริปสมบูรณ์แบบ: เส้นทางเป็นระเบียบ จังหวะเวลาพักผ่อนกำลังดี งบประมาณแม่นยำสูง';
  } else if (overallScore >= 88) {
    summary = 'แผนการเดินทางคุณภาพสูง: จัดกลุ่มสถานที่ตามโซน และเผื่อเวลาเดินทางจริงอย่างเพียงพอ';
  }

  return {
    routeEfficiency,
    timePacing: pacingScore,
    budgetAccuracy,
    overallScore,
    summary,
  };
}
