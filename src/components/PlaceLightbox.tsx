'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, MessageCircle, Loader2, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  PlaceReview,
  PlaceReviewKind,
  Reviewer,
  fetchPlaceReviews,
  addPlaceReview,
  MAX_REVIEW_LENGTH,
} from '@/lib/placeReviews';

interface PlaceLightboxProps {
  images: string[];
  startIndex: number;
  placeName: string;
  provinceName: string;
  reviewer: Reviewer | null;
  onClose: () => void;
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

const Stars: React.FC<{ value: number; size?: string }> = ({ value, size = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
    ))}
  </span>
);

export const PlaceLightbox: React.FC<PlaceLightboxProps> = ({
  images,
  startIndex,
  placeName,
  provinceName,
  reviewer,
  onClose,
}) => {
  const placeKey = `${provinceName}|${placeName}`;
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PlaceReviewKind>('review');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // With Supabase, posting needs a Google sign-in; in demo mode a display name is enough
  const needsSignIn = isSupabaseConfigured() && !reviewer?.authUserId;
  const needsGuestName = !isSupabaseConfigured() && !reviewer;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPlaceReviews(placeKey).then((list) => {
      if (!cancelled) {
        setReviews(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [placeKey]);

  const go = (step: number) => {
    if (images.length < 2) return;
    setZoomed(false);
    setIndex((i) => (i + step + images.length) % images.length);
  };

  // Capture phase so Escape closes only the lightbox, not the province window underneath
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea')) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, onClose]);

  const ratings = reviews.filter((r) => r.kind === 'review' && r.rating);
  const average = ratings.length ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0;
  const visible = reviews.filter((r) => r.kind === tab);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setZoomed((z) => !z);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsSignIn) return;
    const author: Reviewer = reviewer ?? { name: guestName.trim(), avatarUrl: '' };
    if (!author.name) {
      setError('กรุณาใส่ชื่อที่จะแสดง');
      return;
    }
    setPosting(true);
    setError(null);
    const result = await addPlaceReview(placeKey, author, { kind: tab, rating: tab === 'review' ? rating : null, body });
    setPosting(false);
    if (result.error || !result.review) {
      setError(result.error || 'ส่งไม่สำเร็จ');
      return;
    }
    setReviews((list) => [result.review!, ...list]);
    setBody('');
    setRating(0);
  };

  const current = images[Math.min(index, images.length - 1)];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 animate-backdropIn" onClick={onClose}>
      <div
        className="relative w-full max-w-7xl h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col lg:flex-row bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo viewer */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0 flex flex-col">
          <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-black">
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={current}
                src={current}
                alt={`${placeName} ${index + 1}`}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 animate-fadeIn ${
                  zoomed ? 'scale-[2.2] cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                style={{ transformOrigin: origin }}
              />
            ) : (
              <div className="text-white/50 text-sm">ยังไม่มีรูปสำหรับสถานที่นี้</div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all hover:rotate-90"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
            {current && (
              <button
                onClick={() => setZoomed((z) => !z)}
                className="absolute top-3 left-3 h-10 px-3 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                {zoomed ? 'ย่อ' : 'ซูม'}
              </button>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="รูปก่อนหน้า"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                  aria-label="รูปถัดไป"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-full">
                  {index + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="shrink-0 flex gap-2 p-2 bg-slate-900 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => {
                    setZoomed(false);
                    setIndex(i);
                  }}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === index ? 'border-emerald-400' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`รูปที่ ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reviews & comments */}
        <aside className="w-full lg:w-[400px] shrink-0 max-h-[55vh] lg:max-h-none flex flex-col bg-slate-50">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <div className="text-xs text-slate-500">จ.{provinceName}</div>
            <h3 className="text-xl font-black text-slate-900">{placeName}</h3>
            <div className="mt-1.5 flex items-center gap-2 text-sm">
              {ratings.length > 0 ? (
                <>
                  <span className="text-lg font-black text-slate-900">{average.toFixed(1)}</span>
                  <Stars value={average} size="w-4 h-4" />
                  <span className="text-slate-500">({ratings.length} รีวิว)</span>
                </>
              ) : (
                <span className="text-slate-400">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวที่นี่!</span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/70">
              {(['review', 'comment'] as PlaceReviewKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setTab(k);
                    setError(null);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tab === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {k === 'review' ? <Star className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  {k === 'review' ? 'รีวิว' : 'ความคิดเห็น'} ({reviews.filter((r) => r.kind === k).length})
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลด...
              </div>
            ) : visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {tab === 'review' ? 'ยังไม่มีรีวิว' : 'ยังไม่มีความคิดเห็น'}
              </p>
            ) : (
              visible.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white border border-slate-200 p-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    {r.authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                        {r.authorName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-800 truncate">{r.authorName}</div>
                      <div className="text-[11px] text-slate-400">{formatWhen(r.createdAt)}</div>
                    </div>
                    {r.rating && <Stars value={r.rating} />}
                  </div>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{r.body}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 p-4 border-t border-slate-200 bg-white space-y-2">
            {needsSignIn ? (
              <p className="text-sm text-slate-500 text-center py-2">เข้าสู่ระบบด้วย Google เพื่อเขียนรีวิวและแสดงความคิดเห็น</p>
            ) : (
              <>
                {tab === 'review' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">ให้คะแนน</span>
                    <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          aria-label={`${n} ดาว`}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-6 h-6 transition-transform hover:scale-110 ${
                              n <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {needsGuestName && (
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    maxLength={40}
                    placeholder="ชื่อที่จะแสดง"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
                  />
                )}
                <div className="flex gap-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={MAX_REVIEW_LENGTH}
                    rows={2}
                    placeholder={tab === 'review' ? 'เล่าประสบการณ์ของคุณที่นี่...' : 'ถามหรือแสดงความคิดเห็น...'}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm resize-none focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={posting || !body.trim()}
                    className="w-11 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                    aria-label="ส่ง"
                  >
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-xs text-rose-600">{error}</p>}
                {!isSupabaseConfigured() && (
                  <p className="text-[10px] text-slate-400">โหมดทดลอง: รีวิวถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น</p>
                )}
              </>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
};
