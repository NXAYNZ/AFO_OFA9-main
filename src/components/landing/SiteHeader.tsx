'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlaneTakeoff, Search, Menu, X, ArrowRight } from 'lucide-react';
import { UserMenu, NavbarMember } from '@/components/Navbar';

export interface HeaderLink {
  id: string;
  label: string;
}

interface SiteHeaderProps {
  links: HeaderLink[];
  activeId: string;
  onLink: (id: string) => void;
  // Logo goes to the landing page; on the landing page it scrolls to the top instead
  onLogo?: () => void;
  onSearch?: () => void;
  member: NavbarMember | null;
  onSignIn: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
  // Primary pill on the right: "เริ่มใช้งานฟรี" on the landing page, hidden inside the app
  primary?: { label: string; onClick: (origin?: { x: number; y: number }) => void };
  // Extra controls shown before the account menu (e.g. the app's quota and tier switch)
  extra?: React.ReactNode;
}

// One header for the whole site, so the landing page and the app read as the same product
export const SiteHeader: React.FC<SiteHeaderProps> = ({
  links,
  activeId,
  onLink,
  onLogo,
  onSearch,
  member,
  onSignIn,
  onEditProfile,
  onSignOut,
  primary,
  extra,
}) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    onLink(id);
  };

  const logo = (
    <>
      <span className="w-10 h-10 rounded-full bg-tsb-600 text-tsn-0 flex items-center justify-center shadow-md shadow-tsb-600/30">
        <PlaneTakeoff className="w-5 h-5" />
      </span>
      <span className="text-xl font-bold text-tsn-900 tracking-tight whitespace-nowrap">
        TripSure <span className="text-tsb-600">AI</span>
      </span>
    </>
  );

  return (
    <header className={`sticky top-0 z-50 bg-tsn-0/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_1px_0_#E2E8F0,0_8px_24px_-16px_rgba(15,23,42,0.2)]' : 'shadow-[0_1px_0_#F1F5F9]'}`}>
      <div className="mx-auto max-w-[1440px] h-[72px] px-4 sm:px-6 lg:px-8 flex items-center gap-4 lg:gap-6">
        {onLogo ? (
          <button onClick={onLogo} className="flex items-center gap-2.5 shrink-0" aria-label="TripSure AI หน้าแรก">
            {logo}
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="TripSure AI หน้าแรก">
            {logo}
          </Link>
        )}

        <nav className="hidden lg:flex flex-1 min-w-0 justify-center gap-1 overflow-x-auto no-scrollbar" aria-label="เมนูหลัก">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              aria-current={activeId === l.id ? 'page' : undefined}
              className={`relative h-[72px] px-3 xl:px-4 text-[15px] whitespace-nowrap transition-colors ${
                activeId === l.id ? 'text-tsb-600 font-semibold' : 'text-tsn-600 hover:text-tsn-900'
              }`}
            >
              {l.label}
              {activeId === l.id && <span className="nav-underline absolute left-3 right-3 xl:left-4 xl:right-4 bottom-0 h-[3px] rounded-t-full bg-tsb-600" />}
            </button>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          {onSearch && (
            <button onClick={onSearch} className="w-10 h-10 rounded-full text-tsn-600 hover:bg-tsb-50 hover:text-tsb-600 flex items-center justify-center transition-colors" aria-label="ค้นหา">
              <Search className="w-5 h-5" />
            </button>
          )}
          {extra}
          {member ? (
            <UserMenu member={member} onSignIn={onSignIn} onEditProfile={onEditProfile} onSignOut={onSignOut} />
          ) : (
            <button
              onClick={onSignIn}
              className="hidden sm:flex h-10 px-5 rounded-full border border-tsn-300 text-sm font-semibold text-tsn-800 items-center hover:border-tsb-600 hover:text-tsb-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          )}
          {primary && (
            <button
              onClick={(e) => primary.onClick({ x: e.clientX, y: e.clientY })}
              className="btn-start group hidden sm:flex h-10 pl-5 pr-4 rounded-full text-sm font-semibold text-tsn-0 items-center gap-1.5 whitespace-nowrap"
            >
              <span className="relative z-10">{primary.label}</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          )}
          <button onClick={() => setOpen((o) => !o)} className="lg:hidden w-10 h-10 rounded-full text-tsn-700 hover:bg-tsn-100 flex items-center justify-center" aria-label="เมนู" aria-expanded={open}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-tsn-100 bg-tsn-0 px-4 py-3 space-y-1 animate-fadeIn max-h-[80vh] overflow-y-auto">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`w-full text-left h-11 px-3 rounded-xl ${activeId === l.id ? 'bg-tsb-50 text-tsb-700 font-semibold' : 'text-tsn-700'}`}
            >
              {l.label}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {!member && (
              <button
                onClick={() => {
                  setOpen(false);
                  onSignIn();
                }}
                className="h-11 rounded-full border border-tsn-300 text-sm font-semibold"
              >
                เข้าสู่ระบบ
              </button>
            )}
            {primary && (
              <button
                onClick={(e) => {
                  setOpen(false);
                  primary.onClick({ x: e.clientX, y: e.clientY });
                }}
                className={`btn-start h-11 rounded-full text-tsn-0 text-sm font-semibold ${member ? 'col-span-2' : ''}`}
              >
                {primary.label}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
