'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CircleCheck,
  Wallet,
  Plus,
  Home,
  Route,
  Hotel,
  Plane,
  Ticket,
  Map as MapIcon,
  UserRound,
  Clock,
  ArrowRight,
  TriangleAlert,
  Check,
  Users,
  Accessibility,
  SquareParking,
  Camera,
  CloudSun,
  CloudRain,
  Info,
  FerrisWheel,
  UtensilsCrossed,
  Car,
  RefreshCw,
  Pencil,
  CalendarDays,
  Save,
  BriefcaseBusiness,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BadgeKind, BudgetLine, PlannerModes, Stop } from './plannerData';
import { RouteMap } from './RouteMap';
import { CountUp } from '@/components/motion';
import type { OtaCategory } from './Modals';

const BADGE_STYLE: Record<BadgeKind, { icon: LucideIcon; className: string }> = {
  crowd: { icon: Users, className: 'bg-tsg-50 text-tsg-700' },
  access: { icon: Accessibility, className: 'bg-tsb-50 text-tsb-700' },
  parking: { icon: SquareParking, className: 'bg-tsn-100 text-tsn-600' },
  photo: { icon: Camera, className: 'bg-[#FDF2F8] text-[#BE185D]' },
  weather: { icon: CloudSun, className: 'bg-tsa-50 text-tsa-700' },
  rain: { icon: CloudRain, className: 'bg-tsb-50 text-tsb-700' },
  note: { icon: Info, className: 'bg-tsn-100 text-tsn-600' },
};

const LINE_ICON: Record<BudgetLine['key'], LucideIcon> = {
  lodging: Hotel,
  activities: FerrisWheel,
  food: UtensilsCrossed,
  transport: Car,
};

interface Props {
  title: string;
  onRename: (t: string) => void;
  cover?: string;
  dateLabel: string;
  people: number;
  budget: number;
  days: Stop[][];
  dayLabels: string[];
  activeDay: number;
  onSelectDay: (d: number) => void;
  onAddDay: () => void;
  slots: [string, string][];
  modes: PlannerModes;
  onToggleMode: (m: keyof PlannerModes) => void;
  onSwap: (day: number, index: number) => void;
  lines: BudgetLine[];
  approx: boolean;
  thinking: boolean;
  saved: boolean;
  onSave: () => void;
  onOpenQuote: () => void;
  onOpenOta: (c: OtaCategory) => void;
}

const BULLETS = ['แนะนำสถานที่ที่เหมาะกับคุณ', 'ปรับแผนตามงบประมาณและจำนวนคน', 'เปรียบเทียบราคาแบบเรียลไทม์', 'แก้ไขและปรับแต่งได้ตามต้องการ'];

export const PlannerShowcase: React.FC<Props> = (p) => {
  const [editing, setEditing] = useState(false);
  const total = p.lines.reduce((s, l) => s + l.amount, 0);
  const inBudget = total <= p.budget;
  const stops = p.days[p.activeDay] ?? [];

  const modeButtons: { key: keyof PlannerModes; label: string; icon: LucideIcon }[] = [
    { key: 'eco', label: 'สลับเป็นงบประหยัด 12,000 ฿', icon: RefreshCw },
    { key: 'accessible', label: 'โหมดทางลาด/ผู้สูงอายุ', icon: Accessibility },
    { key: 'rainy', label: 'สลับแผนหลบฝน/เลี่ยงคนแน่น', icon: CloudRain },
  ];

  const sideNav: { label: string; icon: LucideIcon; onClick?: () => void; href?: string; active?: boolean }[] = [
    { label: 'หน้าแรก', icon: Home, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'AI Planner', icon: Sparkles, active: true },
    { label: 'แผนการเดินทาง', icon: Route, onClick: () => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) },
    { label: 'ที่พัก', icon: Hotel, onClick: () => p.onOpenOta('hotel') },
    { label: 'ตั๋วเครื่องบิน', icon: Plane, onClick: () => p.onOpenOta('flight') },
    { label: 'กิจกรรม', icon: Ticket, onClick: () => p.onOpenOta('activity') },
    { label: 'แผนที่', icon: MapIcon, onClick: () => document.getElementById('route-map')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) },
    { label: 'งบประมาณ', icon: Wallet, onClick: () => document.getElementById('budget-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) },
    { label: 'โปรไฟล์', icon: UserRound, href: '/workspace' },
  ];

  return (
    <section id="planner" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="grid xl:grid-cols-[340px_minmax(0,1fr)] gap-10 xl:gap-12 items-start">
        {/* Value proposition + demo toggles */}
        <div className="xl:sticky xl:top-28">
          <span className="reveal inline-flex items-center gap-1.5 rounded-full bg-tsb-50 px-3 py-1 text-sm font-medium text-tsb-700">
            <Sparkles className="w-4 h-4" /> AI Planner
          </span>
          <h2 style={{ '--i': 1 } as React.CSSProperties} className="reveal mt-4 text-3xl sm:text-[2.5rem] leading-tight font-bold text-tsn-900">สร้างแผนทริปได้ในไม่กี่คลิก</h2>
          <p className="mt-4 text-tsn-600 leading-relaxed">
            บอกความต้องการของคุณ แล้วให้ AI ช่วยออกแบบแผนการเดินทางที่เหมาะกับงบประมาณและสไตล์ของคุณ
          </p>
          <ul className="mt-6 space-y-3">
            {BULLETS.map((b, i) => (
              <li key={b} style={{ '--i': i + 2 } as React.CSSProperties} className="reveal reveal-left flex items-center gap-3 text-tsn-700">
                <CircleCheck className="w-5 h-5 text-tsg-500 shrink-0" /> {b}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <div className="text-sm font-medium text-tsn-500">ลองปรับเงื่อนไข แล้วดูแผนทางขวาเปลี่ยนทันที</div>
            <div className="mt-3 flex flex-wrap xl:flex-col xl:items-start gap-2">
              {modeButtons.map((m) => {
                const on = p.modes[m.key];
                return (
                  <button
                    key={m.key}
                    aria-pressed={on}
                    onClick={() => p.onToggleMode(m.key)}
                    className={`h-10 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-colors ${
                      on ? 'border-tsb-600 bg-tsb-600 text-tsn-0' : 'border-tsn-200 bg-tsn-0 text-tsn-700 hover:border-tsb-400 hover:text-tsb-700'
                    }`}
                  >
                    {on ? <Check className="w-4 h-4" /> : <m.icon className="w-4 h-4" />}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => document.getElementById('hero-destination')?.focus(), 500);
            }}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-tsb-600 px-6 font-semibold text-tsn-0 shadow-lg shadow-tsb-600/25 hover:bg-tsb-700 transition-colors"
          >
            ลองวางแผนทริปของคุณเลย <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* App window */}
        <div className="reveal reveal-scale rounded-3xl border border-tsn-200 bg-tsn-0 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 h-9 border-b border-tsn-100 bg-tsn-50">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 text-xs text-tsn-400">app.tripsure.ai/planner</span>
          </div>

          <div className="flex">
            <nav className="hidden md:flex flex-col w-44 shrink-0 border-r border-tsn-100 p-3 gap-0.5" aria-label="เมนูในแอป">
              {sideNav.map((n) => {
                const cls = `h-9 px-3 rounded-full text-sm flex items-center gap-2.5 transition-colors ${
                  n.active ? 'bg-tsb-600 text-tsn-0 font-medium' : 'text-tsn-600 hover:bg-tsb-50 hover:text-tsb-700'
                }`;
                return n.href ? (
                  <Link key={n.label} href={n.href} className={cls}>
                    <n.icon className="w-4 h-4" /> {n.label}
                  </Link>
                ) : (
                  <button key={n.label} onClick={n.onClick} className={`${cls} text-left`} aria-current={n.active ? 'page' : undefined}>
                    <n.icon className="w-4 h-4" /> {n.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 min-w-0 p-4 sm:p-5">
              {/* Trip header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {p.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <span className="w-14 h-14 rounded-xl bg-tsb-50 text-tsb-600 flex items-center justify-center shrink-0">
                      <MapIcon className="w-6 h-6" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {editing ? (
                        <input
                          autoFocus
                          defaultValue={p.title}
                          onBlur={(e) => {
                            p.onRename(e.target.value.trim() || p.title);
                            setEditing(false);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="text-lg font-semibold border-b-2 border-tsb-600 outline-none min-w-0 w-64"
                          aria-label="ชื่อทริป"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-tsn-900 truncate">{p.title}</h3>
                      )}
                      <button onClick={() => setEditing(true)} className="p-1 rounded-md text-tsn-400 hover:text-tsb-600 hover:bg-tsb-50" aria-label="แก้ไขชื่อทริป">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tsn-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" /> {p.dateLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {p.people} คน
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-4 h-4" /> งบประมาณ {p.budget.toLocaleString('th-TH')} บาท
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={p.onSave} className="press h-10 px-4 rounded-full border border-tsn-200 text-sm font-medium text-tsn-700 flex items-center gap-2 hover:border-tsb-400 hover:text-tsb-700 transition-colors">
                    {p.saved ? <CircleCheck className="w-4 h-4 text-tsg-500" /> : <Save className="w-4 h-4" />}
                    {p.saved ? 'บันทึกแล้ว' : 'บันทึก'}
                  </button>
                  <button onClick={p.onOpenQuote} className="btn-start press h-10 px-4 rounded-full text-sm font-semibold text-tsn-0 flex items-center gap-2 transition-colors">
                    <BriefcaseBusiness className="w-4 h-4" /> สร้างแพ็กเกจ
                  </button>
                </div>
              </div>

              {/* Day tabs */}
              <div className="mt-5 flex gap-1 overflow-x-auto no-scrollbar border-b border-tsn-100" role="tablist" aria-label="เลือกวัน">
                {p.days.map((_, d) => (
                  <button
                    key={d}
                    role="tab"
                    aria-selected={d === p.activeDay}
                    onClick={() => p.onSelectDay(d)}
                    className={`relative h-10 px-3 text-sm whitespace-nowrap transition-colors ${
                      d === p.activeDay ? 'text-tsb-700 font-semibold' : 'text-tsn-500 hover:text-tsn-900'
                    }`}
                  >
                    วันที่ {d + 1} ({p.dayLabels[d]})
                    {d === p.activeDay && <span className="nav-underline absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-tsb-600" />}
                  </button>
                ))}
                {p.days.length < 5 && (
                  <button onClick={p.onAddDay} className="h-10 px-3 text-sm text-tsb-600 hover:text-tsb-700 flex items-center gap-1 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> เพิ่มวัน
                  </button>
                )}
              </div>

              <div className={`mt-4 grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.95fr)] transition-opacity duration-300 ${p.thinking ? 'opacity-50 thinking-bar' : ''}`}>
                {/* Stops */}
                <div id="itinerary" className="space-y-3 md:row-span-2 2xl:row-span-1">
                  {stops.map((s, i) => {
                    const slot = p.slots[i] ?? p.slots[p.slots.length - 1];
                    return (
                      <article key={`${p.activeDay}-${s.id}-${i}`} style={{ '--i': i } as React.CSSProperties} className="stop-in lift rounded-2xl border border-tsn-200 p-3.5 hover:border-tsb-200">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-tsb-600 text-tsn-0 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-tsn-900 leading-snug">{s.name}</h4>
                              <span className="shrink-0 font-semibold text-tsn-900 tabular">{s.cost > 0 ? `${s.cost.toLocaleString('th-TH')} บาท` : 'ฟรี'}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-sm text-tsn-500 tabular">
                              <Clock className="w-3.5 h-3.5" /> {slot[0]} - {slot[1]}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {s.badges.map((b) => {
                                const st = BADGE_STYLE[b.kind];
                                return (
                                  <span key={b.label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${st.className}`}>
                                    <st.icon className="w-3 h-3" /> {b.label}
                                  </span>
                                );
                              })}
                            </div>
                            <button onClick={() => p.onSwap(p.activeDay, i)} className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-tsb-600 hover:text-tsb-700">
                              <RefreshCw className="w-3.5 h-3.5" /> เปลี่ยนสถานที่
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Map */}
                <div id="route-map">{stops.length > 0 && <RouteMap stops={stops} approx={p.approx} />}</div>

                {/* Budget */}
                <div id="budget-card" className="rounded-2xl border border-tsn-200 p-4">
                  <div
                    key={inBudget ? 'ok' : 'over'}
                    className={`status-pop inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                      inBudget ? 'bg-tsg-50 text-tsg-700' : 'bg-tsa-50 text-tsa-700'
                    }`}
                    aria-live="polite"
                  >
                    {inBudget ? <CircleCheck className="w-4 h-4" /> : <TriangleAlert className="w-4 h-4" />}
                    {inBudget ? 'แผนการเดินทางพร้อมแล้ว! (อยู่ในงบ)' : `เกินงบ ${(total - p.budget).toLocaleString('th-TH')} บาท`}
                  </div>
                  <div className="mt-3 text-sm text-tsn-500">งบประมาณรวม</div>
                  <div className="text-3xl font-bold text-tsn-900 tabular">
                    <CountUp value={total} /> <span className="text-base font-medium text-tsn-500">บาท</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-tsn-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${inBudget ? 'bg-tsg-500' : 'bg-tsa-500'}`}
                      style={{ width: `${Math.min(100, (total / Math.max(1, p.budget)) * 100)}%` }}
                    />
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {p.lines.map((l) => {
                      const Icon = LINE_ICON[l.key];
                      return (
                        <li key={l.key} className="group flex items-center gap-3">
                          <span className="tile-icon w-8 h-8 rounded-lg bg-tsb-50 text-tsb-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-tsn-800">{l.label}</span>
                            <span className="block text-xs text-tsn-400 truncate">{l.note}</span>
                          </span>
                          <CountUp value={l.amount} className="text-sm font-semibold text-tsn-900" />
                        </li>
                      );
                    })}
                  </ul>
                  {!inBudget && (
                    <button onClick={() => p.onToggleMode('eco')} className="mt-3 w-full text-left text-xs text-tsa-700 hover:underline">
                      ลองเปิดโหมดงบประหยัด หรือลดจำนวนคน เพื่อให้อยู่ในงบ
                    </button>
                  )}
                  <button
                    onClick={() => p.onOpenOta('hotel')}
                    className="mt-4 w-full h-10 rounded-full border border-tsb-200 text-tsb-700 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-tsb-50 transition-colors"
                  >
                    ดูรายละเอียดทั้งหมด <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
