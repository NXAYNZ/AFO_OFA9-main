'use client';

import React from 'react';
import {
  ArrowRight,
  LogIn,
  UserPen,
  UserRoundPlus,
  BadgeCheck,
  Trophy,
  CalendarCheck,
  Crown,
  Wallet,
  PlaneTakeoff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TravelSearchTabs } from '@/components/TravelSearchTabs';
import { TripTicket } from '@/components/TripTicket';
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

const HOW_IT_WORKS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'เข้าสู่ระบบ & สร้างโปรไฟล์',
    description: 'ล็อกอินด้วย Google แล้วกรอกชื่อ-นามสกุลและชื่อเล่น ให้เพื่อนร่วมทริปรู้จักคุณ',
    icon: UserRoundPlus,
  },
  {
    title: 'เข้าร่วมทริป & วางมัดจำ',
    description: 'เงินมัดจำถูกล็อกใน Smart Escrow ชื่อคุณจะขึ้นในรายชื่อสมาชิกที่วางเงินค้ำประกันแล้ว',
    icon: Wallet,
  },
  {
    title: 'ไปเที่ยวแบบไม่โดนเท',
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
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-ink-900 flex items-center justify-center font-display text-2xl font-semibold text-white shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold text-slate-900 truncate">สวัสดี {displayName}</h2>
              <div className="text-sm text-slate-500 truncate">
                {memberProfile.fullName}
                {memberProfile.homeProvince && ` · ${memberProfile.homeProvince}`}
              </div>
            </div>
          </div>

          <dl className="flex items-center gap-6 sm:gap-8 shrink-0">
            {[
              { icon: BadgeCheck, value: memberProfile.trustScore, label: 'Trust Score' },
              { icon: CalendarCheck, value: `${memberProfile.attendanceRate}%`, label: 'มาตามนัด' },
              { icon: Trophy, value: memberProfile.tripsCompleted, label: 'ทริปสำเร็จ' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <dt className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <button
            onClick={onOpenProfile}
            className="self-start md:self-center h-10 px-4 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-400 flex items-center gap-2 transition-colors shrink-0"
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
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            {isSignedIn ? 'อีกขั้นเดียว สร้างโปรไฟล์ของคุณ' : 'เริ่มต้นใช้งาน TripSure'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            {isSignedIn
              ? 'กรอกชื่อ-นามสกุลและชื่อเล่น เพื่อเข้าร่วมทริปและวางเงินค้ำประกันกับเพื่อนในชุมชน'
              : 'ล็อกอินด้วย Google และสร้างโปรไฟล์ เพื่อเข้าร่วมทริปชุมชนและสะสมคะแนนความน่าเชื่อถือ'}
          </p>
        </div>
        <button
          onClick={isSignedIn ? onOpenProfile : onSignIn}
          className="self-start sm:self-center h-11 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          {isSignedIn ? <UserRoundPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {isSignedIn ? 'สร้างโปรไฟล์' : 'เข้าสู่ระบบด้วย Google'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-14">
      {/* Booking-style search */}
      <TravelSearchTabs onNavigate={onNavigate} onPlanTrip={onPlanTrip} />

      {/* Welcome / profile status */}
      <section className="border-y border-slate-200 py-6">{renderWelcome()}</section>

      {/* Featured trips, printed as tickets */}
      <section>
        <div className="flex items-end justify-between mb-5 gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold text-slate-900">ทริปชุมชนที่กำลังเปิดรับ</h3>
            <p className="mt-1 text-sm text-slate-500">
              เหลือ {openSeats} ที่นั่ง · เงินมัดจำล็อกใน Escrow รวม{' '}
              <span className="font-mono text-slate-700">฿{lockedPool.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('community')}
            className="group text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {featuredTrips.map((trip) => (
            <TripTicket key={trip.id} trip={trip} onOpen={() => onNavigate('community')} />
          ))}
        </div>
      </section>

      {/* How it works: the route from sign-in to a trip nobody flakes on */}
      <section>
        <h3 className="font-display text-2xl font-semibold text-slate-900">เที่ยวกับคนใหม่ ยังไงไม่ให้โดนเท</h3>
        <p className="mt-1 text-sm text-slate-500">สามจุดแวะ จากล็อกอินถึงวันเดินทาง ด้วยระบบ Smart Escrow</p>
        <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          <span aria-hidden className="hidden md:block absolute top-[15px] left-4 right-[calc(33%-1rem)] border-t-2 border-dashed border-slate-300" />
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative flex md:block gap-4">
                <span
                  className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ring-4 ring-[var(--background)] ${
                    i === HOW_IT_WORKS.length - 1 ? 'bg-emerald-600 text-white' : 'bg-ink-900 text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="md:mt-4">
                  <div className="font-semibold text-slate-900">{step.title}</div>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-xs">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Membership tier */}
      <section className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
        <Crown className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1 text-sm">
          <div className="font-semibold text-slate-900">{tierConfig.labelThai}</div>
          <div className="text-slate-600">
            {tierConfig.unlimitedQuota ? 'ใช้ AI วางแผนได้ไม่จำกัด' : `ใช้โควตา AI ไปแล้ว ${aiQuotaUsed} จาก ${tierConfig.maxQuotas} ครั้งในเดือนนี้`} · ส่วนลดค่าเปิดทริป{' '}
            {tierConfig.creationFeeDiscountPercent}%
          </div>
        </div>
        {currentTier !== 'PLATINUM' && (
          <button
            onClick={onOpenUpgradeModal}
            className="self-start sm:self-center h-10 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
          >
            อัปเกรดสมาชิก
          </button>
        )}
      </section>
    </div>
  );
};
