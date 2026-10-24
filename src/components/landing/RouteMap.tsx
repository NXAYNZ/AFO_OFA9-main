'use client';

import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Stop, mapsDirectionsUrl } from './plannerData';

// Route preview drawn from the day's coordinates, so it renders instantly without a maps API key
export const RouteMap: React.FC<{ stops: Stop[]; approx: boolean }> = ({ stops, approx }) => {
  const W = 300;
  const H = 190;
  const pad = 34;
  const lats = stops.map((s) => s.lat);
  const lons = stops.map((s) => s.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const spanLat = Math.max(maxLat - minLat, 0.01);
  const spanLon = Math.max(maxLon - minLon, 0.01);
  const pts = stops.map((s) => ({
    x: pad + ((s.lon - minLon) / spanLon) * (W - pad * 2),
    y: H - pad - ((s.lat - minLat) / spanLat) * (H - pad * 2),
  }));
  // Gentle curve between consecutive stops
  const path = pts
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2 + (p.y - prev.y) * 0.25;
      const cy = (prev.y + p.y) / 2 - (p.x - prev.x) * 0.25;
      return `Q${cx},${cy} ${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-tsn-200 bg-tsn-0 overflow-hidden">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label={`เส้นทาง ${stops.map((s) => s.name).join(' ไป ')}`}>
          <rect width={W} height={H} fill="#EAF2FF" />
          {/* Terrain: soft hills and a river so the preview reads as a map */}
          <path d={`M0 ${H * 0.72} C ${W * 0.2} ${H * 0.58}, ${W * 0.4} ${H * 0.8}, ${W * 0.62} ${H * 0.66} S ${W * 0.9} ${H * 0.6}, ${W} ${H * 0.7} L ${W} ${H} L 0 ${H} Z`} fill="#DCEFE3" />
          <path d={`M${W * 0.08} 0 C ${W * 0.2} ${H * 0.3}, ${W * 0.1} ${H * 0.55}, ${W * 0.3} ${H}`} stroke="#BFDBFE" strokeWidth={6} fill="none" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`v${i}`} x1={(W / 6) * i} y1={0} x2={(W / 6) * i} y2={H} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(H / 4) * i} x2={W} y2={(H / 4) * i} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1} />
          ))}
          <path d={path} fill="none" stroke="#0057FF" strokeOpacity={0.18} strokeWidth={7} strokeLinecap="round" />
          <path className="route-ants" d={path} fill="none" stroke="#0057FF" strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round" />
          {pts.map((p, i) => (
            <g key={stops[i].id} transform={`translate(${p.x} ${p.y})`}>
              {i === 0 && <circle className="pin-pulse" r={9} fill="#0057FF" />}
              <g className="pin-drop" style={{ '--i': i } as React.CSSProperties}>
              <path d="M0 0 C -9 -10, -9 -22, 0 -24 C 9 -22, 9 -10, 0 0 Z" fill={i === 0 ? '#0057FF' : '#1D4ED8'} stroke="#FFFFFF" strokeWidth={1.5} />
              <text y={-13} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFFFFF">
                {i + 1}
              </text>
              </g>
            </g>
          ))}
        </svg>
        {approx && <span className="absolute top-2 left-2 rounded-full bg-tsn-0/90 px-2 py-0.5 text-[10px] text-tsn-500">ตำแหน่งโดยประมาณ</span>}
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {stops.slice(0, 3).map((s, i) => (
          <div key={s.id} style={{ '--i': i } as React.CSSProperties} className="stop-in group relative h-14 rounded-lg overflow-hidden bg-tsb-50">
            {s.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.img} alt={s.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-1 text-[10px] text-tsb-700 text-center leading-tight">{s.name}</div>
            )}
            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-tsb-600 text-tsn-0 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="px-2 pb-2">
        <a
          href={mapsDirectionsUrl(stops)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-9 rounded-full border border-tsb-200 text-tsb-700 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-tsb-50 transition-colors"
        >
          <MapIcon className="w-4 h-4" /> ดูบนแผนที่
        </a>
      </div>
    </div>
  );
};
