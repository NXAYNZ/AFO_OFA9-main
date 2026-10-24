// Display names, colors and icons for regions and attraction categories on the Thailand map
import {
  TreePalm,
  Mountain,
  Droplets,
  Flower2,
  Landmark,
  Trees,
  Waves,
  ShoppingBasket,
  House,
  Binoculars,
  Flashlight,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RegionId, AttractionCategory } from '@/data/thailandTravel';

// Bright region colours: mountain green north, golden Isan, temple orange central, fruit-and-sea east, Andaman blue south
export const REGION_META: Record<RegionId, { label: string; fill: string; hover: string; desc: string }> = {
  north: { label: 'ภาคเหนือ', fill: '#7DD89C', hover: '#45C373', desc: 'ดอยสูง ทะเลหมอก อากาศเย็น วัฒนธรรมล้านนา' },
  northeast: { label: 'ภาคอีสาน', fill: '#FFD25E', hover: '#FFBE2E', desc: 'ปราสาทหินขอม ทะเลบัวแดง ริมโขง' },
  central: { label: 'ภาคกลาง & ตะวันตก', fill: '#FFA47E', hover: '#FF8455', desc: 'กรุงเทพฯ กรุงเก่า ตลาดน้ำ ป่าตะวันตก' },
  east: { label: 'ภาคตะวันออก', fill: '#6FD6E6', hover: '#36C1D8', desc: 'ทะเลใกล้กรุง เกาะช้าง น้ำตก ผลไม้' },
  south: { label: 'ภาคใต้', fill: '#8FB8FF', hover: '#5E94FF', desc: 'อันดามัน & อ่าวไทย เกาะสวยระดับโลก' },
};

export const CATEGORY_META: Record<AttractionCategory, { label: string; icon: LucideIcon }> = {
  beach: { label: 'ทะเล & เกาะ', icon: TreePalm },
  mountain: { label: 'ภูเขา & ดอย', icon: Mountain },
  waterfall: { label: 'น้ำตก', icon: Droplets },
  temple: { label: 'วัด & ศาสนสถาน', icon: Flower2 },
  history: { label: 'ประวัติศาสตร์', icon: Landmark },
  nature: { label: 'ธรรมชาติ & อุทยาน', icon: Trees },
  lake: { label: 'เขื่อน & แหล่งน้ำ', icon: Waves },
  market: { label: 'ตลาด', icon: ShoppingBasket },
  town: { label: 'ชุมชน & เมืองเล็ก', icon: House },
  viewpoint: { label: 'จุดชมวิว', icon: Binoculars },
  cave: { label: 'ถ้ำ', icon: Flashlight },
  landmark: { label: 'แลนด์มาร์ก', icon: MapPin },
};

export const REGION_ORDER: RegionId[] = ['north', 'northeast', 'central', 'east', 'south'];

export const mapsSearchUrl = (place: string, province: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place} ${province}`)}`;
