'use client';

import React from 'react';
import { Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { SubscriptionTier } from '@/lib/types';

// Cover photograph: longtail boats at Phi Phi, Krabi (Unsplash, same image as the Krabi community trip)
const COVER_PHOTO = 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2000&q=80';

interface HeroBannerProps {
  onExploreAiPlanner: () => void;
  onExploreEscrow: () => void;
  currentTier: SubscriptionTier;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreAiPlanner, onExploreEscrow }) => {
  // Bleeds to the edges of the content column and meets the header, like a magazine opener
  return (
    <section className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-10 -mt-6 lg:-mt-8 bg-ink-900 text-white min-h-[460px] lg:min-h-[540px] flex items-end">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COVER_PHOTO}
        alt="เรือหางยาวจอดเรียงริมหาด เกาะพีพี จังหวัดกระบี่"
        className="absolute inset-0 w-full h-full object-cover object-[72%_center] sm:object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 photo-scrim" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 pt-10 pb-10 lg:pb-14">
        <div className="max-w-2xl">
          <h1 className="font-display font-semibold text-[2rem] leading-[1.25] sm:text-5xl sm:leading-[1.2] lg:text-[3.5rem]">
            เที่ยวไทยตามงบ
            <br />
            แล้วไปกันครบทุกคน
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-white/85">
            AI จัดทริปตามงบและสภาพอากาศ เทียบราคาที่พักให้เสร็จ แล้วล็อกเงินมัดจำของทุกคนไว้ใน Smart Escrow
            ใครยกเลิกกะทันหันถูกหัก 10% และครึ่งหนึ่งชดเชยให้เพื่อนที่เหลือในกลุ่ม
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreAiPlanner}
              className="h-12 px-5 rounded-md bg-ink-50 text-ink-900 font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-ink-100"
            >
              <Sparkles className="w-[18px] h-[18px] text-lagoon-600" />
              วางแผนเที่ยวด้วย AI
            </button>
            <button
              onClick={onExploreEscrow}
              className="group h-12 px-5 rounded-md border border-white/40 text-white font-semibold flex items-center gap-2 transition-colors duration-150 hover:bg-white/10 hover:border-white/70"
            >
              ดูทริปที่เปิดรับสมาชิก
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 sm:top-auto sm:bottom-5 sm:right-10 flex items-center gap-1.5 text-xs text-white/75">
        <MapPin className="w-3.5 h-3.5" />
        เกาะพีพี จ.กระบี่ · ภาพ Unsplash
      </div>
    </section>
  );
};
