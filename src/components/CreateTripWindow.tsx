'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ImagePlus,
  Star,
  Trash2,
  MapPin,
  X,
  ShieldCheck,
  BadgeCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { CommunityTrip, SubscriptionTier, TIER_CONFIGS, UserProfile } from '@/lib/types';
import { TripTicket } from '@/components/TripTicket';

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
  'w-full h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors';

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
            ? [...places, 'สัญญา Smart Escrow ค้ำประกันมัดจำ 100%']
            : [
                'สัญญา Smart Escrow ค้ำประกันมัดจำ 100%',
                'ค่าใช้จ่ายหารเฉลี่ยเท่ากัน โปร่งใส',
                'มีตากล้องและเพื่อนร่วมทริปคุณภาพ',
              ],
        imageUrl: photos[0] || FALLBACK_COVER,
        gallery: photos.length ? photos : undefined,
      },
      finalFee
    );
  };

  const cover = photos[0] || FALLBACK_COVER;
  // The card exactly as members will see it once the trip is open
  const previewTrip = {
    id: 'preview',
    title: title.trim() || `ทริปพาเที่ยว ${destination}`,
    destination,
    travelDates: dates,
    totalSlots: slots,
    joinedSlots: 1,
    costPerPerson: cost,
    securityDepositPerPerson: deposit,
    imageUrl: cover,
  } as CommunityTrip;

  // Portalled to <body> so the window sits above the app header and rail
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-[var(--background)] overflow-y-auto animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="create-trip-title">
      {/* Top bar */}
      <header className="app-header sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={onClose}
            className="h-10 pl-2 pr-3 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> กลับ
          </button>
          <span className="h-6 w-px bg-slate-200" aria-hidden />
          <h1 id="create-trip-title" className="font-display text-lg sm:text-xl font-semibold text-slate-900 truncate">
            เปิดทริปชุมชนใหม่
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
        {/* LEFT: form */}
        <div className="space-y-5 min-w-0">
          {/* Photos */}
          <section className="rounded-lg bg-white border border-slate-200 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">รูปสถานที่ท่องเที่ยว</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              สูงสุด {MAX_PHOTOS} รูป · รูปแรกคือรูปปก · ใช้รูปที่คุณถ่ายเองหรือมีสิทธิ์ใช้เท่านั้น
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
              className={`mt-4 rounded-lg border-2 border-dashed transition-colors ${
                dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'
              }`}
            >
              {photos.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-10 flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors"
                >
                  {processing ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImagePlus className="w-8 h-8" strokeWidth={1.6} />}
                  <span className="text-sm font-semibold">ลากรูปมาวาง หรือคลิกเพื่อเลือกรูป</span>
                  <span className="text-xs">JPG, PNG, WEBP · ไม่เกิน 15MB ต่อรูป</span>
                </button>
              ) : (
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((src, i) => (
                    <div key={i} className="group relative aspect-[4/3] rounded-md overflow-hidden bg-slate-200 animate-fadeIn">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`รูปทริป ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-ink-950/75 text-white flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> รูปปก
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeCover(i)}
                            className="h-7 px-2 rounded bg-ink-50 text-[11px] font-semibold text-ink-900 hover:bg-ink-100"
                          >
                            ตั้งเป็นปก
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="w-7 h-7 rounded bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700"
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
                      className="aspect-[4/3] rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                    >
                      {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                      <span className="text-xs font-semibold">เพิ่มรูป ({photos.length}/{MAX_PHOTOS})</span>
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
          <section className="rounded-lg bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900">รายละเอียดทริป</h2>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อทริป</span>
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
                <span className="block text-sm font-medium text-slate-700 mb-1.5">จุดหมายปลายทาง</span>
                <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} required />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">วันเดินทาง</span>
                <input value={dates} onChange={(e) => setDates(e.target.value)} className={inputClass} required />
              </label>
            </div>
            {places.length > 0 && (
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">สถานที่ในทริป (จากแผนที่)</span>
                <div className="flex flex-wrap gap-1.5">
                  {places.map((place) => (
                    <span
                      key={place}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 pl-2 pr-1 py-1 text-xs font-medium text-slate-700"
                    >
                      <MapPin className="w-3 h-3 text-emerald-600" /> {place}
                      <button
                        type="button"
                        onClick={() => setPlaces((prev) => prev.filter((p) => p !== place))}
                        className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        aria-label={`เอา ${place} ออก`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">เล่าเกี่ยวกับทริป (ไม่บังคับ)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="แผนคร่าวๆ จุดนัดพบ สไตล์การเที่ยว สิ่งที่ต้องเตรียม"
                className="w-full px-3 py-2.5 rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-colors"
              />
            </label>
          </section>

          {/* Money */}
          <section className="rounded-lg bg-white border border-slate-200 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">ค่าใช้จ่ายและมัดจำ Escrow</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">จำนวนคน</span>
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
                <span className="block text-sm font-medium text-slate-700 mb-1.5">ค่าทริป/คน (฿)</span>
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
                <span className="block text-sm font-medium text-slate-700 mb-1.5">มัดจำ/คน (฿)</span>
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
            <p className="mt-3 text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              เงินมัดจำของทุกคนถูกล็อกใน Escrow จนถึงวันเดินทาง ใครเทโดนหัก 10% (5% แพลตฟอร์ม + 5% ชดเชยเพื่อนในกลุ่ม)
            </p>
          </section>
        </div>

        {/* RIGHT: host account, preview, fee */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Host account */}
          <section className="rounded-lg bg-white border border-slate-200 p-5">
            <h2 className="font-display text-lg font-semibold text-slate-900">ผู้เปิดทริป</h2>
            <div className="mt-3 flex items-center gap-3">
              {host.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={host.avatarUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-md bg-ink-900 text-white font-display text-xl font-semibold flex items-center justify-center">
                  {host.fullName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-1">
                  {host.nickname || host.fullName}
                  {host.isVerified && <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
                <div className="text-xs text-slate-500 truncate">{host.fullName}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Trust {host.trustScore} · มาตามนัด {host.attendanceRate}% · <span className="font-semibold text-amber-700">{currentTier}</span>
                </div>
              </div>
            </div>
            {!isMember && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 leading-relaxed">
                ตอนนี้ใช้บัญชีทดลอง เข้าสู่ระบบและสร้างโปรไฟล์ก่อน เพื่อเปิดทริปในชื่อของคุณเอง
              </p>
            )}
          </section>

          {/* Live preview */}
          <section>
            <h2 className="mb-2 text-xs font-medium text-slate-500">ตัวอย่างตั๋วทริปที่สมาชิกจะเห็น</h2>
            <TripTicket trip={previewTrip} />
          </section>

          {/* Fee + submit */}
          <section className="rounded-lg bg-white border border-slate-200 p-5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>เป้าหมายงบรวมทริป</span>
              <span className="font-mono">฿{pool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 mt-1.5">
              <span>ค่าธรรมเนียมคุ้มครองระบบ (3.5%)</span>
              <span className="font-mono">฿{baseFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 mt-1.5">
              <span>ส่วนลดระดับ {currentTier} ({tierConfig.creationFeeDiscountPercent}%)</span>
              <span className="font-mono">-฿{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-semibold pt-3 mt-3 border-t border-slate-200">
              <span>ค่าธรรมเนียมสุทธิ</span>
              <span className="font-mono text-lg">฿{finalFee.toLocaleString()}</span>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="mt-5 w-full h-12 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              เปิดทริปและชำระค่าธรรมเนียม
            </button>
            <button type="button" onClick={onClose} className="mt-2 w-full h-10 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">
              ยกเลิก
            </button>
          </section>
        </aside>
      </form>
    </div>,
    document.body
  );
};
