'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Crown,
  Zap,
  ArrowUpRight,
  Menu,
  Search,
  X,
  Sparkles,
  ShieldCheck,
  Users,
  BarChart3,
  Hotel,
  CloudSun,
  PlusCircle,
  BadgeCheck,
  CornerDownLeft,
  Map as MapIcon,
  LogIn,
  LogOut,
  UserPen,
  ChevronDown,
  Home,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SubscriptionTier, TIER_CONFIGS } from '@/lib/types';

interface SearchItem {
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string;
  tab?: string;
  action?: 'upgrade';
}

const SEARCH_ITEMS: SearchItem[] = [
  { label: 'แผนที่เที่ยวไทย 77 จังหวัด', description: 'ดูแหล่งท่องเที่ยวทั่วประเทศ แล้วสร้างทริป', icon: MapIcon, tab: 'thailand-map', keywords: 'แผนที่ map จังหวัด ภาค เหนือ อีสาน ใต้ ตะวันออก ภาคกลาง ที่เที่ยว แหล่งท่องเที่ยว ดอย ภู เกาะ น้ำตก วัด' },
  { label: 'หน้าหลัก', description: 'ภาพรวม ทริปแนะนำ และโปรไฟล์ของคุณ', icon: Home, tab: 'home', keywords: 'home หน้าหลัก หน้าแรก โปรไฟล์ ภาพรวม' },
  { label: 'AI Planner & OTA', description: 'ให้ AI จัดทริปตามงบ', icon: Sparkles, tab: 'ai-planner', keywords: 'ai planner วางแผน ทริป เที่ยว งบ gemini แผนเที่ยว' },
  { label: 'เทียบราคาโรงแรม', description: 'Agoda vs Trip.com', icon: Hotel, tab: 'ai-planner', keywords: 'โรงแรม ที่พัก hotel agoda trip.com ราคา ota เทียบ' },
  { label: 'พยากรณ์อากาศ', description: 'กรมอุตุฯ / Open-Meteo', icon: CloudSun, tab: 'ai-planner', keywords: 'อากาศ weather ฝน ร้อน พยากรณ์ tmd' },
  { label: 'Community Escrow', description: 'ทริปชุมชน & เงินค้ำประกัน', icon: ShieldCheck, tab: 'community', keywords: 'community escrow ชุมชน มัดจำ ค้ำประกัน หารทริป เกาะเสม็ด' },
  { label: 'สร้างทริปหารค่าใช้จ่าย', description: 'เปิดทริปใหม่ให้เพื่อนเข้าร่วม', icon: PlusCircle, tab: 'community', keywords: 'สร้าง ทริปใหม่ create หาร เพื่อน' },
  { label: 'รีวิว & ผู้ร่วมทริป', description: 'อ่านรีวิวและเขียนรีวิว', icon: Users, tab: 'trust-review', keywords: 'รีวิว review ผู้ร่วมทริป เพื่อน' },
  { label: 'คะแนนความน่าเชื่อถือ', description: 'ทะเบียนคนเททริป', icon: BadgeCheck, tab: 'trust-review', keywords: 'trust คะแนน น่าเชื่อถือ เท เททริป' },
  { label: 'Judge Revenue', description: 'แดชบอร์ดรายได้แพลตฟอร์ม', icon: BarChart3, tab: 'judge-dashboard', keywords: 'judge revenue รายได้ dashboard แดชบอร์ด เงิน' },
  { label: 'อัปเกรดสมาชิก', description: 'GOLD / PLATINUM เพิ่มโควตา AI', icon: Crown, action: 'upgrade', keywords: 'อัปเกรด upgrade สมาชิก gold platinum โควตา แพ็กเกจ' },
];

interface NavSearchProps {
  setActiveTab: (tab: string) => void;
  onOpenUpgradeModal: () => void;
}

const NavSearch: React.FC<NavSearchProps> = ({ setActiveTab, onOpenUpgradeModal }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const results = q
    ? SEARCH_ITEMS.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(q))
    : SEARCH_ITEMS;

  // Ctrl/Cmd + K focuses the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  const selectItem = (item: SearchItem) => {
    if (item.action === 'upgrade') {
      onOpenUpgradeModal();
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlighted((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      if (results[highlighted]) selectItem(results[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div
        className={`group flex items-center gap-2 h-10 px-3 rounded-xl border transition-all duration-300 ${
          isOpen
            ? 'w-72 lg:w-80 xl:w-96 bg-white border-emerald-400 ring-4 ring-emerald-500/15 shadow-md'
            : 'w-56 lg:w-64 xl:w-80 bg-slate-100/80 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-all duration-300 ${
            isOpen ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหาทริป, โรงแรม, ฟีเจอร์..."
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          aria-label="ค้นหา"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all hover:rotate-90"
            aria-label="ล้างคำค้นหา"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-slate-400">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Results dropdown */}
      <div
        className={`absolute left-0 top-full mt-2 w-full min-w-[18rem] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden origin-top transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {q ? `ผลการค้นหา (${results.length})` : 'เมนูแนะนำ'}
        </div>
        {results.length === 0 ? (
          <div className="px-4 pb-4 pt-1 text-sm text-slate-500">
            ไม่พบ &ldquo;{query}&rdquo; ลองค้นด้วยคำอื่น เช่น โรงแรม, escrow, รีวิว
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto pb-2">
            {results.map((item, i) => {
              const Icon = item.icon;
              const isHighlighted = i === highlighted;
              return (
                <li key={item.label}>
                  <button
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => selectItem(item)}
                    className={`group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isHighlighted ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <span
                      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isHighlighted ? 'bg-emerald-600 text-white scale-110' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${isHighlighted ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">{item.description}</span>
                    </span>
                    <CornerDownLeft
                      className={`w-3.5 h-3.5 text-emerald-600 transition-all duration-200 ${
                        isHighlighted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// Signed-in member shown in the navbar (null = signed out)
export interface NavbarMember {
  displayName: string;
  email: string;
  avatarUrl: string;
  hasProfile: boolean;
  isDemo: boolean;
}

interface UserMenuProps {
  member: NavbarMember | null;
  onSignIn: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ member, onSignIn, onEditProfile, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [member?.avatarUrl]);

  if (!member) {
    return (
      <button
        onClick={onSignIn}
        className="group h-10 px-3 sm:px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 flex items-center gap-2 whitespace-nowrap transition-all duration-200 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5"
      >
        <LogIn className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span className="hidden sm:inline">เข้าสู่ระบบ</span>
      </button>
    );
  }

  const initial = (member.displayName || member.email).charAt(0).toUpperCase();

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-1.5 p-1 pr-2 rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:shadow-md hover:border-emerald-300"
        aria-label="เมนูบัญชี"
      >
        <span className="relative">
          {member.avatarUrl && !avatarBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarBroken(true)}
              className="w-8 h-8 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center">
              {initial}
            </span>
          )}
          {!member.hasProfile && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-sm font-bold text-slate-900 truncate">{member.displayName || 'สมาชิกใหม่'}</div>
          <div className="text-xs text-slate-500 truncate">{member.email}</div>
          {member.isDemo && (
            <span className="mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              โหมด Demo
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onEditProfile();
          }}
          className="group w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
        >
          <UserPen className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-transform group-hover:scale-110" />
          {member.hasProfile ? 'แก้ไขโปรไฟล์' : 'สร้างโปรไฟล์'}
          {!member.hasProfile && <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            onSignOut();
          }}
          className="group w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-slate-100"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

interface NavbarProps {
  currentTier: SubscriptionTier;
  aiQuotaUsed: number;
  onTierChange: (tier: SubscriptionTier) => void;
  onOpenUpgradeModal: () => void;
  setActiveTab: (tab: string) => void;
  onToggleSidebar: () => void;
  member: NavbarMember | null;
  onSignIn: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTier,
  aiQuotaUsed,
  onTierChange,
  onOpenUpgradeModal,
  setActiveTab,
  onToggleSidebar,
  member,
  onSignIn,
  onEditProfile,
  onSignOut,
  isDark,
  onToggleTheme,
  onOpenSettings,
}) => {
  const tierConfig = TIER_CONFIGS[currentTier];
  const unlimited = tierConfig.unlimitedQuota;
  const quotaRemaining = Math.max(0, tierConfig.maxQuotas - aiQuotaUsed);
  // Unlimited shows an empty (never filling) bar
  const quotaPercent = unlimited ? 0 : Math.min(100, Math.round((aiQuotaUsed / tierConfig.maxQuotas) * 100));

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
      <div className="px-3 sm:px-5">
        <div className="flex items-center justify-between gap-4 h-16">

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Sidebar toggle (hamburger) */}
            <button
              onClick={onToggleSidebar}
              className="group p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 active:scale-90"
              aria-label="เปิด/ปิดเมนู"
            >
              <Menu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </button>

            {/* Logo & Platform Tag */}
            <button
              type="button"
              className="group flex items-center gap-3 text-left shrink-0"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-emerald-500/40">
                <Compass className="w-6 h-6 transition-transform duration-700 group-hover:rotate-[360deg]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-700 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
                    TripSure AI
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap transition-colors group-hover:bg-emerald-200">
                    ทริปชัวร์
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden xl:block whitespace-nowrap">
                  Thailand&apos;s 1st Anti-Flake Trip Escrow & AI Planner
                </p>
              </div>
            </button>

            {/* Search bar */}
            <div className="ml-2 lg:ml-4">
              <NavSearch setActiveTab={setActiveTab} onOpenUpgradeModal={onOpenUpgradeModal} />
            </div>
          </div>

          {/* Right Controls: Tier Switcher & Live Quota Counter */}
          <div className="flex items-center gap-3">

            {/* Quick Live Tier Switcher for Hackathon Judges */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl transition-shadow hover:shadow-md">
              <span className="text-xs font-medium text-slate-400 px-1.5">Tier:</span>
              {(['FREE', 'GOLD', 'PLATINUM'] as SubscriptionTier[]).map((tierKey) => {
                const isActive = currentTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    onClick={() => onTierChange(tierKey)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isActive
                        ? tierKey === 'PLATINUM'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : tierKey === 'GOLD'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                          : 'bg-slate-700 text-white shadow-md shadow-slate-500/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {tierKey}
                  </button>
                );
              })}
            </div>

            {/* Quota Counter Widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-1.5 py-1.5 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-emerald-200">
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>โควตา AI</span>
                  <span className={`font-mono font-bold ${!unlimited && quotaRemaining === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {unlimited ? '∞ ไม่จำกัด' : `${quotaRemaining}/${tierConfig.maxQuotas}`}
                  </span>
                </div>
                {/* Micro progress bar */}
                <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      quotaPercent >= 100
                        ? 'bg-rose-500'
                        : quotaPercent >= 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>

              {/* Upgrade Trigger Button */}
              <button
                onClick={onOpenUpgradeModal}
                className="group btn-shine px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0"
                title="คลิกเพื่ออัปเกรดแพ็กเกจเพิ่มโควตา"
              >
                <Crown className="w-3.5 h-3.5 group-hover-wiggle" />
                <span>อัปเกรด</span>
                <ArrowUpRight className="w-3 h-3 hidden sm:inline transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            {/* Theme quick toggle + settings */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTheme}
                className="group w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-all active:scale-90"
                aria-label={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 transition-transform duration-500 group-hover:rotate-90" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12" />
                )}
              </button>
              <button
                onClick={onOpenSettings}
                className="group hidden sm:flex w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 items-center justify-center transition-all active:scale-90"
                aria-label="ตั้งค่า"
                title="ตั้งค่า"
              >
                <Settings className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
              </button>
            </div>

            {/* Sign-in / Account menu */}
            <UserMenu member={member} onSignIn={onSignIn} onEditProfile={onEditProfile} onSignOut={onSignOut} />

          </div>
        </div>
      </div>
    </header>
  );
};
