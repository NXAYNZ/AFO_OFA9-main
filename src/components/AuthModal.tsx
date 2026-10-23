'use client';

import React, { useState } from 'react';
import { X, Compass, ShieldCheck, Sparkles, Users, Loader2, FlaskConical } from 'lucide-react';

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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all hover:rotate-90"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold">เข้าสู่ระบบ TripSure AI</h3>
          <p className="text-sm text-white/80 mt-1">สมัครสมาชิกฟรีด้วยบัญชี Gmail ของคุณ ใช้เวลาไม่ถึง 1 นาที</p>
        </div>

        <div className="px-8 py-6">
          <ul className="space-y-2.5 mb-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <button
            onClick={handleGoogle}
            disabled={!isSupabaseReady || isLoading}
            className="group w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <GoogleLogo />}
            <span>{isLoading ? 'กำลังไปที่ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
          </button>

          {error && (
            <p className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              เข้าสู่ระบบไม่สำเร็จ: {error}
            </p>
          )}

          {!isSupabaseReady && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                ยังไม่ได้ตั้งค่า Supabase (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY ใน .env.local) จึงยังใช้ Google Sign-in ไม่ได้
                ระหว่างนี้ลองสร้างโปรไฟล์แบบ Demo ได้ (ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น)
              </p>
              <button
                onClick={onDemoSignIn}
                className="mt-2 w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all hover:-translate-y-0.5"
              >
                <FlaskConical className="w-4 h-4" />
                ทดลองสร้างโปรไฟล์แบบ Demo
              </button>
            </div>
          )}

          <p className="mt-5 text-[11px] text-center text-slate-400 leading-relaxed">
            เราใช้เพียงชื่อ อีเมล และรูปโปรไฟล์จากบัญชี Google ของคุณ
          </p>
        </div>
      </div>
    </div>
  );
};
