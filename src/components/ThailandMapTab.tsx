'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Plus,
  Check,
  ExternalLink,
  Sparkles,
  Users,
  Trash2,
  MousePointerClick,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Luggage,
  Accessibility,
} from 'lucide-react';
import { useMapZoom, Bounds } from '@/lib/useMapZoom';
import { placeImages } from '@/lib/placeImages';
import { accessibilityOf, WHEELCHAIR_META } from '@/data/placeAccessibility';
import { PROVINCE_SHAPES, THAILAND_VIEWBOX } from '@/data/thailandMap';
import { PROVINCE_TRAVEL, ProvinceTravel, RegionId, AttractionCategory } from '@/data/thailandTravel';
import { REGION_META, CATEGORY_META, REGION_ORDER, mapsSearchUrl } from '@/lib/travelMeta';
import { ProvinceDetailModal } from '@/components/ProvinceDetailModal';
import { useRegionTop, RegionTopPanel, RANK_COLORS } from '@/components/RegionTopPlaces';
import { QuickAiPlan } from '@/components/QuickAiPlan';
import { PlannerPresetOptions } from '@/lib/types';
import { Reviewer } from '@/lib/placeReviews';

interface ThailandMapTabProps {
  onPlanWithAi: (
    province: string,
    places: string[],
    totalBudget?: number,
    people?: number,
    options?: PlannerPresetOptions
  ) => void;
  onCreateCommunityTrip: (title: string, destination: string, places: string[]) => void;
  reviewer: Reviewer | null;
}

interface BasketItem {
  name: string;
  province: string;
}

// The AI planner accepts at most this many must-visit places
const MAX_BASKET = 15;

const DIM_FILL = '#e9e7e0';

const [, , MAP_W, MAP_H] = THAILAND_VIEWBOX.split(' ').map(Number);

// Zoom level when a region is picked (centred on the region)
const REGION_ZOOM: Record<RegionId, number> = {
  east: 4.7,
  central: 3.6,
  north: 2.6,
  south: 1.9,
  northeast: 2.9,
};

// Province names appear once zoomed past this scale, and only where they fit on screen
const LABEL_MIN_SCALE = 1.6;
const LABEL_MIN_WIDTH_PX = 34;
// On-screen label size grows with zoom: ~11px at 1.6x up to 20px when zoomed far in
const labelPx = (k: number) => Math.min(20, 11 + (k - LABEL_MIN_SCALE) * 2.6);

// Bounding box of an absolute M/L/Z path
const pathBounds = (d: string): Bounds => {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let i = 0; i + 1 < nums.length; i += 2) {
    b.minX = Math.min(b.minX, nums[i]);
    b.maxX = Math.max(b.maxX, nums[i]);
    b.minY = Math.min(b.minY, nums[i + 1]);
    b.maxY = Math.max(b.maxY, nums[i + 1]);
  }
  return b;
};

const mergeBounds = (list: Bounds[]): Bounds => ({
  minX: Math.min(...list.map((b) => b.minX)),
  minY: Math.min(...list.map((b) => b.minY)),
  maxX: Math.max(...list.map((b) => b.maxX)),
  maxY: Math.max(...list.map((b) => b.maxY)),
});

const mapsUrl = (place: string, province: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place} ${province}`)}`;

export const ThailandMapTab: React.FC<ThailandMapTabProps> = ({ onPlanWithAi, onCreateCommunityTrip, reviewer }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flip: false, maxTop: Infinity });
  // Random attraction photo for the hovered province, re-rolled on every new hover
  const [hoverPhoto, setHoverPhoto] = useState<{ province: string; place: string; src: string } | null>(null);
  const brokenPhotos = useRef(new Set<string>());
  const [selected, setSelected] = useState<string | null>(null);
  // Province whose full detail window (photos, weather, crowd, budget) is open
  const [detailProvince, setDetailProvince] = useState<string | null>(null);
  const closeDetail = useCallback(() => setDetailProvince(null), []);
  const [detailPlace, setDetailPlace] = useState<string | null>(null);
  const openProvince = (name: string, place: string | null = null) => {
    setSelected(name);
    setDetailPlace(place);
    setDetailProvince(name);
  };
  const [regionFilter, setRegionFilter] = useState<RegionId | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<AttractionCategory | null>(null);
  const [query, setQuery] = useState('');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [basketFullMsg, setBasketFullMsg] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoom = useMapZoom(svgRef, MAP_W, MAP_H);
  const k = zoom.scale;

  const travelByName = useMemo(() => new Map(PROVINCE_TRAVEL.map((p) => [p.name, p])), []);
  const shapeByName = useMemo(() => new Map(PROVINCE_SHAPES.map((s) => [s.name, s])), []);
  const boundsByName = useMemo(() => new Map(PROVINCE_SHAPES.map((s) => [s.name, pathBounds(s.d)])), []);
  const regionBounds = (region: RegionId) =>
    mergeBounds(PROVINCE_TRAVEL.filter((p) => p.region === region).map((p) => boundsByName.get(p.name)!));

  const regionTop = useRegionTop(regionFilter);
  // Provinces holding a top-3 place of the selected region -> their ranks (crown markers)
  const crownProvinces = useMemo(() => {
    const ranks = new Map<string, number[]>();
    regionTop.top.forEach((t, i) => ranks.set(t.province, [...(ranks.get(t.province) ?? []), i]));
    // The red goal flag replaces the crown on the selected province
    return Array.from(ranks.entries()).filter(([name]) => name !== selected);
  }, [regionTop.top, selected]);

  const toggleRegion = (region: RegionId) => {
    if (regionFilter === region) {
      setRegionFilter(null);
      zoom.reset();
    } else {
      setRegionFilter(region);
      const b = regionBounds(region);
      zoom.zoomToPoint((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, REGION_ZOOM[region]);
    }
  };
  const totalAttractions = useMemo(() => PROVINCE_TRAVEL.reduce((sum, p) => sum + p.attractions.length, 0), []);

  // Region label positions: average of each region's province centroids
  const regionLabels = useMemo(
    () =>
      REGION_ORDER.map((region) => {
        const shapes = PROVINCE_TRAVEL.filter((p) => p.region === region).map((p) => shapeByName.get(p.name)!);
        return {
          region,
          x: shapes.reduce((s, sh) => s + sh.cx, 0) / shapes.length,
          y: shapes.reduce((s, sh) => s + sh.cy, 0) / shapes.length,
        };
      }),
    [shapeByName]
  );

  const q = query.trim().toLowerCase();

  // A province is "active" when it passes the region / category / search filters
  const isActive = (p: ProvinceTravel) => {
    if (regionFilter && p.region !== regionFilter) return false;
    if (categoryFilter && !p.attractions.some((a) => a.category === categoryFilter)) return false;
    if (q) {
      const inProvince = p.name.includes(q) || p.nameEn.toLowerCase().includes(q);
      const inAttraction = p.attractions.some((a) => a.name.toLowerCase().includes(q));
      if (!inProvince && !inAttraction) return false;
    }
    return true;
  };
  const hasFilter = Boolean(regionFilter || categoryFilter || q);

  const searchResults = useMemo(() => {
    if (!q) return [];
    const results: { label: string; province: string; isProvince: boolean }[] = [];
    for (const p of PROVINCE_TRAVEL) {
      if (p.name.includes(q) || p.nameEn.toLowerCase().includes(q)) {
        results.push({ label: p.name, province: p.name, isProvince: true });
      }
      for (const a of p.attractions) {
        if (a.name.toLowerCase().includes(q)) results.push({ label: a.name, province: p.name, isProvince: false });
      }
    }
    return results.slice(0, 8);
  }, [q]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // The photo makes the tooltip ~360px tall; keep it inside the map box
    setTooltipPos({ x, y, flip: x > rect.width - 270, maxTop: rect.height - 370 });
  };

  useEffect(() => {
    if (!hovered) {
      setHoverPhoto(null);
      return;
    }
    const travel = travelByName.get(hovered);
    const options =
      travel?.attractions.flatMap((a) =>
        placeImages(hovered, a.name)
          .filter((src) => !brokenPhotos.current.has(src))
          .map((src) => ({ province: hovered, place: a.name, src }))
      ) ?? [];
    setHoverPhoto(options.length ? options[Math.floor(Math.random() * options.length)] : null);
  }, [hovered, travelByName]);

  const inBasket = (name: string, province: string) => basket.some((b) => b.name === name && b.province === province);

  const toggleBasket = (name: string, province: string) => {
    if (inBasket(name, province)) {
      setBasket((prev) => prev.filter((b) => !(b.name === name && b.province === province)));
      setBasketFullMsg(false);
      return;
    }
    if (basket.length >= MAX_BASKET) {
      setBasketFullMsg(true);
      return;
    }
    setBasket((prev) => [...prev, { name, province }]);
  };

  const addAllFromProvince = (p: ProvinceTravel) => {
    const toAdd = p.attractions.filter((a) => !inBasket(a.name, p.name)).map((a) => ({ name: a.name, province: p.name }));
    const room = MAX_BASKET - basket.length;
    setBasket((prev) => [...prev, ...toAdd.slice(0, room)]);
    setBasketFullMsg(toAdd.length > room);
  };

  const basketProvinces = Array.from(new Set(basket.map((b) => b.province)));
  const basketPlaces = basket.map((b) => b.name);

  const handlePlanWithAi = () => {
    if (basket.length === 0) return;
    onPlanWithAi(basketProvinces.join(', '), basketPlaces);
  };

  const handleCreateTrip = () => {
    if (basket.length === 0) return;
    const more = basketPlaces.length > 2 ? ` และอีก ${basketPlaces.length - 2} ที่` : '';
    const title = `ทริปเที่ยว${basketProvinces.join('-')}: ${basketPlaces.slice(0, 2).join(', ')}${more}`;
    onCreateCommunityTrip(title, basketProvinces.map((p) => `จ.${p}`).join(', '), basketPlaces);
  };

  const hoveredTravel = hovered ? travelByName.get(hovered) : null;
  const selectedTravel = selected ? travelByName.get(selected) : null;
  const hoveredShape = hovered ? shapeByName.get(hovered) : null;
  const selectedShape = selected ? shapeByName.get(selected) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">แผนที่เที่ยวทั่วไทย</h2>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
            <span className="font-medium text-slate-900">77 จังหวัด · {totalAttractions} แหล่งท่องเที่ยว · 5 ภูมิภาค</span> ชี้ที่จังหวัดเพื่อดูแหล่งท่องเที่ยวเด่น คลิกเพื่อดูรายละเอียด แล้วเลือกสถานที่ลง &ldquo;ทริปของฉัน&rdquo;
            เพื่อให้ AI วางแผน หรือเปิดเป็นทริปชุมชนได้ทันที
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 h-11 px-3 rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาจังหวัดหรือสถานที่ เช่น ภูกระดึง, เกาะ, น่าน"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none text-slate-800"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700" aria-label="ล้างคำค้นหา">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1.5 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
              {searchResults.map((r) => (
                <li key={`${r.province}-${r.label}`}>
                  <button
                    onClick={() => {
                      openProvince(r.province);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left text-sm hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${r.isProvince ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="truncate font-medium text-slate-800">{r.label}</span>
                    </span>
                    {!r.isProvince && <span className="text-xs text-slate-500 shrink-0">จ.{r.province}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_META) as AttractionCategory[]).map((cat) => {
            const isOn = categoryFilter === cat;
            const Icon = CATEGORY_META[cat].icon;
            return (
              <button
                key={cat}
                aria-pressed={isOn}
                onClick={() => setCategoryFilter(isOn ? null : cat)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border inline-flex items-center gap-1.5 transition-colors duration-150 ${
                  isOn
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-ink-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                {CATEGORY_META[cat].label}
              </button>
            );
          })}
          {hasFilter && (
            <button
              onClick={() => {
                if (regionFilter) zoom.reset();
                setRegionFilter(null);
                setCategoryFilter(null);
                setQuery('');
              }}
              className="h-8 px-2.5 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        {/* MAP */}
        <div className="rounded-xl bg-sky-50 border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {REGION_ORDER.map((region) => {
              const meta = REGION_META[region];
              const isOn = regionFilter === region;
              return (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  aria-pressed={isOn}
                  className={`on-light flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold border transition-colors duration-150 ${
                    isOn ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: meta.fill }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          <div ref={mapRef} className="relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHovered(null)}>
            <svg
              ref={svgRef}
              viewBox={zoom.viewBox}
              className={`w-full max-h-[78vh] mx-auto select-none ${k > 1.01 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              // Only take over touch gestures once zoomed, so the page still scrolls on phones
              style={{ touchAction: k > 1.01 ? 'none' : 'pan-x pan-y' }}
              role="img"
              aria-label="แผนที่ประเทศไทย 77 จังหวัด"
              {...zoom.handlers}
            >
              {PROVINCE_SHAPES.map((shape) => {
                const travel = travelByName.get(shape.name)!;
                const meta = REGION_META[travel.region];
                const active = isActive(travel);
                const isHover = hovered === shape.name;
                return (
                  <path
                    key={shape.name}
                    d={shape.d}
                    className="map-province"
                    fill={!active ? DIM_FILL : isHover || selected === shape.name ? meta.hover : meta.fill}
                    stroke="#ffffff"
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    onMouseEnter={() => setHovered(shape.name)}
                    onClick={() => {
                      if (!zoom.consumeDrag()) openProvince(shape.name);
                    }}
                  >
                    <title>{shape.name}</title>
                  </path>
                );
              })}

              {/* Selected outline */}
              {selectedShape && (
                <path
                  d={selectedShape.d}
                  fill="none"
                  stroke="#126c61"
                  strokeWidth={2.2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              )}

              {/* Hover outline with lift shadow */}
              {hoveredShape && hovered !== selected && (
                <path
                  d={hoveredShape.d}
                  className="map-province-hover"
                  fill={REGION_META[travelByName.get(hoveredShape.name)!.region].hover}
                  stroke="#13233a"
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Province names when zoomed in */}
              {k >= LABEL_MIN_SCALE &&
                PROVINCE_SHAPES.map((shape) => {
                  const b = boundsByName.get(shape.name)!;
                  // Bigger text needs a wider province on screen, so small neighbours don't overlap
                  const px = labelPx(k);
                  if ((b.maxX - b.minX) * k < Math.max(LABEL_MIN_WIDTH_PX, px * 3.4) || shape.name === selected) return null;
                  return (
                    <text
                      key={`label-${shape.name}`}
                      x={shape.cx}
                      y={shape.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={px / k}
                      fontWeight={600}
                      fill="#13233a"
                      stroke="#ffffff"
                      strokeWidth={(px * 0.28) / k}
                      paintOrder="stroke"
                      pointerEvents="none"
                      className="animate-fadeIn"
                    >
                      {shape.name}
                    </text>
                  );
                })}

              {/* Region labels */}
              {regionLabels.map(({ region, x, y }) => (
                <text
                  key={region}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontWeight={700}
                  fill="#343e4f"
                  stroke="#ffffff"
                  strokeWidth={3}
                  paintOrder="stroke"
                  pointerEvents="none"
                  fontSize={13 / Math.min(k, LABEL_MIN_SCALE)}
                  opacity={k >= LABEL_MIN_SCALE ? 0 : hovered ? 0.35 : 0.9}
                  style={{ transition: 'opacity 0.2s' }}
                >
                  {REGION_META[region].label}
                </text>
              ))}

              {/* Basket markers */}
              {basketProvinces.map((name) => {
                const s = shapeByName.get(name)!;
                const count = basket.filter((b) => b.province === name).length;
                return (
                  // Markers keep a constant on-screen size at any zoom
                  <g key={name} pointerEvents="none" transform={`translate(${s.cx} ${s.cy}) scale(${1 / k})`}>
                    {/* Offset so the selected-province pin does not cover it */}
                    <circle cx={9} cy={-9} r={7} fill="#1a7d71" stroke="#fff" strokeWidth={1.5} />
                    <text x={9} y={-6} textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff">
                      {count}
                    </text>
                  </g>
                );
              })}

              {/* Top-3 provinces of the selected region: gold outline + crown with rank badges */}
              {crownProvinces.map(([name]) => (
                <path
                  key={`crown-outline-${name}`}
                  d={shapeByName.get(name)!.d}
                  fill="#edcb8e"
                  fillOpacity={0.35}
                  stroke="#c27f1e"
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}
              {crownProvinces.map(([name, ranks]) => {
                const s = shapeByName.get(name)!;
                const badgesW = ranks.length * 13 - 3;
                return (
                  <g key={`crown-${name}`} pointerEvents="none" transform={`translate(${s.cx} ${s.cy}) scale(${1 / k})`}>
                    <g className="map-crown">
                      <path
                        d="M-11 -6 L-13 -20 L-6 -13 L0 -24 L6 -13 L13 -20 L11 -6 Z"
                        fill="#e2ae57"
                        stroke="#855215"
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                      />
                      <rect x={-11} y={-7} width={22} height={4} rx={1} fill="#c27f1e" stroke="#855215" strokeWidth={1} />
                      <circle cx={0} cy={-24} r={1.8} fill="#bc4d36" />
                      <circle cx={-13} cy={-20} r={1.4} fill="#bc4d36" />
                      <circle cx={13} cy={-20} r={1.4} fill="#bc4d36" />
                    </g>
                    {ranks.map((rank, j) => (
                      <g key={rank} transform={`translate(${-badgesW / 2 + 5 + j * 13} 5)`}>
                        <circle r={6} fill={RANK_COLORS[rank]} stroke="#fff" strokeWidth={1.5} />
                        <text y={3} textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff">
                          {rank + 1}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}

              {/* Selected destination: red goal flag planted at the province centre */}
              {selectedShape && (
                <g pointerEvents="none" transform={`translate(${selectedShape.cx} ${selectedShape.cy}) scale(${1 / k})`}>
                  {/* Target ripple on the ground */}
                  <ellipse cx={0} cy={0} rx={6} ry={2.5} fill="none" stroke="#126c61" strokeWidth={1.5}>
                    <animate attributeName="rx" values="4;16;4" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="ry" values="1.6;6;1.6" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx={0} cy={0} rx={4} ry={1.6} fill="#0b3a35" opacity={0.35} />
                  {/* Re-keyed per province so the flag drops in again on each new pick */}
                  <g key={selectedShape.name} className="map-flag-drop">
                    <line x1={0} y1={0} x2={0} y2={-26} stroke="#343e4f" strokeWidth={1.8} strokeLinecap="round" />
                    <path d="M1 -26 Q8 -29 15 -25 T26 -22 L26 -12 Q19 -15 13 -12 T1 -14 Z" fill="#1a7d71" stroke="#fff" strokeWidth={1}>
                      <animate
                        attributeName="d"
                        dur="1.2s"
                        repeatCount="indefinite"
                        values="M1 -26 Q8 -29 15 -25 T26 -22 L26 -12 Q19 -15 13 -12 T1 -14 Z;M1 -26 Q8 -23 15 -26 T26 -24 L26 -14 Q19 -11 13 -14 T1 -14 Z;M1 -26 Q8 -29 15 -25 T26 -22 L26 -12 Q19 -15 13 -12 T1 -14 Z"
                      />
                    </path>
                    <circle cx={0} cy={-27} r={1.8} fill="#e2ae57" stroke="#fff" strokeWidth={0.6} />
                  </g>
                  <text
                    x={0}
                    y={-33}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fill="#0b3a35"
                    stroke="#fff"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {selectedShape.name}
                  </text>
                </g>
              )}
            </svg>

            {/* Zoom controls */}
            <div className="absolute top-2 right-2 flex flex-col rounded-md bg-white border border-slate-200 shadow-md overflow-hidden">
              <button
                onClick={() => zoom.zoomBy(1.6)}
                className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="ซูมเข้า"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoom.zoomBy(1 / 1.6)}
                disabled={k <= 1.01}
                className="w-9 h-9 flex items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="ซูมออก"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={zoom.reset}
                disabled={k <= 1.01}
                className="w-9 h-9 flex items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="ดูทั้งประเทศ"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 text-[11px] text-slate-600 bg-white/85 rounded px-2 py-1 pointer-events-none">
              {k > 1.01 ? `ซูม ${k.toFixed(1)}x · ลากเพื่อเลื่อนแผนที่` : 'เลื่อนลูกกลิ้งเมาส์หรือกด + เพื่อซูมดูจังหวัด'}
            </div>

            {/* Hover tooltip */}
            {hoveredTravel && (
              <div
                className="hidden md:block absolute z-10 w-64 pointer-events-none rounded-lg bg-white border border-slate-200 shadow-xl overflow-hidden animate-fadeIn"
                style={{
                  left: tooltipPos.flip ? tooltipPos.x - 272 : tooltipPos.x + 16,
                  top: Math.max(0, Math.min(tooltipPos.y - 20, hoverPhoto ? tooltipPos.maxTop : Infinity)),
                }}
              >
                {hoverPhoto?.province === hoveredTravel.name && (
                  <div className="relative h-32 bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={hoverPhoto.src}
                      src={hoverPhoto.src}
                      alt={hoverPhoto.place}
                      className="w-full h-full object-cover animate-fadeIn"
                      onError={() => {
                        brokenPhotos.current.add(hoverPhoto.src);
                        setHoverPhoto(null);
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent text-[11px] font-semibold text-white truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {hoverPhoto.place}
                    </div>
                  </div>
                )}
                <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-lg font-semibold text-slate-900 leading-tight">{hoveredTravel.name}</div>
                    <div className="text-[11px] text-slate-500">{hoveredTravel.nameEn}</div>
                  </div>
                  <span
                    className="on-light text-[11px] font-semibold px-1.5 py-0.5 rounded text-slate-700 shrink-0"
                    style={{ backgroundColor: REGION_META[hoveredTravel.region].fill }}
                  >
                    {REGION_META[hoveredTravel.region].label}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1">
                  {hoveredTravel.attractions.slice(0, 5).map((a) => (
                    <li key={a.name} className="flex items-center gap-1.5 text-xs text-slate-700">
                      {React.createElement(CATEGORY_META[a.category].icon, { className: 'w-3.5 h-3.5 text-slate-400 shrink-0', strokeWidth: 1.8 })}
                      <span className={categoryFilter === a.category ? 'font-bold text-emerald-700' : ''}>{a.name}</span>
                      {(() => {
                        const access = accessibilityOf(hoveredTravel.name, a.name);
                        return access && access.wheelchair !== 'no' ? (
                          <span
                            className="ml-auto shrink-0 w-4 h-4 rounded text-white flex items-center justify-center"
                            style={{ backgroundColor: WHEELCHAIR_META[access.wheelchair].color }}
                            title={WHEELCHAIR_META[access.wheelchair].label}
                          >
                            <Accessibility className="w-3 h-3" />
                          </span>
                        ) : null;
                      })()}
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  คลิกเพื่อดูรูป อากาศ งบ & คนเยอะไหม
                </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 text-right">ขอบเขตจังหวัด: OpenGISData-Thailand</p>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-4 lg:sticky lg:top-24">
          {regionFilter ? (
            <RegionTopPanel
              region={regionFilter}
              top={regionTop.top}
              summaries={regionTop.summaries}
              loading={regionTop.loading}
              onOpen={(province, place) => openProvince(province, place)}
              onBack={() => toggleRegion(regionFilter)}
            />
          ) : selectedTravel ? (
            <div key={selectedTravel.name} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="on-light px-5 pt-5 pb-4" style={{ backgroundColor: REGION_META[selectedTravel.region].fill }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-3xl font-semibold text-slate-900 leading-tight">{selectedTravel.name}</h3>
                    <div className="text-xs text-slate-700">
                      {selectedTravel.nameEn} · {REGION_META[selectedTravel.region].label}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-600 transition-colors"
                    aria-label="ปิด"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setDetailProvince(selectedTravel.name)}
                  className="mt-4 h-9 px-3.5 rounded-md bg-ink-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-ink-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" /> ดูรูป อากาศ งบประมาณ & ความหนาแน่น
                </button>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from(new Set(selectedTravel.attractions.map((a) => a.category))).map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white/60 text-slate-700">
                      {React.createElement(CATEGORY_META[cat].icon, { className: 'w-3 h-3', strokeWidth: 1.8 })} {CATEGORY_META[cat].label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">
                    แหล่งท่องเที่ยวเด่น ({selectedTravel.attractions.length})
                  </span>
                  <button
                    onClick={() => addAllFromProvince(selectedTravel)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    + เพิ่มทั้งหมด
                  </button>
                </div>
                <ul className="divide-y divide-slate-100 border-y border-slate-100">
                  {selectedTravel.attractions.map((a) => {
                    const added = inBasket(a.name, selectedTravel.name);
                    return (
                      <li
                        key={a.name}
                        className={`group flex items-center gap-3 py-2.5 transition-colors ${added ? 'bg-emerald-50/70' : ''}`}
                      >
                        <span className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${added ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {React.createElement(CATEGORY_META[a.category].icon, { className: 'w-4 h-4', strokeWidth: 1.8 })}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-slate-900 truncate">{a.name}</span>
                          <span className="block text-xs text-slate-500">{CATEGORY_META[a.category].label}</span>
                        </span>
                        <a
                          href={mapsSearchUrl(a.name, selectedTravel.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="ดูใน Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => toggleBasket(a.name, selectedTravel.name)}
                          className={`h-8 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                            added
                              ? 'bg-emerald-600 text-white hover:bg-rose-600'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {added ? 'เพิ่มแล้ว' : 'เพิ่ม'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => onPlanWithAi(selectedTravel.name, basket.filter((b) => b.province === selectedTravel.name).map((b) => b.name))}
                  className="mt-4 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  ให้ AI วางแผนเที่ยว{selectedTravel.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 animate-fadeIn">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MousePointerClick className="w-4 h-4 text-emerald-600" />
                เริ่มจากคลิกจังหวัดบนแผนที่
              </div>
              <p className="mt-1 text-xs text-slate-500">หรือเลือกดูตามภูมิภาค</p>
              <div className="mt-4 space-y-2">
                {REGION_ORDER.map((region) => {
                  const meta = REGION_META[region];
                  const provinces = PROVINCE_TRAVEL.filter((p) => p.region === region);
                  return (
                    <button
                      key={region}
                      onClick={() => toggleRegion(region)}
                      className="region-card on-light group w-full text-left px-3.5 py-3 rounded-md border border-slate-200 hover:border-slate-400 transition-colors"
                      style={{ '--region-fill': meta.fill } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
                        <span className="text-[11px] text-slate-500">
                          {provinces.length} จังหวัด · {provinces.reduce((s, p) => s + p.attractions.length, 0)} ที่
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">{meta.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trip basket */}
          <div className="rounded-xl bg-ink-900 text-white p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <Luggage className="w-4 h-4 text-lagoon-300" />
                ทริปของฉัน
                <span className="text-xs font-mono text-ink-300">
                  {basket.length}/{MAX_BASKET}
                </span>
              </div>
              {basket.length > 0 && (
                <button
                  onClick={() => {
                    setBasket([]);
                    setBasketFullMsg(false);
                  }}
                  className="text-xs text-ink-300 hover:text-terracotta-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ล้าง
                </button>
              )}
            </div>

            {basket.length === 0 ? (
              <p className="mt-2 text-xs text-ink-300 leading-relaxed">ยังไม่ได้เลือกสถานที่ กด &ldquo;เพิ่ม&rdquo; จากรายการของแต่ละจังหวัด (เลือกข้ามจังหวัดได้)</p>
            ) : (
              <>
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {basketProvinces.map((province) => (
                    <div key={province}>
                      <button
                        onClick={() => setSelected(province)}
                        className="text-[11px] font-semibold text-ink-300 hover:text-white transition-colors"
                      >
                        จ.{province}
                      </button>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {basket
                          .filter((b) => b.province === province)
                          .map((b) => (
                            <span
                              key={b.name}
                              className="inline-flex items-center gap-1 rounded bg-white/10 pl-2 pr-1 py-1 text-xs animate-fadeIn"
                            >
                              {b.name}
                              <button
                                onClick={() => toggleBasket(b.name, b.province)}
                                className="p-0.5 rounded text-ink-300 hover:text-white hover:bg-white/10"
                                aria-label={`เอา ${b.name} ออก`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                {basketFullMsg && (
                  <p className="mt-2 text-xs text-saffron-300">เลือกได้สูงสุด {MAX_BASKET} สถานที่ต่อทริป</p>
                )}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                  <button
                    onClick={handlePlanWithAi}
                    className="h-11 rounded-md bg-lagoon-500 hover:bg-lagoon-400 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    ให้ AI วางแผน
                  </button>
                  <button
                    onClick={handleCreateTrip}
                    className="h-11 rounded-md border border-white/25 hover:bg-white/10 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    เปิดเป็นทริปชุมชน
                  </button>
                </div>
              </>
            )}
          </div>

          <QuickAiPlan
            suggestedProvince={selected ?? regionTop.top[0]?.province ?? null}
            basket={basket}
            onPlan={(province, places, totalBudget, people, options) =>
              onPlanWithAi(province, places, totalBudget, people, options)
            }
          />
        </div>
      </div>

      <ProvinceDetailModal
        province={detailProvince ? travelByName.get(detailProvince) ?? null : null}
        onClose={closeDetail}
        reviewer={reviewer}
        initialPlace={detailPlace}
        isInBasket={(name) => !!detailProvince && inBasket(name, detailProvince)}
        onToggleBasket={(name) => detailProvince && toggleBasket(name, detailProvince)}
        onPlanWithAi={(province, places, totalBudget, people) => {
          setDetailProvince(null);
          onPlanWithAi(province, places, totalBudget, people);
        }}
      />
    </div>
  );
};
