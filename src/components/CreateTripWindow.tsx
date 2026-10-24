'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  Star,
  Trash2,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  BadgeCheck,
  Loader2,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { CommunityTrip, SubscriptionTier, TIER_CONFIGS, UserProfile } from '@/lib/types';

export interface TripSeed {
  title: string;
  destination: string;
  places: string[];
}

interface CreateTripWindowProps {
  isOpen: boolean;
  seed: TripSeed;
  host: UserProfile;
  // false = demo account (not signed in / no member profile yet)
  isMember: boolean;
  currentTier: SubscriptionTier;
  onClose: () => void;
  onSubmit: (trip: Partial<CommunityTrip>, finalFee: number) => void;
}

const MAX_PHOTOS = 6;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

// Downscale in the browser so trips stay light (max 1600px, JPEG)
const resizeImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('อ่านไฟล์รูปไม่ได้'));
    };
    img.src = url;
  });

const inputClass =
  'w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all';

export const CreateTripWindow: React.FC<CreateTripWindowProps> = ({
  isOpen,
  seed,
  host,
  isMember,
  currentTier,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(seed.title);
  const [destination, setDestination] = useState(seed.destination);
  const [places, setPlaces] = useState<string[]>(seed.places);
  const [dates, setDates] = useState('28 - 29 พ.ย. 2026');
  const [slots, setSlots] = useState(6);
  const [cost, setCost] = useState(2500);
  const [deposit, setDeposit] = useState(1000);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fresh form each time the window opens with a new seed
  useEffect(() => {
    if (!isOpen) return;
    setTitle(seed.title);
    setDestination(seed.destination);
    setPlaces(seed.places);
    setPhotos([]);
    setPhotoError(null);
    setDescription('');
  }, [isOpen, seed]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tierConfig = TIER_CONFIGS[currentTier];
  const pool = slots * cost;
  const baseFee = Math.round(pool * 0.035);
  const discount = Math.round(baseFee * (tierConfig.creationFeeDiscountPercent / 100));
  const finalFee = baseFee - discount;

  const addFiles = async (files: FileList | File[]) => {
    setPhotoError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) {
      setPhotoError('รองรับเฉพาะไฟล์รูปภาพ');
      return;
    }
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`อัปโหลดได้สูงสุด ${MAX_PHOTOS} รูป`);
      return;
    }
    const tooBig = list.filter((f) => f.size > MAX_INPUT_BYTES);
    const usable = list.filter((f) => f.size <= MAX_INPUT_BYTES).slice(0, room);
    setProcessing(true);
    try {
      const resized = await Promise.all(usable.map(resizeImage));
      setPhotos((prev) => [...prev, ...resized].slice(0, MAX_PHOTOS));
      if (tooBig.length) setPhotoError(`ข้าม ${tooBig.length} ไฟล์ที่ใหญ่เกิน 15MB`);
      else if (list.length > room) setPhotoError(`เพิ่มได้อีกแค่ ${room} รูป (สูงสุด ${MAX_PHOTOS})`);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setProcessing(false);
    }
  };

  const makeCover = (i: number) => setPhotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)]);
  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || `ทริปพาเที่ยว ${destination}`;
    onSubmit(
      {
        title: finalTitle,
        destination,
        travelDates: dates,
        totalSlots: slots,
        joinedSlots: 1,
        costPerPerson: cost,
        securityDepositPerPerson: deposit,
        description: description.trim() || undefined,
        highlights:
          places.length > 0
            ? [...places.map((p) => `📍 ${p}`), '🛡️ สัญญา Smart Escrow ค้ำประกันมัดจำ 100%']
            : [
                '🛡️ สัญญา Smart Escrow ค้ำประกันมัดจำ 100%',
                '🚐 ค่าใช้จ่ายหารเฉลี่ยเท่ากัน โปร่งใส',
                '📸 มีตากล้องและเพื่อนร่วมทริปคุณภาพ',
              ],
        imageUrl: photos[0] || FALLBACK_COVER,
        gallery: photos.length ? photos : undefined,
      },
      finalFee
    );
  };

  const cover = photos[0] || FALLBACK_COVER;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 overflow-y-auto animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="create-trip-title">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={onClose}
            className="h-10 pl-2 pr-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> กลับ
          </button>
          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
            <PlusCircle className="w-5 h-5" />
          </span>
          <h1 id="create-trip-title" className="text-base sm:text-xl font-black text-slate-900 truncate">
            สร้างทริปชุมชนใหม่ด้วยคุณเอง (Smart Escrow)
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* LEFT: form */}
        <div className="space-y-5 min-w-0">
          {/* Photos */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-slate-900">1. รูปสถานที่ท่องเที่ยว</h2>
            <p className="text-xs text-slate-500">
              สูงสุด {MAX_PHOTOS} รูป • รูปแรกคือรูปปก • ใช้รูปที่คุณถ่ายเองหรือมีสิทธิ์ใช้เท่านั้น
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`mt-4 rounded-2xl border-2 border-dashed transition-colors ${
                dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
              }`}
            >
              {photos.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-10 flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors"
                >
                  {processing ? <Loader2 className="w-10 h-10 animate-spin" /> : <ImagePlus className="w-10 h-10" />}
                  <span className="text-sm font-bold">ลากรูปมาวาง หรือคลิกเพื่อเลือกรูป</span>
                  <span className="text-[11px]">JPG, PNG, WEBP • ไม่เกิน 15MB ต่อรูป</span>
                </button>
              ) : (
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((src, i) => (
                    <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 animate-fadeIn">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`รูปทริป ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" /> รูปปก
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeCover(i)}
                            className="h-7 px-2 rounded-lg bg-white/90 text-[11px] font-bold text-slate-800 hover:bg-white"
                          >
                            ตั้งเป็นปก
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500"
                          aria-label={`ลบรูปที่ ${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
                    >
                      {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                      <span className="text-xs font-bold">เพิ่มรูป ({photos.length}/{MAX_PHOTOS})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {photoError && (
              <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {photoError}
              </p>
            )}
          </section>

          {/* Details */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">2. รายละเอียดทริป</h2>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1">ชื่อทริป</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ทริปดำน้ำเกาะล้าน 2 วัน 1 คืน นอนวิลล่า"
                maxLength={80}
                className={inputClass}
                required
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1">จุดหมายปลายทาง</span>
                <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} required />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1">วันเดินทาง</span>
                <input value={dates} onChange={(e) => setDates(e.target.value)} className={inputClass} required />
              </label>
            </div>
            {places.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1">สถานที่ในทริป (จากแผนที่)</span>
                <div className="flex flex-wrap gap-1.5">
                  {places.map((place) => (
                    <span
                      key={place}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-800"
                    >
                      📍 {place}
                      <button
                        type="button"
                        onClick={() => setPlaces((prev) => prev.filter((p) => p !== place))}
                        className="text-indigo-400 hover:text-rose-600"
                        aria-label={`เอา ${place} ออก`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1">เล่าเกี่ยวกับทริป (ไม่บังคับ)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="แผนคร่าวๆ จุดนัดพบ สไตล์การเที่ยว สิ่งที่ต้องเตรียม"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 resize-none transition-all"
              />
            </label>
          </section>

          {/* Money */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-slate-900">3. ค่าใช้จ่าย & มัดจำ Escrow</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1">จำนวนคน</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={slots}
                  onChange={(e) => setSlots(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
                  className={`${inputClass} font-mono`}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1">ค่าทริป/คน (฿)</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={cost}
                  onChange={(e) => setCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`${inputClass} font-mono`}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 mb-1">มัดจำ/คน (฿)</span>
                <input
                  type="number"
                  min={0}
                  step={200}
                  value={deposit}
                  onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`${inputClass} font-mono`}
                />
              </label>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              เงินมัดจำของทุกคนถูกล็อกใน Escrow จนถึงวันเดินทาง ใครเทโดนหัก 10% (5% แพลตฟอร์ม + 5% ชดเชยเพื่อนในกลุ่ม)
            </p>
          </section>
        </div>

        {/* RIGHT: host account, preview, fee */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Host account */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">บัญชีผู้เปิดทริป</h2>
            <div className="mt-3 flex items-center gap-3">
              {host.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={host.avatarUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 text-xl font-black flex items-center justify-center">
                  {host.fullName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 truncate flex items-center gap-1">
                  {host.nickname || host.fullName}
                  {host.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 truncate">{host.fullName}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ความน่าเชื่อถือ {host.trustScore}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    ไปตามนัด {host.attendanceRate}%
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {currentTier}
                  </span>
                </div>
              </div>
            </div>
            {!isMember && (
              <p className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                ตอนนี้ใช้บัญชีทดลอง เข้าสู่ระบบและสร้างโปรไฟล์ก่อน เพื่อเปิดทริปในชื่อของคุณเอง
              </p>
            )}
          </section>

          {/* Live preview */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-36 bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="ตัวอย่างรูปปก" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white">ตัวอย่างการ์ดทริป</span>
            </div>
            <div className="p-4">
              <div className="font-extrabold text-slate-900 leading-snug">{title.trim() || `ทริปพาเที่ยว ${destination}`}</div>
              <div className="mt-1.5 space-y-0.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {destination}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {dates}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 1/{slots} คน • ฿{cost.toLocaleString()}/คน</div>
              </div>
            </div>
          </section>

          {/* Fee + submit */}
          <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>เป้าหมายงบรวมทริป</span>
              <span className="font-mono font-bold">฿{pool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 mt-1">
              <span>ค่าธรรมเนียมคุ้มครองระบบ (3.5%)</span>
              <span className="font-mono font-bold">฿{baseFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 mt-1">
              <span>ส่วนลดระดับ {currentTier} ({tierConfig.creationFeeDiscountPercent}%)</span>
              <span className="font-mono font-bold">-฿{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold pt-2 mt-2 border-t border-slate-200 text-sm">
              <span>ค่าธรรมเนียมสุทธิ</span>
              <span className="font-mono text-indigo-700">฿{finalFee.toLocaleString()}</span>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="btn-shine mt-4 w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              เปิดทริปและชำระค่าธรรมเนียม
            </button>
            <button type="button" onClick={onClose} className="mt-2 w-full h-10 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
              ยกเลิก
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
};
