import { NextRequest, NextResponse } from 'next/server';
import { getThailandWeather } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const province = searchParams.get('province') || 'เกาะเสม็ด จ.ระยอง';
    const date = searchParams.get('date') || new Date().toISOString();

    const weather = await getThailandWeather(province, date);
    return NextResponse.json({ success: true, weather });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const province = body.province || 'เกาะเสม็ด จ.ระยอง';
    const date = body.date || new Date().toISOString();

    const weather = await getThailandWeather(province, date);
    return NextResponse.json({ success: true, weather });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}
