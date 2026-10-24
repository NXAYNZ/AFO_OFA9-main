'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff } from 'lucide-react';

const LAUNCH_MS = 1100;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduce-motion');

// "เริ่มใช้งานฟรี": a blue circle grows from the button, a plane takes off, then the app opens
export const useLaunch = (href: string) => {
  const router = useRouter();
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const launch = useCallback(
    (from?: { x: number; y: number }) => {
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      setOrigin(from ?? { x: window.innerWidth - 80, y: 36 });
      window.setTimeout(() => router.push(href), LAUNCH_MS);
    },
    [router, href]
  );

  const overlay = origin ? (
    <div
      className="launch-overlay fixed inset-0 z-[100] flex items-center justify-center text-white"
      style={{ '--lx': `${origin.x}px`, '--ly': `${origin.y}px` } as React.CSSProperties}
      role="status"
      aria-live="assertive"
    >
      <div className="launch-content flex flex-col items-center gap-5 font-prompt">
        <div className="relative w-56 h-24">
          <span className="launch-trail absolute left-0 right-8 top-1/2 h-0.5 rounded-full" />
          <span className="launch-plane absolute top-1/2 left-0 -translate-y-1/2 w-14 h-14 rounded-full bg-white text-[#0057FF] flex items-center justify-center shadow-xl">
            <PlaneTakeoff className="w-7 h-7" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight">
          TripSure <span className="text-[#93C5FD]">AI</span>
        </div>
        <div className="text-sm text-white/80">กำลังเตรียมพื้นที่วางแผนทริปของคุณ…</div>
        <div className="launch-bar w-48 h-1 rounded-full bg-white/25 overflow-hidden">
          <span className="block h-full rounded-full bg-white" />
        </div>
      </div>
    </div>
  ) : null;

  return { launch, overlay };
};
