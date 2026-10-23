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
  BadgeCheck,
  Compass,
  X,
  ArrowUpRight,
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
  currentTier: SubscriptionTier;
  totalRevenue: number;
}

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  tab?: string;
  // Only primary items show the active highlight (secondary items are shortcuts into the same tabs)
  primary?: boolean;
  action?: 'upgrade';
  badge?: 'new' | 'live' | 'revenue' | 'tier';
}

const SIDEBAR_GROUPS: { title: string; items: SidebarItem[] }[] = [
  {
    title: 'เมนูหลัก',
    items: [
      { label: 'หน้าหลัก', icon: Home, tab: 'home', primary: true },
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
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  onOpenUpgradeModal,
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
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
    onCloseMobile();
  };

  const renderBadge = (item: SidebarItem, compact: boolean) => {
    if (!item.badge) return null;
    if (item.badge === 'live') {
      return (
        <span className={`relative flex w-2 h-2 ${compact ? 'absolute top-2 right-3' : 'ml-auto'}`}>
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
        </span>
      );
    }
    if (compact) return null;
    if (item.badge === 'new') {
      return (
        <span className="ml-auto text-[10px] font-bold leading-none px-1.5 py-1 rounded bg-rose-600 text-white">
          New
        </span>
      );
    }
    if (item.badge === 'revenue') {
      return (
        <span className="ml-auto text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
          ฿{totalRevenue.toLocaleString()}
        </span>
      );
    }
    return (
      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
        {currentTier}
      </span>
    );
  };

  const renderNav = (compact: boolean) => (
    <nav className="py-3">
      {SIDEBAR_GROUPS.map((group, groupIndex) => (
        <div key={group.title} className={groupIndex > 0 ? 'mt-2 pt-2 border-t border-slate-200/80' : ''}>
          {!compact && (
            <div className="px-5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
          )}
          <ul className="space-y-0.5 px-2">
            {group.items.map((item) => {
              const isActive = !!item.primary && activeTab === item.tab;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleItemClick(item)}
                    title={compact ? item.label : undefined}
                    className={`group relative w-full flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ${
                      compact ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {/* Active indicator bar */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-emerald-500 transition-all duration-300 ${
                        isActive ? 'h-6 opacity-100' : 'h-0 opacity-0 group-hover:h-3 group-hover:opacity-60'
                      }`}
                    />
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 ${
                        isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'
                      } ${compact ? '' : 'group-hover:-rotate-6'}`}
                    />
                    {!compact && (
                      <span className="truncate text-left transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.label}
                      </span>
                    )}
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

  const upgradeCard = (
    <div className="mx-3 mb-4 mt-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Crown className="w-4 h-4" />
        <span>สมาชิก {tierConfig.labelThai}</span>
      </div>
      <p className="mt-1 text-xs text-white/80 leading-relaxed">
        อัปเกรดเพื่อรับโควตา AI เพิ่มและส่วนลดค่าธรรมเนียมสร้างทริป
      </p>
      <button
        onClick={() => {
          onOpenUpgradeModal();
          onCloseMobile();
        }}
        className="group btn-shine mt-3 w-full py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 hover:-translate-y-0.5"
      >
        <span>ดูแพ็กเกจ</span>
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] shrink-0 bg-white border-r border-slate-200 overflow-y-auto overflow-x-hidden no-scrollbar transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderNav(isCollapsed)}
        {!isCollapsed && <div className="mt-auto">{upgradeCard}</div>}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      />
      <aside
        className={`lg:hidden fixed top-0 left-0 z-[70] h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-700 bg-clip-text text-transparent">
              TripSure AI
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all hover:rotate-90"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNav(false)}
        <div className="mt-auto">{upgradeCard}</div>
      </aside>
    </>
  );
};
