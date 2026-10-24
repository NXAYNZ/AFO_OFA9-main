'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  Thermometer,
  ExternalLink,
  CheckCircle,
  Tag,
  Clock,
  ArrowRight,
  TrendingDown,
  Lock,
  ChevronRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AiTripResponse,
  SubscriptionTier,
  TripPlanOption,
  WeatherForecast,
  OtaComparison,
  PlannerPreset,
  TripPreferences,
  TIER_CONFIGS,
  isQuotaExhausted,
} from '@/lib/types';
import { PlannerWeatherCard } from '@/components/PlannerWeatherCard';
import {
  DEFAULT_PREFERENCES,
  FOOD_OPTIONS,
  SUN_OPTIONS,
  RAIN_OPTIONS,
  TRANSPORT_OPTIONS,
  NOTE_EXAMPLES,
  NOTE_MAX_LENGTH,
  buildPreferencePrompt,
} from '@/lib/tripPrompt';
import { THAI_PROVINCES, detectThailandSeason } from '@/lib/weather';

interface AiPlannerTabProps {
  currentTier: SubscriptionTier;
  aiQuotaUsed: number;
  onQuotaIncrement: () => void;
  onOpenUpgradeModal: () => void;
  onRecordAffiliateClick: (ota: OtaComparison) => void;
  // Destination + attractions sent from the Thailand map (nonce changes on every send)
  preset?: PlannerPreset | null;
  onPresetUsed?: () => void;
}

const POPULAR_DESTINATIONS = [
  { key: 'rayong', label: 'เกาะเสม็ด จ.ระยอง', tag: 'เกาะยอดฮิต' },
  { key: 'chiangmai', label: 'เชียงใหม่', tag: 'ดอย & คาเฟ่' },
  { key: 'phuket', label: 'ภูเก็ต', tag: 'ทะเลอันดามัน' },
  { key: 'krabi', label: 'กระบี่', tag: 'ฟรีไดฟ์ & ถ้ำ' },
  { key: 'nan', label: 'น่าน', tag: 'ดูดาว & หมอก' },
];

const TRAVEL_STYLES = [
  { id: 'สายคาเฟ่', label: 'สายคาเฟ่ & ชิลล์', icon: '☕', desc: 'ถ่ายรูปสวย จิบกาแฟ เช็กอินพิกัดลับ' },
  { id: 'สายลุยธรรมชาติ', label: 'สายลุยธรรมชาติ', icon: '🏕️', desc: 'เดินป่า ขึ้นดอย ดำน้ำ ทะเลหมอก' },
  { id: 'สายปาร์ตี้', label: 'สายปาร์ตี้ & มันส์', icon: '🎉', desc: 'บีชคลับ ควงกระบองไฟ สังสรรค์เพื่อน' },
  { id: 'สายประหยัด', label: 'สายประหยัด คุ้มค่า', icon: '💰', desc: 'คุมงบเน้นๆ เที่ยวครบ กินอร่อย' },
];

const BUDGET_PRESETS = [3500, 7000, 12000, 25000];

export const AiPlannerTab: React.FC<AiPlannerTabProps> = ({
  currentTier,
  aiQuotaUsed,
  onQuotaIncrement,
  onOpenUpgradeModal,
  onRecordAffiliateClick,
  preset,
  onPresetUsed,
}) => {
  // Form State
  const [province, setProvince] = useState<string>(preset?.province || 'เกาะเสม็ด จ.ระยอง');
  const [mustVisit, setMustVisit] = useState<string[]>(preset?.mustVisit || []);

  useEffect(() => {
    if (!preset) return;
    setProvince(preset.province);
    setMustVisit(preset.mustVisit);
    if (preset.totalBudget) setTotalBudget(preset.totalBudget);
    if (preset.travelersCount) setTravelersCount(preset.travelersCount);
    if (preset.travelDates) setTravelDates(preset.travelDates);
    if (preset.travelStyle) setTravelStyle(preset.travelStyle);
    if (preset.preferences) setPreferences((p) => ({ ...p, ...preset.preferences }));
    if (preset.autoGenerate) setAutoRunNonce(preset.nonce);
    onPresetUsed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.nonce]);

  // Runs on the render after the preset's values are in state, so the request uses them
  const [autoRunNonce, setAutoRunNonce] = useState<number | null>(null);
  useEffect(() => {
    if (autoRunNonce === null) return;
    setAutoRunNonce(null);
    handleGeneratePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunNonce]);
  const [travelDates, setTravelDates] = useState<string>('14 - 16 พ.ย. 2026');
  const [totalBudget, setTotalBudget] = useState<number>(10500);
  const [travelersCount, setTravelersCount] = useState<number>(3);
  const [travelStyle, setTravelStyle] = useState<string>('สายคาเฟ่');
  const [preferences, setPreferences] = useState<TripPreferences>(DEFAULT_PREFERENCES);
  // Counts can't exceed the group size if travellers is lowered afterwards
  const clampedPreferences: TripPreferences = {
    ...preferences,
    elderlyCount: Math.min(preferences.elderlyCount, travelersCount),
    disabledCount: Math.min(preferences.disabledCount, travelersCount),
  };

  // Generation & Results State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tripData, setTripData] = useState<AiTripResponse | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tierConfig = TIER_CONFIGS[currentTier];
  const detectedSeason = detectThailandSeason(travelDates);
  const perPersonBudget = Math.round(totalBudget / Math.max(1, travelersCount));

  // Handle Form Submit
  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Check Quota
    if (isQuotaExhausted(currentTier, aiQuotaUsed)) {
      onOpenUpgradeModal();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          travelDates,
          totalBudget,
          travelersCount,
          travelStyle,
          tier: currentTier,
          currentQuotaUsed: aiQuotaUsed,
          mustVisit,
          preferences: clampedPreferences,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.quotaExceeded) {
          onOpenUpgradeModal();
          setErrorMsg(data.message || 'โควตาการใช้งานรายเดือนหมดแล้ว กรุณาอัปเกรดเพื่อดำเนินการต่อ');
        } else {
          setErrorMsg(data.error || 'ไม่สามารถสร้างแผนท่องเที่ยวได้');
        }
        setIsLoading(false);
        return;
      }

      setTripData(data);
      setSelectedPlanIndex(0);
      onQuotaIncrement();
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: SMART INPUT FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                AI Smart Trip Planner & OTA Price Engine
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              คำนวณงบประมาณ สภาพอากาศกรมอุตุฯ (TMD / Open-Meteo) และเปรียบเทียบราคาโรงแรม/ตั๋วเดินทาง
            </p>
          </div>

          {/* Active Tier Capability Indicator */}
          <div className="flex items-center space-x-2 self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">สิทธิ์ Tier ปัจจุบัน:</span>
            <span className="font-bold text-emerald-700">
              สร้าง {tierConfig.planOptionsPerRequest} แผน / ครั้ง
            </span>
          </div>
        </div>

        <form onSubmit={handleGeneratePlan} className="mt-6 space-y-6">
          
          {/* Destination Selection & Quick Chips */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>จังหวัดปลายทางในไทย</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="เช่น เกาะเสม็ด จ.ระยอง, เชียงใหม่, ภูเก็ต, น่าน..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                required
              />
            </div>
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-xs text-slate-400 font-medium">จุดหมายยอดนิยม:</span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.key}
                  type="button"
                  onClick={() => setProvince(dest.label)}
                  className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                    province.includes(dest.label)
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dest.label}
                </button>
              ))}
            </div>

            {/* Attractions picked on the Thailand map */}
            {mustVisit.length > 0 && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>📍 สถานที่ที่อยากไป (AI จะจัดลงในแผนให้)</span>
                  <button type="button" onClick={() => setMustVisit([])} className="font-medium text-emerald-700 hover:underline">
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mustVisit.map((place) => (
                    <span
                      key={place}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-emerald-200 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {place}
                      <button
                        type="button"
                        onClick={() => setMustVisit((prev) => prev.filter((p) => p !== place))}
                        className="text-slate-400 hover:text-rose-600"
                        aria-label={`เอา ${place} ออก`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid: Dates & Travelers & Season Detection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Travel Dates */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>วันเดินทาง & ฤดูกาล</span>
              </label>
              <input
                type="text"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="14 - 16 พ.ย. 2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md font-bold uppercase ${
                    detectedSeason === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : detectedSeason === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}
                >
                  {detectedSeason} SEASON
                </span>
                <span className="text-xs text-slate-500">
                  {detectedSeason === 'HIGH' ? 'นักท่องเที่ยวนิยม ราคาพีค' : 'กรีนซีซั่น ได้ดีลราคาประหยัด'}
                </span>
              </div>
            </div>

            {/* Travelers Count */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>จำนวนผู้ร่วมทริป</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold"
                />
                <span className="text-sm font-medium text-slate-500 shrink-0">คน</span>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="shrink-0">งบต่อคน ฿</span>
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={perPersonBudget}
                  onChange={(e) => setTotalBudget(Math.max(500, parseInt(e.target.value) || 500) * Math.max(1, travelersCount))}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="งบต่อคน (บาท)"
                />
              </label>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>งบประมาณรวม (บาท)</span>
              </label>
              <input
                type="number"
                step="500"
                min="1000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(1000, parseInt(e.target.value) || 1000))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono font-bold text-slate-900"
              />
              {/* Presets */}
              <div className="flex items-center space-x-1 mt-2">
                <span className="text-xs text-slate-400 mr-1">งบ:</span>
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTotalBudget(p)}
                    className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono font-medium"
                  >
                    {(p / 1000).toFixed(1)}k
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Travel Style Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>สไตล์การท่องเที่ยว (Travel Vibe)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = travelStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setTravelStyle(style.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{style.icon}</div>
                    <div className="font-bold text-sm text-slate-900">{style.label}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-tight">{style.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group needs -> detailed AI prompt */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> ความต้องการเฉพาะของกลุ่ม
              </h3>
              <p className="text-xs text-slate-500">ระบบจะแปลงเป็นคำสั่งเชิงลึกส่งให้ AI อัตโนมัติ</p>
            </div>

            {/* Food */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">สไตล์การกิน (เลือกได้หลายข้อ)</div>
              <div className="flex flex-wrap gap-1.5">
                {FOOD_OPTIONS.map((o) => {
                  const on = preferences.foodStyles.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          foodStyles: on ? p.foodStyles.filter((f) => f !== o.id) : [...p.foodStyles, o.id],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        on
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sun / rain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: 'sunTolerance', title: 'ความทนต่อแดด', options: SUN_OPTIONS },
                  { key: 'rainTolerance', title: 'ความทนต่อฝน', options: RAIN_OPTIONS },
                ] as const
              ).map(({ key, title, options }) => (
                <div key={key}>
                  <div className="text-xs font-bold text-slate-700 mb-2">{title}</div>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70" role="group" aria-label={title}>
                    {options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={preferences[key] === o.id}
                        onClick={() => setPreferences((p) => ({ ...p, [key]: o.id }))}
                        className={`h-9 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                          preferences[key] === o.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Elderly / disabled: typed count + free-text details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { countKey: 'elderlyCount', noteKey: 'elderlyNote', title: '👵 ผู้สูงอายุในกลุ่ม', example: NOTE_EXAMPLES.elderly },
                  { countKey: 'disabledCount', noteKey: 'disabledNote', title: '♿ ผู้พิการ / ใช้วีลแชร์', example: NOTE_EXAMPLES.disabled },
                ] as const
              ).map(({ countKey, noteKey, title, example }) => {
                const value = Math.min(preferences[countKey], travelersCount);
                return (
                  <div key={countKey}>
                    <label className="block text-xs font-bold text-slate-700 mb-2" htmlFor={`pref-${countKey}`}>
                      {title}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={`pref-${countKey}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={travelersCount}
                        value={value || ''}
                        placeholder="เช่น 1"
                        onChange={(e) =>
                          setPreferences((p) => ({
                            ...p,
                            [countKey]: Math.min(travelersCount, Math.max(0, parseInt(e.target.value) || 0)),
                          }))
                        }
                        className="w-24 h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500">คน (จาก {travelersCount} คน)</span>
                    </div>
                    <textarea
                      value={preferences[noteKey]}
                      onChange={(e) => setPreferences((p) => ({ ...p, [noteKey]: e.target.value.slice(0, NOTE_MAX_LENGTH) }))}
                      placeholder={example}
                      rows={2}
                      maxLength={NOTE_MAX_LENGTH}
                      aria-label={`รายละเอียด${title}`}
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder:text-slate-400"
                    />
                  </div>
                );
              })}
            </div>

            {/* Transport: pick a type, then describe the vehicle */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">ประเภทรถที่ใช้</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TRANSPORT_OPTIONS.map((o) => {
                  const on = preferences.transport === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPreferences((p) => ({ ...p, transport: o.id }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        on ? 'border-emerald-600 bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">{o.label}</div>
                      <div className="text-[11px] text-slate-500">{o.desc}</div>
                    </button>
                  );
                })}
              </div>
              <input
                value={preferences.transportNote}
                onChange={(e) => setPreferences((p) => ({ ...p, transportNote: e.target.value.slice(0, NOTE_MAX_LENGTH) }))}
                placeholder={NOTE_EXAMPLES.transport[preferences.transport]}
                maxLength={NOTE_MAX_LENGTH}
                aria-label="รายละเอียดการเดินทาง"
                className="mt-2 w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>

            {/* Prompt preview: exactly what the server appends */}
            <details className="group rounded-xl border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>🧠 ดู Prompt เชิงลึกที่จะส่งให้ AI</span>
                <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
              </summary>
              <pre className="px-3 pb-3 text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap font-sans">
                {buildPreferencePrompt(clampedPreferences, travelersCount, perPersonBudget)}
              </pre>
            </details>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2">
              <Info className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">แจ้งเตือนระบบ</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                พร้อมสวิตช์ใช้งาน Gemini 2.5 Flash อัตโนมัติเมื่อใส่ API Key หรือใช้ฐานข้อมูลจำลองที่สมบูรณ์แบบ
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังวิเคราะห์สภาพอากาศ & คำนวณแผน AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>สร้างแผนท่องเที่ยว AI (Generate Trip Plan)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* SECTION 2: RESULTS DISPLAY (WEATHER + PLANS + OTA ENGINE) */}
      {tripData && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* WEATHER CARD (TMD / Open-Meteo) with animated scene */}
          <PlannerWeatherCard province={tripData.province} season={tripData.season} weather={tripData.weather} />

          {/* PLAN OPTIONS SELECTOR (1, 3, or 5 based on Tier) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  AI Tailored Plans ({tripData.plans.length} แผนพร้อมใช้งาน)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  แผนการเดินทางที่ AI คัดสรรเพื่อคุณ
                </h3>
              </div>

              {/* Tier Plan Selector Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto p-1 bg-slate-100 rounded-2xl">
                {tripData.plans.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlanIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      selectedPlanIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.title.split(':')[0] || `แผน ${idx + 1}`}
                  </button>
                ))}

                {/* Upgrade Teaser if on Free Tier */}
                {currentTier === 'FREE' && (
                  <button
                    onClick={onOpenUpgradeModal}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200/80 transition-all flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>ปลดล็อก 3 แผน (Gold)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Plan Detail */}
            {tripData.plans[selectedPlanIndex] && (
              <div className="mt-6 space-y-6">
                
                {/* Plan Header & Cost Summary */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {tripData.plans[selectedPlanIndex].title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      {tripData.plans[selectedPlanIndex].tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
                        🚗 {tripData.plans[selectedPlanIndex].recommendedTransport}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
                        🏨 {tripData.plans[selectedPlanIndex].recommendedLodging}
                      </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0 bg-white/80 p-4 rounded-xl border border-emerald-200">
                    <div className="text-xs text-slate-500 font-medium">ประมาณการค่าใช้จ่ายรวม/คน:</div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
                      ฿{tripData.plans[selectedPlanIndex].totalEstimatedCost.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 flex items-center justify-start md:justify-end space-x-1 mt-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>ประหยัดได้ ~฿{tripData.plans[selectedPlanIndex].estimatedSavings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Itinerary Timeline */}
                <div className="space-y-6">
                  {tripData.plans[selectedPlanIndex].days.map((day) => (
                    <div key={day.dayNumber} className="border border-slate-200 rounded-2xl p-5 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                            D{day.dayNumber}
                          </span>
                          <span className="font-bold text-slate-900 text-base">{day.theme}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          งบประมาณวัน: ฿{day.dailyBudget.toLocaleString()}
                        </span>
                      </div>

                      {/* Activities List */}
                      <div className="space-y-3">
                        {day.activities.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-all gap-2"
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5">
                                {act.time}
                              </span>
                              <div>
                                <div className="text-sm font-bold text-slate-800">{act.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{act.description}</div>
                                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{act.location}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:self-center shrink-0">
                              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                                ฿{act.estimatedCost.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings Tips Card */}
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="font-bold text-amber-900 text-sm flex items-center space-x-1.5 mb-2">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <span>เคล็ดลับการประหยัดงบสำหรับทริปนี้ (AI Budget Optimization Tips):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-amber-950/90 list-disc list-inside">
                    {tripData.plans[selectedPlanIndex].savingsTips.map((tip, tipIdx) => (
                      <li key={tipIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>

          {/* SECTION 3: OTA PRICE COMPARATOR ENGINE ("Make Me Money" Affiliate Stream) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Live Price Comparator & Affiliate Deals
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  ตารางเปรียบเทียบราคา Agoda vs Trip.com vs จองตรง
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  ระบบค้นหาดีลที่ถูกที่สุดในตลาดแบบเรียลไทม์ พร้อมลิงก์ Affiliate รับคอมมิชชั่น 4%
                </p>
              </div>

              <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 font-semibold self-start sm:self-center">
                ✨ อัปเดตราคาแบบ Real-time
              </div>
            </div>

            {/* OTA Comparison Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tripData.otaComparisons.map((ota) => (
                <div
                  key={ota.id}
                  className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    ota.isCheapest
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-400/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header Provider & Cheap Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {ota.provider}
                      </span>
                      {ota.isCheapest && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>ถูกที่สุดในตลาด</span>
                        </span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-base text-slate-900 line-clamp-2">
                      {ota.name}
                    </h5>

                    {/* Historical Trend Badge */}
                    <div className="mt-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        📈 {ota.seasonTrend}
                      </span>
                    </div>

                    {/* Badges list */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {ota.badges.map((b, bIdx) => (
                        <span key={bIdx} className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5 font-mono">
                          ฿{ota.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-2xl font-black font-mono text-slate-900">
                          ฿{ota.discountedPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        ลด {ota.savingsPercentage}%
                      </span>
                    </div>

                    <button
                      onClick={() => onRecordAffiliateClick(ota)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                        ota.isCheapest
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>จองผ่าน {ota.provider} (รับส่วนลด)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-center text-[10px] text-slate-400 mt-1">
                      (จำลองบันทึกรายได้ Affiliate 4% เข้า Judge Dashboard)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
