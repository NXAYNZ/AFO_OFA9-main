'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Star,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  UserCheck,
  Award,
  ThumbsUp,
  MessageSquare,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { UserProfile, UserReview } from '@/lib/types';

interface TrustReviewTabProps {
  users: UserProfile[];
  reviews: UserReview[];
  onAddReview: (review: UserReview) => void;
}

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
    '💎 ซื่อสัตย์โปร่งใส',
    '⏰ ตรงต่อเวลา',
  ]);

  const AVAILABLE_BADGES = [
    '👑 Super Host',
    '💎 ซื่อสัตย์โปร่งใส',
    '⏰ ตรงต่อเวลา',
    '🌟 สมาชิกดีเด่น',
    '📸 ตากล้องมือทอง',
    '🤝 ช่วยเหลือเพื่อนร่วมทริป',
    '⚠️ ควรปรับปรุงเรื่องตรงเวลา',
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

  return (
    <div className="space-y-8">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Two-Way Trust & Review Directory (ระบบความน่าเชื่อถือสองทาง)
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ตรวจเช็กประวัติความน่าเชื่อถือ อัตราการไม่เททริป (Attendance Rate) และฟีดแบ็กจริงจากเพื่อนร่วมเดินทาง
          </p>
        </div>

        <button
          onClick={() => setShowReviewModal(true)}
          className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>เขียนรีวิวเพื่อน / โฮสต์</span>
        </button>
      </div>

      {/* USER PROFILES TRUST DIRECTORY */}
      <div>
        <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center space-x-2">
          <span>โปรไฟล์สมาชิก & ประวัติการเข้าร่วมทริป</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            {users.length} ท่าน
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map((user) => {
            const isSuperHost = user.tier === 'PLATINUM';
            const hasCancelled = user.tripsCancelled > 0;

            return (
              <div
                key={user.id}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  isSuperHost
                    ? 'border-indigo-400 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm'
                    : hasCancelled
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Avatar & Badges Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                    />
                    <div className="text-right">
                      <span className="text-xs px-2 py-0.5 rounded-full font-extrabold uppercase bg-slate-100 text-slate-700">
                        {user.tier}
                      </span>
                      {user.isVerified && (
                        <div className="flex items-center justify-end space-x-1 text-[11px] font-bold text-emerald-600 mt-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                    {user.fullName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

                  {/* Trust Score & Attendance Rate Gauge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Trust Score:</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-sm">
                        {user.trustScore}%
                      </span>
                    </div>
                    {/* Micro gauge */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${user.trustScore}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500 font-medium">อัตราการไม่เท:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {user.attendanceRate}%
                      </span>
                    </div>
                  </div>

                  {/* Trips count breakdown */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
                    <span>สำเร็จ {user.tripsCompleted} ทริป</span>
                    <span className={hasCancelled ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                      ยกเลิก {user.tripsCancelled} ครั้ง
                    </span>
                  </div>

                  {/* Warning & Praise Tags */}
                  <div className="mt-3 space-y-1">
                    {user.warningTags.map((tag, tIdx) => (
                      <div
                        key={tIdx}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          tag.includes('⚠️')
                            ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setTargetUserId(user.id);
                      setShowReviewModal(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center justify-center space-x-1 w-full"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>เขียนรีวิวให้สมาชิกนี้</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEWS STREAM */}
      <div className="pt-4">
        <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center space-x-2">
          <span>ฟีดแบค & รีวิวจากผู้ร่วมเดินทางจริง</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            {reviews.length} รีวิว
          </span>
        </h3>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <img
                  src={rev.reviewerAvatar}
                  alt={rev.reviewerName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{rev.reviewerName}</span>
                    <span className="text-xs text-slate-400">รีวิวถึง</span>
                    <span className="font-bold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {rev.targetUserName} ({rev.targetUserRole})
                    </span>
                  </div>

                  {/* Stars Row */}
                  <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-500">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span>ตรงต่อเวลา {rev.punctualityRating}/5</span>
                    <span>•</span>
                    <span>ความโปร่งใส {rev.honestyRating}/5</span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Awarded Badges */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {rev.badges.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          b.includes('⚠️')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 shrink-0 self-end sm:self-start">
                {rev.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600" />
                <span>เขียนรีวิว & ให้คะแนนความน่าเชื่อถือ</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลือกสมาชิกหรือโฮสต์ที่ต้องการรีวิว
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-1">ภาพรวม (Stars)</div>
                  <div className="flex justify-center text-amber-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setRating(s)}
                        className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1">ตรงต่อเวลา</div>
                  <div className="flex justify-center text-emerald-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        onClick={() => setPunctualityRating(s)}
                        className={`text-xs font-mono font-bold px-1 ${
                          s <= punctualityRating ? 'text-emerald-700' : 'text-slate-300'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1">ความโปร่งใส</div>
                  <div className="flex justify-center text-indigo-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        onClick={() => setHonestyRating(s)}
                        className={`text-xs font-mono font-bold px-1 ${
                          s <= honestyRating ? 'text-indigo-700' : 'text-slate-300'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  มอบเหรียญรางวัล / ป้ายเตือน
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_BADGES.map((b) => {
                    const isSelected = selectedBadges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleBadge(b)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ความคิดเห็นเพิ่มเติม
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เขียนแชร์ประสบการณ์เดินทาง เพื่อเป็นประโยชน์ต่อเพื่อนร่วมทริปคนอื่น..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
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
