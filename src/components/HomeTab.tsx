'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Users,
  PlusCircle,
  ArrowRight,
  Calendar,
  MapPin,
  LogIn,
  UserPen,
  UserRoundPlus,
  Wallet,
  PlaneTakeoff,
  BadgeCheck,
  Trophy,
  CalendarCheck,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TravelSearchTabs } from '@/components/TravelSearchTabs';
import { CommunityTrip, UserProfile, SubscriptionTier, TIER_CONFIGS, PlannerPresetOptions } from '@/lib/types';

interface HomeTabProps {
  // Signed-in member's profile; null when signed out or not created yet
  memberProfile: UserProfile | null;
  isSignedIn: boolean;
  heroTrip: CommunityTrip;
  allTrips: CommunityTrip[];
  currentTier: SubscriptionTier;
  aiQuotaUsed: number;
  onNavigate: (tab: string) => void;
  // Send a destination to the AI planner (same handler the map uses)
  onPlanTrip: (province: string, places: string[], totalBudget: number | undefined, people: number, options: PlannerPresetOptions) => void;
  onSignIn: () => void;
  onOpenProfile: () => void;
  onOpenUpgradeModal: () => void;
}

const QUICK_ACTIONS: { label: string; description: string; icon: LucideIcon; tab: string; tint: string }[] = [
  {
    label: 'ให้ AI จัดทริป',
    description: 'วางแผนตามงบ + เช็กอากาศ + เทียบราคาที่พัก',
    icon: Sparkles,
    tab: 'ai-planner',
    tint: 'from-emerald-500 to-teal-500',
  },
  {
    label: 'หาทริปชุมชน',
    description: 'เข้าร่วมทริปกับเพื่อนใหม่ ล็อกมัดจำกันเท',
    icon: ShieldCheck,
    tab: 'community',
    tint: 'from-indigo-500 to-violet-500',
  },
  {
    label: 'เปิดทริปของคุณ',
    description: 'สร้างทริปหารค่าใช้จ่าย ชวนคนมาร่วม',
    icon: PlusCircle,
    tab: 'community',
    tint: 'from-amber-500 to-orange-500',
  },
  {
    label: 'รีวิว & ความน่าเชื่อถือ',
    description: 'ดูคะแนน Trust ก่อนไปเที่ยวกับใคร',
    icon: Users,
    tab: 'trust-review',
    tint: 'from-rose-500 to-pink-500',
  },
];

const HOW_IT_WORKS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: '1. เข้าสู่ระบบ & สร้างโปรไฟล์',
    description: 'ล็อกอินด้วย Google แล้วกรอกชื่อ-นามสกุลและชื่อเล่น ให้เพื่อนร่วมทริปรู้จักคุณ',
    icon: UserRoundPlus,
  },
  {
    title: '2. เข้าร่วมทริป & วางมัดจำ',
    description: 'เงินมัดจำถูกล็อกใน Smart Escrow ชื่อคุณจะขึ้นในรายชื่อสมาชิกที่วางเงินค้ำประกันแล้ว',
    icon: Wallet,
  },
  {
    title: '3. ไปเที่ยวแบบไม่โดนเท',
    description: 'ใครยกเลิกกะทันหันโดนหัก 10% — ครึ่งหนึ่งชดเชยให้เพื่อนที่เหลือในกลุ่ม',
    icon: PlaneTakeoff,
  },
];

export const HomeTab: React.FC<HomeTabProps> = ({
  memberProfile,
  isSignedIn,
  heroTrip,
  allTrips,
  currentTier,
  aiQuotaUsed,
  onNavigate,
  onPlanTrip,
  onSignIn,
  onOpenProfile,
  onOpenUpgradeModal,
}) => {
  const tierConfig = TIER_CONFIGS[currentTier];
  const featuredTrips = [heroTrip, ...allTrips.filter((t) => t.id !== heroTrip.id)].slice(0, 3);
  const openSeats = featuredTrips.reduce((sum, t) => sum + Math.max(0, t.totalSlots - t.joinedSlots), 0);
  const lockedPool = [heroTrip, ...allTrips].reduce((sum, t) => sum + t.tripPoolBalance, 0);

  const renderWelcome = () => {
    if (memberProfile) {
      const displayName = memberProfile.nickname || memberProfile.fullName;
      return (
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {memberProfile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={memberProfile.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-md shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs text-slate-500">ยินดีต้อนรับกลับมา</div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">สวัสดี, {displayName} 👋</h2>
              <div className="text-sm text-slate-500 truncate">
                {memberProfile.fullName}
                {memberProfile.homeProvince && ` • ${memberProfile.homeProvince}`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:w-[22rem] shrink-0">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <BadgeCheck className="w-4 h-4 mx-auto text-emerald-600" />
              <div className="mt-0.5 text-lg font-extrabold text-slate-900">{memberProfile.trustScore}</div>
              <div className="text-[10px] text-slate-500">Trust Score</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <CalendarCheck className="w-4 h-4 mx-auto text-indigo-600" />
              <div className="mt-0.5 text-lg font-extrabold text-slate-900">{memberProfile.attendanceRate}%</div>
              <div className="text-[10px] text-slate-500">มาตามนัด</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <Trophy className="w-4 h-4 mx-auto text-amber-500" />
              <div className="mt-0.5 text-lg font-extrabold text-slate-900">{memberProfile.tripsCompleted}</div>
              <div className="text-[10px] text-slate-500">ทริปสำเร็จ</div>
            </div>
          </div>

          <button
            onClick={onOpenProfile}
            className="self-start md:self-center h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <UserPen className="w-4 h-4" />
            แก้ไขโปรไฟล์
          </button>
        </div>
      );
    }

    // Signed out, or signed in with Google but no profile yet
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
          <span className="animate-nudge inline-block">👋</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {isSignedIn ? 'อีกขั้นเดียว! สร้างโปรไฟล์ของคุณ' : 'เริ่มต้นใช้งาน TripSure AI'}
          </h2>
          <p className="text-sm text-slate-500">
            {isSignedIn
              ? 'กรอกชื่อ-นามสกุลและชื่อเล่น เพื่อเข้าร่วมทริปและวางเงินค้ำประกันกับเพื่อนในชุมชน'
              : 'ล็อกอินด้วย Google และสร้างโปรไฟล์ เพื่อเข้าร่วมทริปชุมชนและสะสมคะแนนความน่าเชื่อถือ'}
          </p>
        </div>
        <button
          onClick={isSignedIn ? onOpenProfile : onSignIn}
          className="btn-shine self-start sm:self-center h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/25 transition-all hover:-translate-y-0.5 shrink-0"
        >
          {isSignedIn ? <UserRoundPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {isSignedIn ? 'สร้างโปรไฟล์' : 'เข้าสู่ระบบด้วย Google'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Welcome / profile status */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 animate-fadeIn">
        {renderWelcome()}
      </section>

      {/* Booking-style search tabs */}
      <TravelSearchTabs onNavigate={onNavigate} onPlanTrip={onPlanTrip} />

      {/* Quick actions */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">อยากทำอะไรวันนี้?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => onNavigate(action.tab)}
                className="group text-left p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <span
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.tint} text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="mt-4 font-bold text-slate-900 flex items-center gap-1">
                  {action.label}
                  <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>
                <div className="mt-1 text-xs text-slate-500 leading-relaxed">{action.description}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured trips */}
      <section>
        <div className="flex items-end justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">ทริปชุมชนที่กำลังเปิดรับ</h3>
            <p className="text-xs text-slate-500">
              เหลือ {openSeats} ที่นั่ง • เงินมัดจำล็อกใน Escrow รวม ฿{lockedPool.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => onNavigate('community')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredTrips.map((trip) => {
            const fillPercent = Math.round((trip.joinedSlots / trip.totalSlots) * 100);
            return (
              <button
                key={trip.id}
                onClick={() => onNavigate('community')}
                className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="relative h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={trip.imageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold">
                    🛡️ มัดจำ ฿{trip.securityDepositPerPerson.toLocaleString()}
                  </span>
                  <span className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {trip.destination}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.travelDates}
                  </div>
                  <h4 className="mt-1 font-bold text-slate-900 line-clamp-1">{trip.title}</h4>
                  <div className="mt-3 flex justify-between text-xs font-semibold text-slate-600">
                    <span>
                      {trip.joinedSlots} / {trip.totalSlots} คน
                    </span>
                    <span className="font-mono text-slate-900">฿{trip.costPerPerson.toLocaleString()}/คน</span>
                  </div>
                  <div className="mt-1.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-indigo-900/60 shadow-xl">
        <h3 className="text-lg sm:text-xl font-extrabold">เที่ยวกับคนใหม่ยังไงไม่ให้โดนเท?</h3>
        <p className="text-sm text-slate-300 mt-1">3 ขั้นตอนง่ายๆ กับระบบ Smart Escrow</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <Icon className="w-6 h-6 text-emerald-400" />
                <div className="mt-3 font-bold">{step.title}</div>
                <div className="mt-1 text-xs text-slate-300 leading-relaxed">{step.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Membership tier */}
      <section className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
        <span className="w-11 h-11 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5" />
        </span>
        <div className="flex-1 text-sm">
          <div className="font-bold text-slate-900">สมาชิก {tierConfig.labelThai}</div>
          <div className="text-slate-600">
            {tierConfig.unlimitedQuota ? 'ใช้ AI วางแผนได้ไม่จำกัด' : `ใช้โควตา AI ไปแล้ว ${aiQuotaUsed} / ${tierConfig.maxQuotas} ครั้งเดือนนี้`} • ส่วนลดค่าเปิดทริป{' '}
            {tierConfig.creationFeeDiscountPercent}%
          </div>
        </div>
        {currentTier !== 'PLATINUM' && (
          <button
            onClick={onOpenUpgradeModal}
            className="self-start sm:self-center h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all hover:-translate-y-0.5"
          >
            อัปเกรดสมาชิก
          </button>
        )}
      </section>
    </div>
  );
};
