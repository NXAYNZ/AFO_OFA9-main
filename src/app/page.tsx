'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { Navbar, NavbarMember } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  ProfileFormData,
  signInWithGoogle,
  signOut,
  fetchProfile,
  createProfile,
  updateProfile,
  googleDefaults,
  buildNewProfile,
  loadDemoProfile,
  saveDemoProfile,
} from '@/lib/auth';
import { HeroBanner } from '@/components/HeroBanner';
import { HomeTab } from '@/components/HomeTab';
import { ThailandMapTab } from '@/components/ThailandMapTab';
import { AiPlannerTab } from '@/components/AiPlannerTab';
import { CommunityEscrowTab, JoinTripResult } from '@/components/CommunityEscrowTab';
import { TrustReviewTab } from '@/components/TrustReviewTab';
import { JudgeRevenueDashboardTab } from '@/components/JudgeRevenueDashboardTab';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { DisplaySettings, DEFAULT_SETTINGS, loadSettings, saveSettings, applySettings, resolveDark } from '@/lib/theme';
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

export default function HomePage() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<string>('home');

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

  // Display settings (theme, reduced motion); the <head> script already applied them before paint
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = loadSettings();
    setDisplaySettings(saved);
    setIsDark(resolveDark(saved.theme));
  }, []);
  const updateDisplaySettings = (next: DisplaySettings) => {
    setDisplaySettings(next);
    saveSettings(next);
    applySettings(next);
    setIsDark(resolveDark(next.theme));
  };
  // "ตามระบบ" follows the OS switching between light and dark
  useEffect(() => {
    if (displaySettings.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applySettings(displaySettings);
      setIsDark(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [displaySettings]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Hamburger: collapse/expand on desktop, open drawer on smaller screens
  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setIsMobileSidebarOpen(true);
    }
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

  // Auth & Member Profile State
  const supabaseReady = isSupabaseConfigured();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<UserProfile | null>(null);
  const [isDemoMember, setIsDemoMember] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    email: string;
    initialData: ProfileFormData;
    // Set when the member was sent here because joining a trip needs a profile
    requiredForJoin?: boolean;
  }>({ isOpen: false, mode: 'create', email: '', initialData: { fullName: '', nickname: '', avatarUrl: '', bio: '', homeProvince: '', travelStyles: [] } });
  const loadedProfileForUser = useRef<string | null>(null);

  const DEMO_EMAIL = 'demo.member@tripsure.ai';

  const profileToForm = (p: UserProfile): ProfileFormData => ({
    fullName: p.fullName,
    nickname: p.nickname || '',
    avatarUrl: p.avatarUrl,
    bio: p.bio || '',
    homeProvince: p.homeProvince || '',
    travelStyles: p.travelStyles || [],
  });

  // Restore session: Supabase (Google) or the browser-only demo profile
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const demo = loadDemoProfile();
      if (demo) {
        setMemberProfile(demo);
        setIsDemoMember(true);
      }
      return;
    }
    supabase.auth.getSession().then(({ data }) => setAuthUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load the member profile after Google sign-in; first-time members are asked to create one
  useEffect(() => {
    if (!authUser) {
      loadedProfileForUser.current = null;
      return;
    }
    if (loadedProfileForUser.current === authUser.id) return;
    loadedProfileForUser.current = authUser.id;
    fetchProfile(authUser).then((profile) => {
      setMemberProfile(profile);
      if (!profile) {
        setProfileModal({ isOpen: true, mode: 'create', email: authUser.email || '', initialData: googleDefaults(authUser) });
      }
    });
  }, [authUser]);

  // Signed-in members act as themselves across the app (joining trips etc.)
  useEffect(() => {
    setCurrentUser(memberProfile ?? INITIAL_USER);
  }, [memberProfile]);

  const handleDemoSignIn = () => {
    setIsAuthModalOpen(false);
    setProfileModal({
      isOpen: true,
      mode: 'create',
      email: DEMO_EMAIL,
      initialData: { fullName: '', nickname: '', avatarUrl: '', bio: '', homeProvince: '', travelStyles: [] },
    });
  };

  const handleOpenProfile = () => {
    if (memberProfile) {
      setProfileModal({ isOpen: true, mode: 'edit', email: memberProfile.email, initialData: profileToForm(memberProfile) });
    } else if (authUser) {
      setProfileModal({ isOpen: true, mode: 'create', email: authUser.email || '', initialData: googleDefaults(authUser) });
    }
  };

  const handleSaveProfile = async (form: ProfileFormData): Promise<string | null> => {
    if (authUser) {
      const result = memberProfile ? await updateProfile(authUser, form) : await createProfile(authUser, form);
      if (result.error || !result.profile) return result.error || 'บันทึกไม่สำเร็จ';
      setMemberProfile(result.profile);
    } else {
      const profile = memberProfile
        ? { ...memberProfile, ...form }
        : buildNewProfile(`usr_demo_${Date.now()}`, DEMO_EMAIL, form);
      saveDemoProfile(profile);
      setMemberProfile(profile);
      setIsDemoMember(true);
    }
    setProfileModal((prev) => ({ ...prev, isOpen: false }));
    return null;
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthUser(null);
    setMemberProfile(null);
    setIsDemoMember(false);
  };

  const navbarMember: NavbarMember | null = authUser
    ? {
        displayName:
          memberProfile?.nickname || memberProfile?.fullName || googleDefaults(authUser).fullName,
        email: authUser.email || '',
        avatarUrl: memberProfile?.avatarUrl || googleDefaults(authUser).avatarUrl,
        hasProfile: !!memberProfile,
        isDemo: false,
      }
    : isDemoMember && memberProfile
    ? {
        displayName: memberProfile.nickname || memberProfile.fullName,
        email: memberProfile.email,
        avatarUrl: memberProfile.avatarUrl,
        hasProfile: true,
        isDemo: true,
      }
    : null;

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
      if (authUser) {
        setProfileModal({
          isOpen: true,
          mode: 'create',
          email: authUser.email || '',
          initialData: googleDefaults(authUser),
          requiredForJoin: true,
        });
      } else {
        setIsAuthModalOpen(true);
      }
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
          warningNote: '⚠️ เคยเททริปกระทันหัน (ถูกหักเงินมัดจำ 10% ตามสัญญา Escrow)',
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
              '⚠️ เคยยกเลิกกระทันหัน 1 ครั้ง (โดนหัก 10%)',
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
      highlights: newTripData.highlights || ['🛡️ มีสัญญา Smart Escrow ค้ำประกันมัดจำ'],
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
    <div className="min-h-screen flex text-slate-900">

      {/* Left navigation rail */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentTier={currentTier}
        totalRevenue={revenueMetrics.totalRevenue}
      />

      <div className="flex-1 min-w-0 flex flex-col">

      {/* Work bar */}
      <Navbar
        currentTier={currentTier}
        aiQuotaUsed={aiQuotaUsed}
        onTierChange={handleTierChange}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        setActiveTab={setActiveTab}
        onToggleSidebar={handleToggleSidebar}
        member={navbarMember}
        onSignIn={() => setIsAuthModalOpen(true)}
        onEditProfile={handleOpenProfile}
        onSignOut={handleSignOut}
        isDark={isDark}
        onToggleTheme={() => updateDisplaySettings({ ...displaySettings, theme: isDark ? 'light' : 'dark' })}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-20">

        {/* Opening spread (home page only) */}
        {activeTab === 'home' && (
          <HeroBanner
            currentTier={currentTier}
            onExploreAiPlanner={() => setActiveTab('ai-planner')}
            onExploreEscrow={() => setActiveTab('community')}
          />
        )}

        {/* Tab Content Display */}
        <div className={activeTab === 'home' ? 'mt-10' : ''}>
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
              onSignIn={() => setIsAuthModalOpen(true)}
              onOpenProfile={handleOpenProfile}
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

      </div>

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

      {/* Google Sign-in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isSupabaseReady={supabaseReady}
        onGoogleSignIn={signInWithGoogle}
        onDemoSignIn={handleDemoSignIn}
      />

      {/* Create / Edit Member Profile */}
      <ProfileModal
        isOpen={profileModal.isOpen}
        mode={profileModal.mode}
        email={profileModal.email}
        initialData={profileModal.initialData}
        requiredForJoin={profileModal.requiredForJoin}
        profile={memberProfile}
        onClose={() => setProfileModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveProfile}
      />

    </div>
  );
}
