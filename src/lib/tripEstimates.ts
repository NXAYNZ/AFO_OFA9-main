// Rough, rule-based estimates for the Thailand map: trip budget and crowd level.
// These are NOT live data; the UI labels them as estimates.
import { ProvinceTravel, AttractionCategory } from '@/data/thailandTravel';

const BANGKOK = { lat: 13.7563, lon: 100.5018 };

// Provinces with heavy tourist traffic: higher prices and bigger crowds
const HOTSPOTS = new Set([
  'กรุงเทพมหานคร', 'ชลบุรี', 'ภูเก็ต', 'เชียงใหม่', 'กระบี่', 'สุราษฎร์ธานี', 'ประจวบคีรีขันธ์', 'พังงา',
  'พระนครศรีอยุธยา', 'กาญจนบุรี', 'ระยอง', 'เพชรบุรี', 'นครราชสีมา', 'สมุทรสงคราม', 'เชียงราย', 'ตราด',
  'แม่ฮ่องสอน', 'สตูล',
]);
// Island-heavy provinces: boat transfers add to activity costs
const ISLAND_PROVINCES = new Set(['ภูเก็ต', 'กระบี่', 'สุราษฎร์ธานี', 'พังงา', 'ตราด', 'สตูล', 'ระยอง', 'ชลบุรี', 'ตรัง', 'ชุมพร', 'ระนอง']);

export const distanceFromBangkokKm = (p: ProvinceTravel): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(p.lat - BANGKOK.lat);
  const dLon = toRad(p.lon - BANGKOK.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(BANGKOK.lat)) * Math.cos(toRad(p.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
};

export type BudgetTier = 'saver' | 'standard' | 'comfort';

export interface BudgetBreakdown {
  tier: BudgetTier;
  transport: number;
  lodging: number;
  food: number;
  activities: number;
  total: number; // per person for the whole trip
}

export interface BudgetEstimate {
  distanceKm: number;
  roadKm: number;
  suggestFlight: boolean;
  tiers: BudgetBreakdown[];
}

const TIER_RATES: Record<BudgetTier, { roomPerNight: number; foodPerDay: number; activityPerDay: number; transportFactor: number }> = {
  saver: { roomPerNight: 600, foodPerDay: 300, activityPerDay: 150, transportFactor: 1 }, // bus / van
  standard: { roomPerNight: 1400, foodPerDay: 550, activityPerDay: 400, transportFactor: 1.6 }, // VIP bus / train / shared car
  comfort: { roomPerNight: 3200, foodPerDay: 1000, activityPerDay: 900, transportFactor: 2.6 }, // flight / private car
};

const roundTo = (n: number, step = 50) => Math.round(n / step) * step;

// Per-person cost for `days` days travelling from Bangkok; rooms are shared by 2 people
export const estimateBudget = (p: ProvinceTravel, days: number, people: number): BudgetEstimate => {
  const distanceKm = distanceFromBangkokKm(p);
  const roadKm = Math.round(distanceKm * 1.3);
  const nights = Math.max(0, days - 1);
  const priceFactor = HOTSPOTS.has(p.name) ? 1.35 : 1;
  const islandExtra = ISLAND_PROVINCES.has(p.name) ? 500 : 0;
  const roomsShare = Math.ceil(people / 2) / people;
  // Round-trip public transport ≈ 0.9 THB/km each way, with a floor for nearby provinces
  const baseTransport = Math.max(150, roadKm * 0.9 * 2);

  const tiers = (Object.keys(TIER_RATES) as BudgetTier[]).map((tier) => {
    const r = TIER_RATES[tier];
    const transport = roundTo(baseTransport * r.transportFactor);
    const lodging = roundTo(r.roomPerNight * priceFactor * nights * roomsShare);
    const food = roundTo(r.foodPerDay * priceFactor * days);
    const activities = roundTo(r.activityPerDay * days + islandExtra);
    return { tier, transport, lodging, food, activities, total: transport + lodging + food + activities };
  });

  return { distanceKm, roadKm, suggestFlight: roadKm > 550, tiers };
};

// ---------------- Crowd estimate ----------------

export const CROWD_LEVELS = [
  { label: 'เงียบ', color: '#10b981' },
  { label: 'คนน้อย', color: '#84cc16' },
  { label: 'ปานกลาง', color: '#eab308' },
  { label: 'ค่อนข้างแน่น', color: '#f97316' },
  { label: 'หนาแน่นมาก', color: '#ef4444' },
];

// Relative busyness by hour (0-23) for each kind of place
const HOURLY: Record<'default' | 'temple' | 'market' | 'floatingMarket' | 'beach' | 'sunrise' | 'night', number[]> = {
  default:        [0, 0, 0, 0, 0, 0, .05, .15, .3, .5, .7, .85, .9, .9, .95, .9, .75, .5, .25, .1, .05, 0, 0, 0],
  temple:         [0, 0, 0, 0, 0, .05, .3, .6, .85, .95, .9, .8, .65, .6, .65, .6, .45, .25, .1, .05, 0, 0, 0, 0],
  market:         [0, 0, 0, 0, 0, 0, .05, .1, .2, .3, .4, .5, .55, .55, .6, .7, .85, .95, 1, .95, .8, .5, .2, .05],
  floatingMarket: [0, 0, 0, 0, 0, .1, .45, .8, 1, .95, .8, .55, .3, .15, .1, .1, .1, .05, 0, 0, 0, 0, 0, 0],
  beach:          [0, 0, 0, 0, 0, .05, .15, .25, .35, .5, .65, .75, .8, .8, .85, .9, .95, .9, .7, .45, .3, .2, .1, .05],
  sunrise:        [0, 0, 0, .05, .3, .85, 1, .75, .5, .45, .5, .55, .55, .55, .55, .5, .55, .65, .5, .15, .05, 0, 0, 0],
  night:          [.1, .05, 0, 0, 0, 0, 0, .05, .1, .2, .3, .4, .5, .5, .5, .55, .6, .7, .85, .95, 1, .9, .6, .3],
};

const curveFor = (name: string, category: AttractionCategory): number[] => {
  if (name.includes('ตลาดน้ำ')) return HOURLY.floatingMarket;
  if (/เยาวราช|พัทยา|ป่าตอง|ถนนคนเดิน/.test(name)) return HOURLY.night;
  if (category === 'market') return HOURLY.market;
  if (category === 'temple') return HOURLY.temple;
  if (category === 'beach') return HOURLY.beach;
  if (category === 'mountain' || category === 'viewpoint') return HOURLY.sunrise;
  return HOURLY.default;
};

// Current date/time in Thailand regardless of the viewer's timezone
export const bangkokNow = (): { hour: number; weekday: number; month: number } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: 'numeric',
    hourCycle: 'h23',
    weekday: 'short',
    month: 'numeric',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { hour: Number(get('hour')) % 24, weekday: weekdayNames.indexOf(get('weekday')), month: Number(get('month')) };
};

const dayFactor = (weekday: number) => (weekday === 0 || weekday === 6 ? 1 : weekday === 5 ? 0.8 : 0.6);

const seasonFactor = (month: number, p: ProvinceTravel) => {
  const coolSeason = month >= 11 || month <= 2;
  if (coolSeason) return p.region === 'north' || p.region === 'northeast' ? 1.1 : 1;
  if (month === 4) return 0.95; // Songkran travel
  if (month === 3) return 0.85;
  return 0.7; // rainy season
};

export interface CrowdEstimate {
  level: number; // 0-4 index into CROWD_LEVELS
  score: number; // 0-1
  hourly: number[]; // 24 values, 0-1, for today
}

export const estimateCrowd = (
  p: ProvinceTravel,
  attraction: { name: string; category: AttractionCategory },
  rainProbability?: number
): CrowdEstimate => {
  const { hour, weekday, month } = bangkokNow();
  const popularity = HOTSPOTS.has(p.name) ? 1 : 0.6;
  const rain = rainProbability !== undefined && rainProbability > 60 && attraction.category !== 'market' ? 0.8 : 1;
  const factor = Math.min(1, popularity * dayFactor(weekday) * seasonFactor(month, p) * rain);
  const hourly = curveFor(attraction.name, attraction.category).map((v) => Math.min(1, v * factor));
  const score = hourly[hour];
  const level = score < 0.12 ? 0 : score < 0.3 ? 1 : score < 0.5 ? 2 : score < 0.72 ? 3 : 4;
  return { level, score, hourly };
};
