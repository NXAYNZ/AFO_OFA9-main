'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2, Mail, MapPin, ShieldCheck, Trophy, CalendarCheck, Save, UserRound, Info, Check } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { ProfileFormData, TRAVEL_STYLE_OPTIONS } from '@/lib/auth';
import { stripEmoji } from '@/lib/text';

interface ProfileModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  email: string;
  initialData: ProfileFormData;
  // Opened from "join trip": full name and nickname are both required
  requiredForJoin?: boolean;
  // Existing profile, used to show trust stats in edit mode
  profile?: UserProfile | null;
  onClose: () => void;
  onSave: (form: ProfileFormData) => Promise<string | null>;
}

const PROVINCES = [
  'กรุงเทพมหานคร', 'เชียงใหม่', 'เชียงราย', 'ภูเก็ต', 'ชลบุรี', 'ระยอง', 'ขอนแก่น', 'นครราชสีมา',
  'สงขลา', 'สุราษฎร์ธานี', 'กระบี่', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'อุดรธานี', 'พิษณุโลก',
];

const BIO_MAX = 300;

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  mode,
  email,
  initialData,
  requiredForJoin = false,
  profile,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<ProfileFormData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Reset the form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialData);
      setError(null);
      setAvatarBroken(false);
      setIsShaking(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const update = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStyle = (style: string) => {
    update(
      'travelStyles',
      form.travelStyles.includes(style)
        ? form.travelStyles.filter((s) => s !== style)
        : [...form.travelStyles, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      setIsShaking(true);
      return;
    }
    if (requiredForJoin && !form.nickname.trim()) {
      setError('กรุณากรอกชื่อเล่น เพื่อแสดงในรายชื่อสมาชิกของทริป');
      setIsShaking(true);
      return;
    }
    setIsSaving(true);
    setError(null);
    const err = await onSave(form);
    setIsSaving(false);
    if (err) setError(err);
  };

  const initials = (form.nickname || form.fullName || email).trim().charAt(0).toUpperCase();
  const inputClass =
    'w-full h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';
  // Glow on required fields that are still empty (stops while typing in them)
  const needsFullName = requiredForJoin && !form.fullName.trim();
  const needsNickname = requiredForJoin && !form.nickname.trim();
  const attention = 'animate-attention focus:animate-none';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink-950/70 animate-backdropIn">
      <div
        className={`w-full max-w-2xl ${isShaking ? 'animate-shake' : ''}`}
        onAnimationEnd={(e) => {
          if (e.animationName === 'shake-x') setIsShaking(false);
        }}
      >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="relative w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl animate-popIn"
      >
        {/* Cover + avatar */}
        <div className="h-24 bg-ink-900 rounded-t-xl" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-md text-white/80 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
          aria-label="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 sm:px-8 pb-8">
          <div className="flex items-end gap-4 -mt-10">
            {form.avatarUrl && !avatarBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setAvatarBroken(true)}
                className="w-20 h-20 rounded-lg object-cover ring-4 ring-white bg-slate-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg ring-4 ring-white bg-emerald-600 flex items-center justify-center font-display text-3xl font-semibold text-white">
                {initials || <UserRound className="w-10 h-10" />}
              </div>
            )}
            <div className="pb-1 min-w-0">
              <h3 id="profile-title" className="font-display text-2xl font-semibold text-slate-900">
                {mode === 'create' ? 'สร้างโปรไฟล์ของคุณ' : 'แก้ไขโปรไฟล์'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {email}
              </p>
            </div>
          </div>

          {requiredForJoin ? (
            <div className="mt-5 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 flex items-start gap-3 animate-fadeIn">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
              <span>
                <strong>สร้างโปรไฟล์ก่อนเข้าร่วมทริป</strong> — กรอก <strong>ชื่อ-นามสกุล</strong> และ <strong>ชื่อเล่น</strong>{' '}
                เพื่อแสดงในรายชื่อสมาชิกที่วางเงินค้ำประกัน
              </span>
            </div>
          ) : mode === 'create' && (
            <p className="mt-5 text-sm text-slate-600">
              ยินดีต้อนรับ กรอกข้อมูลสั้นๆ ให้เพื่อนร่วมทริปรู้จักคุณมากขึ้น (แก้ไขภายหลังได้เสมอ)
            </p>
          )}

          {/* Trust stats (edit mode) */}
          {mode === 'edit' && profile && (
            <dl className="mt-6 grid grid-cols-3 border-y border-slate-200 divide-x divide-slate-200">
              <div className="py-3 px-2 text-center">
                <dd className="font-mono text-xl font-semibold text-slate-900">{profile.trustScore}</dd>
                <dt className="mt-0.5 flex items-center justify-center gap-1 text-xs text-slate-500"><ShieldCheck className="w-3.5 h-3.5" /> ความน่าเชื่อถือ</dt>
              </div>
              <div className="py-3 px-2 text-center">
                <dd className="font-mono text-xl font-semibold text-slate-900">{profile.attendanceRate}%</dd>
                <dt className="mt-0.5 flex items-center justify-center gap-1 text-xs text-slate-500"><CalendarCheck className="w-3.5 h-3.5" /> มาตามนัด</dt>
              </div>
              <div className="py-3 px-2 text-center">
                <dd className="font-mono text-xl font-semibold text-slate-900">{profile.tripsCompleted}</dd>
                <dt className="mt-0.5 flex items-center justify-center gap-1 text-xs text-slate-500"><Trophy className="w-3.5 h-3.5" /> ทริปสำเร็จ</dt>
              </div>
            </dl>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ชื่อ-นามสกุล <span className="text-rose-500">*</span>
              </span>
              <input
                className={`${inputClass} mt-1.5 ${needsFullName ? attention : ''}`}
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                maxLength={80}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ชื่อเล่น {requiredForJoin && <span className="text-rose-500">*</span>}
              </span>
              <input
                className={`${inputClass} mt-1.5 ${needsNickname ? attention : ''}`}
                value={form.nickname}
                onChange={(e) => update('nickname', e.target.value)}
                placeholder="เช่น ต้น"
                maxLength={30}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> จังหวัดที่อยู่
              </span>
              <input
                className={`${inputClass} mt-1.5`}
                value={form.homeProvince}
                onChange={(e) => update('homeProvince', e.target.value)}
                placeholder="พิมพ์หรือเลือกจังหวัด"
                list="tripsure-provinces"
                maxLength={50}
              />
              <datalist id="tripsure-provinces">
                {PROVINCES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700 flex justify-between">
                <span>แนะนำตัวสั้นๆ</span>
                <span className="font-normal text-slate-500">
                  {form.bio.length}/{BIO_MAX}
                </span>
              </span>
              <textarea
                className={`${inputClass} mt-1.5 h-24 py-2.5 resize-none`}
                value={form.bio}
                onChange={(e) => update('bio', e.target.value.slice(0, BIO_MAX))}
                placeholder="ชอบเที่ยวแบบไหน ตรงต่อเวลาแค่ไหน อยากหาเพื่อนร่วมทริปสไตล์ไหน..."
              />
            </label>
          </div>

          <div className="mt-5">
            <span className="text-sm font-medium text-slate-700">สไตล์การเที่ยว (เลือกได้หลายข้อ)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRAVEL_STYLE_OPTIONS.map((style) => {
                const isSelected = form.travelStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => toggleStyle(style)}
                    aria-pressed={isSelected}
                    className={`h-9 px-3 rounded-md text-sm border inline-flex items-center gap-1.5 transition-colors duration-150 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {stripEmoji(style)}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mt-5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-4 py-2.5 animate-fadeIn" role="alert">{error}</p>
          )}

          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mode === 'create' ? 'ไว้ทีหลัง' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {mode === 'create' ? 'สร้างโปรไฟล์' : 'บันทึก'}
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};
