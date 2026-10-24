'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  Plus,
  Check,
  ExternalLink,
  Sparkles,
  CloudSun,
  Droplets,
  Thermometer,
  Users,
  Wallet,
  Bus,
  Plane,
  BedDouble,
  UtensilsCrossed,
  Ticket,
  Loader2,
  MapPin,
  MessageCircle,
  Accessibility,
} from 'lucide-react';
import { PlaceLightbox } from '@/components/PlaceLightbox';
import { WeatherScene, sceneFor, SCENE_BACKGROUND, SCENE_LABEL, SCENE_ICON } from '@/components/WeatherScene';
import { Reviewer } from '@/lib/placeReviews';
import { ProvinceTravel } from '@/data/thailandTravel';
import { PLACE_PHOTOS } from '@/data/placePhotos';
import { placeImages } from '@/lib/placeImages';
import { accessibilityOf, WHEELCHAIR_META } from '@/data/placeAccessibility';
import { WeatherForecast } from '@/lib/types';
import { REGION_META, CATEGORY_META, mapsSearchUrl } from '@/lib/travelMeta';
import { estimateBudget, estimateCrowd, bangkokNow, CROWD_LEVELS, BudgetTier } from '@/lib/tripEstimates';

interface ProvinceDetailModalProps {
  province: ProvinceTravel | null;
  onClose: () => void;
  isInBasket: (name: string) => boolean;
  onToggleBasket: (name: string) => void;
  onPlanWithAi: (province: string, places: string[], totalBudget: number, people: number) => void;
  reviewer: Reviewer | null;
  // Attraction to focus when the window opens (e.g. from a region top-3 card); first one otherwise
  initialPlace?: string | null;
}

const TIER_LABELS: Record<BudgetTier, { label: string; hint: string }> = {
  saver: { label: 'ประหยัด', hint: 'รถทัวร์ / โฮสเทล' },
  standard: { label: 'มาตรฐาน', hint: 'รถ VIP-รถไฟ / โรงแรม 3 ดาว' },
  comfort: { label: 'สบาย', hint: 'เครื่องบิน-รถส่วนตัว / รีสอร์ต' },
};

const photoOf = (province: string, place: string) => PLACE_PHOTOS[`${province}|${place}`];

const imagesOf = placeImages;

const embedUrl = (place: string, province: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(`${place} จ.${province}`)}&hl=th&z=13&output=embed`;

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' });

export const ProvinceDetailModal: React.FC<ProvinceDetailModalProps> = ({
  province,
  onClose,
  isInBasket,
  onToggleBasket,
  onPlanWithAi,
  reviewer,
  initialPlace,
}) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  // Image URLs that failed to load (e.g. dead Wikimedia thumbnails) are hidden instead of showing a broken icon
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const markBroken = (src: string) => setBrokenImages((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherDayIndex, setWeatherDayIndex] = useState(0);
  const [pokeCount, setPokeCount] = useState(0);
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [tier, setTier] = useState<BudgetTier>('standard');
  const [customBudget, setCustomBudget] = useState<number | null>(null);
  const [customMode, setCustomMode] = useState<'perPerson' | 'total'>('perPerson');
  const [, setClock] = useState(0);

  // Reset and load weather whenever a new province opens
  useEffect(() => {
    if (!province) return;
    setFocusIndex(Math.max(0, province.attractions.findIndex((a) => a.name === initialPlace)));
    setPhotoIndex(0);
    setLightboxOpen(false);
    setWeatherDayIndex(0);
    setPokeCount(0);
    setWeather(null);
    setWeatherLoading(true);
    let cancelled = false;
    fetch(`/api/weather?province=${encodeURIComponent(province.name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setWeather(data.weather);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // initialPlace is set together with province; re-running for it alone would refetch weather
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  // Keep the "now" crowd estimate fresh, close on Escape, lock page scroll
  useEffect(() => {
    if (!province) return;
    const timer = setInterval(() => setClock((c) => c + 1), 60000);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [province, onClose]);

  const budget = useMemo(() => (province ? estimateBudget(province, days, people) : null), [province, days, people]);

  if (!province || !budget) return null;

  const region = REGION_META[province.region];
  const focus = province.attractions[Math.min(focusIndex, province.attractions.length - 1)];
  const focusPhoto = photoOf(province.name, focus.name);
  const focusAccess = accessibilityOf(province.name, focus.name);
  const focusImages = imagesOf(province.name, focus.name).filter((src) => !brokenImages.has(src));
  const heroImage = focusImages[Math.min(photoIndex, focusImages.length - 1)];
  const selectAttraction = (i: number) => {
    setFocusIndex(i);
    setPhotoIndex(0);
  };
  const openLightbox = (i: number) => {
    setPhotoIndex(i);
    setLightboxOpen(true);
  };
  const crowds = province.attractions.map((a) => estimateCrowd(province, a, weather?.rainProbability));
  const focusCrowd = crowds[Math.min(focusIndex, crowds.length - 1)];
  const overallLevel = Math.max(...crowds.map((c) => c.level));
  const { hour } = bangkokNow();
  const selectedDay = weather?.sevenDays[Math.min(weatherDayIndex, weather.sevenDays.length - 1)];
  const isToday = weatherDayIndex === 0;
  const scene = sceneFor(selectedDay, isToday && (hour < 6 || hour >= 18));
  const selectedTier = budget.tiers.find((t) => t.tier === tier)!;

  // User's own budget, normalised to per person; null = use the selected tier
  const customPerPerson =
    customBudget && customBudget > 0 ? Math.round(customMode === 'total' ? customBudget / people : customBudget) : null;
  const perPersonBudget = customPerPerson ?? selectedTier.total;
  // Split a custom budget in the same proportions as the selected tier's estimate
  const share = (part: number) =>
    customPerPerson === null ? part : Math.round((part / Math.max(1, selectedTier.total)) * customPerPerson);
  const coveredTier = customPerPerson === null ? null : [...budget.tiers].reverse().find((t) => customPerPerson >= t.total) ?? null;
  const saverTotal = budget.tiers.find((t) => t.tier === 'saver')!.total;

  const handlePlan = () => {
    const picked = province.attractions.filter((a) => isInBasket(a.name)).map((a) => a.name);
    onPlanWithAi(
      province.name,
      picked.length > 0 ? picked : province.attractions.map((a) => a.name),
      perPersonBudget * people,
      people
    );
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-2 sm:px-4 pt-16 sm:pt-20 pb-4 bg-ink-950/70 animate-backdropIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col bg-[var(--background)] rounded-xl shadow-2xl overflow-hidden animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-48 sm:h-64 shrink-0 overflow-hidden" style={{ backgroundColor: region.hover }}>
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={heroImage}
              src={heroImage}
              alt={focus.name}
              onError={() => markBroken(heroImage)}
              className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
            />
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent ${heroImage ? 'cursor-zoom-in' : ''}`}
            onClick={() => heroImage && openLightbox(Math.min(photoIndex, focusImages.length - 1))}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-md bg-ink-950/50 hover:bg-ink-950/75 text-white flex items-center justify-center transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">{province.name}</h2>
            <div className="mt-1 text-sm text-white/80">
              {province.nameEn} · {region.label} · ห่างกรุงเทพฯ ~{budget.distanceKm.toLocaleString()} กม. (ระยะตรง)
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 p-4 sm:p-7">
            {/* LEFT: attractions, photo, map */}
            <div className="space-y-5 min-w-0">
              <section>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
                  แหล่งท่องเที่ยวแนะนำ <span className="font-sans text-sm font-normal text-slate-500">{province.attractions.length} แห่ง</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {province.attractions.map((a, i) => {
                    const cover = imagesOf(province.name, a.name).find((src) => !brokenImages.has(src));
                    const access = accessibilityOf(province.name, a.name);
                    const crowd = CROWD_LEVELS[crowds[i].level];
                    const isFocus = i === focusIndex;
                    return (
                      <button
                        key={a.name}
                        onClick={() => selectAttraction(i)}
                        aria-pressed={isFocus}
                        className={`group text-left rounded-lg overflow-hidden bg-white border transition-[box-shadow,border-color] duration-200 hover:shadow-md ${
                          isFocus ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200'
                        }`}
                      >
                        <div className="relative h-24 sm:h-28 overflow-hidden bg-slate-200">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={a.name}
                              loading="lazy"
                              onError={() => markBroken(cover)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="on-light w-full h-full flex items-end p-3" style={{ backgroundColor: region.fill }}>
                              <span className="font-display text-xl font-semibold leading-tight text-slate-800 line-clamp-2">{a.name}</span>
                            </div>
                          )}
                          <span
                            className="absolute top-1.5 left-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: crowd.color }}
                          >
                            {crowd.label}
                          </span>
                          {isInBasket(a.name) && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                          {access && access.wheelchair !== 'no' && (
                            <span
                              className="absolute bottom-1.5 left-1.5 h-6 px-1.5 rounded text-white text-[11px] font-semibold flex items-center gap-1"
                              style={{ backgroundColor: WHEELCHAIR_META[access.wheelchair].color }}
                              title={WHEELCHAIR_META[access.wheelchair].label}
                            >
                              <Accessibility className="w-3.5 h-3.5" />
                              {access.wheelchair === 'limited' && <span>บางส่วน</span>}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          {/* A photo-less tile already sets the name, so the body carries only the category */}
                          {cover && <div className="text-sm font-semibold text-slate-900 truncate">{a.name}</div>}
                          <div className="text-xs text-slate-500">{CATEGORY_META[a.category].label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Focused attraction */}
              <section key={focus.name} className="rounded-lg bg-white border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-slate-900">{focus.name}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        {React.createElement(CATEGORY_META[focus.category].icon, { className: 'w-3.5 h-3.5', strokeWidth: 1.8 })}
                        {CATEGORY_META[focus.category].label} · จ.{province.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={mapsSearchUrl(focus.name, province.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:border-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Google Maps
                      </a>
                      <button
                        onClick={() => onToggleBasket(focus.name)}
                        className={`h-9 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isInBasket(focus.name)
                            ? 'bg-emerald-600 text-white hover:bg-rose-600'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isInBasket(focus.name) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {isInBasket(focus.name) ? 'อยู่ในทริปแล้ว' : 'เพิ่มลงทริป'}
                      </button>
                    </div>
                  </div>
                  {/* Wheelchair access (OpenStreetMap) */}
                  <div
                    className="mt-4 flex items-start gap-2.5 rounded-md border px-3 py-2.5"
                    style={
                      focusAccess
                        ? { borderColor: `${WHEELCHAIR_META[focusAccess.wheelchair].color}55`, backgroundColor: `${WHEELCHAIR_META[focusAccess.wheelchair].color}0f` }
                        : { borderColor: 'var(--rule)', backgroundColor: 'transparent' }
                    }
                  >
                    <span
                      className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white ${focusAccess?.wheelchair === 'no' ? 'opacity-60' : ''}`}
                      style={{ backgroundColor: focusAccess ? WHEELCHAIR_META[focusAccess.wheelchair].color : '#8f9196' }}
                      aria-hidden
                    >
                      <Accessibility className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 text-xs">
                      <div className="font-semibold text-slate-900 text-sm">
                        {focusAccess ? WHEELCHAIR_META[focusAccess.wheelchair].label : 'ยังไม่มีข้อมูลการเข้าถึงสำหรับผู้พิการ'}
                      </div>
                      <div className="text-slate-500">
                        {focusAccess?.note && `${focusAccess.note} · `}
                        {focusAccess ? 'ข้อมูลจาก ' : 'ช่วยเพิ่มข้อมูลได้ที่ '}
                        <a
                          href={
                            focusAccess
                              ? `https://www.openstreetmap.org/${focusAccess.osmId}`
                              : `https://wheelmap.org/search?q=${encodeURIComponent(focus.name)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-slate-700"
                        >
                          {focusAccess ? 'OpenStreetMap' : 'Wheelmap'}
                        </a>
                        {focusAccess && ' · ควรโทรสอบถามสถานที่ก่อนเดินทาง'}
                      </div>
                    </div>
                  </div>
                  {focusPhoto?.extract ? (
                    <p className="mt-4 text-sm text-slate-700 leading-relaxed max-w-[68ch]">{focusPhoto.extract}</p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">ยังไม่มีคำอธิบายสำหรับสถานที่นี้ ดูรายละเอียดเพิ่มเติมได้ใน Google Maps</p>
                  )}
                  {focusPhoto?.pageUrl && (
                    <a
                      href={focusPhoto.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[11px] text-slate-500 hover:text-slate-700 underline"
                    >
                      ข้อมูลและภาพ: Wikipedia / Wikimedia Commons
                    </a>
                  )}
                </div>
                <iframe
                  key={focus.name}
                  title={`แผนที่ ${focus.name}`}
                  src={embedUrl(focus.name, province.name)}
                  className="w-full h-72 sm:h-80 border-0 bg-slate-100"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-4 sm:p-5">
                  {focusImages.length > 0 && (
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      {focusImages.map((src, i) => (
                        <button
                          key={src}
                          onClick={() => openLightbox(i)}
                          className={`group relative h-20 sm:h-28 rounded-md overflow-hidden cursor-zoom-in transition-opacity ${
                            i === photoIndex ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-white' : 'opacity-85 hover:opacity-100'
                          }`}
                          aria-label={`ขยายรูปที่ ${i + 1} ของ ${focus.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`${focus.name} ${i + 1}`}
                            loading="lazy"
                            onError={() => markBroken(src)}
                            className="w-full h-full object-cover transition-transform duration-500"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => openLightbox(Math.min(photoIndex, Math.max(focusImages.length - 1, 0)))}
                    className="h-9 px-3 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:border-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> รีวิว & ความคิดเห็น
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT: weather, crowd, budget */}
            <div className="space-y-4">
              {/* Weather: animated scene follows the selected day; tap the scene for an effect */}
              <section
                className="relative overflow-hidden rounded-lg text-white transition-[background] duration-700"
                style={{ background: SCENE_BACKGROUND[scene] }}
              >
                <WeatherScene kind={scene} poke={pokeCount} compact />
                {/* Remounted per tap so a thunder strike can replay the rumble */}
                <div
                  key={scene === 'storm' ? `rumble-${pokeCount}` : 'weather'}
                  className={`relative z-10 p-5 ${pokeCount > 0 && scene === 'storm' ? 'wx-rumble' : ''}`}
                >
                  {/* Source sits beside the heading, out of the corner where the sun and clouds drift */}
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                      <CloudSun className="w-5 h-5" /> สภาพอากาศ
                    </h3>
                    {weather && (
                      <span className="text-[11px] text-white/80">
                        {weather.source === 'OPEN_METEO_API' ? 'Open-Meteo สด' : weather.source === 'TMD_API' ? 'กรมอุตุฯ' : 'ข้อมูลสำรอง'}
                      </span>
                    )}
                  </div>
                  {weatherLoading ? (
                    <div className="mt-6 mb-4 flex items-center justify-center gap-2 text-sm text-white/80">
                      <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดพยากรณ์อากาศ...
                    </div>
                  ) : weather ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPokeCount((c) => c + 1)}
                        className="mt-3 w-full flex items-end gap-4 text-left rounded-md cursor-pointer"
                        aria-label={`เอฟเฟกต์${SCENE_LABEL[scene]}`}
                        title="แตะเพื่อดูเอฟเฟกต์"
                      >
                        <div className="drop-shadow-md">
                          <div className="text-[11px] font-semibold text-white/80">
                            {isToday ? 'ตอนนี้' : `${formatDay(selectedDay!.date)} · สูงสุด`}
                          </div>
                          <div className="font-mono text-5xl font-semibold leading-none">
                            {isToday ? Math.round(weather.currentTemp) : selectedDay!.tempMax}°
                          </div>
                        </div>
                        <div className="text-sm space-y-0.5 pb-1 drop-shadow">
                          <div className="font-semibold">
                            {selectedDay?.condition || SCENE_LABEL[scene]}
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5" />
                            {selectedDay?.rainMm !== undefined
                              ? `ฝน ${selectedDay.rainMm} มม.`
                              : weather.rainMetric === 'area'
                                ? `ฝน ${selectedDay?.rainProbability ?? weather.rainProbability}% ของพื้นที่`
                                : `โอกาสฝน ${selectedDay?.rainProbability ?? weather.rainProbability}%`}
                          </div>
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5" />
                            {selectedDay ? `${selectedDay.tempMin}°-${selectedDay.tempMax}°` : weather.season}
                            {isToday && weather.humidity !== undefined && ` · ชื้น ${weather.humidity}%`}
                          </div>
                        </div>
                      </button>
                      {isToday && <p className="mt-3 text-xs text-white/90 leading-relaxed drop-shadow">{weather.advisory}</p>}
                      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                        {weather.sevenDays.slice(0, 7).map((d, i) => (
                          <button
                            type="button"
                            key={d.date}
                            onClick={() => {
                              setWeatherDayIndex(i);
                              setPokeCount(0);
                            }}
                            aria-pressed={i === weatherDayIndex}
                            className={`rounded py-1.5 transition-colors duration-150 ${
                              i === weatherDayIndex ? 'bg-ink-50 text-ink-900' : 'bg-ink-950/25 hover:bg-ink-950/40'
                            }`}
                            title={d.condition}
                          >
                            <div className="text-[10px] opacity-80">{i === 0 ? 'วันนี้' : formatDay(d.date)}</div>
                            {React.createElement(SCENE_ICON[sceneFor(d, false)], { className: 'w-4 h-4 mx-auto my-1', strokeWidth: 1.8 })}
                            <div className="text-[11px] font-semibold tabular">{Math.round(d.tempMax)}°</div>
                            <div className="text-[10px] opacity-80">
                              {d.rainMm !== undefined ? `${d.rainMm}มม.` : `${d.rainProbability}%`}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-white/75">
                        เลือกวันเพื่อดูพยากรณ์ · แตะอุณหภูมิเพื่อดูเอฟเฟกต์
                        {weather.source === 'TMD_API' && (
                          <>
                            <br />
                            พยากรณ์จากกรมอุตุนิยมวิทยา
                            {weather.updatedAt &&
                              ` (อัปเดต ${new Date(weather.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })} น.)`}
                            {weather.currentTempSource === 'OPEN_METEO' && ' · อุณหภูมิตอนนี้จาก Open-Meteo'}
                            {weather.currentTempSource === 'TMD_FORECAST_MAX' && ' · อุณหภูมิตอนนี้คือค่าสูงสุดของวัน'}
                          </>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-white/80">โหลดพยากรณ์อากาศไม่สำเร็จ ลองใหม่อีกครั้ง</p>
                  )}
                </div>
              </section>

              {/* Crowd */}
              <section className="rounded-lg bg-white border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" /> ความหนาแน่นตอนนี้
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: CROWD_LEVELS[overallLevel].color }}
                  >
                    {CROWD_LEVELS[overallLevel].label}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {province.attractions.map((a, i) => (
                    <button
                      key={a.name}
                      onClick={() => setFocusIndex(i)}
                      className={`w-full flex items-center gap-2 text-left rounded px-1.5 py-1 transition-colors ${
                        i === focusIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-24 sm:w-28 truncate text-xs text-slate-700">{a.name}</span>
                      <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <span
                          className="block h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(4, crowds[i].score * 100)}%`, backgroundColor: CROWD_LEVELS[crowds[i].level].color }}
                        />
                      </span>
                      <span className="w-20 text-right text-[11px] text-slate-500">{CROWD_LEVELS[crowds[i].level].label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 text-xs font-medium text-slate-600">ช่วงเวลาคนเยอะวันนี้ · {focus.name}</div>
                <div className="mt-2 flex items-end gap-[3px] h-16">
                  {focusCrowd.hourly.slice(5, 24).map((v, i) => {
                    const h = i + 5;
                    const isNow = h === hour;
                    return (
                      <div key={h} className="flex-1 flex flex-col items-center justify-end h-full" title={`${h}:00 น.`}>
                        <div
                          className={`w-full rounded-t-sm transition-[height] duration-500 ${isNow ? 'bg-orange-600' : 'bg-slate-300'}`}
                          style={{ height: `${Math.max(4, v * 100)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 tabular">
                  <span>05:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                  ค่าประมาณจากช่วงเวลา วันในสัปดาห์ ฤดูท่องเที่ยว และความนิยมของพื้นที่ ไม่ใช่ข้อมูลสดจากสถานที่จริง
                </p>
              </section>

              {/* Budget */}
              <section className="rounded-lg bg-white border border-slate-200 p-5">
                <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-slate-500" /> งบประมาณโดยประมาณ
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-600">
                    จำนวนวัน
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="mt-1 w-full h-9 px-2 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[1, 2, 3, 4, 5, 7].map((d) => (
                        <option key={d} value={d}>
                          {d === 1 ? '1 วัน (ไป-กลับ)' : `${d} วัน ${d - 1} คืน`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">
                    จำนวนคน
                    <select
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                      className="mt-1 w-full h-9 px-2 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} คน
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {budget.tiers.map((t) => (
                    <button
                      key={t.tier}
                      onClick={() => {
                        setTier(t.tier);
                        setCustomBudget(null);
                      }}
                      aria-pressed={tier === t.tier && customPerPerson === null}
                      className={`rounded-md border p-2 text-center transition-colors duration-150 ${
                        tier === t.tier && customPerPerson === null
                          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                          : coveredTier?.tier === t.tier
                            ? 'border-dashed border-emerald-500'
                            : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-medium text-slate-500">{TIER_LABELS[t.tier].label}</div>
                      <div className="text-sm font-semibold font-mono text-slate-900">฿{t.total.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">ต่อคน</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 text-center">
                  {customPerPerson === null ? TIER_LABELS[tier].hint : 'ใช้งบที่คุณกำหนดเอง'}
                </div>

                {/* Own budget */}
                <div
                  className={`mt-3 rounded-md border p-2.5 transition-colors ${
                    customPerPerson !== null ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700">หรือกรอกงบของคุณเอง</span>
                    <div className="flex rounded border border-slate-200 bg-white p-0.5 text-[11px] font-medium" role="group" aria-label="หน่วยงบ">
                      {(['perPerson', 'total'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCustomMode(m)}
                          className={`px-2 py-0.5 rounded-sm transition-colors ${
                            customMode === m ? 'bg-slate-900 text-white dark:bg-white dark:text-ink-900' : 'text-slate-500 hover:text-slate-900'
                          }`}
                          aria-pressed={customMode === m}
                        >
                          {m === 'perPerson' ? 'ต่อคน' : 'ทั้งกลุ่ม'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">฿</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        value={customBudget ?? ''}
                        onChange={(e) => setCustomBudget(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
                        placeholder={customMode === 'perPerson' ? `เช่น ${selectedTier.total.toLocaleString()}` : `เช่น ${(selectedTier.total * people).toLocaleString()}`}
                        className="w-full h-10 pl-7 pr-3 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-900 font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        aria-label={customMode === 'perPerson' ? 'งบต่อคน (บาท)' : 'งบทั้งกลุ่ม (บาท)'}
                      />
                    </div>
                    {customBudget !== null && (
                      <button
                        type="button"
                        onClick={() => setCustomBudget(null)}
                        className="h-10 px-2.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>
                  {customPerPerson !== null && (
                    <p
                      className={`mt-2 text-xs font-medium animate-fadeIn ${
                        coveredTier ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {customMode === 'total' && `≈ ฿${customPerPerson.toLocaleString()}/คน · `}
                      {coveredTier
                        ? `พอสำหรับระดับ "${TIER_LABELS[coveredTier.tier].label}" (${TIER_LABELS[coveredTier.tier].hint})`
                        : `ต่ำกว่าแบบประหยัดอยู่ ฿${(saverTotal - customPerPerson).toLocaleString()}/คน ลองลดวันหรือให้ AI หาทางประหยัด`}
                    </p>
                  )}
                </div>

                <ul className="mt-3 space-y-1.5 text-sm">
                  {[
                    { icon: budget.suggestFlight && tier === 'comfort' ? Plane : Bus, label: 'เดินทางไป-กลับจากกรุงเทพฯ', value: share(selectedTier.transport) },
                    { icon: BedDouble, label: `ที่พัก ${Math.max(0, days - 1)} คืน (พักห้องละ 2 คน)`, value: share(selectedTier.lodging) },
                    { icon: UtensilsCrossed, label: `อาหาร ${days} วัน`, value: share(selectedTier.food) },
                    { icon: Ticket, label: 'ค่าเข้าชม / กิจกรรม', value: share(selectedTier.activities) },
                  ].map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Icon className="w-4 h-4 text-slate-400" /> {label}
                      </span>
                      <span className="font-mono text-slate-900">฿{value.toLocaleString()}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-200 font-semibold text-slate-900">
                    <span>รวมทั้งกลุ่ม ({people} คน)</span>
                    <span className="font-mono text-lg">฿{(perPersonBudget * people).toLocaleString()}</span>
                  </li>
                </ul>
                {customPerPerson !== null && (
                  <p className="mt-1.5 text-[11px] text-slate-500">แบ่งงบของคุณตามสัดส่วนค่าใช้จ่ายโดยประมาณ (ต่อคน)</p>
                )}
                {budget.suggestFlight && (
                  <p className="mt-2 text-xs text-sky-800 bg-sky-50 rounded-md px-2.5 py-1.5 flex items-start gap-1.5">
                    <Plane className="w-3.5 h-3.5 mt-0.5 shrink-0" /> ระยะทางถนนประมาณ {budget.roadKm.toLocaleString()} กม. แนะนำเทียบราคาเครื่องบินโลว์คอสต์ด้วย
                  </p>
                )}
                <p className="mt-2 text-[11px] text-slate-500">ประมาณการเบื้องต้น ราคาจริงขึ้นกับช่วงเวลาและการจอง</p>

                <button
                  onClick={handlePlan}
                  className="mt-4 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> ให้ AI วางแผนด้วยงบ ฿{(perPersonBudget * people).toLocaleString()}
                </button>
                <p className="mt-1.5 text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  ใช้สถานที่ที่เลือกไว้ หรือทุกที่ในจังหวัดถ้ายังไม่ได้เลือก
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Sibling, not child: clicks inside must not bubble to the province window's backdrop */}
    {lightboxOpen && (
      <PlaceLightbox
        key={`${province.name}|${focus.name}`}
        images={focusImages}
        startIndex={Math.min(photoIndex, Math.max(focusImages.length - 1, 0))}
        placeName={focus.name}
        provinceName={province.name}
        reviewer={reviewer}
        onClose={closeLightbox}
      />
    )}
    </>
  );
};
