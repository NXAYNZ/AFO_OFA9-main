'use client';

import React, { useId, useState } from 'react';
import { BedDouble, Plane, TrainFront, CarFront, FerrisWheel, Luggage, Search, ExternalLink, Minus, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PROVINCE_TRAVEL } from '@/data/thailandTravel';
import { PlannerPresetOptions } from '@/lib/types';

type TabId = 'hotels' | 'flights' | 'trains' | 'cars' | 'attractions' | 'flight_hotel';

interface TravelSearchTabsProps {
  onNavigate: (tab: string) => void;
  onPlanTrip: (province: string, places: string[], totalBudget: number | undefined, people: number, options: PlannerPresetOptions) => void;
}

const TABS: { id: TabId; label: string; en: string; icon: LucideIcon }[] = [
  { id: 'hotels', label: 'ที่พัก', en: 'Hotels & Homes', icon: BedDouble },
  { id: 'flights', label: 'เที่ยวบิน', en: 'Flights', icon: Plane },
  { id: 'trains', label: 'รถไฟ', en: 'Trains', icon: TrainFront },
  { id: 'cars', label: 'รถเช่า', en: 'Cars', icon: CarFront },
  { id: 'attractions', label: 'ที่เที่ยว & ทัวร์', en: 'Attractions & Tours', icon: FerrisWheel },
  { id: 'flight_hotel', label: 'เที่ยวบิน + ที่พัก', en: 'Flight + Hotel', icon: Luggage },
];

const isoDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// "14 - 16 พ.ย. 2026" (the planner's date format)
const thaiRange = (startIso: string, endIso: string) => {
  const s = new Date(`${startIso}T00:00:00`);
  const e = new Date(`${(endIso >= startIso ? endIso : startIso)}T00:00:00`);
  const m = (d: Date) => d.toLocaleDateString('th-TH', { month: 'short' });
  if (s.getTime() === e.getTime()) return `${s.getDate()} ${m(s)} ${s.getFullYear()}`;
  return s.getMonth() === e.getMonth()
    ? `${s.getDate()} - ${e.getDate()} ${m(e)} ${e.getFullYear()}`
    : `${s.getDate()} ${m(s)} - ${e.getDate()} ${m(e)} ${e.getFullYear()}`;
};

const englishName = (thai: string) =>
  thai === 'กรุงเทพฯ' ? 'Bangkok' : PROVINCE_TRAVEL.find((p) => p.name === thai)?.nameEn ?? thai;

const fieldClass =
  'w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all';

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-[11px] font-bold text-slate-500 mb-1">{label}</span>
    {children}
  </label>
);

export const TravelSearchTabs: React.FC<TravelSearchTabsProps> = ({ onNavigate, onPlanTrip }) => {
  const listId = useId();
  const [tab, setTab] = useState<TabId>('hotels');
  const [from, setFrom] = useState('กรุงเทพฯ');
  const [to, setTo] = useState('เชียงใหม่');
  const [start, setStart] = useState(isoDate(14));
  const [end, setEnd] = useState(isoDate(16));
  const [people, setPeople] = useState(2);

  const index = TABS.findIndex((t) => t.id === tab);
  const dates = thaiRange(start, end);
  const needsFrom = tab === 'flights' || tab === 'trains' || tab === 'flight_hotel';
  const needsDates = tab !== 'attractions';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = to.trim() || 'เชียงใหม่';
    const places = PROVINCE_TRAVEL.find((p) => p.name === dest)?.attractions.map((a) => a.name) ?? [];
    switch (tab) {
      case 'hotels':
        onPlanTrip(dest, places, undefined, people, { travelDates: dates, autoGenerate: true });
        break;
      case 'cars':
        onPlanTrip(dest, places, undefined, people, {
          travelDates: dates,
          autoGenerate: true,
          preferences: { transport: 'rental_car', transportNote: `เช่ารถที่${dest} สำหรับ ${people} คน` },
        });
        break;
      case 'flight_hotel':
        onPlanTrip(dest, places, undefined, people, {
          travelDates: dates,
          autoGenerate: true,
          preferences: { transport: 'public', transportNote: `บินจาก${from || 'กรุงเทพฯ'}ไป${dest} แล้วเดินทางต่อในพื้นที่` },
        });
        break;
      case 'flights': {
        const q = `Flights from ${englishName(from)} to ${englishName(dest)} on ${start}${end > start ? ` returning ${end}` : ''} ${people} passengers`;
        window.open(`https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&hl=th`, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'trains':
        window.open('https://dticket.railway.co.th/', '_blank', 'noopener,noreferrer');
        break;
      case 'attractions':
        onNavigate('thailand-map');
        break;
    }
  };

  const action: Record<TabId, { label: string; note: string; external?: boolean }> = {
    hotels: { label: 'เทียบราคาที่พักด้วย AI', note: 'AI จัดแผนพร้อมเทียบราคาที่พัก • ใช้โควตา AI 1 ครั้ง' },
    flights: { label: 'ค้นหาเที่ยวบิน', note: 'เปิดผลค้นหาใน Google Flights', external: true },
    trains: { label: 'จองตั๋วรถไฟ', note: 'ไปที่ระบบ D-Ticket ของการรถไฟแห่งประเทศไทย', external: true },
    cars: { label: 'วางแผนทริปรถเช่าด้วย AI', note: 'AI คิดค่าเช่ารถ น้ำมัน และเส้นทางขับให้ • ใช้โควตา AI 1 ครั้ง' },
    attractions: { label: 'ดูที่เที่ยวบนแผนที่', note: 'แหล่งท่องเที่ยว 77 จังหวัด พร้อมรีวิวและความหนาแน่น' },
    flight_hotel: { label: 'จัดแพ็กเกจบิน + พักด้วย AI', note: 'AI จัดแผนรวมเดินทางและที่พัก • ใช้โควตา AI 1 ครั้ง' },
  };
  const current = action[tab];

  return (
    <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab bar with sliding underline */}
      <div className="relative overflow-x-auto no-scrollbar border-b border-slate-200">
        <div className="relative grid grid-cols-6 min-w-[640px]" role="tablist" aria-label="ประเภทการค้นหา">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={`group flex flex-col items-center gap-1.5 pt-4 pb-3 transition-colors ${
                  on ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-7 h-7 transition-transform duration-300 ${on ? 'scale-110' : 'group-hover:-translate-y-0.5'}`} strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{t.label}</span>
                <span className="text-[10px] text-slate-400 hidden sm:block">{t.en}</span>
              </button>
            );
          })}
          <span
            aria-hidden
            className="absolute bottom-0 h-[3px] rounded-full bg-indigo-600 transition-transform duration-300 ease-out"
            style={{ width: `${100 / TABS.length}%`, transform: `translateX(${index * 100}%)` }}
          />
        </div>
      </div>

      {/* Search panel */}
      <form key={tab} onSubmit={handleSearch} className="p-4 sm:p-5 animate-fadeIn">
        <datalist id={listId}>
          <option value="กรุงเทพฯ" />
          {PROVINCE_TRAVEL.map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {needsFrom && (
            <Field label={tab === 'trains' ? 'สถานีต้นทาง' : 'ต้นทาง'} className="lg:col-span-3">
              <input value={from} onChange={(e) => setFrom(e.target.value)} list={listId} className={fieldClass} placeholder="เช่น กรุงเทพฯ" />
            </Field>
          )}
          <Field
            label={tab === 'hotels' ? 'จะพักที่ไหน' : tab === 'cars' ? 'รับรถที่จังหวัด' : tab === 'trains' ? 'สถานีปลายทาง' : 'ปลายทาง'}
            className={needsFrom ? 'lg:col-span-3' : needsDates ? 'lg:col-span-4' : 'lg:col-span-9'}
          >
            <input value={to} onChange={(e) => setTo(e.target.value)} list={listId} className={fieldClass} placeholder="เช่น เชียงใหม่" required />
          </Field>
          {needsDates && (
            <>
              <Field label={tab === 'hotels' ? 'เช็กอิน' : tab === 'cars' ? 'วันรับรถ' : 'วันไป'} className={needsFrom ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <input
                  type="date"
                  value={start}
                  min={isoDate(0)}
                  onChange={(e) => {
                    setStart(e.target.value);
                    if (e.target.value > end) setEnd(e.target.value);
                  }}
                  className={fieldClass}
                  required
                />
              </Field>
              <Field label={tab === 'hotels' ? 'เช็กเอาท์' : tab === 'cars' ? 'วันคืนรถ' : 'วันกลับ'} className={needsFrom ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={fieldClass} />
              </Field>
            </>
          )}
          <Field label={tab === 'hotels' ? 'ผู้เข้าพัก' : 'ผู้เดินทาง'} className={needsFrom ? 'lg:col-span-2' : 'lg:col-span-2'}>
            <div className="h-12 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-1.5">
              <button
                type="button"
                onClick={() => setPeople((n) => Math.max(1, n - 1))}
                className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                aria-label="ลดจำนวนคน"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-900">{people} คน</span>
              <button
                type="button"
                onClick={() => setPeople((n) => Math.min(20, n + 1))}
                className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                aria-label="เพิ่มจำนวนคน"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Field>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">{current.note}</p>
          <button
            type="submit"
            className="btn-shine h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" /> {current.label}
            {current.external && <ExternalLink className="w-3.5 h-3.5 opacity-80" />}
          </button>
        </div>
      </form>
    </section>
  );
};
