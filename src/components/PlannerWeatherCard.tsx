'use client';

import React, { useEffect, useState } from 'react';
import { Umbrella, Sparkles } from 'lucide-react';
import { WeatherForecast } from '@/lib/types';
import { stripEmoji } from '@/lib/text';
import { bangkokNow } from '@/lib/tripEstimates';
import { WeatherScene, sceneFor, SCENE_BACKGROUND, SCENE_LABEL, SCENE_ICON } from '@/components/WeatherScene';

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
  const SceneIcon = SCENE_ICON[scene];
  const rainLabel =
    day?.rainMm !== undefined
      ? 'ปริมาณฝน (กรมอุตุฯ)'
      : weather.rainMetric === 'area'
        ? 'ฝน (% ของพื้นที่ ตามกรมอุตุฯ)'
        : 'โอกาสฝน';
  const source =
    weather.source === 'TMD_API'
      ? 'กรมอุตุนิยมวิทยา (TMD API)'
      : weather.source === 'OPEN_METEO_API'
        ? 'Open-Meteo'
        : 'ข้อมูลสำรอง (ไม่ใช่ข้อมูลจริง)';

  return (
    <section
      className="relative overflow-hidden text-white rounded-xl shadow-md transition-[background] duration-700"
      style={{ background: SCENE_BACKGROUND[scene] }}
    >
      <WeatherScene kind={scene} poke={poke} />

      {/* Remounted per tap so a thunder strike can replay the rumble */}
      <div key={scene === 'storm' ? `rumble-${poke}` : 'weather'} className={`relative z-10 p-5 sm:p-7 ${poke > 0 && scene === 'storm' ? 'wx-rumble' : ''}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-2xl font-semibold drop-shadow-sm">อากาศที่ {province}</h3>
          <p className="text-xs text-white/80">
            {source} · {season} SEASON
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[auto_auto_minmax(0,1fr)] gap-6 md:gap-10 items-center">
          {/* Tap for the scene's effect */}
          <button
            type="button"
            onClick={() => setPoke((c) => c + 1)}
            className="flex items-center gap-4 text-left rounded-md"
            title="แตะเพื่อดูเอฟเฟกต์"
            aria-label={`เอฟเฟกต์${SCENE_LABEL[scene]}`}
          >
            <span className="font-mono text-6xl font-semibold leading-none drop-shadow-sm">
              {isToday ? weather.currentTemp : day?.tempMax}°
            </span>
            <span className="drop-shadow-sm">
              <span className="block text-xs text-white/75">
                {isToday ? 'ตอนนี้' : `${new Date(day.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })} · สูงสุด`}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
                <SceneIcon className="w-4 h-4" />
                {day?.condition || SCENE_LABEL[scene]}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3 drop-shadow-sm">
            <Umbrella className="w-6 h-6 text-white/85" strokeWidth={1.6} />
            <div>
              <div className="text-xs text-white/75">{rainLabel}</div>
              <div className="font-mono text-xl font-semibold">
                {day ? rainText(day.rainMm, day.rainProbability) : `${weather.rainProbability}%`}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-ink-950/35 px-4 py-3 text-sm text-white/90 leading-relaxed">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              คำแนะนำจากสภาพอากาศ
            </div>
            {stripEmoji(weather.advisory)}
          </div>
        </div>

        <div className="mt-7">
          <div className="text-xs text-white/80 mb-2">พยากรณ์ 7 วัน · เลือกวันเพื่อดูท้องฟ้า แตะอุณหภูมิเพื่อดูเอฟเฟกต์</div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {weather.sevenDays.map((d, idx) => {
              const DayIcon = SCENE_ICON[sceneFor(d, false)];
              const on = idx === dayIndex;
              return (
                <button
                  type="button"
                  key={d.date}
                  onClick={() => {
                    setDayIndex(idx);
                    setPoke(0);
                  }}
                  aria-pressed={on}
                  className={`px-2 py-2.5 rounded-md text-center transition-colors duration-150 ${
                    on ? 'bg-ink-50 text-ink-900' : 'bg-ink-950/25 hover:bg-ink-950/40'
                  }`}
                >
                  <div className={`text-xs font-medium ${on ? 'text-ink-600' : 'text-white/80'}`}>
                    {idx === 0 ? 'วันนี้' : new Date(d.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <DayIcon className="w-5 h-5 mx-auto my-1.5" strokeWidth={1.8} />
                  <div className="text-xs font-mono font-semibold">
                    {d.tempMin}°–{d.tempMax}°
                  </div>
                  <div className={`text-[11px] mt-0.5 ${on ? 'text-ink-500' : 'text-white/75'}`}>ฝน {rainText(d.rainMm, d.rainProbability)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
