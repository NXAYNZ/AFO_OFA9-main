import { NextRequest, NextResponse } from 'next/server';
import { getThailandWeather } from '@/lib/weather';

// In-Memory cache for weather responses (30-minute TTL per province/date)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1800 * 1000; // 30 minutes

// Thailand geographic bounding box coordinates
const THAILAND_BOUNDS = {
  minLat: 5.5,
  maxLat: 20.5,
  minLng: 97.0,
  maxLng: 106.0,
};

function isValidThailandCoords(lat: number, lng: number): boolean {
  return (
    lat >= THAILAND_BOUNDS.minLat &&
    lat <= THAILAND_BOUNDS.maxLat &&
    lng >= THAILAND_BOUNDS.minLng &&
    lng <= THAILAND_BOUNDS.maxLng
  );
}

function sanitizeInput(str: unknown, maxLen = 100): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, maxLen);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawProvince = searchParams.get('province');
    const rawDate = searchParams.get('date');
    const rawLat = searchParams.get('lat');
    const rawLng = searchParams.get('lng');

    // Coordinate validation if provided
    if (rawLat !== null && rawLng !== null) {
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if (isNaN(lat) || isNaN(lng) || !isValidThailandCoords(lat, lng)) {
        return NextResponse.json(
          {
            success: false,
            error: 'พิกัดอยู่นอกขอบเขตประเทศไทย (รองรับ Latitude 5.5°N - 20.5°N, Longitude 97.0°E - 106.0°E)',
          },
          { status: 400 }
        );
      }
    }

    const province = sanitizeInput(rawProvince) || 'เกาะเสม็ด จ.ระยอง';
    const date = sanitizeInput(rawDate) || new Date().toISOString();

    const cacheKey = `${province.toLowerCase()}_${date.slice(0, 10)}`;
    const now = Date.now();
    const cached = weatherCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return NextResponse.json(
        { success: true, weather: cached.data, cached: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          },
        }
      );
    }

    const weather = await getThailandWeather(province, date);
    weatherCache.set(cacheKey, { data: weather, expiresAt: now + CACHE_TTL_MS });

    return NextResponse.json(
      { success: true, weather },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('Weather API GET error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถดึงข้อมูลสภาพอากาศได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lat, lng } = body;

    if (lat !== undefined && lng !== undefined) {
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      if (isNaN(numLat) || isNaN(numLng) || !isValidThailandCoords(numLat, numLng)) {
        return NextResponse.json(
          {
            success: false,
            error: 'พิกัดอยู่นอกขอบเขตประเทศไทย (รองรับ Latitude 5.5°N - 20.5°N, Longitude 97.0°E - 106.0°E)',
          },
          { status: 400 }
        );
      }
    }

    const province = sanitizeInput(body.province) || 'เกาะเสม็ด จ.ระยอง';
    const date = sanitizeInput(body.date) || new Date().toISOString();

    const cacheKey = `${province.toLowerCase()}_${date.slice(0, 10)}`;
    const now = Date.now();
    const cached = weatherCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ success: true, weather: cached.data, cached: true });
    }

    const weather = await getThailandWeather(province, date);
    weatherCache.set(cacheKey, { data: weather, expiresAt: now + CACHE_TTL_MS });

    return NextResponse.json({ success: true, weather });
  } catch (error: any) {
    console.error('Weather API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถดึงข้อมูลสภาพอากาศได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
