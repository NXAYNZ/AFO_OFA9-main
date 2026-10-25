'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, ShieldCheck, QrCode, X, CheckCircle2, Ticket } from 'lucide-react';
import { CommunityTrip } from '@/lib/types';

interface TripTicketProps {
  trip: CommunityTrip;
  // Opens the trip; without it the body is static (e.g. when the stub carries the action)
  onOpen?: () => void;
  // Optional action rendered in the stub (e.g. a join button); the whole ticket stays clickable without it
  action?: React.ReactNode;
  // Set when the ticket sits on a white panel so the perforation notches match it
  onSurface?: boolean;
  onCheckInSuccess?: (tripId: string) => void;
}

// Stable 4-digit ticket number from the trip id, printed like a serial on the stub
export const ticketNumber = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `TS-${String(1000 + (h % 9000))}`;
};

/**
 * Deterministic SVG QR Code Generator (Zero-dependency, crisp vector)
 */
const SvgQrCode: React.FC<{ value: string; size?: number }> = ({ value, size = 160 }) => {
  // Deterministic 21x21 QR-like matrix generator based on input string hash
  const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));

  // Finder pattern helper (7x7)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);   // Top-Left
  drawFinder(0, 14);  // Top-Right
  drawFinder(14, 0);  // Bottom-Left

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data fill derived from hash
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 37 + value.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      // Skip finders
      if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
      if (r === 6 || c === 6) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      matrix[r][c] = (h % 3) !== 0;
    }
  }

  const cellSize = size / 21;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-2 rounded-lg shadow-sm">
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};

// A community trip printed as a travel ticket: photo and itinerary on the body, money on the stub
export const TripTicket: React.FC<TripTicketProps> = ({ trip, onOpen, action, onSurface, onCheckInSuccess }) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const seatsLeft = Math.max(0, trip.totalSlots - trip.joinedSlots);
  const fillPercent = Math.round((trip.joinedSlots / trip.totalSlots) * 100);
  const isFull = seatsLeft === 0;
  const Body = onOpen ? 'button' : 'div';
  const serial = ticketNumber(trip.id);

  const handleSimulateCheckIn = () => {
    setIsCheckedIn(true);
    onCheckInSuccess?.(trip.id);
    setTimeout(() => {
      setShowQrModal(false);
    }, 1500);
  };

  return (
    <>
      <article className={`ticket group flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg ${onSurface ? 'on-surface' : ''}`}>
        <Body {...(onOpen ? { type: "button" as const, onClick: onOpen } : {})} className="text-left flex-1 flex flex-col">
          <div className="relative h-44 overflow-hidden rounded-t-[9px] bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded bg-ink-950/70 px-2 py-1 text-xs font-medium text-white">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </span>
            {trip.imageCredit && (
              <span className="absolute top-2 right-2 max-w-[70%] truncate rounded bg-ink-950/55 px-1.5 py-0.5 text-[10px] text-white/85">
                {trip.imageCredit}
              </span>
            )}
          </div>
          <div className="px-4 pt-4 pb-5 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {trip.travelDates}
            </div>
            <h4 className="mt-1.5 font-display text-lg font-semibold leading-snug text-slate-900 line-clamp-2">{trip.title}</h4>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${fillPercent}%` }} />
              </div>
              <span className={`text-xs font-medium ${isFull ? 'text-rose-600' : 'text-slate-600'}`}>
                {isFull ? 'เต็มแล้ว' : `เหลือ ${seatsLeft} ที่`}
              </span>
            </div>
          </div>
        </Body>

        {/* Stub: the money */}
        <div className="ticket-perf px-4 pt-3.5 pb-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500">มัดจำ Escrow ต่อคน</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-xl font-semibold leading-none text-emerald-700">
                <ShieldCheck className="w-4 h-4" />฿{trip.securityDepositPerPerson.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                title="สแกนเช็คอินตั๋วทริปด้วย QR Code"
                className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                aria-label="QR Code เช็คอิน"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] tracking-wider text-slate-400">{serial}</span>
            </div>
          </div>
          <dl className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between text-xs">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-slate-500">ที่นั่ง</dt>
              <dd className="font-mono font-semibold text-slate-900">{trip.joinedSlots}/{trip.totalSlots}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-slate-500">ค่าทริปต่อคน</dt>
              <dd className="font-mono font-semibold text-slate-900">฿{trip.costPerPerson.toLocaleString()}</dd>
            </div>
          </dl>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </article>

      {/* QR Code Check-in Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Ticket className="w-6 h-6" />
            </div>

            <h3 className="font-display text-xl font-semibold text-slate-900">
              Trip Boarding Pass & QR
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              สแกนเช็คอินหน้างานเพื่อรับสิทธิ์ <span className="font-semibold text-emerald-700">Verified Traveler</span>
            </p>

            <div className="mt-5 flex justify-center">
              <SvgQrCode value={`https://tripsure.ai/checkin/${trip.id}/${serial}`} size={170} />
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">รหัสตั๋ว:</span>
                <span className="font-mono font-bold text-slate-900">{serial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ปลายทาง:</span>
                <span className="font-semibold text-slate-800">{trip.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สัญญา Escrow:</span>
                <span className="text-emerald-700 font-medium">฿{trip.securityDepositPerPerson.toLocaleString()} (ค้ำประกันแล้ว)</span>
              </div>
            </div>

            {isCheckedIn ? (
              <div className="mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                เช็คอินสำเร็จ! คุณได้รับสถานะ Verified Traveler
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateCheckIn}
                className="mt-5 w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                จำลองการสแกนเช็คอินหน้างาน (Check-In)
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
