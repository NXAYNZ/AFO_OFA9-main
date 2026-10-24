'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  MapPin,
  Sparkles,
  Info,
  Clock,
  Coins,
  Award,
} from 'lucide-react';
import {
  CommunityTrip,
  UserProfile,
  TripParticipant,
  SubscriptionTier,
} from '@/lib/types';
import { CreateTripWindow, TripSeed } from '@/components/CreateTripWindow';

const DEFAULT_SEED: TripSeed = { title: '', destination: 'เกาะล้าน จ.ชลบุรี', places: [] };

export type JoinTripResult = 'JOINED' | 'NEEDS_PROFILE' | 'ALREADY_JOINED' | 'FULL';

interface CommunityEscrowTabProps {
  currentTier: SubscriptionTier;
  heroTrip: CommunityTrip;
  onJoinTrip: (trip: CommunityTrip) => JoinTripResult;
  onSimulateFlake: (trip: CommunityTrip, participant: TripParticipant) => void;
  onCreateNewTrip: (newTrip: Partial<CommunityTrip>) => void;
  allTrips: CommunityTrip[];
  userProfile: UserProfile;
  // Signed-in member's own profile; null until they create one on the web
  memberProfile: UserProfile | null;
  // Trip draft sent from the Thailand map: opens the create modal prefilled (nonce changes on every send)
  draft?: { title: string; destination: string; places: string[]; nonce: number } | null;
  onDraftUsed?: () => void;
}

export const CommunityEscrowTab: React.FC<CommunityEscrowTabProps> = ({
  currentTier,
  heroTrip,
  onJoinTrip,
  onSimulateFlake,
  onCreateNewTrip,
  allTrips,
  userProfile,
  memberProfile,
  draft,
  onDraftUsed,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [flakeSuccessMsg, setFlakeSuccessMsg] = useState<string | null>(null);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);
  const [joinBlockedMsg, setJoinBlockedMsg] = useState<string | null>(null);
  // Trip whose join button shakes after a blocked join
  const [shakingTripId, setShakingTripId] = useState<string | null>(null);
  const stopShake = (e: React.AnimationEvent) => {
    if (e.animationName === 'shake-x') setShakingTripId(null);
  };

  // Starting values for the create-trip window (a new object resets its form)
  const [tripSeed, setTripSeed] = useState<TripSeed>(DEFAULT_SEED);
  const openCreate = (seed: TripSeed = DEFAULT_SEED) => {
    setTripSeed({ ...seed });
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (!draft) return;
    openCreate({ title: draft.title, destination: draft.destination, places: draft.places });
    onDraftUsed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.nonce]);


  // The participant to simulate flake on (default Krit who has flaked before or another member)
  const flakyParticipant = heroTrip.participants.find(
    (p) => p.userId.includes('krit') || p.escrowStatus === 'HELD'
  ) || heroTrip.participants[2];

  const handleJoin = (trip: CommunityTrip) => {
    const result = onJoinTrip(trip);
    if (result === 'JOINED') {
      setJoinBlockedMsg(null);
      setJoinSuccessMsg(
        `🎉 คุณได้เข้าร่วมทริป "${trip.title}" และระบบได้ล็อกเงินมัดจำ ${trip.securityDepositPerPerson.toLocaleString()} บาท เข้าบัญชี Smart Escrow เรียบร้อยแล้ว!`
      );
      setTimeout(() => setJoinSuccessMsg(null), 6000);
      return;
    }
    const blockedMessages: Record<Exclude<JoinTripResult, 'JOINED'>, string> = {
      NEEDS_PROFILE: '👤 ต้องสร้างโปรไฟล์สมาชิกบนเว็บก่อน (ชื่อ-นามสกุล และชื่อเล่น) จึงจะเข้าร่วมทริปและวางเงินมัดจำได้',
      ALREADY_JOINED: 'คุณเข้าร่วมทริปนี้และวางเงินมัดจำไว้แล้ว',
      FULL: 'ทริปนี้เต็มแล้ว',
    };
    setJoinBlockedMsg(blockedMessages[result]);
    setShakingTripId(trip.id);
    setTimeout(() => setJoinBlockedMsg(null), 6000);
  };

  const handleFlakeClick = () => {
    if (!flakyParticipant) return;
    onSimulateFlake(heroTrip, flakyParticipant);
    setFlakeSuccessMsg(`🚨 จำลองสำเร็จ! สมาชิก "${flakyParticipant.fullName}" ยกเลิกทริปกระทันหัน: ระบบหักค่าปรับ 10% (150 บาท) โดยแบ่ง 75 บาทเข้าแพลตฟอร์ม และ 75 บาทชดเชยให้เพื่อนที่เหลือ 5 คนทันที!`);
    setTimeout(() => setFlakeSuccessMsg(null), 8000);
  };

  const handleCreateTrip = (trip: Partial<CommunityTrip>, finalFee: number) => {
    onCreateNewTrip(trip);
    setShowCreateModal(false);
    setJoinSuccessMsg(`✨ เปิดทริป "${trip.title}" สำเร็จ! บันทึกค่าธรรมเนียมคุ้มครอง ${finalFee.toLocaleString()} บาท เข้าสู่ระบบ`);
    setTimeout(() => setJoinSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION HEADER & QUICK CREATE TRIGGER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Community Trip Escrow & Anti-Flake Penalty Engine
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ระบบจัดทริปกลุ่มที่ผสาน Smart Escrow ล็อกเงินมัดจำ: หากใครเททริป โดนหัก 10% (5% แพลตฟอร์ม + 5% ชดเชยเพื่อนในกลุ่ม)
          </p>
        </div>

        <button
          onClick={() => openCreate()}
          className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>สร้างทริปใหม่ (+3.5% Platform Fee)</span>
        </button>
      </div>

      {/* FEEDBACK ALERTS */}
      {joinSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-center space-x-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{joinSuccessMsg}</span>
        </div>
      )}

      {joinBlockedMsg && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 text-sky-900 text-sm flex items-center space-x-3 shadow-sm animate-fadeIn">
          <Info className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="font-semibold">{joinBlockedMsg}</span>
        </div>
      )}

      {!memberProfile && !joinBlockedMsg && (
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>เข้าสู่ระบบด้วย Google และสร้างโปรไฟล์ก่อน จึงจะเข้าร่วมทริปได้ — ชื่อ-นามสกุลและชื่อเล่นของคุณจะแสดงในรายชื่อสมาชิกที่วางเงินค้ำประกัน</span>
        </div>
      )}

      {flakeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-sm flex items-center space-x-3 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="font-semibold">{flakeSuccessMsg}</span>
        </div>
      )}

      {/* FEATURE HERO: KOH SAMET 8-PERSON TRIP */}
      <div className="bg-white rounded-3xl border-2 border-indigo-500/30 overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Trip Image & Badges (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
            <img
              src={heroTrip.imageUrl}
              alt={heroTrip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-slate-950 shadow-md">
                🛡️ Escrow Guaranteed 100%
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-sm">
                เกาะเสม็ด ระยอง
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{heroTrip.travelDates}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-1 leading-snug">
                {heroTrip.title}
              </h3>
              
              {/* Host Tag */}
              <div className="mt-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                <img
                  src={heroTrip.host.avatarUrl}
                  alt={heroTrip.host.fullName}
                  className="w-8 h-8 rounded-full border border-emerald-400"
                />
                <div className="text-xs">
                  <div className="font-bold flex items-center space-x-1">
                    <span>{heroTrip.host.fullName}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-900 px-1 rounded font-extrabold">SUPER HOST</span>
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    Trust Score {heroTrip.host.trustScore}% • ไม่เคยเท 24 ทริป
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details & Live Calculator (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            {/* Slot & Pool KPI Row */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">ค่าใช้จ่าย/คน</div>
                  <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                    ฿{heroTrip.costPerPerson.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-semibold">เงินมัดจำ Escrow</div>
                  <div className="text-xl font-black font-mono text-indigo-700 mt-0.5">
                    ฿{heroTrip.securityDepositPerPerson.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-semibold">สมาชิกในกลุ่ม</div>
                  <div className="text-xl font-black font-mono text-emerald-700 mt-0.5">
                    {heroTrip.joinedSlots} / {heroTrip.totalSlots} คน
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-800 font-semibold">กองกลางที่ล็อกไว้</div>
                  <div className="text-xl font-black font-mono text-amber-800 mt-0.5">
                    ฿{heroTrip.tripPoolBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>ความจุทริป (Capacity)</span>
                  <span className="font-mono">{Math.round((heroTrip.joinedSlots / heroTrip.totalSlots) * 100)}% เต็มแล้ว</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${(heroTrip.joinedSlots / heroTrip.totalSlots) * 100}%` }}
                  />
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-5 space-y-1.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">ไฮไลต์ของทริปนี้:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {heroTrip.highlights.map((h, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TRANSPARENT TAX & PENALTY ENGINE WIDGET */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800/60 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm text-amber-300">
                    Transparent Escrow Fee & 10% Penalty Tax Breakdown
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Make Me Money Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs">
                {/* Creation Fee 3.5% */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium">1. ค่าเปิดทริปคุ้มครองระบบ (3.5%):</div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    ฿{Math.round(heroTrip.totalSlots * heroTrip.costPerPerson * 0.035).toLocaleString()} บาท
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    (สมาชิก Platinum Tier ได้สิทธิ์ลดหย่อน 100% ฟรีค่าธรรมเนียม)
                  </div>
                </div>

                {/* 10% Cancellation Penalty Split */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-amber-300 font-medium">2. ค่าปรับหากมีคนเททริป (10% จากมัดจำ):</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">
                    หัก 150 บาท / ครั้ง
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 flex flex-col space-y-0.5">
                    <span>• <strong>5% (75 THB)</strong>: เข้า Platform Revenue</span>
                    <span>• <strong>5% (75 THB)</strong>: ชดเชยกองกลางเพื่อนในกลุ่ม (~15 บ./คน)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE HACKATHON DEMO BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Button 1: Join Trip & Pay Deposit */}
              <button
                onClick={() => handleJoin(heroTrip)}
                onAnimationEnd={stopShake}
                disabled={heroTrip.joinedSlots >= heroTrip.totalSlots}
                className={`${shakingTripId === heroTrip.id ? 'animate-shake' : ''} flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>เข้าร่วมทริป & วางเงินมัดจำ ฿{heroTrip.securityDepositPerPerson.toLocaleString()}</span>
              </button>

              {/* Button 2: Simulate Member Flake */}
              <button
                onClick={handleFlakeClick}
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <AlertTriangle className="w-5 h-5 text-amber-200" />
                <span>🚨 จำลองการเททริป (หักค่าปรับ 10%)</span>
              </button>
            </div>

          </div>

        </div>

        {/* PARTICIPANTS LIST ROW */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>รายชื่อสมาชิกที่วางเงินค้ำประกันแล้ว ({heroTrip.participants.length} คน)</span>
            </h4>
            <span className="text-xs text-slate-500">
              สถานะเงินมัดจำถูกล็อกอย่างปลอดภัยผ่านระบบ Escrow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {heroTrip.participants.map((p) => {
              const isPenalized = p.escrowStatus === 'PENALIZED_CANCEL';
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center space-x-3 ${
                    p.joinedAt === 'เพิ่งเข้าร่วม' ? 'animate-popIn' : ''
                  } ${
                    isPenalized
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <img
                    src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nickname || p.fullName)}&background=e0e7ff&color=4338ca`}
                    alt={p.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{p.fullName}</div>
                    {p.nickname && (
                      <div className="text-slate-500 truncate">ชื่อเล่น: {p.nickname}</div>
                    )}
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-semibold text-emerald-600">
                        Trust {p.trustScore}%
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{p.attendanceRate}% เข้าร่วม</span>
                    </div>
                    {isPenalized ? (
                      <div className="text-[10px] font-bold text-rose-600 mt-1 bg-rose-100 px-1.5 py-0.5 rounded">
                        ⚠️ โดนหักค่าปรับ 10% (150 บ.)
                      </div>
                    ) : (
                      <div className="text-[10px] font-semibold text-indigo-600 mt-1">
                        🔒 ล็อกมัดจำ ฿{p.depositPaid.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ADDITIONAL COMMUNITY TRIPS */}
      <div className="pt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <span>ทริปชุมชนอื่นๆ ที่กำลังเปิดรับสมาชิก</span>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
            {allTrips.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-44">
                  <img
                    src={trip.imageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold backdrop-blur-sm">
                    {trip.joinedSlots} / {trip.totalSlots} คน
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                    มัดจำ ฿{trip.securityDepositPerPerson.toLocaleString()}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs text-slate-500 flex items-center space-x-1 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{trip.travelDates}</span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 line-clamp-1">{trip.title}</h4>
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    {trip.highlights.slice(0, 2).map((h, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <div className="text-xs text-slate-400">ค่าทริปต่อคน</div>
                  <div className="text-lg font-black font-mono text-slate-900">
                    ฿{trip.costPerPerson.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(trip)}
                  onAnimationEnd={stopShake}
                  className={`${shakingTripId === trip.id ? 'animate-shake' : ''} px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all`}
                >
                  เข้าร่วมทริป & ล็อกมัดจำ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA: start a new trip */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-fuchsia-300/20 blur-2xl pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/25">
              <ShieldCheck className="w-3.5 h-3.5" /> คุ้มครองด้วย Smart Escrow
            </div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-black leading-tight">เริ่มสร้างทริปใหม่ของคุณ</h3>
            <p className="mt-1.5 text-sm text-white/85 max-w-xl">
              ชวนเพื่อนไปเที่ยวโดยไม่ต้องกลัวโดนเท ทุกคนล็อกมัดจำไว้ในระบบ ใครเทโดนหักชดเชยให้เพื่อนในกลุ่ม
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: <PlusCircle className="w-4 h-4" />, title: '1. สร้างทริป', desc: 'ตั้งปลายทาง วันเดินทาง และงบต่อคน' },
                { icon: <Users className="w-4 h-4" />, title: '2. เพื่อนล็อกมัดจำ', desc: 'เงินพักไว้ใน Escrow จนกว่าจะออกเดินทาง' },
                { icon: <Award className="w-4 h-4" />, title: '3. เที่ยวจริง ได้เงินคืน', desc: 'มาตามนัดรับเงินคืนเต็ม พร้อมคะแนนความน่าเชื่อถือ' },
              ].map((step) => (
                <div key={step.title} className="rounded-2xl bg-white/10 border border-white/15 p-3 backdrop-blur-sm">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    {step.icon} {step.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/75 leading-snug">{step.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-white/70 mr-1">ไอเดียเริ่มต้น:</span>
              {[
                { title: 'เชียงใหม่ ทะเลหมอก 3 วัน 2 คืน', destination: 'เชียงใหม่' },
                { title: 'เกาะเสม็ด ชิลล์ริมทะเล', destination: 'เกาะเสม็ด จ.ระยอง' },
                { title: 'น่าน ดูดาว ปั่นจักรยานเมืองเก่า', destination: 'น่าน' },
              ].map((idea) => (
                <button
                  key={idea.title}
                  onClick={() => {
                    openCreate({ title: idea.title, destination: idea.destination, places: [] });
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 hover:bg-white/30 border border-white/20 transition-colors"
                >
                  {idea.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch lg:items-center gap-2">
            <button
              onClick={() => openCreate()}
              className="btn-shine px-7 h-14 rounded-2xl bg-white text-indigo-700 font-black text-base shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              สร้างทริปใหม่เลย
              <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-white/75 text-center">ค่าธรรมเนียมแพลตฟอร์ม 3.5% • สมาชิก Gold/Platinum ได้ส่วนลด</span>
          </div>
        </div>
      </div>

      {/* CREATE NEW TRIP: full-screen window */}
      <CreateTripWindow
        isOpen={showCreateModal}
        seed={tripSeed}
        host={memberProfile ?? userProfile}
        isMember={Boolean(memberProfile)}
        currentTier={currentTier}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
      />

    </div>
  );
};
