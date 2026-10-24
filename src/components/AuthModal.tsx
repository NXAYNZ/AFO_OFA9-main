'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Sparkles, Users, Loader2, FlaskConical } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseReady: boolean;
  onGoogleSignIn: () => Promise<string | null>;
  onDemoSignIn: () => void;
}

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const PERKS = [
  { icon: Sparkles, text: 'บันทึกแผนเที่ยว AI ของคุณ' },
  { icon: ShieldCheck, text: 'เข้าร่วมทริปพร้อมระบบ Escrow ค้ำประกัน' },
  { icon: Users, text: 'สร้างโปรไฟล์และสะสมคะแนนความน่าเชื่อถือ' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isSupabaseReady,
  onGoogleSignIn,
  onDemoSignIn,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setIsLoading(true);
    setError(null);
    const err = await onGoogleSignIn();
    // On success the browser redirects to Google, so only errors land here
    if (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink-950/70 animate-backdropIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-8 pt-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="w-11 h-11" />
          <h3 id="auth-title" className="mt-4 font-display text-2xl font-semibold text-slate-900">เข้าสู่ระบบ TripSure</h3>
          <p className="text-sm text-slate-600 mt-1">สมัครสมาชิกฟรีด้วยบัญชี Google ใช้เวลาไม่ถึง 1 นาที</p>
        </div>

        <div className="px-8 pt-6 pb-8">
          <ul className="space-y-2.5 mb-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-700">
                <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          <button
            onClick={handleGoogle}
            disabled={!isSupabaseReady || isLoading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-md border border-slate-300 bg-white text-slate-900 font-semibold transition-colors duration-150 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <GoogleLogo />}
            <span>{isLoading ? 'กำลังไปที่ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
          </button>

          {error && (
            <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2" role="alert">
              เข้าสู่ระบบไม่สำเร็จ: {error}
            </p>
          )}

          {!isSupabaseReady && (
            <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                ยังไม่ได้ตั้งค่า Supabase (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY ใน .env.local) จึงยังใช้ Google Sign-in ไม่ได้
                ระหว่างนี้ลองสร้างโปรไฟล์แบบ Demo ได้ (ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น)
              </p>
              <button
                onClick={onDemoSignIn}
                className="mt-2.5 w-full h-10 flex items-center justify-center gap-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
              >
                <FlaskConical className="w-4 h-4" />
                ทดลองสร้างโปรไฟล์แบบ Demo
              </button>
            </div>
          )}

          <p className="mt-5 text-xs text-center text-slate-500 leading-relaxed">
            เราใช้เพียงชื่อ อีเมล และรูปโปรไฟล์จากบัญชี Google ของคุณ
          </p>
        </div>
      </div>
    </div>
  );
};
