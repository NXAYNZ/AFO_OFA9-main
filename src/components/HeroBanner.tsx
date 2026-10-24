'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, MapPin, Pause, Play } from 'lucide-react';
import { SubscriptionTier } from '@/lib/types';

interface HeroSlide {
  province: string;
  place: string;
  src: string;
  alt: string;
  credit?: string;
  // object-position on phones, so the subject stays in frame when the hero is narrow
  focus?: string;
}

// One destination per region; local photos live in /public/images/places
const SLIDES: HeroSlide[] = [
  {
    province: 'กระบี่',
    place: 'เกาะพีพี',
    src: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2000&q=80',
    alt: 'เรือหางยาวจอดเรียงริมหาด เกาะพีพี จังหวัดกระบี่',
    credit: 'Unsplash',
    focus: '72% center',
  },
  {
    province: 'เชียงราย',
    place: 'วัดร่องขุ่น',
    src: '/images/places/wat-rong-khun-3.jpg',
    alt: 'อุโบสถสีขาวของวัดร่องขุ่น จังหวัดเชียงราย',
    focus: '40% center',
  },
  {
    province: 'แม่ฮ่องสอน',
    place: 'ปางอุ๋ง',
    src: '/images/places/pang-ung-1.jpg',
    alt: 'แพไม้ล่องในอ่างเก็บน้ำปางอุ๋ง ล้อมด้วยป่าสน จังหวัดแม่ฮ่องสอน',
    focus: '60% center',
  },
  {
    province: 'สุโขทัย',
    place: 'อุทยานประวัติศาสตร์สุโขทัย',
    src: '/images/places/sukhothai-park-1.jpg',
    alt: 'เจดีย์และเสาโบราณในอุทยานประวัติศาสตร์สุโขทัย',
    focus: '50% center',
  },
  {
    province: 'ตาก',
    place: 'น้ำตกทีลอซู',
    src: '/images/places/thi-lo-su-2.jpg',
    alt: 'สายน้ำตกทีลอซูไหลผ่านป่าดิบ จังหวัดตาก',
    focus: '45% center',
  },
  {
    province: 'น่าน',
    place: 'ดอยเสมอดาว',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Morning_sea_of_mist%2C_Doi_Samer_Dao%2C_Si_Nan%2C_Nan%2C_Thailand.jpg/1280px-Morning_sea_of_mist%2C_Doi_Samer_Dao%2C_Si_Nan%2C_Nan%2C_Thailand.jpg',
    alt: 'ทะเลหมอกยามเช้าที่ดอยเสมอดาว อุทยานแห่งชาติศรีน่าน',
    credit: 'Kris4to / Wikimedia Commons (CC BY-SA 4.0)',
    focus: '50% center',
  },
  {
    province: 'แพร่',
    place: 'แพะเมืองผี',
    src: '/images/places/phae-mueang-phi-1.jpg',
    alt: 'เสาดินรูปทรงแปลกตาที่แพะเมืองผี จังหวัดแพร่',
    focus: '60% center',
  },
];

const SLIDE_MS = 7000;

interface HeroBannerProps {
  onExploreAiPlanner: () => void;
  onExploreEscrow: () => void;
  currentTier: SubscriptionTier;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreAiPlanner, onExploreEscrow }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Photos are mounted once seen, so later slides load lazily and then stay for the crossfade
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1]));

  useEffect(() => {
    const reduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('reduce-motion');
    if (paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  useEffect(() => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(index);
      next.add((index + 1) % SLIDES.length);
      return next.size === prev.size ? prev : next;
    });
  }, [index]);

  const slide = SLIDES[index];

  return (
    <>
      {/* Bleeds to the edges of the content column and meets the header, like a magazine opener */}
      <section
        className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-10 -mt-6 lg:-mt-8 bg-ink-900 text-white min-h-[460px] lg:min-h-[540px] flex items-end"
        aria-roledescription="carousel"
        aria-label="จุดหมายแนะนำ"
      >
        {SLIDES.map((s, i) =>
          seen.has(i) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              alt={i === index ? s.alt : ''}
              aria-hidden={i !== index}
              className={`hero-slide absolute inset-0 w-full h-full object-cover ${i === index ? 'is-active' : ''}`}
              style={{ objectPosition: s.focus }}
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          ) : null
        )}
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
      </section>

      {/* Destination strip: the caption for the photo above, and a picker for the other provinces */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-10 border-b border-slate-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-2 min-w-0 lg:w-80 shrink-0" aria-live="polite">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {slide.place} <span className="font-normal text-slate-500">จ.{slide.province}</span>
              </div>
              {slide.credit && <div className="text-[11px] text-slate-500 truncate">ภาพ: {slide.credit}</div>}
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar" role="tablist" aria-label="เลือกจังหวัด">
              <div className="flex gap-1">
                {SLIDES.map((s, i) => {
                  const on = i === index;
                  return (
                    <button
                      key={s.src}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setIndex(i)}
                      className={`relative shrink-0 h-9 px-3 rounded-md text-sm whitespace-nowrap transition-colors duration-150 ${
                        on ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {s.province}
                      {/* Progress line under the current province while the slideshow runs */}
                      {on && (
                        <span aria-hidden className="absolute left-2 right-2 bottom-0.5 h-0.5 rounded-full bg-emerald-200 overflow-hidden">
                          <span
                            key={`${index}-${paused}`}
                            className={`block h-full bg-emerald-600 ${paused ? 'w-full' : 'hero-progress'}`}
                            style={{ animationDuration: `${SLIDE_MS}ms` }}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setPaused((p) => !p)}
              className="shrink-0 w-9 h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors"
              aria-label={paused ? 'เล่นภาพต่อ' : 'หยุดเปลี่ยนภาพ'}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
