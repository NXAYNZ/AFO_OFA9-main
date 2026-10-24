'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  ExternalLink,
  CheckCircle,
  Check,
  Tag,
  TrendingDown,
  Lock,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  X,
  Car,
  BedDouble,
  Coffee,
  Tent,
  PartyPopper,
  PiggyBank,
  HeartHandshake,
  Accessibility,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { stripEmoji } from '@/lib/text';
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

const TRAVEL_STYLES: { id: string; label: string; icon: LucideIcon; desc: string }[] = [
  { id: 'สายคาเฟ่', label: 'สายคาเฟ่ & ชิลล์', icon: Coffee, desc: 'ถ่ายรูปสวย จิบกาแฟ เช็กอินพิกัดลับ' },
  { id: 'สายลุยธรรมชาติ', label: 'สายลุยธรรมชาติ', icon: Tent, desc: 'เดินป่า ขึ้นดอย ดำน้ำ ทะเลหมอก' },
  { id: 'สายปาร์ตี้', label: 'สายปาร์ตี้ & มันส์', icon: PartyPopper, desc: 'บีชคลับ ควงกระบองไฟ สังสรรค์เพื่อน' },
  { id: 'สายประหยัด', label: 'สายประหยัด คุ้มค่า', icon: PiggyBank, desc: 'คุมงบเน้นๆ เที่ยวครบ กินอร่อย' },
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

  const fieldClass =
    'w-full h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors';
  const labelClass = 'flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5';
  const plan = tripData?.plans[selectedPlanIndex];

  return (
    <div className="space-y-10">

      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">AI Planner & OTA</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 leading-relaxed">
            วางแผนทริปตามงบ ดูพยากรณ์อากาศจากกรมอุตุฯ (TMD / Open-Meteo) และเทียบราคาที่พักกับตั๋วเดินทางในที่เดียว
          </p>
        </div>
        <div className="text-sm text-slate-500 shrink-0">
          แพ็กเกจ {currentTier} · <span className="font-semibold text-slate-900">{tierConfig.planOptionsPerRequest} แผนต่อครั้ง</span>
        </div>
      </header>

      {/* Planner form */}
      <form onSubmit={handleGeneratePlan} className="rounded-xl bg-white border border-slate-200 shadow-sm">

        {/* Where, when, who, how much */}
        <div className="p-5 sm:p-7 space-y-6">
          <div>
            <label className={labelClass} htmlFor="planner-province">
              <MapPin className="w-4 h-4 text-slate-400" />
              จังหวัดปลายทาง
            </label>
            <input
              id="planner-province"
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="เช่น เกาะเสม็ด จ.ระยอง, เชียงใหม่, ภูเก็ต, น่าน"
              className={`${fieldClass} h-12 text-base`}
              required
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs text-slate-500 mr-1">ยอดนิยม</span>
              {POPULAR_DESTINATIONS.map((dest) => {
                const on = province.includes(dest.label);
                return (
                  <button
                    key={dest.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setProvince(dest.label)}
                    className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                      on ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {dest.label}
                  </button>
                );
              })}
            </div>

            {/* Attractions picked on the Thailand map */}
            {mustVisit.length > 0 && (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <MapPin className="w-3.5 h-3.5" /> สถานที่ที่อยากไป (AI จะจัดลงในแผนให้)
                  </span>
                  <button type="button" onClick={() => setMustVisit([])} className="font-medium text-emerald-700 hover:underline">
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mustVisit.map((place) => (
                    <span
                      key={place}
                      className="inline-flex items-center gap-1 rounded bg-white border border-emerald-200 pl-2 pr-1 py-1 text-xs font-medium text-slate-700"
                    >
                      {place}
                      <button
                        type="button"
                        onClick={() => setMustVisit((prev) => prev.filter((p) => p !== place))}
                        className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        aria-label={`เอา ${place} ออก`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass} htmlFor="planner-dates">
                <Calendar className="w-4 h-4 text-slate-400" />
                วันเดินทาง
              </label>
              <input
                id="planner-dates"
                type="text"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="14 - 16 พ.ย. 2026"
                className={fieldClass}
              />
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`font-semibold tracking-wide ${
                    detectedSeason === 'HIGH' ? 'text-amber-700' : detectedSeason === 'LOW' ? 'text-emerald-700' : 'text-sky-700'
                  }`}
                >
                  {detectedSeason} SEASON
                </span>
                {detectedSeason === 'HIGH' ? 'ช่วงนักท่องเที่ยวเยอะ ราคาสูง' : 'กรีนซีซั่น ได้ราคาประหยัด'}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="planner-people">
                <Users className="w-4 h-4 text-slate-400" />
                จำนวนผู้ร่วมทริป
              </label>
              <div className="relative">
                <input
                  id="planner-people"
                  type="number"
                  min="1"
                  max="20"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${fieldClass} font-mono pr-10`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">คน</span>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="shrink-0">งบต่อคน ฿</span>
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={perPersonBudget}
                  onChange={(e) => setTotalBudget(Math.max(500, parseInt(e.target.value) || 500) * Math.max(1, travelersCount))}
                  className="w-full h-8 px-2 rounded border border-slate-300 bg-white font-mono text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  aria-label="งบต่อคน (บาท)"
                />
              </label>
            </div>

            <div>
              <label className={labelClass} htmlFor="planner-budget">
                <Wallet className="w-4 h-4 text-slate-400" />
                งบประมาณรวม (บาท)
              </label>
              <input
                id="planner-budget"
                type="number"
                step="500"
                min="1000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(1000, parseInt(e.target.value) || 1000))}
                className={`${fieldClass} font-mono font-semibold`}
              />
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-slate-500 mr-1">เลือกเร็ว</span>
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTotalBudget(p)}
                    className={`h-7 px-2 rounded text-xs font-mono transition-colors ${
                      totalBudget === p ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {(p / 1000).toFixed(1)}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Travel style */}
        <fieldset className="px-5 sm:px-7 py-6 border-t border-slate-100">
          <legend className="sr-only">สไตล์การท่องเที่ยว</legend>
          <div className={labelClass} aria-hidden>
            <Compass className="w-4 h-4 text-slate-400" />
            สไตล์การท่องเที่ยว
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = travelStyle === style.id;
              const Icon = style.icon;
              return (
                <button
                  key={style.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setTravelStyle(style.id)}
                  className={`relative text-left p-4 rounded-lg border transition-colors ${
                    isSelected ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} strokeWidth={1.8} />
                  <div className="mt-3 font-semibold text-sm text-slate-900">{style.label}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{style.desc}</div>
                  {isSelected && <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Group needs -> detailed AI prompt */}
        <div className="px-5 sm:px-7 py-6 border-t border-slate-100 bg-slate-50 space-y-6">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" /> ความต้องการเฉพาะของกลุ่ม
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">ระบบแปลงเป็นคำสั่งเชิงลึกส่งให้ AI อัตโนมัติ</p>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 mb-2">สไตล์การกิน (เลือกได้หลายข้อ)</div>
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
                    className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1 ${
                      on ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {on && <Check className="w-3 h-3" />}
                    {stripEmoji(o.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(
              [
                { key: 'sunTolerance', title: 'ความทนต่อแดด', options: SUN_OPTIONS },
                { key: 'rainTolerance', title: 'ความทนต่อฝน', options: RAIN_OPTIONS },
              ] as const
            ).map(({ key, title, options }) => (
              <div key={key}>
                <div className="text-xs font-medium text-slate-700 mb-2">{title}</div>
                <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-white p-0.5" role="group" aria-label={title}>
                  {options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={preferences[key] === o.id}
                      onClick={() => setPreferences((p) => ({ ...p, [key]: o.id }))}
                      className={`h-9 rounded text-xs font-medium transition-colors ${
                        preferences[key] === o.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {stripEmoji(o.label)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(
              [
                { countKey: 'elderlyCount', noteKey: 'elderlyNote', title: 'ผู้สูงอายุในกลุ่ม', icon: HeartHandshake, example: NOTE_EXAMPLES.elderly },
                { countKey: 'disabledCount', noteKey: 'disabledNote', title: 'ผู้พิการ / ใช้วีลแชร์', icon: Accessibility, example: NOTE_EXAMPLES.disabled },
              ] as const
            ).map(({ countKey, noteKey, title, icon: Icon, example }) => {
              const value = Math.min(preferences[countKey], travelersCount);
              return (
                <div key={countKey}>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2" htmlFor={`pref-${countKey}`}>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
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
                      placeholder="0"
                      onChange={(e) =>
                        setPreferences((p) => ({
                          ...p,
                          [countKey]: Math.min(travelersCount, Math.max(0, parseInt(e.target.value) || 0)),
                        }))
                      }
                      className="w-20 h-11 px-3 rounded-md border border-slate-300 bg-white text-sm font-mono text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-xs text-slate-500">คน จากทั้งหมด {travelersCount} คน</span>
                  </div>
                  <textarea
                    value={preferences[noteKey]}
                    onChange={(e) => setPreferences((p) => ({ ...p, [noteKey]: e.target.value.slice(0, NOTE_MAX_LENGTH) }))}
                    placeholder={example}
                    rows={2}
                    maxLength={NOTE_MAX_LENGTH}
                    aria-label={`รายละเอียด${title}`}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
              );
            })}
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 mb-2">การเดินทาง</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TRANSPORT_OPTIONS.map((o) => {
                const on = preferences.transport === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPreferences((p) => ({ ...p, transport: o.id }))}
                    className={`text-left px-3 py-2.5 rounded-md border bg-white transition-colors ${
                      on ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{stripEmoji(o.label)}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
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
              className={`${fieldClass} mt-2`}
            />
          </div>

          {/* Prompt preview: exactly what the server appends */}
          <details className="group rounded-md border border-slate-200 bg-white">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-slate-600 flex items-center justify-between hover:text-slate-900">
              <span>ดูคำสั่งเชิงลึกที่จะส่งให้ AI</span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap font-sans">
              {buildPreferencePrompt(clampedPreferences, travelersCount, perPersonBudget)}
            </pre>
          </details>
        </div>

        {/* Submit */}
        <div className="px-5 sm:px-7 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {errorMsg ? (
            <div className="flex items-start gap-2 text-sm text-rose-700" role="alert">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 max-w-md">
              ใช้ Gemini 2.5 Flash เมื่อตั้งค่า API Key แล้ว หากยังไม่ได้ตั้งค่าจะใช้ข้อมูลจำลอง · ใช้โควตา AI 1 ครั้ง
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังเช็กอากาศและจัดแผน
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                สร้างแผนเที่ยวด้วย AI
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading skeleton */}
      {isLoading && !tripData && (
        <div className="space-y-4" aria-hidden>
          <div className="h-40 rounded-xl bg-slate-200/70 relative overflow-hidden"><div className="absolute inset-0 animate-shimmer" /></div>
          <div className="h-72 rounded-xl bg-slate-200/70 relative overflow-hidden"><div className="absolute inset-0 animate-shimmer" /></div>
        </div>
      )}

      {/* Results */}
      {tripData && (
        <div className="space-y-10 animate-fadeIn">

          <PlannerWeatherCard province={tripData.province} season={tripData.season} weather={tripData.weather} />

          {/* Plans */}
          <section>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">แผนการเดินทางจาก AI</h3>
                <p className="mt-1 text-sm text-slate-500">{tripData.plans.length} แผนสำหรับ {tripData.province}</p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 lg:border-0" role="tablist" aria-label="เลือกแผน">
                {tripData.plans.map((p, idx) => (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={selectedPlanIndex === idx}
                    onClick={() => setSelectedPlanIndex(idx)}
                    className={`h-10 px-3.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedPlanIndex === idx ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    {p.title.split(':')[0] || `แผน ${idx + 1}`}
                  </button>
                ))}
                {currentTier === 'FREE' && (
                  <button
                    onClick={onOpenUpgradeModal}
                    className="h-10 px-3 rounded-md text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    ปลดล็อก 3 แผนด้วย GOLD
                  </button>
                )}
              </div>
            </div>

            {plan && (
              <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                {/* Plan summary */}
                <div className="p-5 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200">
                  <div className="min-w-0">
                    <h4 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">{stripEmoji(plan.title)}</h4>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{stripEmoji(plan.tagline)}</p>
                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <dt><Car className="w-4 h-4 text-slate-400" aria-label="การเดินทาง" /></dt>
                        <dd>{stripEmoji(plan.recommendedTransport)}</dd>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <dt><BedDouble className="w-4 h-4 text-slate-400" aria-label="ที่พัก" /></dt>
                        <dd>{stripEmoji(plan.recommendedLodging)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* The plan total printed on a stub, behind a perforated rule */}
                  <div className="shrink-0 border-t-[1.5px] border-dashed border-slate-300 pt-5 md:border-t-0 md:pt-0 md:border-l-[1.5px] md:pl-8 md:text-right md:self-stretch md:flex md:flex-col md:justify-center">
                    <div className="text-xs text-slate-500">ประมาณการค่าใช้จ่ายต่อคน</div>
                    <div className="mt-1 font-mono text-3xl font-semibold text-slate-900">฿{plan.totalEstimatedCost.toLocaleString()}</div>
                    <div className="mt-1 text-xs font-medium text-emerald-700 flex items-center md:justify-end gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      ประหยัดได้ราว ฿{plan.estimatedSavings.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Day by day: a timetable on a route line */}
                <div className="divide-y divide-slate-100">
                  {plan.days.map((day) => (
                    <section key={day.dayNumber} className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-4 lg:gap-8">
                      <div>
                        <h5 className="font-display text-lg font-semibold text-slate-900 leading-snug">{stripEmoji(day.theme)}</h5>
                        <div className="mt-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-emerald-700">วันที่ {day.dayNumber}</span> · งบ{' '}
                          <span className="font-mono text-slate-700">฿{day.dailyBudget.toLocaleString()}</span>
                        </div>
                      </div>

                      <ol className="relative">
                        <span aria-hidden className="absolute left-[60px] top-2 bottom-2 border-l-2 border-dotted border-slate-300" />
                        {day.activities.map((act, actIdx) => (
                          <li key={actIdx} className="relative grid grid-cols-[52px_16px_minmax(0,1fr)_auto] gap-x-3 py-2.5">
                            <span className="font-mono text-sm text-slate-500 pt-px">{act.time}</span>
                            <span aria-hidden className="relative z-10 mt-1.5 w-3 h-3 rounded-full border-2 border-emerald-600 bg-white dark:bg-ink-900" />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900">{stripEmoji(act.title)}</div>
                              <div className="mt-0.5 text-sm text-slate-600 leading-relaxed">{stripEmoji(act.description)}</div>
                              <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {stripEmoji(act.location)}
                              </div>
                            </div>
                            <span className="font-mono text-sm text-slate-700 pt-px">฿{act.estimatedCost.toLocaleString()}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>

                {/* Savings tips */}
                <div className="p-5 sm:p-7 border-t border-slate-200 bg-sky-50">
                  <h5 className="flex items-center gap-1.5 text-sm font-semibold text-sky-900">
                    <Tag className="w-4 h-4" />
                    เคล็ดลับประหยัดงบสำหรับทริปนี้
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    {plan.savingsTips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex gap-2">
                        <span aria-hidden className="mt-2 w-1 h-1 rounded-full bg-sky-600 shrink-0" />
                        {stripEmoji(tip)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* OTA price comparison */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">เทียบราคาที่พัก</h3>
                <p className="mt-1 text-sm text-slate-500">Agoda, Trip.com และการจองตรง เรียงจากดีลที่คุ้มที่สุด</p>
              </div>
              <p className="text-xs text-slate-500">ลิงก์ Affiliate · แพลตฟอร์มได้รับคอมมิชชั่น 4%</p>
            </div>

            <div className="mt-5 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-[120px_minmax(0,1fr)_150px_200px] gap-4 px-5 py-2.5 border-b border-slate-200 text-xs font-medium text-slate-500">
                <span>ผู้ให้บริการ</span>
                <span>ที่พัก</span>
                <span className="text-right">ราคา</span>
                <span />
              </div>
              <ul className="divide-y divide-slate-100">
                {tripData.otaComparisons.map((ota) => (
                  <li
                    key={ota.id}
                    className={`grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)_150px_200px] gap-x-4 gap-y-2 px-5 py-4 md:items-center ${
                      ota.isCheapest ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{ota.provider}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{ota.name}</span>
                        {ota.isCheapest && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> ถูกที่สุด
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {stripEmoji(ota.seasonTrend)}
                        {ota.badges.length > 0 && <> · {ota.badges.map(stripEmoji).join(' · ')}</>}
                      </div>
                    </div>
                    <div className="md:text-right">
                      <span className="mr-2 text-xs text-slate-400 line-through font-mono">฿{ota.originalPrice.toLocaleString()}</span>
                      <span className="font-mono text-lg font-semibold text-slate-900">฿{ota.discountedPrice.toLocaleString()}</span>
                      <div className="text-xs font-medium text-emerald-700">ลด {ota.savingsPercentage}%</div>
                    </div>
                    <div>
                      <button
                        onClick={() => onRecordAffiliateClick(ota)}
                        className={`w-full h-10 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          ota.isCheapest
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'border border-slate-300 text-slate-700 hover:border-slate-500 hover:text-slate-900'
                        }`}
                      >
                        จองผ่าน {ota.provider}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
                โหมดสาธิต: การกดจองจะบันทึกรายได้ Affiliate 4% เข้า Judge Revenue
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
