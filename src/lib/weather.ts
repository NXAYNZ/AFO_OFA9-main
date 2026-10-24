import { WeatherForecast, WeatherDay } from './types';
import { PROVINCE_TRAVEL } from '@/data/thailandTravel';

export interface ProvinceLocation {
  name: string;
  thaiName: string;
  latitude: number;
  longitude: number;
  region: string;
}

export const THAI_PROVINCES: Record<string, ProvinceLocation> = {
  rayong: {
    name: 'Rayong (Koh Samet)',
    thaiName: 'เกาะเสม็ด จ.ระยอง',
    latitude: 12.5657,
    longitude: 101.4500,
    region: 'Eastern',
  },
  chiangmai: {
    name: 'Chiang Mai',
    thaiName: 'เชียงใหม่',
    latitude: 18.7883,
    longitude: 98.9853,
    region: 'Northern',
  },
  phuket: {
    name: 'Phuket',
    thaiName: 'ภูเก็ต',
    latitude: 7.8804,
    longitude: 98.3923,
    region: 'Southern',
  },
  krabi: {
    name: 'Krabi',
    thaiName: 'กระบี่',
    latitude: 8.0863,
    longitude: 98.9063,
    region: 'Southern',
  },
  nan: {
    name: 'Nan',
    thaiName: 'น่าน',
    latitude: 18.7832,
    longitude: 100.7782,
    region: 'Northern',
  },
  bangkok: {
    name: 'Bangkok',
    thaiName: 'กรุงเทพมหานคร',
    latitude: 13.7563,
    longitude: 100.5018,
    region: 'Central',
  },
  kanchanaburi: {
    name: 'Kanchanaburi',
    thaiName: 'กาญจนบุรี',
    latitude: 14.0228,
    longitude: 99.5328,
    region: 'Western',
  },
  huahin: {
    name: 'Hua Hin',
    thaiName: 'หัวหิน จ.ประจวบคีรีขันธ์',
    latitude: 12.5684,
    longitude: 99.9577,
    region: 'Western',
  },
};

/**
 * Detect High vs Low Season in Thailand based on month
 */
export function detectThailandSeason(dateString?: string): 'HIGH' | 'LOW' | 'SHOULDER' {
  const date = dateString ? new Date(dateString) : new Date();
  const month = isNaN(date.getMonth()) ? new Date().getMonth() + 1 : date.getMonth() + 1; // 1 - 12

  if (month >= 11 || month <= 2) {
    return 'HIGH'; // Nov, Dec, Jan, Feb
  } else if (month >= 5 && month <= 10) {
    return 'LOW'; // May - Oct (Rainy / Green season)
  } else {
    return 'SHOULDER'; // Mar - Apr (Hot / Songkran)
  }
}

/**
 * Weather condition helper based on WMO weather code
 */
function interpretWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'ท้องฟ้าแจ่มใส แดดจัด', icon: '☀️' };
  if (code <= 3) return { condition: 'มีเมฆบางส่วน ท้องฟ้าโปร่ง', icon: '⛅' };
  if (code <= 48) return { condition: 'มีหมอกบาง ทัศนวิสัยดี', icon: '🌫️' };
  if (code <= 55) return { condition: 'ฝนปรอยๆ เล็กน้อย', icon: '🌦️' };
  if (code <= 65) return { condition: 'มีฝนตกปานกลาง', icon: '🌧️' };
  if (code <= 82) return { condition: 'ฝนตกหนัก มีลมกระโชก', icon: '⛈️' };
  return { condition: 'มีพายุฝนฟ้าคะนอง', icon: '⚡' };
}

/**
 * Generate AI weather advisory in Thai
 */
function generateAdvisory(
  rainProb: number,
  maxTemp: number,
  province: string,
  season: 'HIGH' | 'LOW' | 'SHOULDER'
): string {
  if (rainProb >= 60) {
    return `โอกาสฝนตกสูงถึง ${rainProb}% ในพื้นที่ ${province} แนะนำเตรียมเสื้อกันฝน/ร่ม และสลับกิจกรรมทางน้ำหรือกลางแจ้งไปเป็นกิจกรรมในร่มช่วงบ่าย`;
  }
  if (rainProb >= 35) {
    return `มีโอกาสเกิดฝนตกช่วงสั้นๆ (${rainProb}%) ช่วงบ่ายถึงค่ำ ทะเลยังมีคลื่นลมปานกลาง ท่องเที่ยวได้ปกติแต่ควรเช็กประกาศท่าเรือก่อนออกเดินทาง`;
  }
  if (season === 'HIGH') {
    return `สภาพอากาศยอดเยี่ยมมาก! ท้องฟ้าโปร่ง แดดดี คลื่นลมสงบ อุณหภูมิสบายๆ ${maxTemp}°C เหมาะแก่การล่องเรือ ดำน้ำ และทำกิจกรรมกลางแจ้งอย่างเต็มที่`;
  }
  return `สภาพอากาศดี มีแดดจัดช่วงเที่ยง (${maxTemp}°C) แนะนำทาครีมกันแดด SPF50+ และเตรียมแว่นกันแดดสำหรับถ่ายรูปคาเฟ่ริมหาด`;
}

/**
 * Fetch real-time weather using Open-Meteo API (Free, no key required, highly accurate for Thailand)
 */
async function fetchOpenMeteoWeather(
  provinceKey: string,
  loc: ProvinceLocation,
  season: 'HIGH' | 'LOW' | 'SHOULDER'
): Promise<WeatherForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current_weather=true&timezone=Asia%2FBangkok`;

  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.statusText}`);

  const data = await res.json();
  const daily = data.daily;

  const sevenDays: WeatherDay[] = [];
  const count = Math.min(daily.time.length, 7);

  for (let i = 0; i < count; i++) {
    const code = daily.weathercode[i] || 0;
    const { condition, icon } = interpretWmoCode(code);
    sevenDays.push({
      date: daily.time[i],
      tempMin: Math.round(daily.temperature_2m_min[i]),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      rainProbability: daily.precipitation_probability_max[i] || 20,
      condition,
      icon,
    });
  }

  const currentRainProb = sevenDays[0]?.rainProbability ?? 25;
  const currentTemp = Math.round(data.current_weather?.temperature || 31);
  const maxTemp = sevenDays[0]?.tempMax ?? 33;

  return {
    province: loc.thaiName,
    latitude: loc.latitude,
    longitude: loc.longitude,
    currentTemp,
    rainProbability: currentRainProb,
    season,
    advisory: generateAdvisory(currentRainProb, maxTemp, loc.thaiName, season),
    sevenDays,
    source: 'OPEN_METEO_API',
  };
}

/**
 * Mock Fallback Weather when offline or API is unreachable
 */
function getMockFallbackWeather(
  provinceKey: string,
  season: 'HIGH' | 'LOW' | 'SHOULDER',
  locOverride?: ProvinceLocation
): WeatherForecast {
  const loc = locOverride || THAI_PROVINCES[provinceKey] || THAI_PROVINCES.rayong;
  const isHigh = season === 'HIGH';
  const baseRain = isHigh ? 15 : 65;

  const today = new Date();
  const sevenDays: WeatherDay[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const rain = Math.min(95, Math.max(10, baseRain + (i % 3) * 15 - 10));
    return {
      date: dateStr,
      tempMin: isHigh ? 23 : 25,
      tempMax: isHigh ? 31 : 33,
      rainProbability: rain,
      condition: rain > 50 ? 'มีฝนฟ้าคะนองกระจาย' : 'ท้องฟ้าแจ่มใส มีแดดจัด',
      icon: rain > 50 ? '🌦️' : '☀️',
    };
  });

  return {
    province: loc.thaiName,
    latitude: loc.latitude,
    longitude: loc.longitude,
    currentTemp: isHigh ? 29 : 32,
    rainProbability: baseRain,
    season,
    advisory: generateAdvisory(baseRain, 32, loc.thaiName, season),
    sevenDays,
    source: 'FALLBACK_SYSTEM',
  };
}

// --- Thai Meteorological Department (TMD) NWP API ---
// Docs: https://data.tmd.go.th/nwpapi/doc/ (register there for a Bearer token)

const TMD_BASE = 'https://data.tmd.go.th/nwpapi/v1/forecast/location';
// TMD rate-limits per token, so share results across visitors for a while
const TMD_REVALIDATE_SECONDS = 900;

// TMD "cond" codes 1-12
const TMD_CONDITIONS: Record<number, { condition: string; icon: string }> = {
  1: { condition: 'ท้องฟ้าแจ่มใส', icon: '☀️' },
  2: { condition: 'มีเมฆบางส่วน', icon: '⛅' },
  3: { condition: 'เมฆเป็นส่วนมาก', icon: '🌥️' },
  4: { condition: 'มีเมฆมาก', icon: '☁️' },
  5: { condition: 'ฝนตกเล็กน้อย', icon: '🌦️' },
  6: { condition: 'ฝนปานกลาง', icon: '🌧️' },
  7: { condition: 'ฝนตกหนัก', icon: '🌧️' },
  8: { condition: 'ฝนฟ้าคะนอง', icon: '⛈️' },
  9: { condition: 'อากาศหนาวจัด', icon: '🥶' },
  10: { condition: 'อากาศหนาว', icon: '❄️' },
  11: { condition: 'อากาศเย็น', icon: '🌬️' },
  12: { condition: 'อากาศร้อนจัด', icon: '🥵' },
};

/**
 * TMD publishes rainfall (mm) and a condition code but no rain probability.
 * The app's crowd/advisory logic needs a 0-100 value, so derive a rough rain index from both.
 * The UI shows the TMD rainfall in mm instead of this number.
 */
function tmdRainIndex(cond: number, rainMm: number): number {
  const byCond: Record<number, number> = { 5: 55, 6: 70, 7: 90, 8: 80 };
  if (byCond[cond]) return byCond[cond];
  if (rainMm >= 10) return 70;
  if (rainMm >= 1) return 40;
  if (rainMm > 0.1) return 20;
  return 5;
}

interface TmdForecast {
  time: string;
  data: Record<string, number>;
}

// The docs show several top-level keys ("WeatherForecasts", "WeatherForcasts", "weather_forecast")
function tmdForecasts(json: any): TmdForecast[] {
  const root = json?.WeatherForecasts ?? json?.WeatherForcasts ?? json?.weather_forecast ?? json?.weatherForecasts;
  const location = Array.isArray(root) ? root[0] : root?.locations?.[0];
  return Array.isArray(location?.forecasts) ? location.forecasts : [];
}

async function tmdGet(path: string, params: Record<string, string | number>, token: string): Promise<TmdForecast[]> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${TMD_BASE}/${path}?${qs}`, {
    headers: { accept: 'application/json', authorization: `Bearer ${token}` },
    next: { revalidate: TMD_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`TMD ${path} error: ${res.status} ${res.statusText}`);
  const forecasts = tmdForecasts(await res.json());
  if (forecasts.length === 0) throw new Error(`TMD ${path}: empty response`);
  return forecasts;
}

// Current date and hour in Thailand time
function bangkokDateHour(): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

async function fetchTmdWeather(
  loc: ProvinceLocation,
  season: 'HIGH' | 'LOW' | 'SHOULDER',
  token: string
): Promise<WeatherForecast> {
  const { date, hour } = bangkokDateHour();
  const at = { lat: loc.latitude, lon: loc.longitude };

  const [daily, hourly] = await Promise.all([
    tmdGet('daily/at', { ...at, date, duration: 7, fields: 'tc_max,tc_min,rh,rain,cond' }, token),
    tmdGet('hourly/at', { ...at, date, hour, duration: 1, fields: 'tc,rh,rain,cond' }, token),
  ]);

  const sevenDays: WeatherDay[] = daily.slice(0, 7).map((f) => {
    const cond = Math.round(f.data.cond ?? 2);
    const rainMm = Math.round((f.data.rain ?? 0) * 10) / 10;
    const meta = TMD_CONDITIONS[cond] || TMD_CONDITIONS[2];
    return {
      date: f.time.slice(0, 10),
      tempMin: Math.round(f.data.tc_min),
      tempMax: Math.round(f.data.tc_max),
      rainProbability: tmdRainIndex(cond, rainMm),
      rainMm,
      condition: meta.condition,
      icon: meta.icon,
    };
  });

  const now = hourly[0];
  const nowCond = Math.round(now.data.cond ?? 2);
  const today = sevenDays[0];
  const rainIndex = today?.rainProbability ?? 20;

  return {
    province: loc.thaiName,
    latitude: loc.latitude,
    longitude: loc.longitude,
    currentTemp: Math.round(now.data.tc),
    rainProbability: rainIndex,
    season,
    advisory: generateAdvisory(rainIndex, today?.tempMax ?? 33, loc.thaiName, season),
    sevenDays,
    source: 'TMD_API',
    humidity: now.data.rh !== undefined ? Math.round(now.data.rh) : undefined,
    currentCondition: (TMD_CONDITIONS[nowCond] || TMD_CONDITIONS[2]).condition,
    updatedAt: now.time,
  };
}

// --- TMD public 7-day province forecast (no registration needed) ---
// One request returns every province. uid/ukey default to TMD's published demo credentials;
// set TMD_UID / TMD_UKEY to use your own account from data.tmd.go.th.

const TMD_7DAY_REVALIDATE_SECONDS = 1800;

interface Tmd7DayProvince {
  ProvinceNameThai: string;
  ProvinceNameEnglish: string;
  SevenDaysForecast: {
    ForecastDate: string[]; // dd/mm/yyyy, newest first
    MaximumTemperature: string[];
    MinimumTemperature: string[];
    PercentRainCover: string[];
    DescriptionThai: string[];
  };
}

// TMD keeps the season's rain wording (e.g. "ฝนฟ้าคะนอง") even at 10% coverage, so the icon follows coverage
function tmd7DayIcon(description: string, rainCover: number): string {
  if (description.includes('ฝน')) {
    if (rainCover >= 40) return description.includes('ฟ้าคะนอง') ? '⛈️' : '🌧️';
    return rainCover >= 20 ? '🌦️' : '⛅';
  }
  if (rainCover >= 40) return '🌦️';
  if (description.includes('หนาว')) return '❄️';
  if (description.includes('เย็น')) return '🌬️';
  if (description.includes('ร้อน')) return '🥵';
  if (description.includes('เมฆ')) return '⛅';
  return '☀️';
}

async function fetchTmd7DayWeather(
  loc: ProvinceLocation,
  season: 'HIGH' | 'LOW' | 'SHOULDER'
): Promise<WeatherForecast> {
  const uid = process.env.TMD_UID?.trim() || 'api';
  const ukey = process.env.TMD_UKEY?.trim() || 'api12345';
  const res = await fetch(
    `https://data.tmd.go.th/api/WeatherForecast7Days/V2/?uid=${encodeURIComponent(uid)}&ukey=${encodeURIComponent(ukey)}&format=json`,
    { next: { revalidate: TMD_7DAY_REVALIDATE_SECONDS }, signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`TMD 7-day error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  const provinces: Tmd7DayProvince[] = json?.Provinces?.Province || [];

  // Match the province name inside the location label, e.g. "เกาะเสม็ด จ.ระยอง" -> ระยอง
  const province = provinces.find((p) => loc.thaiName === p.ProvinceNameThai) ||
    provinces.find((p) => loc.thaiName.includes(p.ProvinceNameThai));
  if (!province) throw new Error(`TMD 7-day: no forecast for ${loc.thaiName}`);

  const f = province.SevenDaysForecast;
  const sevenDays: WeatherDay[] = f.ForecastDate.map((d, i) => {
    const [day, month, year] = d.split('/');
    const rainCover = Number(f.PercentRainCover[i]) || 0;
    const description = f.DescriptionThai[i] || '';
    return {
      date: `${year}-${month}-${day}`,
      tempMin: Math.round(Number(f.MinimumTemperature[i])),
      tempMax: Math.round(Number(f.MaximumTemperature[i])),
      rainProbability: rainCover,
      // TMD phrasing: "ฝนฟ้าคะนอง ร้อยละ 10 ของพื้นที่"
      condition: description.includes('ฝน') ? `${description} ร้อยละ ${rainCover} ของพื้นที่` : description,
      icon: tmd7DayIcon(description, rainCover),
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const today = sevenDays[0];
  const rain = today?.rainProbability ?? 20;

  // TMD's public feed has forecasts only (its station observation feeds are often empty),
  // so the current temperature comes from Open-Meteo when it is reachable
  let currentTemp = today?.tempMax ?? 32;
  let currentTempSource: WeatherForecast['currentTempSource'] = 'TMD_FORECAST_MAX';
  try {
    const live = await fetchOpenMeteoWeather(loc.name, loc, season);
    currentTemp = live.currentTemp;
    currentTempSource = 'OPEN_METEO';
  } catch (e) {}

  return {
    province: loc.thaiName,
    latitude: loc.latitude,
    longitude: loc.longitude,
    currentTemp,
    rainProbability: rain,
    season,
    advisory: generateAdvisory(rain, today?.tempMax ?? 33, loc.thaiName, season),
    sevenDays,
    source: 'TMD_API',
    rainMetric: 'area',
    currentCondition: today?.condition,
    currentTempSource,
    updatedAt: json?.header?.LastBuildDate ? `${json.header.LastBuildDate.replace(' ', 'T')}+07:00` : undefined,
  };
}

// Province from the request text: the curated list first, then any of the 77 map provinces
function resolveLocation(provinceQuery: string): { key: string; loc: ProvinceLocation } {
  const queryLower = (provinceQuery || '').toLowerCase();

  for (const [key, item] of Object.entries(THAI_PROVINCES)) {
    if (
      queryLower.includes(key) ||
      queryLower.includes(item.thaiName.toLowerCase()) ||
      queryLower.includes(item.name.toLowerCase())
    ) {
      return { key, loc: item };
    }
  }

  const province = PROVINCE_TRAVEL.find(
    (p) => queryLower.includes(p.name) || queryLower.includes(p.nameEn.toLowerCase())
  );
  if (province) {
    return {
      key: province.nameEn,
      loc: {
        name: province.nameEn,
        thaiName: province.name,
        latitude: province.lat,
        longitude: province.lon,
        region: province.region,
      },
    };
  }

  return { key: 'rayong', loc: THAI_PROVINCES.rayong };
}

/**
 * Main Weather Service for Thailand:
 * 1. TMD (กรมอุตุนิยมวิทยา) NWP API when TMD_API_TOKEN is set (point forecast, hourly).
 * 2. TMD public 7-day province forecast (no registration needed).
 * 3. Open-Meteo free API if TMD fails.
 * 4. Thai mock data if the network fails (source: FALLBACK_SYSTEM).
 */
export async function getThailandWeather(provinceQuery: string, dateString?: string): Promise<WeatherForecast> {
  const season = detectThailandSeason(dateString);
  const { key, loc } = resolveLocation(provinceQuery);

  const tmdToken = process.env.TMD_API_TOKEN?.trim();
  if (tmdToken && tmdToken !== 'your_tmd_api_token_here') {
    try {
      return await fetchTmdWeather(loc, season, tmdToken);
    } catch (err) {
      console.warn('TMD NWP API failed, switching to TMD 7-day forecast:', err);
    }
  }

  try {
    return await fetchTmd7DayWeather(loc, season);
  } catch (err) {
    console.warn('TMD 7-day forecast failed, switching to Open-Meteo:', err);
  }

  try {
    return await fetchOpenMeteoWeather(key, loc, season);
  } catch (err) {
    console.warn('Open-Meteo API failed or offline, using fallback Thai weather:', err);
    return getMockFallbackWeather(key, season, loc);
  }
}
