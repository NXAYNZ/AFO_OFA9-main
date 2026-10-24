'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  X,
  FileDown,
  Send,
  CircleCheck,
  Hotel,
  Plane,
  Ticket,
  ShieldCheck,
  Users,
  CalendarDays,
  CreditCard,
  QrCode,
  Lock,

} from 'lucide-react';
import { HERO_COMMUNITY_TRIP, ADDITIONAL_COMMUNITY_TRIPS } from '@/lib/mockData';
import { BudgetLine, Stop } from './plannerData';

const baht = (n: number) => `${Math.round(n).toLocaleString('th-TH')} บาท`;

interface ShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
}

// Dialog shell: closes on Escape and backdrop click, locks page scroll while open
export const ModalShell: React.FC<ShellProps> = ({ open, onClose, title, subtitle, wide, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-tsn-900/55 animate-backdropIn" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto bg-tsn-0 text-tsn-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-popIn font-prompt`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-4 bg-tsn-0 border-b border-tsn-100">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-tsn-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 shrink-0 rounded-full text-tsn-500 hover:bg-tsn-100 hover:text-tsn-900 flex items-center justify-center transition-colors" aria-label="ปิด">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ---------------- B2B quotation builder ----------------

interface QuotationProps {
  open: boolean;
  onClose: () => void;
  tripTitle: string;
  dateLabel: string;
  people: number;
  lines: BudgetLine[];
  days: Stop[][];
}

export const QuotationModal: React.FC<QuotationProps> = ({ open, onClose, tripTitle, dateLabel, people, lines, days }) => {
  const [markup, setMarkup] = useState(15);
  const [client, setClient] = useState('คุณลูกค้า');
  const [sent, setSent] = useState(false);
  const cost = lines.reduce((s, l) => s + l.amount, 0);
  const selling = Math.round((cost * (1 + markup / 100)) / 10) * 10;
  const perPerson = Math.round(selling / people / 10) * 10;
  const profit = selling - cost;
  const quoteNo = useMemo(() => `QT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) setSent(false);
  }, [open]);

  const exportPdf = () => {
    const itinerary = days
      .map(
        (d, i) =>
          `<tr><td style="padding:6px 8px;vertical-align:top;white-space:nowrap;color:#1D4ED8">วันที่ ${i + 1}</td><td style="padding:6px 8px">${d
            .map((s) => s.name)
            .join(' · ')}</td></tr>`
      )
      .join('');
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${quoteNo}</title>
<style>body{font-family:'Prompt','Noto Sans Thai',sans-serif;color:#0F172A;margin:40px}h1{color:#0057FF;margin:0}table{width:100%;border-collapse:collapse}
.box{border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin-top:16px}.r{text-align:right}.big{font-size:22px;font-weight:700;color:#0057FF}</style></head><body>
<h1>TripSure AI</h1><div style="color:#64748B">ใบเสนอราคาแพ็กเกจท่องเที่ยว · เลขที่ ${quoteNo}</div>
<div class="box"><b>เรียน</b> ${client}<br><b>แพ็กเกจ</b> ${tripTitle} · ${dateLabel} · ${people} คน</div>
<div class="box"><b>แผนการเดินทาง</b><table>${itinerary}</table></div>
<div class="box"><table>
<tr><td>ราคาแพ็กเกจรวม (${people} คน)</td><td class="r big">${baht(selling)}</td></tr>
<tr><td>ราคาต่อท่าน</td><td class="r"><b>${baht(perPerson)}</b></td></tr>
<tr><td style="color:#64748B">รวมที่พัก กิจกรรม อาหาร การเดินทาง และค่าบริการจัดทริป</td><td></td></tr></table></div>
<p style="color:#64748B;font-size:12px">ใบเสนอราคามีอายุ 7 วัน · ราคาอาจเปลี่ยนแปลงตามความพร้อมของที่พัก · เอกสารสาธิตจาก TripSure AI</p>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const sendToClient = async () => {
    const text = `ใบเสนอราคา ${quoteNo}\n${tripTitle} (${dateLabel}) ${people} คน\nราคารวม ${baht(selling)} · ต่อท่าน ${baht(perPerson)}\nสร้างด้วย TripSure AI`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {}
    setSent(true);
  };

  return (
    <ModalShell open={open} onClose={onClose} title="สร้างแพ็กเกจ & ใบเสนอราคา" subtitle="สำหรับผู้จัดทริปและบริษัททัวร์" wide>
      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-tsn-700">ชื่อลูกค้า</span>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-1.5 w-full h-11 px-3.5 rounded-xl border border-tsn-200 outline-none focus:border-tsb-600 focus:ring-4 focus:ring-tsb-100"
            />
          </label>

          <div className="rounded-2xl bg-tsn-50 p-4">
            <div className="text-sm text-tsn-500">ต้นทุนแพ็กเกจ ({people} คน)</div>
            <div className="text-2xl font-semibold tabular">{baht(cost)}</div>
            <ul className="mt-3 space-y-1 text-sm text-tsn-600">
              {lines.map((l) => (
                <li key={l.key} className="flex justify-between">
                  <span>{l.label}</span>
                  <span className="tabular">{l.amount.toLocaleString('th-TH')}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-tsn-700">Agent Markup / ค่าบริการ</span>
              <span className="text-lg font-semibold text-tsb-600 tabular">+{markup}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={markup}
              onChange={(e) => setMarkup(Number(e.target.value))}
              className="mt-2 w-full accent-[#0057FF]"
              aria-label="Agent markup เปอร์เซ็นต์"
            />
            <div className="flex justify-between text-xs text-tsn-400 tabular">
              <span>0%</span>
              <span>20%</span>
              <span>40%</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-tsn-950 text-tsn-0 p-5 flex flex-col">
          <div className="text-sm text-tsb-200">ราคาขายรวม</div>
          <div className="text-3xl font-semibold tabular">{baht(selling)}</div>
          <div className="mt-4 text-sm text-tsb-200">ราคาขายต่อท่าน</div>
          <div className="text-xl font-semibold tabular">{baht(perPerson)}</div>
          <div className="mt-4 pt-4 border-t border-tsn-0/15 flex justify-between text-sm">
            <span className="text-tsb-200">กำไรของคุณ</span>
            <span className="font-semibold text-tsg-500 tabular">+{baht(profit)}</span>
          </div>
          <div className="mt-auto pt-5 space-y-2">
            <button onClick={sendToClient} className="w-full h-11 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {sent ? <CircleCheck className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {sent ? 'คัดลอกข้อความส่งลูกค้าแล้ว' : 'ส่งใบเสนอราคาให้ลูกค้า'}
            </button>
            <button onClick={exportPdf} className="w-full h-11 rounded-full bg-tsn-0 text-tsn-900 hover:bg-tsb-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-tsn-400">เลขที่ {quoteNo} · Export PDF เปิดหน้าพิมพ์ของเบราว์เซอร์ เลือก “บันทึกเป็น PDF”</p>
    </ModalShell>
  );
};

// ---------------- OTA price comparison ----------------

export type OtaCategory = 'hotel' | 'flight' | 'activity';

interface OtaProps {
  open: boolean;
  onClose: () => void;
  initial: OtaCategory;
  destName: string;
  people: number;
  lines: BudgetLine[];
}

const PROVIDERS = [
  { name: 'Agoda', factor: 1.0 },
  { name: 'Trip.com', factor: 0.955 },
  { name: 'จองตรง', factor: 1.06 },
];

export const OtaModal: React.FC<OtaProps> = ({ open, onClose, initial, destName, people, lines }) => {
  const [cat, setCat] = useState<OtaCategory>(initial);
  useEffect(() => {
    if (open) setCat(initial);
  }, [open, initial]);

  const lodging = lines.find((l) => l.key === 'lodging')?.amount ?? 0;
  const activities = lines.find((l) => l.key === 'activities')?.amount ?? 0;
  const base: Record<OtaCategory, { item: string; amount: number; unit: string }> = {
    hotel: { item: `โรงแรมบูทีค ใจกลาง${destName}`, amount: lodging, unit: 'ทั้งทริป' },
    flight: { item: `ตั๋วไป-กลับ กรุงเทพฯ – ${destName}`, amount: 1890 * people, unit: `${people} ที่นั่ง` },
    activity: { item: `บัตรเข้าชมและกิจกรรมใน${destName}`, amount: activities, unit: `${people} คน` },
  };
  const rows = PROVIDERS.map((p) => ({ ...p, price: Math.round((base[cat].amount * p.factor) / 10) * 10 }));
  const cheapest = Math.min(...rows.map((r) => r.price));
  const tabs: { id: OtaCategory; label: string; icon: React.ElementType }[] = [
    { id: 'hotel', label: 'ที่พัก', icon: Hotel },
    { id: 'flight', label: 'ตั๋วเครื่องบิน', icon: Plane },
    { id: 'activity', label: 'กิจกรรม', icon: Ticket },
  ];

  return (
    <ModalShell open={open} onClose={onClose} title="เปรียบเทียบราคา" subtitle="Agoda · Trip.com · จองตรง" wide>
      <div className="flex gap-1 p-1 rounded-full bg-tsn-100 w-fit" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={cat === t.id}
            onClick={() => setCat(t.id)}
            className={`h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
              cat === t.id ? 'bg-tsn-0 text-tsb-700 shadow-sm' : 'text-tsn-500 hover:text-tsn-900'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-tsn-500">
        {base[cat].item} · {base[cat].unit}
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const best = r.price === cheapest;
          return (
            <li
              key={r.name}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${best ? 'border-tsg-500 bg-tsg-50' : 'border-tsn-200'}`}
            >
              <div className="w-24 font-semibold">{r.name}</div>
              <div className="flex-1 text-sm">
                {best ? (
                  <span className="inline-flex items-center gap-1 text-tsg-700 font-medium">
                    <CircleCheck className="w-4 h-4" /> ถูกที่สุด
                  </span>
                ) : (
                  <span className="text-tsn-500">แพงกว่า {baht(r.price - cheapest)}</span>
                )}
              </div>
              <div className="text-lg font-semibold tabular">{baht(r.price)}</div>
              <button className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${best ? 'bg-tsb-600 text-tsn-0 hover:bg-tsb-700' : 'border border-tsn-200 hover:border-tsb-600 hover:text-tsb-700'}`}>
                เลือก
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-tsn-400">ราคาตัวอย่างสำหรับการสาธิต คำนวณจากงบในแผนปัจจุบัน</p>
    </ModalShell>
  );
};

// ---------------- Community trips preview ----------------

export const CommunityModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const trips = [HERO_COMMUNITY_TRIP, ...ADDITIONAL_COMMUNITY_TRIPS].slice(0, 3);
  return (
    <ModalShell open={open} onClose={onClose} title="Community Trip" subtitle="หาเพื่อนร่วมทริป พร้อมระบบคุ้มครองเงินมัดจำ" wide>
      <div className="grid sm:grid-cols-3 gap-3">
        {trips.map((t) => (
          <div key={t.id} className="rounded-2xl border border-tsn-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.imageUrl} alt="" className="h-28 w-full object-cover" />
            <div className="p-3">
              <div className="text-sm font-semibold leading-snug line-clamp-2">{t.title}</div>
              <div className="mt-1 text-xs text-tsn-500 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> {t.travelDates}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-tsn-600">
                  <Users className="w-3.5 h-3.5" /> {t.joinedSlots}/{t.totalSlots} คน
                </span>
                <span className="font-semibold text-tsb-700">มัดจำ {t.securityDepositPerPerson.toLocaleString('th-TH')}฿</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-tsb-50 p-5">
        <div className="flex items-center gap-2 font-semibold text-tsb-700">
          <ShieldCheck className="w-5 h-5" /> Deposit Protection
        </div>
        <ul className="mt-3 space-y-2 text-sm text-tsn-700">
          {[
            'ทุกคนวางมัดจำไว้ในระบบ Escrow จนถึงวันเดินทาง',
            'มาตามนัด ได้เงินมัดจำคืนเต็มจำนวน พร้อมคะแนนความน่าเชื่อถือ',
            'ยกเลิกกะทันหันถูกหัก 10%: 5% ชดเชยเพื่อนในกลุ่ม อีก 5% เป็นค่าดำเนินการ',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <CircleCheck className="w-4 h-4 mt-0.5 shrink-0 text-tsg-500" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Link href="/workspace" className="h-11 px-5 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 text-sm font-semibold flex items-center justify-center transition-colors">
          ดูทริปทั้งหมดในแอป
        </Link>
      </div>
      <p className="mt-3 text-xs text-tsn-400">ทริปตัวอย่างสำหรับการสาธิต</p>
    </ModalShell>
  );
};

// ---------------- B2B trial checkout ----------------

export const TrialModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'card' | 'promptpay'>('card');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setStep('form');
      setError(null);
    }
  }, [open]);

  const trialEnd = new Date(Date.now() + 7 * 864e5).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business.trim()) return setError('กรุณากรอกชื่อธุรกิจ');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('กรุณากรอกอีเมลให้ถูกต้อง');
    setError(null);
    setStep('done');
  };

  const field = 'mt-1.5 w-full h-11 px-3.5 rounded-xl border border-tsn-200 outline-none focus:border-tsb-600 focus:ring-4 focus:ring-tsb-100';

  return (
    <ModalShell open={open} onClose={onClose} title="ทดลองใช้งานฟรี 7 วัน" subtitle="TripSure AI สำหรับธุรกิจท่องเที่ยว · 499 บาท/เดือน หลังหมดช่วงทดลอง">
      {step === 'form' ? (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-tsn-700">ชื่อธุรกิจ</span>
            <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="เช่น ล้านนา ทราเวล" className={field} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-tsn-700">อีเมล</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.th" className={field} />
          </label>
          <div>
            <span className="text-sm font-medium text-tsn-700">วิธีชำระเงินหลังหมดช่วงทดลอง</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: 'card' as const, label: 'บัตรเครดิต/เดบิต', icon: CreditCard },
                { id: 'promptpay' as const, label: 'PromptPay', icon: QrCode },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={method === m.id}
                  onClick={() => setMethod(m.id)}
                  className={`h-12 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    method === m.id ? 'border-tsb-600 bg-tsb-50 text-tsb-700' : 'border-tsn-200 text-tsn-600 hover:border-tsn-400'
                  }`}
                >
                  <m.icon className="w-4 h-4" /> {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-tsn-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-tsn-500">วันนี้</span>
              <span className="font-semibold">0 บาท</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-tsn-500">เริ่มเรียกเก็บ {trialEnd}</span>
              <span className="font-semibold tabular">499 บาท/เดือน</span>
            </div>
          </div>
          {error && (
            <p className="text-sm text-[#DC2626]" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="w-full h-12 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 font-semibold flex items-center justify-center gap-2 transition-colors">
            <Lock className="w-4 h-4" /> เริ่มทดลองใช้ฟรี
          </button>
          <p className="text-xs text-tsn-400 text-center">ไม่ต้องผูกมัด ยกเลิกได้ทุกเมื่อ · ระบบชำระเงินจำลองสำหรับการสาธิต ไม่มีการตัดเงินจริง</p>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-tsg-50 text-tsg-500 flex items-center justify-center">
            <CircleCheck className="w-8 h-8" />
          </div>
          <h4 className="mt-4 text-lg font-semibold">เริ่มทดลองใช้งานแล้ว</h4>
          <p className="mt-1 text-sm text-tsn-500">
            {business} ใช้งานฟรีได้ถึง {trialEnd} · ส่งรายละเอียดไปที่ {email}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/workspace" className="h-11 px-5 rounded-full bg-tsb-600 hover:bg-tsb-700 text-tsn-0 text-sm font-semibold flex items-center justify-center transition-colors">
              เข้าสู่แดชบอร์ด
            </Link>
            <button onClick={onClose} className="h-11 px-5 rounded-full border border-tsn-200 text-sm font-semibold hover:border-tsn-400 transition-colors">
              กลับไปหน้าแรก
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

