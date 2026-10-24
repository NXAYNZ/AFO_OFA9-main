'use client';

import React, { useEffect, useState } from 'react';
import { X, Settings, Sun, Moon, Monitor, Sparkles, Trash2, Check } from 'lucide-react';
import { DisplaySettings, ThemePreference } from '@/lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  settings: DisplaySettings;
  onChange: (settings: DisplaySettings) => void;
  onClose: () => void;
}

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: React.ReactNode; preview: string }[] = [
  { id: 'light', label: 'สว่าง', icon: <Sun className="w-4 h-4" />, preview: 'linear-gradient(135deg, #f8fafc 50%, #e2e8f0 50%)' },
  { id: 'dark', label: 'มืด', icon: <Moon className="w-4 h-4" />, preview: 'linear-gradient(135deg, #0f172a 50%, #1e293b 50%)' },
  { id: 'system', label: 'ตามระบบ', icon: <Monitor className="w-4 h-4" />, preview: 'linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)' },
];

// Browser-only data the demo mode keeps (no Supabase)
const LOCAL_DATA_KEYS = ['tripsure_place_reviews', 'tripsure_tier', 'tripsure_quota'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onChange, onClose }) => {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCleared(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const clearLocalData = () => {
    if (!window.confirm('ล้างรีวิวทดลองและข้อมูลโควตาที่เก็บในเบราว์เซอร์นี้? (ย้อนกลับไม่ได้)')) return;
    try {
      LOCAL_DATA_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    setCleared(true);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-backdropIn" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-popIn"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 id="settings-title" className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" /> ตั้งค่า
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all hover:rotate-90"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Theme */}
          <section>
            <h3 className="text-sm font-bold text-slate-800">ธีม</h3>
            <p className="text-xs text-slate-500">เลือกโหมดสว่าง โหมดมืด หรือให้ตามการตั้งค่าของเครื่อง</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const isOn = settings.theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onChange({ ...settings, theme: opt.id })}
                    className={`relative rounded-2xl border-2 p-2 text-left transition-all hover:-translate-y-0.5 ${
                      isOn ? 'border-emerald-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    aria-pressed={isOn}
                  >
                    <div className="h-14 rounded-xl border border-slate-300" style={{ background: opt.preview }} />
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      {opt.icon} {opt.label}
                    </div>
                    {isOn && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Motion */}
          <section className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> ลดภาพเคลื่อนไหว
              </h3>
              <p className="text-xs text-slate-500">ปิดเอฟเฟกต์ฝน ฟ้าแลบ ธงโบก และการเลื่อนต่างๆ</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.reduceMotion}
              onClick={() => onChange({ ...settings, reduceMotion: !settings.reduceMotion })}
              className={`shrink-0 relative w-12 h-7 rounded-full transition-colors ${settings.reduceMotion ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.reduceMotion ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </section>

          {/* Local data */}
          <section className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">ข้อมูลในเบราว์เซอร์นี้</h3>
            <p className="text-xs text-slate-500">รีวิวทดลองและโควตา AI ในโหมดทดลองถูกเก็บไว้ในเครื่องนี้เท่านั้น</p>
            <button
              onClick={clearLocalData}
              disabled={cleared}
              className="mt-2.5 h-9 px-3 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {cleared ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
              {cleared ? 'ล้างข้อมูลแล้ว' : 'ล้างข้อมูลทดลอง'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
