'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Crown, Gem, Settings } from 'lucide-react';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { useMember } from '@/lib/useMember';
import { RevealObserver } from '@/components/motion';
import { HeroBanner } from '@/components/HeroBanner';
import { HomeTab } from '@/components/HomeTab';
import { ThailandMapTab } from '@/components/ThailandMapTab';
import { AiPlannerTab } from '@/components/AiPlannerTab';
import { CommunityEscrowTab, JoinTripResult } from '@/components/CommunityEscrowTab';
import { TrustReviewTab } from '@/components/TrustReviewTab';
import { JudgeRevenueDashboardTab } from '@/components/JudgeRevenueDashboardTab';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { DisplaySettings, DEFAULT_SETTINGS, loadSettings, saveSettings, applySettings } from '@/lib/theme';
import {
  SubscriptionTier,
  UserProfile,
  CommunityTrip,
  UserReview,
  EscrowTransaction,
  RevenueMetrics,
  TripParticipant,
  OtaComparison,
  PlannerPreset,
  PlannerPresetOptions,
  TIER_CONFIGS,
  quotaLabel,
} from '@/lib/types';
import {
  INITIAL_USER,
  MOCK_USERS,
  HERO_COMMUNITY_TRIP,
  ADDITIONAL_COMMUNITY_TRIPS,
  MOCK_REVIEWS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVENUE_METRICS,
} from '@/lib/mockData';

const APP_TABS = [
  { id: 'home', label: 'ภาพรวม' },
  { id: 'thailand-map', label: 'แผนที่เที่ยวไทย' },
  { id: 'ai-planner', label: 'AI Planner & OTA' },
  { id: 'community', label: 'Community Trip' },
  { id: 'trust-review', label: 'รีวิว & ผู้ร่วมทริป' },
  { id: 'judge-dashboard', label: 'Judge Revenue' },
];

export default function WorkspacePage() {
  return (
    <Suspense>
      <Workspace />
    </Suspense>
  );
}

function Workspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The tab lives in the URL (?tab=...) so links from the landing page open the right section
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState<string>(APP_TABS.some((t) => t.id === initialTab) ? (initialTab as string) : 'home');
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    router.replace(tab === 'home' ? '/workspace' : `/workspace?tab=${tab}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hand-offs from the Thailand map into the AI planner / community trip form
  const [aiPlannerPreset, setAiPlannerPreset] = useState<PlannerPreset | null>(null);
  const [communityDraft, setCommunityDraft] = useState<{ title: string; destination: string; places: string[]; nonce: number } | null>(null);

  const handlePlanFromMap = (
    province: string,
    places: string[],
    totalBudget?: number,
    travelersCount?: number,
    options?: PlannerPresetOptions
  ) => {
    setAiPlannerPreset({ province, mustVisit: places, totalBudget, travelersCount, ...options, nonce: Date.now() });
    setActiveTab('ai-planner');
  };

  const handleCreateTripFromMap = (title: string, destination: string, places: string[]) => {
    setCommunityDraft({ title, destination, places, nonce: Date.now() });
    setActiveTab('community');
  };
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // Display settings (reduced motion); the <head> script already applied it before paint
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setDisplaySettings(loadSettings());
  }, []);
  const updateDisplaySettings = (next: DisplaySettings) => {
    setDisplaySettings(next);
    saveSettings(next);
    applySettings(next);
  };

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('FREE');
  const [aiQuotaUsed, setAiQuotaUsed] = useState<number>(0);

  // Data States
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);
  const [heroTrip, setHeroTrip] = useState<CommunityTrip>(HERO_COMMUNITY_TRIP);
  const [allCommunityTrips, setAllCommunityTrips] = useState<CommunityTrip[]>(ADDITIONAL_COMMUNITY_TRIPS);
  const [reviewsList, setReviewsList] = useState<UserReview[]>(MOCK_REVIEWS);
  const [transactionsList, setTransactionsList] = useState<EscrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>(INITIAL_REVENUE_METRICS);

  // Sign-in is shared with the landing page
  const account = useMember();
  const { authUser, memberProfile } = account;

  // Signed-in members act as themselves across the app (joining trips etc.)
  useEffect(() => {
    setCurrentUser(memberProfile ?? INITIAL_USER);
  }, [memberProfile]);

  // Load / Sync state from localStorage for persistent demo session
  useEffect(() => {
    try {
      const savedTier = localStorage.getItem('tripsure_tier') as SubscriptionTier;
      if (savedTier && savedTier in TIER_CONFIGS) {
        setCurrentTier(savedTier);
      }
      const savedQuota = localStorage.getItem('tripsure_quota');
      if (savedQuota) {
        setAiQuotaUsed(parseInt(savedQuota) || 0);
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleTierChange = (newTier: SubscriptionTier) => {
    setCurrentTier(newTier);
    try {
      localStorage.setItem('tripsure_tier', newTier);
    } catch (e) {}

    // Record subscription revenue transaction if upgrading from FREE
    const tierConfig = TIER_CONFIGS[newTier];
    if (tierConfig.priceMonthly > 0) {
      const upgradeTx: EscrowTransaction = {
        id: `tx_sub_${Date.now()}`,
        userName: currentUser.fullName,
        type: 'SUBSCRIPTION_UPGRADE',
        amount: tierConfig.priceMonthly,
        platformRevenue: tierConfig.priceMonthly,
        description: `อัปเกรดสมาชิกเป็น ${tierConfig.labelThai} (โควตา AI ${quotaLabel(newTier)})`,
        timestamp: 'เพิ่งเกิดขึ้น',
      };

      setTransactionsList((prev) => [upgradeTx, ...prev]);
      setRevenueMetrics((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + tierConfig.priceMonthly,
        subscriptionRevenue: prev.subscriptionRevenue + tierConfig.priceMonthly,
        activeTransactionsCount: prev.activeTransactionsCount + 1,
      }));
    }
  };

  const handleQuotaIncrement = () => {
    // Platinum is unlimited: nothing to count down
    if (TIER_CONFIGS[currentTier].unlimitedQuota) return;
    const nextQuota = aiQuotaUsed + 1;
    setAiQuotaUsed(nextQuota);
    try {
      localStorage.setItem('tripsure_quota', nextQuota.toString());
    } catch (e) {}
  };

  // 1. Join Trip & Hold Deposit in Escrow (members must create a profile first)
  const handleJoinTrip = (trip: CommunityTrip): JoinTripResult => {
    if (!memberProfile) {
      account.requireProfile();
      return 'NEEDS_PROFILE';
    }
    if (trip.participants.some((p) => p.userId === memberProfile.id)) return 'ALREADY_JOINED';
    if (trip.joinedSlots >= trip.totalSlots) return 'FULL';

    const newParticipant: TripParticipant = {
      id: `p_${Date.now()}`,
      userId: memberProfile.id,
      fullName: memberProfile.fullName,
      nickname: memberProfile.nickname || undefined,
      avatarUrl: memberProfile.avatarUrl,
      depositPaid: trip.securityDepositPerPerson,
      escrowStatus: 'HELD',
      trustScore: memberProfile.trustScore,
      attendanceRate: memberProfile.attendanceRate,
      joinedAt: 'เพิ่งเข้าร่วม',
    };

    const addParticipant = (t: CommunityTrip): CommunityTrip => ({
      ...t,
      joinedSlots: t.joinedSlots + 1,
      tripPoolBalance: t.tripPoolBalance + t.securityDepositPerPerson,
      participants: [...t.participants, newParticipant],
    });

    if (trip.id === heroTrip.id) {
      setHeroTrip(addParticipant);
    } else {
      setAllCommunityTrips((prev) => prev.map((t) => (t.id === trip.id ? addParticipant(t) : t)));
    }

    const depositTx: EscrowTransaction = {
      id: `tx_dep_${Date.now()}`,
      tripId: trip.id,
      userName: memberProfile.nickname ? `${memberProfile.fullName} (${memberProfile.nickname})` : memberProfile.fullName,
      type: 'DEPOSIT_ESCROW',
      amount: trip.securityDepositPerPerson,
      platformRevenue: 0,
      description: `วางเงินค้ำประกัน Escrow ฿${trip.securityDepositPerPerson.toLocaleString()} ทริป "${trip.title}"`,
      timestamp: 'เพิ่งเกิดขึ้น',
    };

    setTransactionsList((prev) => [depositTx, ...prev]);
    return 'JOINED';
  };

  // 2. Simulate Member Cancellation (10% Penalty Tax Split)
  const handleSimulateFlake = (trip: CommunityTrip, participant: TripParticipant) => {
    const deposit = participant.depositPaid;
    const totalPenalty = Math.round(deposit * 0.10); // 150 THB
    const platformShare = Math.round(totalPenalty * 0.50); // 75 THB (5%)
    const poolSubsidies = Math.round(totalPenalty * 0.50); // 75 THB (5%)
    const remainingCount = Math.max(1, trip.joinedSlots - 1);
    const subsidyPerMember = Math.round(poolSubsidies / remainingCount);

    // Update participant status & warning tags
    const updatedParticipants = trip.participants.map((p) => {
      if (p.id === participant.id) {
        return {
          ...p,
          escrowStatus: 'PENALIZED_CANCEL' as const,
          attendanceRate: Math.max(0, p.attendanceRate - 15),
          trustScore: Math.max(0, p.trustScore - 12),
          warningNote: 'เคยเททริปกระทันหัน (ถูกหักเงินมัดจำ 10% ตามสัญญา Escrow)',
        };
      }
      return p;
    });

    // Update flaker profile in directory
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === participant.userId || u.fullName.includes(participant.fullName.split(' ')[0])) {
          return {
            ...u,
            trustScore: Math.max(0, u.trustScore - 12),
            attendanceRate: Math.max(0, u.attendanceRate - 15),
            tripsCancelled: u.tripsCancelled + 1,
            warningTags: [
              'เคยยกเลิกกระทันหัน 1 ครั้ง (โดนหัก 10%)',
              ...u.warningTags.filter((t) => !t.includes('เคยยกเลิก')),
            ],
          };
        }
        return u;
      })
    );

    // Update Hero Trip Pool & Participants
    setHeroTrip({
      ...heroTrip,
      participants: updatedParticipants,
      tripPoolBalance: heroTrip.tripPoolBalance + poolSubsidies, // pool gets 75 THB extra compensation
    });

    // Create 2 Transactions: 5% Platform Revenue + 5% Member Subsidies
    const platTx: EscrowTransaction = {
      id: `tx_pen_plat_${Date.now()}`,
      tripId: trip.id,
      userName: participant.fullName,
      type: 'PENALTY_PLATFORM_5',
      amount: totalPenalty,
      platformRevenue: platformShare,
      description: `ภาษีค่าปรับเททริป 5% (฿${platformShare}) เข้าแพลตฟอร์มจาก ${participant.fullName}`,
      timestamp: 'เพิ่งเกิดขึ้น',
    };

    const poolTx: EscrowTransaction = {
      id: `tx_pen_pool_${Date.now()}`,
      tripId: trip.id,
      userName: participant.fullName,
      type: 'PENALTY_POOL_5',
      amount: poolSubsidies,
      platformRevenue: 0,
      poolAddition: poolSubsidies,
      description: `เงินชดเชยกองกลาง 5% (฿${poolSubsidies}) กระจายให้สมาชิกที่เหลือ ${remainingCount} คน (~฿${subsidyPerMember}/คน)`,
      timestamp: 'เพิ่งเกิดขึ้น',
    };

    setTransactionsList((prev) => [platTx, poolTx, ...prev]);

    // Update Revenue metrics
    setRevenueMetrics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + platformShare,
      penaltyTaxRevenue: prev.penaltyTaxRevenue + platformShare,
      escrowPoolSubsidiesGiven: prev.escrowPoolSubsidiesGiven + poolSubsidies,
      activeTransactionsCount: prev.activeTransactionsCount + 2,
    }));
  };

  // 3. Create New Community Trip (3.5% Platform Creation Fee)
  const handleCreateNewTrip = (newTripData: Partial<CommunityTrip>) => {
    const totalTarget = (newTripData.totalSlots || 6) * (newTripData.costPerPerson || 2500);
    const tierConfig = TIER_CONFIGS[currentTier];
    const baseFee = totalTarget * 0.035;
    const discount = tierConfig.creationFeeDiscountPercent / 100;
    const finalFee = Math.round(baseFee * (1 - discount));

    const completeTrip: CommunityTrip = {
      id: `trip_${Date.now()}`,
      hostId: currentUser.id,
      host: currentUser,
      title: newTripData.title || 'ทริปพาเที่ยวพักผ่อน',
      destination: newTripData.destination || 'เกาะล้าน ชลบุรี',
      travelDates: newTripData.travelDates || '28 - 29 พ.ย. 2026',
      totalSlots: newTripData.totalSlots || 6,
      joinedSlots: 1,
      costPerPerson: newTripData.costPerPerson || 2500,
      securityDepositPerPerson: newTripData.securityDepositPerPerson || 1000,
      status: 'OPEN',
      platformCreationFeeRate: 0.035,
      cancellationPenaltyRate: 0.10,
      tripPoolBalance: newTripData.securityDepositPerPerson || 1000,
      highlights: newTripData.highlights || ['มีสัญญา Smart Escrow ค้ำประกันมัดจำ'],
      gallery: newTripData.gallery,
      description: newTripData.description,
      imageUrl: newTripData.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      participants: [
        {
          id: `p_host_${Date.now()}`,
          userId: currentUser.id,
          fullName: `${currentUser.fullName} (Host)`,
          avatarUrl: currentUser.avatarUrl,
          depositPaid: newTripData.securityDepositPerPerson || 1000,
          escrowStatus: 'HELD',
          trustScore: currentUser.trustScore,
          attendanceRate: currentUser.attendanceRate,
          joinedAt: 'วันนี้',
        },
      ],
    };

    setAllCommunityTrips((prev) => [completeTrip, ...prev]);

    if (finalFee > 0) {
      const creationTx: EscrowTransaction = {
        id: `tx_create_${Date.now()}`,
        tripId: completeTrip.id,
        userName: currentUser.fullName,
        type: 'CREATION_FEE_3_5',
        amount: totalTarget,
        platformRevenue: finalFee,
        description: `ค่าธรรมเนียมคุ้มครองแพลตฟอร์ม 3.5% ทริป "${completeTrip.destination}" (ส่วนลดระดับ ${currentTier} ${tierConfig.creationFeeDiscountPercent}%)`,
        timestamp: 'เพิ่งเกิดขึ้น',
      };

      setTransactionsList((prev) => [creationTx, ...prev]);
      setRevenueMetrics((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + finalFee,
        creationFeeRevenue: prev.creationFeeRevenue + finalFee,
        activeTransactionsCount: prev.activeTransactionsCount + 1,
      }));
    }
  };

  // 4. Record OTA Affiliate Click (4% Commission)
  const handleRecordAffiliateClick = (ota: OtaComparison) => {
    const commission = Math.round(ota.discountedPrice * (ota.affiliateCommissionRate || 0.04));

    const affTx: EscrowTransaction = {
      id: `tx_aff_${Date.now()}`,
      userName: currentUser.fullName,
      type: 'AFFILIATE_COMMISSION',
      amount: ota.discountedPrice,
      platformRevenue: commission,
      description: `รับคอมมิชชั่น Affiliate 4% (${ota.provider}) จากการจอง "${ota.name}"`,
      timestamp: 'เพิ่งเกิดขึ้น',
    };

    setTransactionsList((prev) => [affTx, ...prev]);
    setRevenueMetrics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + commission,
      affiliateRevenue: prev.affiliateRevenue + commission,
      activeTransactionsCount: prev.activeTransactionsCount + 1,
    }));
  };

  // 5. Add User Review
  const handleAddReview = (newReview: UserReview) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-[var(--background)]">
      <div className="app-enter-header sticky top-0 z-50">
      <SiteHeader
        links={[{ id: 'landing', label: 'หน้าแรก' }, ...APP_TABS]}
        activeId={activeTab}
        onLink={(id) => (id === 'landing' ? router.push('/') : setActiveTab(id))}
        member={account.member}
        onSignIn={account.openSignIn}
        onEditProfile={account.openProfile}
        onSignOut={account.signOut}
      />

      </div>

      {/* App toolbar: demo tier switch, AI quota, settings */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0" role="group" aria-label="สลับแพ็กเกจ (โหมดสาธิต)">
            <span className="text-xs text-slate-500">แพ็กเกจ (Demo)</span>
            <div className="flex rounded-full bg-slate-100 p-1">
              {(['FREE', 'GOLD', 'PLATINUM'] as SubscriptionTier[]).map((tierKey) => {
                const on = currentTier === tierKey;
                const Icon = tierKey === 'GOLD' ? Crown : tierKey === 'PLATINUM' ? Gem : null;
                const activeStyle =
                  tierKey === 'GOLD' ? 'bg-amber-400 text-amber-950' : tierKey === 'PLATINUM' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm';
                return (
                  <button
                    key={tierKey}
                    onClick={() => handleTierChange(tierKey)}
                    aria-pressed={on}
                    className={`h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors ${on ? activeStyle : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {tierKey}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="text-sm text-slate-600 whitespace-nowrap">
              โควตา AI{' '}
              <span className="font-semibold text-slate-900 tabular">
                {TIER_CONFIGS[currentTier].unlimitedQuota ? 'ไม่จำกัด' : `${Math.max(0, TIER_CONFIGS[currentTier].maxQuotas - aiQuotaUsed)}/${TIER_CONFIGS[currentTier].maxQuotas}`}
              </span>
            </span>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Crown className="w-4 h-4" /> อัปเกรด
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors"
              aria-label="ตั้งค่า"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <main className="app-enter flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-20">

        {/* Opening spread (home page only) */}
        {activeTab === 'home' && (
          <HeroBanner
            currentTier={currentTier}
            onExploreAiPlanner={() => setActiveTab('ai-planner')}
            onExploreEscrow={() => setActiveTab('community')}
          />
        )}

        {/* Tab Content Display */}
        <div key={activeTab} className={`tab-in ${activeTab === 'home' ? 'mt-10' : ''}`}>
          {activeTab === 'home' && (
            <HomeTab
              memberProfile={memberProfile}
              isSignedIn={!!authUser}
              heroTrip={heroTrip}
              allTrips={allCommunityTrips}
              currentTier={currentTier}
              aiQuotaUsed={aiQuotaUsed}
              onNavigate={setActiveTab}
              onPlanTrip={handlePlanFromMap}
              onSignIn={account.openSignIn}
              onOpenProfile={account.openProfile}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            />
          )}

          {activeTab === 'ai-planner' && (
            <AiPlannerTab
              currentTier={currentTier}
              aiQuotaUsed={aiQuotaUsed}
              onQuotaIncrement={handleQuotaIncrement}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onRecordAffiliateClick={handleRecordAffiliateClick}
              preset={aiPlannerPreset}
              onPresetUsed={() => setAiPlannerPreset(null)}
            />
          )}

          {activeTab === 'thailand-map' && (
            <ThailandMapTab
              onPlanWithAi={handlePlanFromMap}
              onCreateCommunityTrip={handleCreateTripFromMap}
              reviewer={
                memberProfile
                  ? {
                      name: memberProfile.nickname || memberProfile.fullName,
                      avatarUrl: memberProfile.avatarUrl,
                      authUserId: authUser?.id,
                    }
                  : null
              }
            />
          )}

          {activeTab === 'community' && (
            <CommunityEscrowTab
              currentTier={currentTier}
              heroTrip={heroTrip}
              onJoinTrip={handleJoinTrip}
              onSimulateFlake={handleSimulateFlake}
              onCreateNewTrip={handleCreateNewTrip}
              allTrips={allCommunityTrips}
              userProfile={currentUser}
              memberProfile={memberProfile}
              draft={communityDraft}
              onDraftUsed={() => setCommunityDraft(null)}
            />
          )}

          {activeTab === 'trust-review' && (
            <TrustReviewTab
              users={usersList}
              reviews={reviewsList}
              onAddReview={handleAddReview}
            />
          )}

          {activeTab === 'judge-dashboard' && (
            <JudgeRevenueDashboardTab
              revenueMetrics={revenueMetrics}
              transactions={transactionsList}
              onSimulateSubscriptionUpgrade={() => handleTierChange('PLATINUM')}
              onSimulateAffiliateClick={() =>
                handleRecordAffiliateClick({
                  id: 'ota_test',
                  provider: 'Agoda',
                  category: 'HOTEL',
                  name: 'Sai Kaew Beach Resort Villa',
                  rating: 4.8,
                  originalPrice: 4500,
                  discountedPrice: 3650,
                  seasonTrend: 'ถูกกว่า High Season 19%',
                  savingsPercentage: 19,
                  isCheapest: true,
                  affiliateCommissionRate: 0.04,
                  bookingUrl: '#',
                  badges: ['Agoda ดีลพิเศษ'],
                })
              }
              onSimulateCreationFee={() =>
                handleCreateNewTrip({
                  title: 'ทริปเหมาเรือดำน้ำเกาะเต่า 4 วัน 3 คืน',
                  destination: 'เกาะเต่า สุราษฎร์ธานี',
                  totalSlots: 8,
                  costPerPerson: 3500,
                })
              }
              onSimulateCancellationPenalty={() =>
                handleSimulateFlake(heroTrip, heroTrip.participants[2] || heroTrip.participants[0])
              }
            />
          )}
        </div>

      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-xs text-slate-500">
          <div>
            <div className="font-display text-base font-semibold text-slate-900">TripSure · ทริปชัวร์</div>
            <p className="mt-1 max-w-md leading-relaxed">
              วางแผนเที่ยวด้วย AI เทียบราคาที่พัก และล็อกเงินมัดจำกับระบบ Smart Escrow เพื่อให้ทุกคนในทริปมาจริง
            </p>
          </div>
          <div className="md:text-right leading-relaxed">
            <p>Hackathon project &ldquo;Make Me Money&rdquo; · Next.js, Gemini 2.5 Flash, Supabase, TMD / Open-Meteo</p>
            <p className="mt-1 text-slate-400">ทำงานได้ทั้งโหมดข้อมูลจำลองและโหมดเชื่อมต่อ API จริง</p>
          </div>
        </div>
      </footer>

      {/* Subscription Paywall Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={displaySettings}
        onChange={updateDisplaySettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={currentTier}
        onSelectTier={handleTierChange}
      />

      {account.dialogs}
      <RevealObserver />

    </div>
  );
}
