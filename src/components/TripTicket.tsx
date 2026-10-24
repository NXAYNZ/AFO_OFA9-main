'use client';

import React from 'react';
import { Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { CommunityTrip } from '@/lib/types';

interface TripTicketProps {
  trip: CommunityTrip;
  // Opens the trip; without it the body is static (e.g. when the stub carries the action)
  onOpen?: () => void;
  // Optional action rendered in the stub (e.g. a join button); the whole ticket stays clickable without it
  action?: React.ReactNode;
  // Set when the ticket sits on a white panel so the perforation notches match it
  onSurface?: boolean;
}

// Stable 4-digit ticket number from the trip id, printed like a serial on the stub
export const ticketNumber = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `TS-${String(1000 + (h % 9000))}`;
};

// A community trip printed as a travel ticket: photo and itinerary on the body, money on the stub
export const TripTicket: React.FC<TripTicketProps> = ({ trip, onOpen, action, onSurface }) => {
  const seatsLeft = Math.max(0, trip.totalSlots - trip.joinedSlots);
  const fillPercent = Math.round((trip.joinedSlots / trip.totalSlots) * 100);
  const isFull = seatsLeft === 0;
  const Body = onOpen ? 'button' : 'div';

  return (
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
          <span className="font-mono text-[11px] tracking-wider text-slate-400">{ticketNumber(trip.id)}</span>
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
  );
};
