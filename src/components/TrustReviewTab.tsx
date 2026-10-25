'use client';

import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Award,
  MessageSquare,
  HeartHandshake,
  Check,
  X,
} from 'lucide-react';
import { UserProfile, UserReview } from '@/lib/types';
import { stripEmoji } from '@/lib/text';

interface TrustReviewTabProps {
  users: UserProfile[];
  reviews: UserReview[];
  onAddReview: (review: UserReview) => void;
}

// 1-5 score picker; lives outside the tab so a click does not remount it and drop focus
const ScoreButtons: React.FC<{ value: number; onChange: (n: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="grid grid-cols-5 rounded-md border border-slate-200 p-0.5" role="group" aria-label={label}>
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        aria-pressed={s === value}
        onClick={() => onChange(s)}
        className={`h-8 rounded text-xs font-mono font-semibold transition-colors ${
          s <= value ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-900'
        }`}
      >
        {s}
      </button>
    ))}
  </div>
);


export const TrustReviewTab: React.FC<TrustReviewTabProps> = ({
  users,
  reviews,
  onAddReview,
}) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'HOST' | 'PARTICIPANT'>('ALL');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // New Review Form State
  const [targetUserId, setTargetUserId] = useState<string>(users[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [honestyRating, setHonestyRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([
    'ซื่อสัตย์โปร่งใส',
    'ตรงต่อเวลา',
  ]);

  const AVAILABLE_BADGES = [
    'Verified Traveler',
    'Super Host',
    'ซื่อสัตย์โปร่งใส',
    'ตรงต่อเวลา',
    'สมาชิกดีเด่น',
    'ตากล้องมือทอง',
    'ช่วยเหลือเพื่อนร่วมทริป',
    'ควรปรับปรุงเรื่องตรงเวลา',
  ];

  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === targetUserId) || users[0];

    const newRev: UserReview = {
      id: `rev_${Date.now()}`,
      tripId: 't0000001-0000-0000-0000-000000000001',
      reviewerName: 'คุณ (กรรมการ Hackathon)',
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      targetUserId: targetUser.id,
      targetUserName: targetUser.fullName,
      targetUserRole: targetUser.tier === 'PLATINUM' ? 'HOST' : 'PARTICIPANT',
      rating,
      punctualityRating,
      honestyRating,
      comment: comment || 'เพื่อนร่วมทริปคุณภาพ จัดการทริปได้ยอดเยี่ยมมากครับ',
      badges: selectedBadges,
      createdAt: 'เมื่อสักครู่',
    };

    onAddReview(newRev);
    setShowReviewModal(false);
    setComment('');
  };

  // "ไม่เคยเท" (never flaked) is praise, so only flag the positive forms
  const isWarning = (tag: string) =>
    tag.includes('ควรปรับปรุง') || (/เคย(ยกเลิก|เท|ถูกหัก)/.test(tag) && !tag.includes('ไม่เคย'));

  return (
    <div className="space-y-12">

      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">รีวิว & ความน่าเชื่อถือ</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 leading-relaxed">
            ระบบรีวิวสองทาง ดูประวัติการมาตามนัด อัตราการไม่เททริป และฟีดแบ็กจากเพื่อนร่วมเดินทาง ก่อนตัดสินใจไปเที่ยวกับใคร
          </p>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="self-start sm:self-auto h-11 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          เขียนรีวิว
        </button>
      </header>

      {/* Member register */}
      <section>
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          ทะเบียนสมาชิก <span className="font-sans text-base font-normal text-slate-500">{users.length} คน</span>
        </h3>
        <p className="mt-1 text-xs text-slate-500">สมาชิกและรีวิวในหน้านี้เป็นข้อมูลตัวอย่างสำหรับสาธิต</p>

        <div className="mt-5 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden lg:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_100px_110px_minmax(0,1.6fr)_120px] gap-4 px-5 py-2.5 border-b border-slate-200 text-xs font-medium text-slate-500">
            <span>สมาชิก</span>
            <span>Trust Score</span>
            <span className="text-right">มาตามนัด</span>
            <span className="text-right">สำเร็จ / ยกเลิก</span>
            <span>หมายเหตุ</span>
            <span />
          </div>
          <ul className="divide-y divide-slate-100">
            {users.map((user) => {
              const hasCancelled = user.tripsCancelled > 0;
              return (
                <li
                  key={user.id}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_100px_110px_minmax(0,1.6fr)_120px] gap-x-4 gap-y-3 px-5 py-4 lg:items-center"
                >
                  <div className="flex items-center gap-3 min-w-0 sm:col-span-2 lg:col-span-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">{user.fullName}</span>
                        {user.isVerified && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-label="ยืนยันตัวตนแล้ว" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        <span className="font-semibold tracking-wide text-amber-700">{user.tier}</span> · {user.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between lg:justify-start gap-2">
                      <span className="text-xs text-slate-500 lg:hidden">Trust Score</span>
                      <span className="font-mono font-semibold text-slate-900">{user.trustScore}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${user.trustScore >= 90 ? 'bg-emerald-500' : user.trustScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${user.trustScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between lg:block lg:text-right text-sm">
                    <span className="text-xs text-slate-500 lg:hidden">มาตามนัด</span>
                    <span className="font-mono text-slate-900">{user.attendanceRate}%</span>
                  </div>

                  <div className="flex justify-between lg:block lg:text-right text-sm">
                    <span className="text-xs text-slate-500 lg:hidden">สำเร็จ / ยกเลิก</span>
                    <span className="font-mono">
                      <span className="text-slate-900">{user.tripsCompleted}</span>
                      <span className="text-slate-400"> / </span>
                      <span className={hasCancelled ? 'text-rose-600 font-semibold' : 'text-slate-400'}>{user.tripsCancelled}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:col-span-2 lg:col-span-1">
                    {user.warningTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                          isWarning(tag) ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isWarning(tag) && <AlertCircle className="w-3 h-3" />}
                        {stripEmoji(tag)}
                      </span>
                    ))}
                  </div>

                  <div className="lg:text-right">
                    <button
                      onClick={() => {
                        setTargetUserId(user.id);
                        setShowReviewModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      รีวิวคนนี้
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section>
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          รีวิวจากผู้ร่วมเดินทาง <span className="font-sans text-base font-normal text-slate-500">{reviews.length} รีวิว</span>
        </h3>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          {reviews.map((rev) => (
            <article key={rev.id} className="py-6 border-t border-slate-200 animate-fadeIn">
              <div className="flex items-center gap-0.5" aria-label={`${rev.rating} จาก 5 ดาว`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                ))}
              </div>
              <blockquote className="mt-3 font-display text-lg leading-relaxed text-slate-900">&ldquo;{rev.comment}&rdquo;</blockquote>

              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rev.reviewerAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0 text-sm">
                  <div className="text-slate-900">
                    <span className="font-semibold">{rev.reviewerName}</span>
                    <span className="text-slate-500"> รีวิวถึง </span>
                    <span className="font-semibold">{rev.targetUserName}</span>
                    <span className="text-slate-500"> ({rev.targetUserRole === 'HOST' ? 'โฮสต์' : 'ผู้ร่วมทริป'})</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ตรงต่อเวลา {rev.punctualityRating}/5 · ความโปร่งใส {rev.honestyRating}/5 · {rev.createdAt}
                  </div>
                </div>
              </div>

              {rev.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rev.badges.map((b, bIdx) => {
                    const isVerified = b.includes('Verified') || b === 'Verified Traveler';
                    return (
                      <span
                        key={bIdx}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                            : isWarning(b)
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isWarning(b) ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <Award className="w-3 h-3 text-amber-600" />
                        )}
                        {stripEmoji(b)}
                      </span>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Write review dialog */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink-950/70 animate-backdropIn"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="bg-white rounded-xl max-w-lg w-full shadow-2xl animate-popIn max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <h3 id="review-dialog-title" className="font-display text-xl font-semibold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                เขียนรีวิวและให้คะแนน
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors"
                aria-label="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">รีวิวถึง</span>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.tier})
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">ภาพรวม</span>
                <div className="flex gap-1" role="group" aria-label="คะแนนภาพรวม">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)} aria-label={`${s} ดาว`} aria-pressed={s === rating} className="p-0.5">
                      <Star className={`w-7 h-7 transition-colors ${s <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">ตรงต่อเวลา</span>
                  <ScoreButtons value={punctualityRating} onChange={setPunctualityRating} label="คะแนนตรงต่อเวลา" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">ความโปร่งใส</span>
                  <ScoreButtons value={honestyRating} onChange={setHonestyRating} label="คะแนนความโปร่งใส" />
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">มอบป้ายรางวัลหรือป้ายเตือน</span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_BADGES.map((b) => {
                    const isSelected = selectedBadges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleBadge(b)}
                        className={`h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                          isSelected
                            ? isWarning(b)
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {stripEmoji(b)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">ความคิดเห็นเพิ่มเติม</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="แชร์ประสบการณ์เดินทาง เพื่อเป็นประโยชน์ต่อเพื่อนร่วมทริปคนอื่น"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </label>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="h-10 px-4 rounded-md text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
                >
                  ส่งรีวิว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
