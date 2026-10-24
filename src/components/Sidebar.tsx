'use client';

import React, { useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Users,
  BarChart3,
  Hotel,
  CloudSun,
  PlusCircle,
  Map as MapIcon,
  Crown,
  Settings,
  BadgeCheck,
  X,
  ArrowRight,
  Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SubscriptionTier, TIER_CONFIGS } from '@/lib/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenUpgradeModal: () => void;
  onOpenSettings: () => void;
  currentTier: SubscriptionTier;
  totalRevenue: number;
}

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  tab?: string;
  // Only primary items show the active highlight (secondary items are shortcuts into the same tabs)
  primary?: boolean;
  action?: 'upgrade' | 'settings';
  badge?: 'new' | 'live' | 'revenue' | 'tier';
}

const SIDEBAR_GROUPS: { title: string; items: SidebarItem[] }[] = [
  {
    title: 'เมนูหลัก',
    items: [
      { label: 'หน้าหลัก', icon: Home, tab: 'home', primary: true },
      { label: 'แผนที่เที่ยวไทย', icon: MapIcon, tab: 'thailand-map', primary: true, badge: 'new' },
      { label: 'AI Planner & OTA', icon: Sparkles, tab: 'ai-planner', primary: true },
      { label: 'Community Escrow', icon: ShieldCheck, tab: 'community', primary: true, badge: 'live' },
      { label: 'รีวิว & ผู้ร่วมทริป', icon: Users, tab: 'trust-review', primary: true },
      { label: 'Judge Revenue', icon: BarChart3, tab: 'judge-dashboard', primary: true, badge: 'revenue' },
    ],
  },
  {
    title: 'เครื่องมือวางแผน',
    items: [
      { label: 'เทียบราคาโรงแรม', icon: Hotel, tab: 'ai-planner' },
      { label: 'พยากรณ์อากาศ', icon: CloudSun, tab: 'ai-planner' },
      { label: 'สร้างทริปหารค่าใช้จ่าย', icon: PlusCircle, tab: 'community', badge: 'new' },
      { label: 'ทริปชุมชนแนะนำ', icon: MapIcon, tab: 'community' },
    ],
  },
  {
    title: 'บัญชีของฉัน',
    items: [
      { label: 'คะแนนความน่าเชื่อถือ', icon: BadgeCheck, tab: 'trust-review' },
      { label: 'อัปเกรดสมาชิก', icon: Crown, action: 'upgrade', badge: 'tier' },
      { label: 'ตั้งค่า & ธีม', icon: Settings, action: 'settings' },
    ],
  },
];

// Logo + wordmark, shared by the rail, the mobile drawer, and the mobile header
export const BrandMark: React.FC<{ compact?: boolean; onDark?: boolean }> = ({ compact, onDark = true }) => (
  <span className="flex items-center gap-2.5 min-w-0">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/icon.png" alt="" className="w-8 h-8 shrink-0" />
    {!compact && (
      <span className="min-w-0 leading-none">
        <span className={`block font-display text-[1.35rem] font-semibold tracking-tight ${onDark ? 'text-white' : 'text-ink-900 dark:text-white'}`}>
          TripSure
        </span>
        <span className={`block mt-1 text-[11px] font-medium ${onDark ? 'text-ink-300' : 'text-ink-500'}`}>
          ทริปชัวร์ · วางแผนและค้ำประกันทริป
        </span>
      </span>
    )}
  </span>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  onOpenUpgradeModal,
  onOpenSettings,
  currentTier,
  totalRevenue,
}) => {
  // Close the mobile drawer with Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileOpen, onCloseMobile]);

  const handleItemClick = (item: SidebarItem) => {
    if (item.action === 'upgrade') {
      onOpenUpgradeModal();
    } else if (item.action === 'settings') {
      onOpenSettings();
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
    onCloseMobile();
  };

  const renderBadge = (item: SidebarItem, compact: boolean) => {
    if (!item.badge) return null;
    if (item.badge === 'live') {
      return (
        <span
          className={`w-1.5 h-1.5 rounded-full bg-lagoon-300 ${compact ? 'absolute top-2.5 right-4' : 'ml-auto'}`}
          aria-label="เปิดรับสมาชิก"
        />
      );
    }
    if (compact) return null;
    if (item.badge === 'new') {
      return <span className="ml-auto text-[11px] font-semibold text-lagoon-300">ใหม่</span>;
    }
    if (item.badge === 'revenue') {
      return <span className="ml-auto text-xs font-mono text-saffron-200">฿{totalRevenue.toLocaleString()}</span>;
    }
    return <span className="ml-auto text-[11px] font-semibold tracking-wide text-ink-300">{currentTier}</span>;
  };

  const renderNav = (compact: boolean) => (
    <nav className="flex-1 py-2" aria-label="เมนูหลัก">
      {SIDEBAR_GROUPS.map((group, groupIndex) => (
        <div key={group.title} className={groupIndex > 0 ? 'mt-5' : ''}>
          {!compact ? (
            <div className="px-5 pb-1.5 text-xs font-medium text-ink-400">{group.title}</div>
          ) : (
            groupIndex > 0 && <div className="mx-5 mb-3 border-t border-white/10" />
          )}
          <ul className="space-y-px px-3">
            {group.items.map((item) => {
              const isActive = !!item.primary && activeTab === item.tab;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleItemClick(item)}
                    title={compact ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative w-full flex items-center gap-3 rounded-md text-sm transition-colors duration-150 ${
                      compact ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2'
                    } ${
                      isActive
                        ? 'bg-lagoon-300/20 text-lagoon-50 font-semibold ring-1 ring-inset ring-lagoon-300/35'
                        : 'text-ink-200 hover:bg-white/[0.06] hover:text-white active:bg-lagoon-300/15'
                    }`}
                  >
                    {/* Light-green marker on the selected page */}
                    {isActive && (
                      <span aria-hidden className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-lagoon-300" />
                    )}
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-lagoon-200' : 'text-ink-400'}`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {!compact && <span className="truncate text-left">{item.label}</span>}
                    {renderBadge(item, compact)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const tierConfig = TIER_CONFIGS[currentTier];

  const membership = (
    <div className="mx-3 mb-4 mt-6 rounded-lg border border-white/10 p-4">
      <div className="text-sm font-semibold text-white">
        แพ็กเกจ <span className="tracking-wide text-saffron-300">{currentTier}</span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-200">
        {currentTier === 'PLATINUM'
          ? 'ใช้ AI ได้ไม่จำกัด และไม่มีค่าธรรมเนียมเปิดทริป'
          : currentTier === 'GOLD'
          ? `ลดค่าธรรมเนียมเปิดทริป ${tierConfig.creationFeeDiscountPercent}% · อัปเกรดเป็น PLATINUM เพื่อใช้ AI ไม่จำกัด`
          : 'อัปเกรดเพื่อรับโควตา AI เพิ่ม และส่วนลดค่าธรรมเนียมเปิดทริป'}
      </p>
      <button
        onClick={() => {
          onOpenUpgradeModal();
          onCloseMobile();
        }}
        className="group mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-lagoon-200 hover:text-white transition-colors"
      >
        ดูแพ็กเกจทั้งหมด
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden lg:block shrink-0 self-stretch bg-ink-900 border-r border-ink-950 transition-[width] duration-200 ease-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex items-center h-16 shrink-0 ${isCollapsed ? 'justify-center' : 'px-5'}`}
          aria-label="TripSure หน้าหลัก"
        >
          <BrandMark compact={isCollapsed} />
        </button>
        {renderNav(isCollapsed)}
        {!isCollapsed && membership}
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] bg-ink-950/50 transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      />
      <aside
        className={`lg:hidden fixed top-0 left-0 z-[70] h-full w-72 max-w-[85vw] bg-ink-900 shadow-2xl flex flex-col overflow-y-auto transition-transform duration-200 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div className="flex items-center justify-between h-16 pl-5 pr-3 shrink-0">
          <BrandMark />
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-md text-ink-300 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNav(false)}
        {membership}
      </aside>
    </>
  );
};
