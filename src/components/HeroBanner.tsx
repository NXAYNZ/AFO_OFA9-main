'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { SubscriptionTier } from '@/lib/types';

// Background clips rotate with a crossfade
const BG_CLIPS = [
  '/images/bangkok-bg-1.gif',
  '/images/bangkok-bg-2.gif',
  '/images/bangkok-bg-3.gif',
  '/images/bangkok-bg-4.gif',
  '/images/bangkok-bg-5.gif',
];
const BG_INTERVAL_MS = 7000;

interface HeroBannerProps {
  onExploreAiPlanner: () => void;
  onExploreEscrow: () => void;
  currentTier: SubscriptionTier;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreAiPlanner,
  onExploreEscrow,
  currentTier,
}) => {
  const [bgIndex, setBgIndex] = useState(0);
  // GIFs are large, so only mount clips up to the one after the current (preloads the next clip)
  const [mountedCount, setMountedCount] = useState(2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBgIndex((prev) => (prev + 1) % BG_CLIPS.length);
    }, BG_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [bgIndex]);

  useEffect(() => {
    setMountedCount((prev) => Math.min(BG_CLIPS.length, Math.max(prev, bgIndex + 2)));
  }, [bgIndex]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800 my-6 font-sarabun">

      {/* Decorative Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Bangkok background clips (faint; scaled up slightly to crop the GIFs' black letterbox bars) */}
      {BG_CLIPS.slice(0, mountedCount).map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-[1500ms] ease-in-out ${
            i === bgIndex ? 'opacity-30 scale-110' : 'opacity-0 scale-125'
          }`}
        />
      ))}
      {/* Darken the left side so the text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />

      {/* Clip indicator dots */}
      <div className="absolute bottom-4 right-5 z-20 flex items-center gap-1.5">
        {BG_CLIPS.map((src, i) => (
          <button
            key={src}
            onClick={() => setBgIndex(i)}
            aria-label={`ภาพพื้นหลังที่ ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 hover:bg-white/80 ${
              i === bgIndex ? 'w-6 bg-white/80' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl">
        
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Budget Trip Planner (Gemini 2.5 Flash)</span>
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Smart Escrow ค้ำประกันทริป ไม่เท 100%</span>
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>OTA Price Comparator + ค่าปรับเททริป 10%</span>
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          วางแผนเที่ยวไทยสุดฉลาด คุมงบได้จริง{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            พร้อมระบบล็อกเงินค้ำประกัน ป้องกันโดนเท
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl">
          แพลตฟอร์มแรกในไทยที่นำ <strong className="text-white">AI จัดทริปตามงบ & สภาพอากาศเรียลไทม์</strong>{' '}
          ผสานระบบ <strong className="text-emerald-300">Smart Escrow มัดจำหารทริป</strong> หากมีคนยกเลิกกระทันหัน{' '}
          ระบบจะหัก <strong className="text-amber-300">ค่าปรับ 10%</strong> (เข้าแพลตฟอร์ม 5% และชดเชยเพื่อนที่เหลือในกลุ่ม 5%) ทันที!
        </p>

        {/* Feature Checkpoints */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-sm text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>เปรียบเทียบราคา Agoda vs Trip.com</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>พยากรณ์อากาศกรมอุตุฯ (TMD / Open-Meteo)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>คะแนนความน่าเชื่อถือ & ทะเบียนคนเททริป</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <button
            onClick={onExploreAiPlanner}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>สร้างแผนเที่ยว AI ทันที</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={onExploreEscrow}
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold backdrop-blur-sm border border-white/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>ดูทริปชุมชน & ระบบ Escrow (เกาะเสม็ด 8 คน)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
