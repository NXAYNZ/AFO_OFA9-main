'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Minus, Plus, CalendarDays, Wallet } from 'lucide-react';
import { PROVINCE_TRAVEL } from '@/data/thailandTravel';
import { REGION_META, REGION_ORDER } from '@/lib/travelMeta';
import { estimateBudget } from '@/lib/tripEstimates';
import { PlannerPresetOptions } from '@/lib/types';

interface QuickAiPlanProps {
  // Province to suggest (selected on the map / top of the chosen region)
  suggestedProvince: string | null;
  // Places already in "ทริปของฉัน"
  basket: { name: string; province: string }[];
  onPlan: (province: string, places: string[], totalBudget: number, people: number, options: PlannerPresetOptions) => void;
}

const STYLES = [
  { id: 'สายคาเฟ่', label: '☕ คาเฟ่' },
  { id: 'สายลุยธรรมชาติ', label: '🏕️ ธรรมชาติ' },
  { id: 'สายปาร์ตี้', label: '🎉 ปาร์ตี้' },
  { id: 'สายประหยัด', label: '💰 ประหยัด' },
];

const BASKET_OPTION = '__basket__';

// Next Saturday (Thailand) as yyyy-mm-dd, a sensible default trip start
const nextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
};

// "14 - 16 พ.ย. 2026", the format the AI planner form uses
const formatRange = (startIso: string, days: number) => {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  const month = (d: Date) => d.toLocaleDateString('th-TH', { month: 'short' });
  if (days === 1) return `${start.getDate()} ${month(start)} ${start.getFullYear()}`;
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()} - ${end.getDate()} ${month(end)} ${end.getFullYear()}`
    : `${start.getDate()} ${month(start)} - ${end.getDate()} ${month(end)} ${end.getFullYear()}`;
};

export const QuickAiPlan: React.FC<QuickAiPlanProps> = ({ suggestedProvince, basket, onPlan }) => {
  const [destination, setDestination] = useState<string>(suggestedProvince || 'เชียงใหม่');
  const [startDate, setStartDate] = useState(nextSaturday);
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [style, setStyle] = useState(STYLES[0].id);
  // Budget follows the estimate until the user types their own
  const [customBudget, setCustomBudget] = useState<number | null>(null);

  // Follow the map: a newly selected province (or a filled basket) becomes the destination
  useEffect(() => {
    if (suggestedProvince) setDestination(suggestedProvince);
  }, [suggestedProvince]);
  useEffect(() => {
    if (basket.length > 0) setDestination(BASKET_OPTION);
    else setDestination((d) => (d === BASKET_OPTION ? suggestedProvince || 'เชียงใหม่' : d));
  }, [basket.length, suggestedProvince]);

  const useBasket = destination === BASKET_OPTION && basket.length > 0;
  const basketProvinces = Array.from(new Set(basket.map((b) => b.province)));

  // Estimate with the standard tier; for a multi-province basket use the farthest province
  const estimate = useMemo(() => {
    const names = useBasket ? basketProvinces : [destination];
    const totals = names
      .map((n) => PROVINCE_TRAVEL.find((p) => p.name === n))
      .filter(Boolean)
      .map((p) => estimateBudget(p!, days, people).tiers.find((t) => t.tier === 'standard')!.total * people);
    return totals.length ? Math.round(Math.max(...totals) / 100) * 100 : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useBasket, basketProvinces.join(','), destination, days, people]);

  const budget = customBudget ?? estimate;

  const handleGo = () => {
    const province = useBasket ? basketProvinces.join(', ') : destination;
    const places = useBasket
      ? basket.map((b) => b.name)
      : PROVINCE_TRAVEL.find((p) => p.name === destination)?.attractions.map((a) => a.name) ?? [];
    onPlan(province, places, budget, people, {
      travelDates: formatRange(startDate, days),
      travelStyle: style,
      autoGenerate: true,
    });
  };

  return (
    <div className="rounded-3xl p-5 shadow-lg text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="font-black text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" /> สร้างแผนเที่ยว AI ทันที
        </div>
        <p className="text-xs text-white/80">เลือกนิดเดียว แล้วให้ AI จัดแผน งบ และเทียบราคาให้เลย</p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold text-white/80">ไปไหนดี</span>
            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setCustomBudget(null);
              }}
              className="mt-1 w-full h-10 px-3 rounded-xl bg-white text-slate-900 text-sm font-semibold outline-none focus:ring-4 focus:ring-white/30"
            >
              {basket.length > 0 && (
                <option value={BASKET_OPTION}>
                  🧳 สถานที่ในทริปของฉัน ({basket.length} ที่ • {basketProvinces.join(', ')})
                </option>
              )}
              {REGION_ORDER.map((region) => (
                <optgroup key={region} label={`${REGION_META[region].emoji} ${REGION_META[region].label}`}>
                  {PROVINCE_TRAVEL.filter((p) => p.region === region).map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> วันเริ่มเดินทาง
              </span>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
                className="mt-1 w-full h-10 px-2 rounded-xl bg-white text-slate-900 text-sm font-semibold outline-none focus:ring-4 focus:ring-white/30"
              />
            </label>
            <div>
              <span className="text-[11px] font-semibold text-white/80">กี่คน</span>
              <div className="mt-1 h-10 flex items-center justify-between rounded-xl bg-white/15 border border-white/25 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setPeople((n) => Math.max(1, n - 1));
                    setCustomBudget(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
                  aria-label="ลดจำนวนคน"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black">{people} คน</span>
                <button
                  type="button"
                  onClick={() => {
                    setPeople((n) => Math.min(20, n + 1));
                    setCustomBudget(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
                  aria-label="เพิ่มจำนวนคน"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-white/80">กี่วัน</span>
            <div className="mt-1 grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => {
                    setDays(n);
                    setCustomBudget(null);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold transition-all ${
                    days === n ? 'bg-white text-teal-700 shadow-md' : 'bg-white/15 hover:bg-white/25'
                  }`}
                >
                  {n === 1 ? 'ไปกลับ' : `${n} วัน`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-white/80">สไตล์</span>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {STYLES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`h-8 rounded-lg text-[11px] font-bold transition-all ${
                    style === s.id ? 'bg-white text-teal-700 shadow-md' : 'bg-white/15 hover:bg-white/25'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> งบรวมทั้งทริป (บาท)
              {customBudget === null && <span className="font-normal text-white/60">• ประมาณการอัตโนมัติ</span>}
            </span>
            <input
              type="number"
              min={500}
              step={500}
              value={budget || ''}
              onChange={(e) => setCustomBudget(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full h-10 px-3 rounded-xl bg-white text-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-white/30"
            />
          </label>
        </div>

        <button
          onClick={handleGo}
          disabled={!budget || (!useBasket && !destination)}
          className="btn-shine mt-4 w-full h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          สร้างแผน {formatRange(startDate, days)} เลย!
        </button>
        <p className="mt-2 text-[10px] text-white/70 text-center">ใช้โควตา AI 1 ครั้ง • ปรับรายละเอียดต่อได้ในหน้า AI วางแผน</p>
      </div>
    </div>
  );
};
