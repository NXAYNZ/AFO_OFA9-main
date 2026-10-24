'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Info,
  Coins,
  Lock,
} from 'lucide-react';
import {
  CommunityTrip,
  UserProfile,
  TripParticipant,
  SubscriptionTier,
} from '@/lib/types';
import { CreateTripWindow, TripSeed } from '@/components/CreateTripWindow';
import { TripTicket, ticketNumber } from '@/components/TripTicket';
import { stripEmoji } from '@/lib/text';

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
        `เข้าร่วมทริป "${trip.title}" แล้ว ระบบล็อกเงินมัดจำ ฿${trip.securityDepositPerPerson.toLocaleString()} ไว้ใน Smart Escrow เรียบร้อย`
      );
      setTimeout(() => setJoinSuccessMsg(null), 6000);
      return;
    }
    const blockedMessages: Record<Exclude<JoinTripResult, 'JOINED'>, string> = {
      NEEDS_PROFILE: 'ต้องสร้างโปรไฟล์สมาชิกบนเว็บก่อน (ชื่อ-นามสกุล และชื่อเล่น) จึงจะเข้าร่วมทริปและวางเงินมัดจำได้',
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
    setFlakeSuccessMsg(
      `จำลองแล้ว: "${flakyParticipant.fullName}" ยกเลิกทริปกะทันหัน ระบบหักค่าปรับ 10% (150 บาท) แบ่ง 75 บาทเข้าแพลตฟอร์ม และ 75 บาทชดเชยให้เพื่อนที่เหลือในกลุ่ม`
    );
    setTimeout(() => setFlakeSuccessMsg(null), 8000);
  };

  const handleCreateTrip = (trip: Partial<CommunityTrip>, finalFee: number) => {
    onCreateNewTrip(trip);
    setShowCreateModal(false);
    setJoinSuccessMsg(`เปิดทริป "${trip.title}" แล้ว บันทึกค่าธรรมเนียมคุ้มครอง ฿${finalFee.toLocaleString()} เข้าระบบ`);
    setTimeout(() => setJoinSuccessMsg(null), 5000);
  };

  const fillPercent = Math.round((heroTrip.joinedSlots / heroTrip.totalSlots) * 100);
  const creationFee = Math.round(heroTrip.totalSlots * heroTrip.costPerPerson * 0.035);
  const penalty = Math.round(heroTrip.securityDepositPerPerson * 0.1);
  const heroFull = heroTrip.joinedSlots >= heroTrip.totalSlots;

  return (
    <div className="space-y-12">

      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">Community Escrow</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 leading-relaxed">
            ทริปกลุ่มที่ทุกคนล็อกเงินมัดจำไว้ใน Smart Escrow ใครเททริปถูกหัก 10% โดย 5% เข้าแพลตฟอร์ม และอีก 5% ชดเชยให้เพื่อนในกลุ่ม
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="self-start sm:self-auto h-11 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          สร้างทริปใหม่
        </button>
      </header>

      {/* Feedback */}
      {(joinSuccessMsg || joinBlockedMsg || flakeSuccessMsg || !memberProfile) && (
        <div className="space-y-2" aria-live="polite">
          {joinSuccessMsg && (
            <div className="px-4 py-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{joinSuccessMsg}</span>
            </div>
          )}
          {joinBlockedMsg && (
            <div className="px-4 py-3 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-start gap-3 animate-fadeIn">
              <Info className="w-5 h-5 text-sky-600 shrink-0" />
              <span>{joinBlockedMsg}</span>
            </div>
          )}
          {flakeSuccessMsg && (
            <div className="px-4 py-3 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{flakeSuccessMsg}</span>
            </div>
          )}
          {!memberProfile && !joinBlockedMsg && (
            <div className="px-4 py-3 rounded-md border border-slate-200 text-slate-600 text-sm flex items-start gap-3">
              <Info className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              <span>เข้าสู่ระบบด้วย Google และสร้างโปรไฟล์ก่อนจึงจะเข้าร่วมทริปได้ ชื่อและชื่อเล่นของคุณจะแสดงในรายชื่อสมาชิกที่วางเงินค้ำประกัน</span>
            </div>
          )}
        </div>
      )}

      {/* Featured trip: a boarding pass with the money on the stub */}
      <article className="ticket overflow-hidden shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">

          {/* Photo */}
          <div className="relative min-h-[300px] lg:min-h-[460px] rounded-t-[9px] lg:rounded-tr-none lg:rounded-l-[9px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroTrip.imageUrl} alt={heroTrip.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded bg-ink-950/70 px-2 py-1 text-xs font-medium text-white">
              <MapPin className="w-3.5 h-3.5" />
              {heroTrip.destination}
            </span>
            {heroTrip.imageCredit && (
              <span className="absolute top-4 right-4 max-w-[60%] truncate rounded bg-ink-950/55 px-1.5 py-0.5 text-[10px] text-white/85">
                {heroTrip.imageCredit}
              </span>
            )}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
              <div className="flex items-center gap-1.5 text-xs text-white/75">
                <Calendar className="w-3.5 h-3.5" />
                {heroTrip.travelDates}
              </div>
              <h3 className="mt-1.5 font-display text-2xl sm:text-[1.7rem] font-semibold leading-snug">{heroTrip.title}</h3>
              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroTrip.host.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30" />
                <div className="text-xs leading-relaxed">
                  <div className="font-semibold">
                    {heroTrip.host.fullName}
                    <span className="ml-2 rounded-sm bg-saffron-400 px-1 py-px text-[10px] font-bold tracking-wide text-ink-950">SUPER HOST</span>
                  </div>
                  <div className="text-white/75">Trust Score {heroTrip.host.trustScore}% · ไม่เคยเท 24 ทริป</div>
                </div>
              </div>
            </div>
          </div>

          {/* Body: itinerary facts */}
          <div className="p-6 sm:p-7 flex flex-col">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <dt className="text-xs text-slate-500">ค่าใช้จ่ายต่อคน</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-slate-900">฿{heroTrip.costPerPerson.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">สมาชิกในกลุ่ม</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-slate-900">
                  {heroTrip.joinedSlots}<span className="text-slate-400">/{heroTrip.totalSlots}</span>
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>ที่นั่งที่จองแล้ว</span>
                <span className="font-mono">{fillPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${fillPercent}%` }} />
              </div>
            </div>

            <h4 className="mt-7 text-sm font-semibold text-slate-900">ไฮไลต์ของทริป</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {heroTrip.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{stripEmoji(h)}</span>
                </li>
              ))}
            </ul>

            {/* Fee receipt */}
            <div className="mt-auto pt-7">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Coins className="w-4 h-4 text-amber-600" />
                ค่าธรรมเนียมและค่าปรับ
              </h4>
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-600">ค่าเปิดทริป 3.5%</td>
                    <td className="py-2 text-right font-mono text-slate-900">฿{creationFee.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">ค่าปรับเททริป 10% ของมัดจำ</td>
                    <td className="py-2 text-right font-mono text-rose-600">฿{penalty.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-4 text-xs text-slate-500">เข้าแพลตฟอร์ม 5%</td>
                    <td className="py-1.5 text-right font-mono text-xs text-slate-500">฿{Math.round(penalty / 2).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pl-4 text-xs text-slate-500">ชดเชยเพื่อนในกลุ่ม 5%</td>
                    <td className="py-1.5 text-right font-mono text-xs text-slate-500">฿{Math.round(penalty / 2).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-slate-500">สมาชิก PLATINUM ไม่เสียค่าเปิดทริป</p>
            </div>
          </div>

          {/* Stub: the money and the action */}
          <div className="ticket-stub p-6 sm:p-7 flex flex-col bg-slate-50">
            <div className="flex items-baseline justify-between gap-2 pb-4 mb-4 border-b border-dashed border-slate-300">
              <span className="text-xs font-medium text-slate-600">ตั๋วมัดจำ</span>
              <span className="font-mono text-xs tracking-wider text-slate-500">{ticketNumber(heroTrip.id)}</span>
            </div>
            <div className="text-xs text-slate-500">เงินมัดจำ Escrow ต่อคน</div>
            <div className="mt-1 flex items-center gap-2 font-mono text-[2.1rem] leading-none font-semibold text-emerald-700">
              <ShieldCheck className="w-7 h-7" />฿{heroTrip.securityDepositPerPerson.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">คืนเต็มจำนวนเมื่อมาตามนัด</p>

            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-xs text-slate-500">กองกลางที่ล็อกไว้</div>
              <div className="mt-1 font-mono text-xl font-semibold text-slate-900">฿{heroTrip.tripPoolBalance.toLocaleString()}</div>
            </div>

            <div className="mt-auto pt-8 space-y-2.5">
              <button
                onClick={() => handleJoin(heroTrip)}
                onAnimationEnd={stopShake}
                disabled={heroFull}
                className={`${shakingTripId === heroTrip.id ? 'animate-shake' : ''} w-full h-12 px-4 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  heroFull ? 'border border-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <ShieldCheck className="w-[18px] h-[18px]" />
                {heroFull ? 'ทริปเต็มแล้ว' : `เข้าร่วม & วางมัดจำ ฿${heroTrip.securityDepositPerPerson.toLocaleString()}`}
              </button>
              <button
                onClick={handleFlakeClick}
                className="w-full h-10 px-4 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                จำลองการเททริป
              </button>
              <p className="text-center text-[11px] text-slate-500">ปุ่มจำลองสำหรับสาธิต หักค่าปรับ 10% จากสมาชิก 1 คน</p>
            </div>
          </div>
        </div>

        {/* Roster */}
        <div className="border-t border-slate-200 px-6 sm:px-7 py-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users className="w-4 h-4 text-slate-500" />
              สมาชิกที่วางเงินค้ำประกันแล้ว {heroTrip.participants.length} คน
            </h4>
            <span className="text-xs text-slate-500">เงินมัดจำทุกก้อนถูกล็อกไว้ใน Escrow จนถึงวันเดินทาง · รายชื่อเป็นข้อมูลตัวอย่างสำหรับสาธิต</span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 border-t border-slate-100">
            {heroTrip.participants.map((p) => {
              const isPenalized = p.escrowStatus === 'PENALIZED_CANCEL';
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 py-3 border-b border-slate-100 ${p.joinedAt === 'เพิ่งเข้าร่วม' ? 'animate-fadeIn' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nickname || p.fullName)}&background=dce4ef&color=2a4165`}
                    alt=""
                    className={`w-10 h-10 rounded-full object-cover shrink-0 ${isPenalized ? 'grayscale opacity-70' : ''}`}
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className={`font-medium truncate ${isPenalized ? 'text-slate-500 line-through decoration-rose-400' : 'text-slate-900'}`}>
                      {p.fullName}
                      {p.nickname && <span className="font-normal text-slate-500"> ({p.nickname})</span>}
                    </div>
                    <div className="text-xs text-slate-500">
                      Trust {p.trustScore}% · มาตามนัด {p.attendanceRate}%
                    </div>
                  </div>
                  {isPenalized ? (
                    <span className="shrink-0 text-xs font-semibold text-rose-600">หัก ฿{Math.round(p.depositPaid * 0.1)}</span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 font-mono text-xs text-emerald-700">
                      <Lock className="w-3 h-3" />฿{p.depositPaid.toLocaleString()}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </article>

      {/* Other open trips */}
      <section>
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          ทริปอื่นที่เปิดรับสมาชิก <span className="font-sans text-base font-normal text-slate-500">{allTrips.length} ทริป</span>
        </h3>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allTrips.map((trip) => (
            <TripTicket
              key={trip.id}
              trip={trip}
              action={
                <button
                  onClick={() => handleJoin(trip)}
                  onAnimationEnd={stopShake}
                  className={`${shakingTripId === trip.id ? 'animate-shake' : ''} w-full h-10 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-sm transition-colors`}
                >
                  เข้าร่วม & ล็อกมัดจำ
                </button>
              }
            />
          ))}
        </div>
      </section>

      {/* Start a new trip */}
      <section className="rounded-xl bg-ink-900 text-white p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 items-end">
          <div>
            <h3 className="font-display text-3xl font-semibold">เปิดทริปของคุณเอง</h3>
            <p className="mt-2 max-w-xl text-sm text-ink-200 leading-relaxed">
              ตั้งปลายทาง วันเดินทาง และงบต่อคน แล้วชวนเพื่อนล็อกมัดจำไว้ใน Escrow จนถึงวันเดินทาง
              ใครมาตามนัดได้เงินคืนเต็มพร้อมคะแนนความน่าเชื่อถือ ใครเทถูกหักชดเชยให้เพื่อนในกลุ่ม
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-300 mr-1">เริ่มจากไอเดีย</span>
              {[
                { title: 'เชียงใหม่ ทะเลหมอก 3 วัน 2 คืน', destination: 'เชียงใหม่' },
                { title: 'เกาะเสม็ด ชิลล์ริมทะเล', destination: 'เกาะเสม็ด จ.ระยอง' },
                { title: 'น่าน ดูดาว ปั่นจักรยานเมืองเก่า', destination: 'น่าน' },
              ].map((idea) => (
                <button
                  key={idea.title}
                  onClick={() => openCreate({ title: idea.title, destination: idea.destination, places: [] })}
                  className="h-8 px-3 rounded-md text-xs font-medium border border-white/20 hover:bg-white/10 hover:border-white/40 transition-colors"
                >
                  {idea.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={() => openCreate()}
              className="h-12 px-6 rounded-md bg-ink-50 hover:bg-ink-100 text-ink-900 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-lagoon-600" />
              สร้างทริปใหม่
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-ink-300 text-center">ค่าธรรมเนียม 3.5% · GOLD และ PLATINUM ได้ส่วนลด</span>
          </div>
        </div>
      </section>

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
