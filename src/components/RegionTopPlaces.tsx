'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Star, Flame, MessageCircle, ArrowLeft, Crown } from 'lucide-react';
import { PROVINCE_TRAVEL, RegionId, AttractionCategory } from '@/data/thailandTravel';
import { REGION_META, CATEGORY_META } from '@/lib/travelMeta';
import { estimateCrowd, CROWD_LEVELS } from '@/lib/tripEstimates';
import { placeImages } from '@/lib/placeImages';
import { fetchReviewSummaries, ReviewSummary } from '@/lib/placeReviews';

export interface TopPlace {
  key: string;
  province: string;
  place: string;
  category: AttractionCategory;
  peak: number; // today's expected peak crowd, 0-1
  photo?: string;
}

export const MEDALS = ['🥇', '🥈', '🥉'];
export const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

/**
 * Top 3 attractions of a region.
 * Score = today's expected peak crowd (app estimate) + a bonus for well-rated community reviews,
 * so places people love rise even when the crowd model ties.
 */
export const useRegionTop = (region: RegionId | null) => {
  const [summaries, setSummaries] = useState<Record<string, ReviewSummary>>({});
  const [loading, setLoading] = useState(false);

  const candidates = useMemo<TopPlace[]>(
    () =>
      region
        ? PROVINCE_TRAVEL.filter((p) => p.region === region).flatMap((p) =>
            p.attractions.map((a) => ({
              key: `${p.name}|${a.name}`,
              province: p.name,
              place: a.name,
              category: a.category,
              peak: Math.max(...estimateCrowd(p, a).hourly),
              photo: placeImages(p.name, a.name)[0],
            }))
          )
        : [],
    [region]
  );

  useEffect(() => {
    if (candidates.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetchReviewSummaries(candidates.map((c) => c.key)).then((s) => {
      if (!cancelled) {
        setSummaries(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  const top = useMemo(() => {
    const score = (c: TopPlace) => {
      const s = summaries[c.key];
      // Up to +0.5 for a 5-star average, weighted by how many reviews back it (full weight at 5)
      const reviewBonus = s ? ((s.average - 3) / 2) * Math.min(1, s.count / 5) * 0.5 : 0;
      return c.peak + reviewBonus;
    };
    return [...candidates]
      .sort(
        (a, b) =>
          score(b) - score(a) ||
          (summaries[b.key]?.count ?? 0) - (summaries[a.key]?.count ?? 0) ||
          Number(Boolean(b.photo)) - Number(Boolean(a.photo)) ||
          a.place.localeCompare(b.place, 'th')
      )
      .slice(0, 3);
  }, [candidates, summaries]);

  return { top, summaries, loading };
};

// Same thresholds as estimateCrowd's level
const levelOf = (v: number) => (v < 0.12 ? 0 : v < 0.3 ? 1 : v < 0.5 ? 2 : v < 0.72 ? 3 : 4);

interface RegionTopPanelProps {
  region: RegionId;
  top: TopPlace[];
  summaries: Record<string, ReviewSummary>;
  loading: boolean;
  onOpen: (province: string, place: string) => void;
  onBack: () => void;
}

export const RegionTopPanel: React.FC<RegionTopPanelProps> = ({ region, top, summaries, loading, onOpen, onBack }) => {
  const meta = REGION_META[region];

  return (
    <div key={region} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="on-light px-5 pt-4 pb-3" style={{ backgroundColor: meta.fill }}>
        <button
          onClick={onBack}
          className="h-8 pl-2 pr-3 -ml-1 rounded-lg text-xs font-bold text-slate-700 bg-white/70 hover:bg-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> กลับไปดูทั้งประเทศ
        </button>
        <h3 className="mt-2.5 text-base font-black text-slate-900 flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-orange-500" />
          3 อันดับที่คึกคักและน่าไปที่สุด
        </h3>
        <div className="text-xs text-slate-600">
          {meta.emoji} {meta.label} • จังหวัดที่ติดอันดับมี <Crown className="inline w-3.5 h-3.5 text-amber-500" /> บนแผนที่
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {top.map((c, i) => {
          const s = summaries[c.key];
          const crowd = CROWD_LEVELS[levelOf(c.peak)];
          return (
            <button
              key={c.key}
              onClick={() => onOpen(c.province, c.place)}
              className="group w-full flex text-left rounded-2xl overflow-hidden bg-white border-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderColor: `${RANK_COLORS[i]}66` }}
            >
              <div className="relative w-28 shrink-0 overflow-hidden bg-slate-200">
                {c.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.photo}
                    alt={c.place}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-4xl"
                    style={{ background: `linear-gradient(135deg, ${meta.fill}, ${meta.hover})` }}
                  >
                    {CATEGORY_META[c.category].emoji}
                  </div>
                )}
                <span className="absolute top-1 left-1 text-2xl drop-shadow">{MEDALS[i]}</span>
              </div>
              <div className="min-w-0 flex-1 p-2.5">
                <div className="text-sm font-bold text-slate-800 truncate">{c.place}</div>
                <div className="text-[11px] font-semibold flex items-center gap-1" style={{ color: RANK_COLORS[i] }}>
                  <Crown className="w-3 h-3" /> จ.{c.province}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: crowd.color }}
                    title="ช่วงที่คนเยอะที่สุดของวันนี้ (ประมาณการ)"
                  >
                    พีค: {crowd.label}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {CATEGORY_META[c.category].emoji} {CATEGORY_META[c.category].label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {s ? (
                    <>
                      <span className="font-black text-slate-900">{s.average.toFixed(1)}</span>
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3 h-3 ${n <= Math.round(s.average) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </span>
                      <span className="text-slate-500">({s.count})</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">{loading ? 'กำลังโหลดรีวิว...' : 'ยังไม่มีรีวิว • เป็นคนแรก!'}</span>
                  )}
                </div>
                {s?.latest && (
                  <p className="mt-1 text-[11px] text-slate-600 leading-snug line-clamp-2">
                    <MessageCircle className="inline w-3 h-3 mr-0.5 text-slate-400" />
                    &ldquo;{s.latest.body}&rdquo; — {s.latest.authorName}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="px-4 pb-4 text-[10px] text-slate-400 leading-relaxed">
        จัดอันดับจากความคึกคักที่คาดการณ์ของวันนี้ ร่วมกับคะแนนรีวิวจากผู้ใช้ TripSure • คลิกเพื่อดูรายละเอียดและเขียนรีวิว
      </p>
    </div>
  );
};
