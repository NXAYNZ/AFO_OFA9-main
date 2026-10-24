'use client';

import React, { useEffect, useState } from 'react';
import { CloudSun, Umbrella, Sparkles } from 'lucide-react';
import { WeatherForecast } from '@/lib/types';
import { bangkokNow } from '@/lib/tripEstimates';
import { WeatherScene, sceneFor, SCENE_BACKGROUND, SCENE_LABEL } from '@/components/WeatherScene';

interface PlannerWeatherCardProps {
  province: string;
  season: string;
  weather: WeatherForecast;
}

const rainText = (rainMm: number | undefined, pct: number) =>
  rainMm !== undefined ? `${rainMm} มม.` : `${pct}%`;

/** AI planner weather card: animated scene for the selected day, tap the temperature for an effect */
export const PlannerWeatherCard: React.FC<PlannerWeatherCardProps> = ({ province, season, weather }) => {
  const [dayIndex, setDayIndex] = useState(0);
  const [poke, setPoke] = useState(0);

  // New forecast (new plan) starts again from today
  useEffect(() => {
    setDayIndex(0);
    setPoke(0);
  }, [weather]);

  const day = weather.sevenDays[Math.min(dayIndex, weather.sevenDays.length - 1)];
  const isToday = dayIndex === 0;
  const { hour } = bangkokNow();
  const scene = sceneFor(day, isToday && (hour < 6 || hour >= 18));
  const rainLabel =
    day?.rainMm !== undefined
      ? 'ปริมาณฝน (กรมอุตุฯ)'
      : weather.rainMetric === 'area'
        ? 'ฝน (% ของพื้นที่ ตามกรมอุตุฯ)'
        : 'โอกาสฝน';

  return (
    <div
      className="relative overflow-hidden text-white rounded-3xl shadow-xl transition-[background] duration-700"
      style={{ background: SCENE_BACKGROUND[scene] }}
    >
      <WeatherScene kind={scene} poke={poke} />

      {/* Remounted per tap so a thunder strike can replay the rumble */}
      <div key={scene === 'storm' ? `rumble-${poke}` : 'weather'} className={`relative z-10 p-6 sm:p-8 ${poke > 0 && scene === 'storm' ? 'wx-rumble' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20">
          <div className="flex items-center space-x-2 drop-shadow">
            <CloudSun className="w-6 h-6 text-amber-300" />
            <h3 className="text-lg sm:text-xl font-bold">สภาพอากาศเรียลไทม์: {province}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/20">
              Source:{' '}
              {weather.source === 'TMD_API'
                ? 'กรมอุตุนิยมวิทยา (TMD API)'
                : weather.source === 'OPEN_METEO_API'
                  ? 'Open-Meteo'
                  : 'ข้อมูลสำรอง (ไม่ใช่ข้อมูลจริง)'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm text-amber-200 border border-amber-300/40 font-semibold">
              {season} SEASON
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Tap for the scene's effect */}
          <button
            type="button"
            onClick={() => setPoke((c) => c + 1)}
            className="flex items-center space-x-4 text-left rounded-2xl active:scale-[0.98] transition-transform"
            title="แตะเพื่อดูเอฟเฟกต์"
            aria-label={`เอฟเฟกต์${SCENE_LABEL[scene]}`}
          >
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-amber-300 drop-shadow-md">
              {isToday ? weather.currentTemp : day?.tempMax}°C
            </div>
            <div className="drop-shadow">
              <div className="text-xs text-white/75">
                {isToday ? 'อุณหภูมิปัจจุบัน' : `${new Date(day.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })} • สูงสุด`}
              </div>
              <div className="text-sm font-semibold">
                {day?.icon} {day?.condition || SCENE_LABEL[scene]}
              </div>
            </div>
          </button>

          <div className="flex items-center space-x-4 drop-shadow">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-sky-200">
              <Umbrella className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-white/75">{rainLabel}</div>
              <div className="text-lg font-bold font-mono text-sky-200">
                {day ? rainText(day.rainMm, day.rainProbability) : `${weather.rainProbability}%`}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/15 text-xs sm:text-sm text-white/90 leading-relaxed">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>คำแนะนำ AI จากสภาพอากาศ:</span>
            </div>
            {weather.advisory}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="text-xs text-white/80 font-semibold mb-3">พยากรณ์อากาศล่วงหน้า 7 วัน • กดวันเพื่อดูสภาพอากาศ แตะอุณหภูมิเพื่อดูเอฟเฟกต์</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weather.sevenDays.map((d, idx) => (
              <button
                type="button"
                key={d.date}
                onClick={() => {
                  setDayIndex(idx);
                  setPoke(0);
                }}
                aria-pressed={idx === dayIndex}
                className={`p-2.5 rounded-xl text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  idx === dayIndex ? 'bg-white/30 ring-2 ring-white/80 shadow-lg' : 'bg-black/20 border border-white/10 hover:bg-white/15'
                }`}
              >
                <div className="text-xs text-white/80 font-medium">
                  {idx === 0 ? 'วันนี้' : new Date(d.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })}
                </div>
                <div className="text-xl my-1">{d.icon}</div>
                <div className="text-xs font-mono font-bold">
                  {d.tempMin}° - {d.tempMax}°
                </div>
                <div className="text-[11px] text-sky-200 mt-0.5">ฝน {rainText(d.rainMm, d.rainProbability)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
