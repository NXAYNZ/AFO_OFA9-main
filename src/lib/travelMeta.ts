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

// Region tints read like a survey atlas: sage hills, Isan sand, rice-paper plains, jade coast, sea mist
export const REGION_META: Record<RegionId, { label: string; fill: string; hover: string; desc: string }> = {
  north: { label: 'ภาคเหนือ', fill: '#d6dbbf', hover: '#bfc79f', desc: 'ดอยสูง ทะเลหมอก อากาศเย็น วัฒนธรรมล้านนา' },
  northeast: { label: 'ภาคอีสาน', fill: '#ebd9ae', hover: '#dec285', desc: 'ปราสาทหินขอม ทะเลบัวแดง ริมโขง' },
  central: { label: 'ภาคกลาง & ตะวันตก', fill: '#e6e1c8', hover: '#d4cca6', desc: 'กรุงเทพฯ กรุงเก่า ตลาดน้ำ ป่าตะวันตก' },
  east: { label: 'ภาคตะวันออก', fill: '#c8ded0', hover: '#a7c9b3', desc: 'ทะเลใกล้กรุง เกาะช้าง น้ำตก ผลไม้' },
  south: { label: 'ภาคใต้', fill: '#c3d7e2', hover: '#9fbfd0', desc: 'อันดามัน & อ่าวไทย เกาะสวยระดับโลก' },
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
