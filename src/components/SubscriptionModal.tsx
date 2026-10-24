'use client';

import React, { useEffect } from 'react';
import { Check, Minus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionTier } from '@/lib/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
}

const PLANS: {
  tier: SubscriptionTier;
  name: string;
  price: number;
  audience: string;
  recommended?: boolean;
  features: { text: React.ReactNode; included: boolean }[];
}[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    audience: 'สำหรับทดลองใช้งาน',
    features: [
      { text: <>AI วางแผนเที่ยว <strong>2 ครั้งต่อเดือน</strong></>, included: true },
      { text: <>แผนการเดินทาง <strong>1 ตัวเลือก</strong></>, included: true },
      { text: 'พยากรณ์อากาศกรมอุตุฯ (TMD / Open-Meteo)', included: true },
      { text: 'เปรียบเทียบราคา OTA เชิงลึก', included: false },
      { text: 'ส่วนลดค่าเปิดทริป', included: false },
    ],
  },
  {
    tier: 'GOLD',
    name: 'Gold',
    price: 149,
    audience: 'สำหรับสายเที่ยวที่คุมงบ',
    recommended: true,
    features: [
      { text: <>AI วางแผนเที่ยว <strong>5 ครั้งต่อเดือน</strong></>, included: true },
      { text: <>สร้างพร้อมกัน <strong>3 แผนทางเลือก</strong></>, included: true },
      { text: 'เทียบราคา OTA เชิงลึก (Agoda vs Trip.com)', included: true },
      { text: <>ส่วนลดค่าเปิดทริป Escrow <strong>50%</strong></>, included: true },
    ],
  },
  {
    tier: 'PLATINUM',
    name: 'Platinum',
    price: 299,
    audience: 'สำหรับหัวหน้าทริปและผู้จัดทริป',
    features: [
      { text: <>AI วางแผนเที่ยว <strong>ไม่จำกัด</strong></>, included: true },
      { text: <>สร้างพร้อมกัน <strong>5 แผนทางเลือก</strong></>, included: true },
      { text: 'แจ้งเตือนราคาลดตามฤดูกาล', included: true },
      { text: <><strong>ไม่มีค่าเปิดทริป</strong> (ยกเว้น 3.5%)</>, included: true },
    ],
  },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier !== 'FREE') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0057FF', '#F59E0B', '#0F172A', '#93C5FD', '#FBBF24'],
        disableForReducedMotion: true,
      });
    }
    onSelectTier(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink-950/70 animate-backdropIn" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-title"
        className="bg-white rounded-xl max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 sm:px-10 pt-8 sm:pt-10 max-w-xl">
          <h3 id="plans-title" className="font-display text-3xl font-semibold text-slate-900">เลือกแพ็กเกจ</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            เพิ่มโควตา AI วางแผนเที่ยว ปลดล็อกการเทียบราคาเชิงลึก และลดค่าธรรมเนียมเปิดทริป Escrow
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 border-t border-slate-200 md:divide-x divide-slate-200">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            return (
              <div key={plan.tier} className={`relative flex flex-col p-6 sm:p-8 ${plan.recommended ? 'bg-amber-50/60' : ''}`}>
                {plan.recommended && <span className="absolute inset-x-0 top-0 h-1 bg-amber-500" aria-hidden />}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-semibold text-slate-900">{plan.name}</span>
                  {plan.recommended && <span className="text-xs font-semibold text-amber-800">ยอดนิยม</span>}
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{plan.audience}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold text-slate-900">฿{plan.price}</span>
                  <span className="text-sm text-slate-500">ต่อเดือน</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 ${f.included ? 'text-slate-700' : 'text-slate-400'}`}>
                      {f.included ? (
                        <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Minus className="w-4 h-4 mt-0.5 shrink-0" />
                      )}
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isCurrent}
                  className={`mt-7 w-full h-11 rounded-md text-sm font-semibold transition-colors disabled:cursor-default ${
                    isCurrent
                      ? 'border border-slate-200 text-slate-500'
                      : plan.recommended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border border-slate-300 text-slate-800 hover:border-slate-500'
                  }`}
                >
                  {isCurrent ? 'แพ็กเกจปัจจุบัน' : plan.price === 0 ? 'เปลี่ยนเป็น Free' : `อัปเกรดเป็น ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="px-6 sm:px-10 py-4 border-t border-slate-200 text-xs text-slate-500">
          โหมดสาธิต: จำลองการชำระเงินโดยไม่ต้องใช้บัตรเครดิตจริง
        </p>
      </div>
    </div>
  );
};
