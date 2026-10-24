// Landing-page trip planner: runs entirely on local Thai data so the live demo never waits on an API.
// Chiang Mai is hand-built for the pitch; any other province is generated from PROVINCE_TRAVEL.
import { PROVINCE_TRAVEL, AttractionCategory } from '@/data/thailandTravel';
import { accessibilityOf } from '@/data/placeAccessibility';
import { placeImagesOrCity } from '@/lib/placeImages';

export type BadgeKind = 'crowd' | 'access' | 'parking' | 'photo' | 'weather' | 'rain' | 'note';

export interface StopBadge {
  kind: BadgeKind;
  label: string;
}

export interface Stop {
  id: string;
  name: string;
  cost: number; // per person, THB
  outdoor: boolean;
  accessible: boolean;
  lat: number;
  lon: number;
  img?: string;
  badges: StopBadge[];
}

export interface Destination {
  key: string;
  name: string; // shown in the trip title, e.g. "เชียงใหม่"
  // Approximate positions are labelled as such on the map
  approxCoords: boolean;
  days: Stop[][];
  // Replacement candidates for swaps, rain mode and accessible mode
  pool: Stop[];
  // Time slot for each stop position in a day
  slots: [string, string][];
  lodgingPerRoomNight: { normal: number; eco: number };
  foodPerPerson: { normal: number; eco: number };
  transportPerGroup: { normal: number; eco: number; normalLabel: string; ecoLabel: string };
  // Trip thumbnail; generated destinations without a photo show a map pin instead
  cover?: string;
}

export interface PlannerModes {
  eco: boolean;
  accessible: boolean;
  rainy: boolean;
}

const WIKI_DOI_PUI = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/DoiPui1.jpg/960px-DoiPui1.jpg';

const CHIANG_MAI: Destination = {
  key: 'chiangmai',
  name: 'เชียงใหม่',
  approxCoords: false,
  cover: '/images/places/doi-suthep-1.jpg',
  slots: [
    ['08:00', '10:00'],
    ['10:30', '12:00'],
    ['13:00', '16:00'],
  ],
  lodgingPerRoomNight: { normal: 3100, eco: 1100 },
  foodPerPerson: { normal: 1090, eco: 700 },
  transportPerGroup: { normal: 3040, eco: 1200, normalLabel: 'รถเช่า 3 วัน + น้ำมัน', ecoLabel: 'รถแดง / Grab' },
  days: [
    [
      {
        id: 'doi-suthep',
        name: 'วัดพระธาตุดอยสุเทพ',
        cost: 250,
        outdoor: true,
        accessible: true,
        lat: 18.8048,
        lon: 98.9216,
        img: '/images/places/doi-suthep-1.jpg',
        badges: [
          { kind: 'crowd', label: 'ช่วงเช้าคนไม่แน่น' },
          { kind: 'access', label: 'มีลิฟต์/ทางลาด' },
          { kind: 'parking', label: 'มีที่จอดรถ' },
        ],
      },
      {
        id: 'doi-pui-cafe',
        name: 'แวะคาเฟ่ดอยปุย',
        cost: 120,
        outdoor: true,
        accessible: false,
        lat: 18.8166,
        lon: 98.8829,
        img: WIKI_DOI_PUI,
        badges: [
          { kind: 'photo', label: 'ภาพตรงปก' },
          { kind: 'parking', label: 'จอดรถริมทาง' },
        ],
      },
      {
        id: 'mon-jam',
        name: 'ม่อนแจ่ม',
        cost: 300,
        outdoor: true,
        accessible: false,
        lat: 18.9354,
        lon: 98.8186,
        img: '/images/places/mon-jam-1.jpg',
        badges: [{ kind: 'weather', label: 'อากาศเย็นสบาย 21°C' }],
      },
    ],
    [
      {
        id: 'inthanon',
        name: 'ยอดดอยอินทนนท์',
        cost: 300,
        outdoor: true,
        accessible: true,
        lat: 18.5886,
        lon: 98.4867,
        badges: [
          { kind: 'weather', label: 'ยอดดอย 9°C ควรพกเสื้อกันหนาว' },
          { kind: 'access', label: 'ทางเดินไม้เรียบ' },
          { kind: 'parking', label: 'มีที่จอดรถ' },
        ],
      },
      {
        id: 'napha',
        name: 'พระมหาธาตุนภเมทนีดล-นภพลภูมิสิริ',
        cost: 100,
        outdoor: true,
        accessible: false,
        lat: 18.5539,
        lon: 98.4858,
        badges: [
          { kind: 'photo', label: 'วิวทะเลหมอก' },
          { kind: 'note', label: 'มีบันไดหลายขั้น' },
        ],
      },
      {
        id: 'wachirathan',
        name: 'น้ำตกวชิรธาร',
        cost: 0,
        outdoor: true,
        accessible: false,
        lat: 18.544,
        lon: 98.5993,
        badges: [
          { kind: 'crowd', label: 'บ่ายวันธรรมดาคนน้อย' },
          { kind: 'note', label: 'พื้นลื่น ควรใส่รองเท้ากันลื่น' },
        ],
      },
    ],
    [
      {
        id: 'chedi-luang',
        name: 'วัดเจดีย์หลวงวรวิหาร',
        cost: 50,
        outdoor: true,
        accessible: true,
        lat: 18.787,
        lon: 98.9864,
        badges: [
          { kind: 'crowd', label: 'ก่อน 09:00 คนไม่แน่น' },
          { kind: 'access', label: 'พื้นเรียบ มีทางลาด' },
        ],
      },
      {
        id: 'cooking',
        name: 'เวิร์กช็อปทำอาหารล้านนา',
        cost: 450,
        outdoor: false,
        accessible: true,
        lat: 18.7905,
        lon: 98.988,
        badges: [
          { kind: 'rain', label: 'กิจกรรมในร่ม' },
          { kind: 'note', label: 'มีเมนูมังสวิรัติ' },
        ],
      },
      {
        id: 'warorot',
        name: 'ตลาดวโรรส (กาดหลวง) ซื้อของฝาก',
        cost: 155,
        outdoor: false,
        accessible: true,
        lat: 18.7904,
        lon: 99.0006,
        badges: [
          { kind: 'rain', label: 'ตลาดในอาคาร' },
          { kind: 'parking', label: 'ลานจอดเสียเงิน' },
        ],
      },
    ],
  ],
  pool: [
    {
      id: 'ratchaphruek',
      name: 'อุทยานหลวงราชพฤกษ์',
      cost: 200,
      outdoor: true,
      accessible: true,
      lat: 18.7477,
      lon: 98.9285,
      badges: [
        { kind: 'access', label: 'มีรถรางและทางลาด' },
        { kind: 'parking', label: 'มีที่จอดรถ' },
      ],
    },
    {
      id: 'maiiam',
      name: 'MAIIAM พิพิธภัณฑ์ศิลปะร่วมสมัย',
      cost: 150,
      outdoor: false,
      accessible: true,
      lat: 18.7713,
      lon: 99.1278,
      badges: [
        { kind: 'rain', label: 'ในร่ม หลบฝนได้' },
        { kind: 'access', label: 'มีลิฟต์' },
      ],
    },
    {
      id: 'lanna-museum',
      name: 'หอศิลปวัฒนธรรมเมืองเชียงใหม่',
      cost: 90,
      outdoor: false,
      accessible: true,
      lat: 18.7905,
      lon: 98.9877,
      badges: [
        { kind: 'rain', label: 'ในร่ม' },
        { kind: 'crowd', label: 'คนไม่แน่นทั้งวัน' },
      ],
    },
    {
      id: 'one-nimman',
      name: 'One Nimman & ย่านนิมมานฯ',
      cost: 200,
      outdoor: false,
      accessible: true,
      lat: 18.8,
      lon: 98.9675,
      badges: [
        { kind: 'rain', label: 'มีหลังคาคลุม' },
        { kind: 'parking', label: 'ลานจอดในอาคาร' },
      ],
    },
    {
      id: 'sirikit-garden',
      name: 'สวนพฤกษศาสตร์สมเด็จพระนางเจ้าสิริกิติ์',
      cost: 100,
      outdoor: true,
      accessible: false,
      lat: 18.893,
      lon: 98.8622,
      badges: [{ kind: 'photo', label: 'ทางเดินลอยฟ้า Canopy Walk' }],
    },
    {
      id: 'umong',
      name: 'วัดอุโมงค์',
      cost: 20,
      outdoor: true,
      accessible: false,
      lat: 18.7832,
      lon: 98.9516,
      badges: [{ kind: 'crowd', label: 'เงียบสงบ' }],
    },
    {
      id: 'hot-spring',
      name: 'บ่อน้ำพุร้อนสันกำแพง',
      cost: 100,
      outdoor: true,
      accessible: true,
      lat: 18.8158,
      lon: 99.2291,
      badges: [
        { kind: 'access', label: 'ทางเรียบรอบบ่อ' },
        { kind: 'parking', label: 'มีที่จอดรถ' },
      ],
    },
  ],
};

// --- Generated destinations (any of the 77 provinces) ---

const CATEGORY_COST: Record<AttractionCategory, number> = {
  waterfall: 100, beach: 300, temple: 50, history: 100, cave: 100, lake: 100,
  market: 200, mountain: 200, nature: 100, town: 150, viewpoint: 50, landmark: 100,
};
const INDOOR: AttractionCategory[] = ['market', 'town', 'history'];
const ACCESSIBLE_BY_CATEGORY: AttractionCategory[] = ['temple', 'market', 'town', 'history', 'lake', 'landmark'];
const CATEGORY_BADGES: Record<AttractionCategory, StopBadge[]> = {
  waterfall: [{ kind: 'crowd', label: 'เช้าวันธรรมดาคนน้อย' }, { kind: 'note', label: 'พื้นลื่น' }],
  beach: [{ kind: 'photo', label: 'น้ำใส ภาพตรงปก' }, { kind: 'weather', label: 'แดดแรง พกครีมกันแดด' }],
  temple: [{ kind: 'crowd', label: 'ช่วงเช้าคนไม่แน่น' }, { kind: 'parking', label: 'มีที่จอดรถ' }],
  history: [{ kind: 'rain', label: 'มีส่วนจัดแสดงในร่ม' }, { kind: 'parking', label: 'มีที่จอดรถ' }],
  cave: [{ kind: 'note', label: 'ควรพกไฟฉาย' }],
  lake: [{ kind: 'photo', label: 'วิวพระอาทิตย์ตก' }, { kind: 'parking', label: 'มีที่จอดรถ' }],
  market: [{ kind: 'rain', label: 'มีหลังคาคลุม' }, { kind: 'crowd', label: 'เย็นคนเยอะ' }],
  mountain: [{ kind: 'weather', label: 'อากาศเย็น พกเสื้อกันหนาว' }],
  nature: [{ kind: 'photo', label: 'ธรรมชาติสวย' }],
  town: [{ kind: 'rain', label: 'เดินเล่นในร่มได้' }, { kind: 'parking', label: 'จอดรถริมทาง' }],
  viewpoint: [{ kind: 'photo', label: 'จุดชมวิวยอดนิยม' }, { kind: 'crowd', label: 'มาก่อนพระอาทิตย์ขึ้น' }],
  landmark: [{ kind: 'photo', label: 'จุดเช็กอินยอดนิยม' }, { kind: 'parking', label: 'มีที่จอดรถ' }],
};

// Small deterministic offset so generated pins spread around the province centre
const jitter = (seed: string, i: number) => {
  let h = 0;
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) >>> 0;
  const a = ((h + i * 7919) % 360) * (Math.PI / 180);
  const r = 0.05 + ((h >> (i % 8)) % 10) / 100;
  return { dLat: Math.sin(a) * r, dLon: Math.cos(a) * r };
};

const buildFromProvince = (provinceName: string): Destination | null => {
  const p = PROVINCE_TRAVEL.find((x) => x.name === provinceName);
  if (!p || p.attractions.length === 0) return null;
  const stops: Stop[] = p.attractions.map((a, i) => {
    const access = accessibilityOf(p.name, a.name);
    const accessible = access ? access.wheelchair !== 'no' : ACCESSIBLE_BY_CATEGORY.includes(a.category);
    const { dLat, dLon } = jitter(p.name, i);
    const badges = [...CATEGORY_BADGES[a.category]];
    if (accessible) badges.push({ kind: 'access', label: access?.wheelchair === 'limited' ? 'เข้าถึงได้บางส่วน' : 'มีทางลาด' });
    return {
      id: `${p.name}-${i}`,
      name: a.name,
      cost: CATEGORY_COST[a.category],
      outdoor: !INDOOR.includes(a.category),
      accessible,
      lat: p.lat + dLat,
      lon: p.lon + dLon,
      img: placeImagesOrCity(p.name, a.name)[0],
      badges,
    };
  });
  // Spread the province's attractions over three days, three stops a day, repeating if the list is short
  const days: Stop[][] = [[], [], []];
  const picked = stops.slice(0, 9);
  picked.forEach((s, i) => days[Math.floor(i / 3)]?.push(s));
  for (let d = 0; d < 3; d++) {
    while (days[d].length < 3 && stops.length > 0) days[d].push(stops[(d * 3 + days[d].length) % stops.length]);
  }
  return {
    key: p.name,
    name: p.name,
    approxCoords: true,
    cover: stops.find((s) => s.img)?.img,
    slots: CHIANG_MAI.slots,
    days,
    pool: stops.slice(9),
    lodgingPerRoomNight: { normal: 2200, eco: 1000 },
    foodPerPerson: { normal: 1000, eco: 650 },
    transportPerGroup: { normal: 2800, eco: 1100, normalLabel: 'รถเช่า 3 วัน + น้ำมัน', ecoLabel: 'รถโดยสาร / Grab' },
  };
};

// Matches a free-text destination against a province or an attraction name
export const resolveDestination = (query: string): Destination => {
  const q = query.trim().replace(/^จ\.|^จังหวัด/, '').trim();
  if (!q || q.includes('เชียงใหม่') || /chiang\s*mai/i.test(q)) return CHIANG_MAI;
  const byProvince = PROVINCE_TRAVEL.find((p) => q.includes(p.name) || p.name.includes(q) || p.nameEn.toLowerCase() === q.toLowerCase());
  const byPlace = byProvince ? null : PROVINCE_TRAVEL.find((p) => p.attractions.some((a) => a.name.includes(q) || q.includes(a.name)));
  const match = byProvince ?? byPlace;
  return (match && buildFromProvince(match.name)) || CHIANG_MAI;
};

export const DEFAULT_DESTINATION = CHIANG_MAI;

// --- Plan assembly ---

const fits = (s: Stop, modes: PlannerModes) => (!modes.rainy || !s.outdoor) && (!modes.accessible || s.accessible);

// Applies rain/accessible modes, user swaps, and extra days. Swaps are keyed "day-index" -> pool offset.
export const buildDays = (
  dest: Destination,
  modes: PlannerModes,
  swaps: Record<string, number>,
  extraDays: number
): Stop[][] => {
  const base = [...dest.days];
  // Extra days reuse pool stops in order
  for (let e = 0; e < extraDays; e++) base.push(dest.pool.slice(e * 2, e * 2 + 2));
  const used = new Set<string>();
  base.flat().forEach((s) => used.add(s.id));
  return base.map((day, d) =>
    day.map((stop, i) => {
      const key = `${d}-${i}`;
      const offset = swaps[key] ?? 0;
      if (offset === 0 && fits(stop, modes)) return stop;
      // Candidates: pool stops that satisfy the modes and are not already in the plan
      const candidates = dest.pool.filter((p) => fits(p, modes) && (!used.has(p.id) || p.id === stop.id));
      if (candidates.length === 0) return stop;
      const pick = candidates[(Math.max(1, offset) - 1) % candidates.length];
      used.add(pick.id);
      return pick;
    })
  );
};

export interface BudgetLine {
  key: 'lodging' | 'activities' | 'food' | 'transport';
  label: string;
  note: string;
  amount: number;
}

export const computeBudget = (dest: Destination, days: Stop[][], people: number, modes: PlannerModes): BudgetLine[] => {
  const nights = Math.max(1, days.length - 1);
  const rooms = Math.ceil(people / 2);
  const groups = Math.ceil(people / 4);
  const perPersonActivities = days.flat().reduce((sum, s) => sum + s.cost, 0);
  const tier = modes.eco ? 'eco' : 'normal';
  const dayFactor = days.length / 3;
  return [
    {
      key: 'lodging',
      label: 'ที่พัก',
      note: `${nights} คืน · ${rooms} ห้อง${modes.eco ? ' · โฮสเทล/เกสต์เฮาส์' : ''}`,
      amount: dest.lodgingPerRoomNight[tier] * nights * rooms,
    },
    { key: 'activities', label: 'กิจกรรม', note: `ค่าเข้าชม ${days.flat().length} จุด`, amount: perPersonActivities * people },
    { key: 'food', label: 'อาหาร', note: `${days.length} วัน · ${people} คน`, amount: Math.round(dest.foodPerPerson[tier] * people * dayFactor) },
    {
      key: 'transport',
      label: 'เดินทาง',
      note: modes.eco ? dest.transportPerGroup.ecoLabel : modes.accessible ? 'รถตู้พร้อมทางลาด' : dest.transportPerGroup.normalLabel,
      amount: Math.round(dest.transportPerGroup[tier] * groups * dayFactor) + (modes.accessible && !modes.eco ? 600 * groups : 0),
    },
  ];
};

// Date presets for the hero search; days are labelled from the start date
export const DATE_PRESETS = [
  { label: '12 - 14 ธันวาคม', start: 12, month: 'ธ.ค.', monthLong: 'ธันวาคม' },
  { label: '19 - 21 ธันวาคม', start: 19, month: 'ธ.ค.', monthLong: 'ธันวาคม' },
  { label: '26 - 28 ธันวาคม', start: 26, month: 'ธ.ค.', monthLong: 'ธันวาคม' },
  { label: '9 - 11 มกราคม', start: 9, month: 'ม.ค.', monthLong: 'มกราคม' },
];

export const PEOPLE_OPTIONS = [2, 4, 6, 8];

export const mapsDirectionsUrl = (stops: Stop[]) => {
  const pts = stops.map((s) => `${s.lat},${s.lon}`);
  return `https://www.google.com/maps/dir/${pts.join('/')}`;
};
