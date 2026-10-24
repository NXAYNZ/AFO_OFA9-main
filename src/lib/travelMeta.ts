// Display names, colors and icons for regions and attraction categories on the Thailand map
import { RegionId, AttractionCategory } from '@/data/thailandTravel';

export const REGION_META: Record<RegionId, { label: string; emoji: string; fill: string; hover: string; desc: string }> = {
  north: { label: 'ภาคเหนือ', emoji: '⛰️', fill: '#e8c5e6', hover: '#d49fd1', desc: 'ดอยสูง ทะเลหมอก อากาศเย็น วัฒนธรรมล้านนา' },
  northeast: { label: 'ภาคอีสาน', emoji: '🎭', fill: '#fde3a7', hover: '#fbcf6e', desc: 'ปราสาทหินขอม ทะเลบัวแดง ริมโขง' },
  central: { label: 'ภาคกลาง & ตะวันตก', emoji: '🛕', fill: '#e2e8b4', hover: '#cbd785', desc: 'กรุงเทพฯ กรุงเก่า ตลาดน้ำ ป่าตะวันตก' },
  east: { label: 'ภาคตะวันออก', emoji: '🌴', fill: '#c4e5a0', hover: '#a3d670', desc: 'ทะเลใกล้กรุง เกาะช้าง น้ำตก ผลไม้' },
  south: { label: 'ภาคใต้', emoji: '🏝️', fill: '#a5d8ec', hover: '#72c2e2', desc: 'อันดามัน & อ่าวไทย เกาะสวยระดับโลก' },
};

export const CATEGORY_META: Record<AttractionCategory, { label: string; emoji: string }> = {
  beach: { label: 'ทะเล & เกาะ', emoji: '🏖️' },
  mountain: { label: 'ภูเขา & ดอย', emoji: '⛰️' },
  waterfall: { label: 'น้ำตก', emoji: '💧' },
  temple: { label: 'วัด & ศาสนสถาน', emoji: '🛕' },
  history: { label: 'ประวัติศาสตร์', emoji: '🏛️' },
  nature: { label: 'ธรรมชาติ & อุทยาน', emoji: '🌿' },
  lake: { label: 'เขื่อน & แหล่งน้ำ', emoji: '🛶' },
  market: { label: 'ตลาด', emoji: '🛍️' },
  town: { label: 'ชุมชน & เมืองเล็ก', emoji: '🏘️' },
  viewpoint: { label: 'จุดชมวิว', emoji: '🔭' },
  cave: { label: 'ถ้ำ', emoji: '🪨' },
  landmark: { label: 'แลนด์มาร์ก', emoji: '📍' },
};

export const REGION_ORDER: RegionId[] = ['north', 'northeast', 'central', 'east', 'south'];

export const mapsSearchUrl = (place: string, province: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place} ${province}`)}`;
