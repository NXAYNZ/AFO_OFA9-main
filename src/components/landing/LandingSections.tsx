'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlaneTakeoff,
  Search,
  Menu,
  X,
  Sparkles,
  Scale,
  Route,
  Calculator,
  ShieldCheck,
  MonitorSmartphone,
  ArrowRight,
  CircleCheck,
  Plane,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DATE_PRESETS, PEOPLE_OPTIONS } from './plannerData';
import type { OtaCategory } from './Modals';
import { SiteHeader } from './SiteHeader';
import { CountUp } from '@/components/motion';
import type { NavbarMember } from '@/components/Navbar';

// ---------------- Navigation ----------------

const NAV_LINKS = [
  { id: 'top', label: 'หน้าแรก' },
  { id: 'features', label: 'ฟีเจอร์' },
  { id: 'pricing', label: 'ราคา' },
  { id: 'business', label: 'สำหรับธุรกิจ' },
  { id: 'about', label: 'เกี่ยวกับเรา' },
];
// Sections watched for the active link, in page order; the planner counts as "ฟีเจอร์"
const SPY: [string, string][] = [
  ['top', 'top'],
  ['features', 'features'],
  ['planner', 'features'],
  ['why', 'pricing'],
  ['about', 'about'],
];

export const scrollToId = (id: string) => {
  if (id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

interface LandingNavProps {
  onSearch: () => void;
  onStart: (origin?: { x: number; y: number }) => void;
  member: NavbarMember | null;
  onSignIn: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onSearch, onStart, member, onSignIn, onEditProfile, onSignOut }) => {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const onScroll = () => {
      let current = 'top';
      for (const [id, link] of SPY) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = link;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = 'about';
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <SiteHeader
      links={NAV_LINKS}
      activeId={active}
      onLink={(id) => {
        setActive(id);
        scrollToId(id);
      }}
      onLogo={() => scrollToId('top')}
      onSearch={onSearch}
      member={member}
      onSignIn={onSignIn}
      onEditProfile={onEditProfile}
      onSignOut={onSignOut}
      primary={{ label: member ? 'เข้าแอป' : 'เริ่มใช้งานฟรี', onClick: onStart }}
    />
  );
};

// ---------------- Hero + search ----------------

const HERO_PHOTO = 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=2400&q=80';

export interface SearchQuery {
  destination: string;
  dateIdx: number;
  people: number;
  budget: number;
}

interface HeroProps {
  query: SearchQuery;
  onChange: (q: SearchQuery) => void;
  onSubmit: () => void;
}

export const LandingHero: React.FC<HeroProps> = ({ query, onChange, onSubmit }) => {
  const set = <K extends keyof SearchQuery>(k: K, v: SearchQuery[K]) => onChange({ ...query, [k]: v });
  const fieldLabel = 'block text-xs font-medium text-tsn-500';
  const fieldInput = 'w-full bg-transparent text-[15px] font-semibold text-tsn-900 outline-none';

  return (
    <section id="top" className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-4">
      <div className="relative rounded-[28px] overflow-hidden lg:min-h-[600px] bg-tsn-900 pb-4 lg:pb-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_PHOTO} alt="ทะเลสีเทอร์ควอยซ์และหน้าผาหินปูน ทะเลอันดามัน" className="hero-photo absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,25,44,0.82)_0%,rgba(11,25,44,0.55)_38%,rgba(11,25,44,0.05)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(11,25,44,0.45),transparent)]" />

        <div className="relative px-6 sm:px-10 lg:px-16 pt-10 lg:pt-20 pb-8 lg:pb-36 max-w-3xl">
          <span style={{ '--i': 0 } as React.CSSProperties} className="hero-in inline-flex items-center gap-2 rounded-full border border-tsn-0/30 bg-tsn-0/15 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-tsn-0">
            <Sparkles className="w-4 h-4 text-tsb-200" /> AI ผู้ช่วยจัดทริปอัจฉริยะ
          </span>
          <h1 style={{ '--i': 1 } as React.CSSProperties} className="hero-in mt-6 text-[2.5rem] sm:text-5xl lg:text-[4rem] font-bold leading-[1.18] text-tsn-0">
            วางแผนเที่ยวง่ายขึ้น
            <br />
            <span className="text-tsb-300">สนุกขึ้น</span> ในแบบของคุณ
          </h1>
          <p style={{ '--i': 2 } as React.CSSProperties} className="hero-in mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-tsn-0/85">
            ให้ TripSure AI ช่วยคุณค้นหาที่เที่ยวที่ใช่ เปรียบเทียบราคา และสร้างแผนการเดินทางที่ตรงกับสไตล์และงบประมาณของคุณ
          </p>
        </div>

        <div className="hero-script hidden md:flex absolute right-10 lg:right-16 top-16 lg:top-24 rotate-[-6deg] items-center gap-2 font-script text-4xl lg:text-5xl text-tsn-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
          Your Next Trip Starts Here
          <Plane className="float-y w-9 h-9 -rotate-12" />
        </div>

        {/* Floating search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="hero-search relative mx-4 sm:mx-10 lg:mx-0 lg:absolute lg:left-16 lg:right-16 lg:bottom-10 rounded-3xl lg:rounded-full bg-tsn-0 shadow-[0_24px_48px_-16px_rgba(11,25,44,0.45)] p-3 lg:p-2.5 lg:pl-6 grid grid-cols-2 lg:grid-cols-[1.3fr_1.2fr_0.9fr_1fr_auto] gap-x-3 gap-y-3 lg:gap-0 items-center"
        >
          <label className="col-span-2 lg:col-span-1 flex items-center gap-3 lg:pr-5">
            <span className="w-10 h-10 rounded-full bg-tsb-50 text-tsb-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={fieldLabel}>ปลายทาง</span>
              <input
                id="hero-destination"
                value={query.destination}
                onChange={(e) => set('destination', e.target.value)}
                placeholder="เช่น เชียงใหม่, เกาะเสม็ด, ภูเก็ต"
                className={`${fieldInput} placeholder:text-tsn-400 placeholder:font-normal`}
              />
            </span>
          </label>
          <label className="flex items-center gap-3 lg:px-5 lg:border-l border-tsn-200">
            <span className="hidden sm:flex w-10 h-10 rounded-full bg-tsb-50 text-tsb-600 items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={fieldLabel}>ช่วงวันเดินทาง · 3 วัน 2 คืน</span>
              <select value={query.dateIdx} onChange={(e) => set('dateIdx', Number(e.target.value))} className={`${fieldInput} cursor-pointer`}>
                {DATE_PRESETS.map((d, i) => (
                  <option key={d.label} value={i}>
                    {d.label}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="flex items-center gap-3 lg:px-5 lg:border-l border-tsn-200">
            <span className="hidden sm:flex w-10 h-10 rounded-full bg-tsb-50 text-tsb-600 items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={fieldLabel}>จำนวนคน</span>
              <select value={query.people} onChange={(e) => set('people', Number(e.target.value))} className={`${fieldInput} cursor-pointer`}>
                {PEOPLE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} คน
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="col-span-2 lg:col-span-1 flex items-center gap-3 lg:px-5 lg:border-l border-tsn-200">
            <span className="w-10 h-10 rounded-full bg-tsb-50 text-tsb-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={fieldLabel}>งบประมาณรวม</span>
              <span className="flex items-baseline gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={query.budget ? query.budget.toLocaleString('th-TH') : ''}
                  onChange={(e) => set('budget', Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                  className={`${fieldInput} tabular w-full`}
                  aria-label="งบประมาณรวม (บาท)"
                />
                <span className="text-sm text-tsn-500">บาท</span>
              </span>
            </span>
          </label>
          <button type="submit" className="btn-start press col-span-2 lg:col-span-1 h-14 px-8 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-tsb-600/30 transition-colors">
            <Search className="w-5 h-5" /> ค้นหา
          </button>
        </form>
      </div>
    </section>
  );
};

// ---------------- Feature shortcuts + B2B callout ----------------

interface FeatureStripProps {
  onPlanner: () => void;
  onCompare: (c: OtaCategory) => void;
  onMap: () => void;
  onBudget: () => void;
  onSafety: () => void;
  onBusiness: () => void;
}

export const FeatureStrip: React.FC<FeatureStripProps> = (p) => {
  const items: { title: string; desc: string; icon: LucideIcon; onClick?: () => void }[] = [
    { title: 'AI Planner', desc: 'วางแผนทริปอัจฉริยะ', icon: Sparkles, onClick: p.onPlanner },
    { title: 'เปรียบเทียบราคา', desc: 'ที่พัก + ตั๋ว + กิจกรรม', icon: Scale, onClick: () => p.onCompare('hotel') },
    { title: 'แผนที่และเส้นทาง', desc: 'พร้อมข้อมูลสถานที่จริง', icon: Route, onClick: p.onMap },
    { title: 'จัดการงบประมาณ', desc: 'คำนวณค่าใช้จ่ายอัตโนมัติ', icon: Calculator, onClick: p.onBudget },
    { title: 'ความปลอดภัย', desc: 'ระบบยืนยันและคุ้มครอง', icon: ShieldCheck, onClick: p.onSafety },
    { title: 'เข้าถึงได้ทุกที่', desc: 'บนมือถือและคอมพิวเตอร์', icon: MonitorSmartphone },
  ];

  return (
    <section id="features" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-12">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-stretch">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 content-center">
          {items.map((it, idx) => {
            const body = (
              <>
                <span className="tile-icon w-12 h-12 shrink-0 rounded-2xl bg-tsb-50 text-tsb-600 flex items-center justify-center transition-colors group-hover:bg-tsb-600 group-hover:text-tsn-0">
                  <it.icon className="w-6 h-6" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-tsn-900">{it.title}</span>
                  <span className="mt-0.5 block text-sm text-tsn-500 leading-snug">{it.desc}</span>
                </span>
              </>
            );
            const cls = 'reveal group flex items-center gap-4 text-left rounded-2xl p-4 transition-colors';
            return it.onClick ? (
              <button key={it.title} onClick={it.onClick} style={{ '--i': idx } as React.CSSProperties} className={`${cls} hover:bg-tsn-50`}>
                {body}
              </button>
            ) : (
              <div key={it.title} style={{ '--i': idx } as React.CSSProperties} className={cls}>
                {body}
              </div>
            );
          })}
        </div>

        <div id="business" className="reveal reveal-right lift scroll-mt-24 rounded-2xl bg-tsb-50 border border-tsb-100 p-6 flex flex-col">
          <div className="flex items-center gap-3">
            <span className="float-y w-11 h-11 rounded-xl bg-tsb-600 text-tsn-0 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold text-tsn-900">สำหรับธุรกิจท่องเที่ยว</h3>
          </div>
          <p className="mt-3 text-sm text-tsn-600 leading-relaxed">
            ให้ TripSure AI เป็นเครื่องมือช่วยคุณสร้างแพ็กเกจ และวางแผนทริปได้เร็วขึ้น ประหยัดเวลา เพิ่มยอดขาย
          </p>
          <button onClick={p.onBusiness} className="group press mt-5 self-start h-11 px-5 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 text-sm font-semibold flex items-center gap-2 transition-colors">
            ดูรายละเอียดสำหรับธุรกิจ <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ---------------- Why TripSure + 499 pricing ----------------

const WHY = [
  {
    title: 'ข้อมูลที่พักและสถานที่จริง',
    desc: 'ภาพจริง รีวิวจริง อัปเดตเสมอ ไม่ต้องกลัวเจอของไม่ตรงปก',
    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=70',
  },
  {
    title: 'แผนที่และเส้นทางอัจฉริยะ',
    desc: 'เดินทางง่าย พร้อมข้อมูลที่จอดรถและการเข้าถึงสำหรับทุกคน',
    img: 'https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&w=800&q=70',
  },
  {
    title: 'คำนวณงบประมาณอัตโนมัติ',
    desc: 'วางแผนค่าใช้จ่ายได้ชัดเจน ไม่บานปลาย',
    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=70',
  },
  {
    title: 'Community Trip',
    desc: 'แชร์ประสบการณ์ พบเพื่อนร่วมทริป และมีกลุ่มช่วยเหลือ',
    img: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=70',
    community: true,
  },
];

export const WhyAndPricing: React.FC<{ onCommunity: () => void; onTrial: () => void; onCard: (i: number) => void }> = ({ onCommunity, onTrial, onCard }) => (
  <section id="why" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
    <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-stretch">
      <div>
        <h2 className="reveal text-3xl font-bold text-tsn-900">
          ทำไมต้อง TripSure <span className="text-tsb-600">AI</span>?
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY.map((w, i) => (
            <button
              key={w.title}
              onClick={() => (w.community ? onCommunity() : onCard(i))}
              style={{ '--i': i } as React.CSSProperties}
              className="reveal reveal-scale lift group text-left rounded-2xl bg-tsn-0 border border-tsn-200 overflow-hidden shadow-sm hover:border-tsb-200"
            >
              <div className="h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.img} alt="" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-tsn-900 flex items-center justify-between gap-2">
                  {w.title}
                  <ArrowRight className="w-4 h-4 text-tsn-300 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-tsb-600" />
                </h3>
                <p className="mt-1 text-sm text-tsn-500 leading-relaxed">{w.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div id="pricing" className="reveal reveal-right glow-card scroll-mt-24 rounded-3xl bg-tsn-950 text-tsn-0 p-7 flex flex-col xl:mt-[60px]">
        <div className="text-tsb-200">พร้อมให้บริการสำหรับธุรกิจท่องเที่ยว</div>
        <div className="mt-5 text-sm text-tsn-400">เริ่มต้นเพียง</div>
        <div className="flex items-baseline gap-2">
          <CountUp value={499} duration={1200} className="text-5xl font-bold" />
          <span className="text-lg text-tsn-300">บาท / เดือน</span>
        </div>
        <ul className="mt-6 space-y-3">
          {['สร้างแพ็กเกจทริปได้ไม่จำกัด', 'เข้าถึงข้อมูลสถานที่และราคาพิเศษ', 'ระบบจัดการลูกค้าและใบเสนอราคา'].map((t) => (
            <li key={t} className="flex items-center gap-3 text-tsn-100">
              <CircleCheck className="w-5 h-5 text-tsg-500 shrink-0" /> {t}
            </li>
          ))}
        </ul>
        <button onClick={onTrial} className="group press mt-8 h-12 rounded-full bg-tsn-0 text-tsn-950 font-semibold flex items-center justify-center gap-2 hover:bg-tsb-50 transition-colors">
          ทดลองใช้งานฟรี 7 วัน <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-3 text-center text-sm text-tsn-400">ไม่ต้องผูกมัด ยกเลิกได้ทุกเมื่อ</p>
      </div>
    </div>
  </section>
);

// ---------------- Footer ----------------

const PARTNERS = [
  { name: 'Booking.com', className: 'font-bold tracking-tight' },
  { name: 'agoda', className: 'font-bold lowercase tracking-tight' },
  { name: 'Tripadvisor', className: 'font-semibold' },
  { name: 'airbnb', className: 'font-bold lowercase' },
  { name: 'Google Maps', className: 'font-medium' },
];

export const LandingFooter: React.FC = () => (
  <footer id="about" className="border-t border-tsn-200 bg-tsn-50">
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row lg:items-center gap-8">
      <div className="flex-1">
        <div className="text-sm font-medium text-tsn-500">พันธมิตรของเรา</div>
        <div className="mt-3 flex flex-wrap items-center gap-x-10 gap-y-3 text-2xl text-tsn-400">
          {PARTNERS.map((p) => (
            <span key={p.name} className={`${p.className} cursor-default transition-[color,transform] duration-300 hover:text-tsb-600 hover:-translate-y-0.5`}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
      <div className="reveal reveal-right font-script text-4xl text-tsb-600 flex items-center gap-2">
        Smarter Trip, Better Business <Plane className="float-y w-7 h-7 -rotate-12" />
      </div>
    </div>
    <div className="border-t border-tsn-200">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-2 justify-between text-xs text-tsn-500">
        <span>© {new Date().getFullYear()} TripSure AI (ทริปชัวร์) · Hackathon Project</span>
        <Link href="/workspace" className="hover:text-tsb-600">
          เปิดแอปเต็ม: แผนที่ 77 จังหวัด · Community Escrow · Judge Dashboard →
        </Link>
      </div>
    </div>
  </footer>
);
