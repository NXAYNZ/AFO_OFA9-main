'use client';

import { Sun, Moon, CloudSun, CloudRain, CloudLightning, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { WeatherDay } from '@/lib/types';

export type SceneKind = 'sunny' | 'night' | 'cloudy' | 'rain' | 'storm' | 'cold';

// Flat sky colour per scene; white text stays readable on all of them
export const SCENE_BACKGROUND: Record<SceneKind, string> = {
  sunny: '#3f5f8a',
  night: '#13233a',
  cloudy: '#4f5868',
  rain: '#343e4f',
  storm: '#1a2433',
  cold: '#456590',
};

// Drawn icons for each sky, used in place of the forecast emoji
export const SCENE_ICON: Record<SceneKind, LucideIcon> = {
  sunny: Sun,
  night: Moon,
  cloudy: CloudSun,
  rain: CloudRain,
  storm: CloudLightning,
  cold: Wind,
};

export const SCENE_LABEL: Record<SceneKind, string> = {
  sunny: 'แดดดี ท้องฟ้าโปร่ง',
  night: 'ท้องฟ้ายามค่ำคืน',
  cloudy: 'มีเมฆเป็นส่วนมาก',
  rain: 'มีฝนตก',
  storm: 'ฝนฟ้าคะนอง',
  cold: 'อากาศเย็นสบาย',
};

/** Pick the animated scene for a forecast day (icons and rain values come from TMD or Open-Meteo) */
export const sceneFor = (day: WeatherDay | undefined, isNight: boolean): SceneKind => {
  if (!day) return isNight ? 'night' : 'sunny';
  const rain = day.rainMm !== undefined ? Math.min(100, day.rainMm * 8) : day.rainProbability;
  if (day.icon === '⛈️' || day.icon === '⚡' || (day.condition.includes('ฟ้าคะนอง') && rain >= 40)) return 'storm';
  if (day.icon === '🌧️' || day.icon === '🌦️' || rain >= 40) return 'rain';
  if (['❄️', '🥶', '🌬️'].includes(day.icon)) return 'cold';
  if (['⛅', '☁️', '🌥️', '🌫️'].includes(day.icon) || rain >= 20) return isNight ? 'night' : 'cloudy';
  return isNight ? 'night' : 'sunny';
};

// Deterministic pseudo-random so drops/stars do not jump between renders
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const Cloud: React.FC<{ top: string; scale: number; duration: number; delay: number; opacity: number; dark?: boolean }> = ({
  top,
  scale,
  duration,
  delay,
  opacity,
  dark,
}) => (
  <div
    className="wx-cloud absolute left-0"
    style={{ top, opacity, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
  >
    <svg width={120 * scale} height={52 * scale} viewBox="0 0 120 52" aria-hidden>
      <path
        d="M28 50h70a20 20 0 0 0 2-40 26 26 0 0 0-49-4A18 18 0 0 0 26 22a14 14 0 0 0 2 28Z"
        fill={dark ? '#cbd5e1' : '#ffffff'}
      />
    </svg>
  </div>
);

interface WeatherSceneProps {
  kind: SceneKind;
  // Increments on every tap of the card; replays the one-shot effect
  poke: number;
  // Narrow cards keep clouds in the top-right corner, clear of the text
  compact?: boolean;
}

export const WeatherScene: React.FC<WeatherSceneProps> = ({ kind, poke, compact }) => {
  const drops = useMemo(() => {
    const rand = seeded(kind === 'storm' ? 7 : 3);
    const count = kind === 'storm' ? 90 : 45;
    return Array.from({ length: count }, () => ({
      left: rand() * 110 - 5,
      delay: -rand() * 2,
      duration: (kind === 'storm' ? 0.45 : 0.8) + rand() * 0.4,
      length: (kind === 'storm' ? 18 : 12) + rand() * 10,
      opacity: 0.35 + rand() * 0.5,
    }));
  }, [kind]);

  const stars = useMemo(() => {
    const rand = seeded(11);
    return Array.from({ length: 28 }, () => ({
      left: rand() * 100,
      top: rand() * 60,
      size: 1 + rand() * 2,
      delay: rand() * 3,
    }));
  }, []);

  const isWet = kind === 'rain' || kind === 'storm';
  const showSun = kind === 'sunny' || kind === 'cloudy' || kind === 'cold';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Stars + moon */}
      {kind === 'night' && (
        <>
          {stars.map((s, i) => (
            <span
              key={i}
              className="wx-star absolute rounded-full bg-white"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
            />
          ))}
          <div key={`moon-${poke}`} className="wx-moon absolute top-4 right-6 w-14 h-14 rounded-full" />
        </>
      )}

      {/* Sun with rotating rays; a tap makes it flare */}
      {showSun && (
        <div className="absolute -top-10 -right-10 w-28 h-28" style={{ opacity: kind === 'cloudy' ? 0.6 : 0.85 }}>
          <div className="wx-sun-rays absolute inset-0 rounded-full" />
          <div key={`sun-${poke}`} className={`wx-sun absolute inset-8 rounded-full ${poke ? 'wx-sun-flare' : ''}`} />
        </div>
      )}

      {/* Clouds drift through the right side only, fading out before the heading and reading */}
      {kind !== 'night' && (
        <div className={`absolute right-0 [mask-image:linear-gradient(to_right,transparent,black_35%)] ${compact ? 'top-0 h-16 w-2/5' : 'inset-y-0 w-3/5'}`}>
          <Cloud top="10%" scale={kind === 'sunny' ? 0.7 : 1} duration={kind === 'storm' ? 22 : 38} delay={-6} opacity={0.35} dark={isWet} />
          {kind !== 'sunny' && <Cloud top="38%" scale={0.8} duration={kind === 'storm' ? 18 : 30} delay={-20} opacity={0.25} dark={isWet} />}
          {kind !== 'sunny' && kind !== 'cold' && <Cloud top="0%" scale={1.2} duration={kind === 'storm' ? 26 : 45} delay={-33} opacity={0.3} dark={isWet} />}
        </div>
      )}
      {kind === 'night' && <Cloud top="35%" scale={0.9} duration={50} delay={-15} opacity={0.15} />}

      {/* Rain */}
      {isWet && (
        <div className={`absolute -inset-x-6 inset-y-0 ${kind === 'storm' ? 'wx-rain-slant' : ''}`}>
          {drops.map((d, i) => (
            <span
              key={i}
              className="wx-drop absolute top-0 w-px rounded-full"
              style={{
                left: `${d.left}%`,
                height: d.length,
                opacity: d.opacity,
                animationDuration: `${d.duration}s`,
                animationDelay: `${d.delay}s`,
              }}
            />
          ))}
          {/* Tap = a short downpour burst */}
          {poke > 0 && kind === 'rain' && (
            <div key={`burst-${poke}`} className="wx-rain-burst absolute inset-0">
              {drops.slice(0, 30).map((d, i) => (
                <span
                  key={i}
                  className="wx-drop absolute top-0 w-px rounded-full"
                  style={{ left: `${(d.left + 37) % 100}%`, height: d.length + 6, animationDuration: `${d.duration * 0.6}s`, animationDelay: `${-d.delay * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightning: periodic flashes, plus an instant strike on tap */}
      {kind === 'storm' && (
        <>
          <div className="wx-flash absolute inset-0 bg-white" />
          <svg className="wx-bolt absolute left-[18%] top-0 h-3/4" viewBox="0 0 40 120" aria-hidden>
            <path d="M24 0 6 62h14L10 120 36 46H21L30 0Z" fill="#fde68a" />
          </svg>
          {poke > 0 && (
            <React.Fragment key={`strike-${poke}`}>
              <div className="wx-strike-flash absolute inset-0 bg-white" />
              <svg className="wx-strike-bolt absolute left-[55%] top-0 h-4/5" viewBox="0 0 40 120" aria-hidden>
                <path d="M24 0 6 62h14L10 120 36 46H21L30 0Z" fill="#fef9c3" />
              </svg>
            </React.Fragment>
          )}
        </>
      )}

    </div>
  );
};
