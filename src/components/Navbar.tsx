'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
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
  Gem,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SubscriptionTier, TIER_CONFIGS } from '@/lib/types';
import { BrandMark } from '@/components/Sidebar';

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
    <div ref={wrapperRef} className="relative hidden md:block w-full max-w-md">
      <div
        className={`group flex items-center gap-2 h-10 px-3 rounded-md border transition-colors duration-150 ${
          isOpen
            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 ${isOpen ? 'text-emerald-600' : 'text-slate-400'}`} />
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
          placeholder="ค้นหาทริป โรงแรม หรือเมนู"
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 outline-none"
          aria-label="ค้นหา"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="ล้างคำค้นหา"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-medium text-slate-500">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Results dropdown */}
      <div
        className={`absolute left-0 top-full mt-1.5 w-full min-w-[18rem] bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden origin-top transition-[opacity,transform] duration-150 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-3 pb-1.5 text-xs font-medium text-slate-500">
          {q ? `ผลการค้นหา ${results.length} รายการ` : 'ไปที่'}
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
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      isHighlighted ? 'bg-slate-100' : ''
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isHighlighted ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate text-slate-900">{item.label}</span>
                      <span className="block text-xs text-slate-500 truncate">{item.description}</span>
                    </span>
                    <CornerDownLeft
                      className={`w-3.5 h-3.5 text-slate-400 ${isHighlighted ? 'opacity-100' : 'opacity-0'}`}
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

// Each tier looks like its rank when selected: plain ink, gold with a crown, navy and silver with a gem
const TIER_SWITCH_STYLE: Record<SubscriptionTier, { active: string; idle: string; icon?: LucideIcon }> = {
  FREE: {
    active: 'bg-ink-600 text-white',
    idle: 'text-slate-500 hover:text-slate-900',
  },
  GOLD: {
    active: 'bg-saffron-400 text-saffron-950 shadow-sm',
    idle: 'text-saffron-700 hover:bg-saffron-50 dark:text-saffron-300',
    icon: Crown,
  },
  PLATINUM: {
    active: 'bg-ink-900 text-gulf-100 ring-1 ring-inset ring-gulf-300/60 shadow-sm',
    idle: 'text-gulf-600 hover:bg-gulf-50 dark:text-gulf-300',
    icon: Gem,
  },
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
        className="h-10 px-3 sm:px-4 rounded-md bg-slate-900 text-sm font-semibold text-white flex items-center gap-2 whitespace-nowrap transition-colors duration-150 hover:bg-slate-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">เข้าสู่ระบบ</span>
      </button>
    );
  }

  const initial = (member.displayName || member.email).charAt(0).toUpperCase();

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 pr-2 rounded-md border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300"
        aria-label="เมนูบัญชี"
        aria-expanded={isOpen}
      >
        <span className="relative">
          {member.avatarUrl && !avatarBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarBroken(true)}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <span className="w-8 h-8 rounded bg-ink-900 text-white text-sm font-semibold flex items-center justify-center">
              {initial}
            </span>
          )}
          {!member.hasProfile && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 top-full mt-1.5 w-64 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden origin-top-right transition-[opacity,transform] duration-150 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-sm font-semibold text-slate-900 truncate">{member.displayName || 'สมาชิกใหม่'}</div>
          <div className="text-xs text-slate-500 truncate">{member.email}</div>
          {member.isDemo && (
            <span className="mt-1.5 inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              โหมด Demo
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onEditProfile();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <UserPen className="w-4 h-4 text-slate-500" />
          {member.hasProfile ? 'แก้ไขโปรไฟล์' : 'สร้างโปรไฟล์'}
          {!member.hasProfile && <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            onSignOut();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-slate-100"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
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
    <header className="app-header sticky top-0 z-50 border-b border-slate-200">
      <div className="flex items-center gap-3 h-16 px-3 sm:px-5 lg:px-6">
        {/* Sidebar toggle: collapses the rail on desktop, opens the drawer on mobile */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-md text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
          aria-label="เปิด/ปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand appears here only when the rail is hidden */}
        <button type="button" className="lg:hidden min-w-0" onClick={() => setActiveTab('home')} aria-label="TripSure หน้าหลัก">
          <span className="hidden sm:block"><BrandMark onDark={false} /></span>
          <span className="sm:hidden"><BrandMark compact onDark={false} /></span>
        </button>

        <div className="flex-1 min-w-0 flex">
          <NavSearch setActiveTab={setActiveTab} onOpenUpgradeModal={onOpenUpgradeModal} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo tier switch for judges: clearly marked as a simulation control */}
          <div className="hidden xl:flex items-center gap-2" role="group" aria-label="สลับแพ็กเกจ (โหมดสาธิต)">
            <span className="text-xs text-slate-500">Demo</span>
            <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
              {(['FREE', 'GOLD', 'PLATINUM'] as SubscriptionTier[]).map((tierKey) => {
                const isActive = currentTier === tierKey;
                const style = TIER_SWITCH_STYLE[tierKey];
                const Icon = style.icon;
                return (
                  <button
                    key={tierKey}
                    onClick={() => onTierChange(tierKey)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded transition-colors duration-150 ${
                      isActive ? style.active : style.idle
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" strokeWidth={2.2} />}
                    {tierKey}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI quota meter */}
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white pl-3 pr-1 h-10">
            <div className="hidden sm:block">
              <div className="flex items-baseline gap-1.5 text-xs whitespace-nowrap">
                <span className="text-slate-500">โควตา AI</span>
                <span className={`font-mono font-semibold ${!unlimited && quotaRemaining === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {unlimited ? 'ไม่จำกัด' : `${quotaRemaining}/${tierConfig.maxQuotas}`}
                </span>
              </div>
              <div className="w-20 bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    quotaPercent >= 100 ? 'bg-rose-500' : quotaPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={onOpenUpgradeModal}
              className="h-8 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors duration-150"
              title="อัปเกรดแพ็กเกจเพื่อเพิ่มโควตา"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>อัปเกรด</span>
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-md text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 flex items-center justify-center transition-colors"
              aria-label={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="hidden sm:flex w-10 h-10 rounded-md text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 items-center justify-center transition-colors"
              aria-label="ตั้งค่า"
              title="ตั้งค่า"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>

          <UserMenu member={member} onSignIn={onSignIn} onEditProfile={onEditProfile} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
};
