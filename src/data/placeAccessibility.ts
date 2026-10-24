// Wheelchair access per attraction, keyed by "จังหวัด|สถานที่" (same keys as PLACE_PHOTOS).
// Source: OpenStreetMap "wheelchair" tag (© OpenStreetMap contributors, ODbL), matched by name + distance
// and checked by hand; wrong-place matches were dropped. Places not listed have no data yet.
export type WheelchairAccess = 'yes' | 'limited' | 'no';

export interface PlaceAccessibility {
  wheelchair: WheelchairAccess;
  osmId: string; // e.g. "way/23482754" -> https://www.openstreetmap.org/way/23482754
  note?: string;
}

export const PLACE_ACCESSIBILITY: Record<string, PlaceAccessibility> = {
  'กรุงเทพมหานคร|พระบรมมหาราชวัง': { wheelchair: 'yes', osmId: 'way/23482754' },
  'ปทุมธานี|พิพิธภัณฑ์วิทยาศาสตร์แห่งชาติ': { wheelchair: 'yes', osmId: 'way/253429082' },
  'ลพบุรี|พระปรางค์สามยอด': { wheelchair: 'limited', osmId: 'way/1011171287' },
  'นครสวรรค์|บึงบอระเพ็ด': {
    wheelchair: 'limited',
    osmId: 'node/2147672094',
    note: 'ข้อมูลเฉพาะอาคารแสดงพันธุ์สัตว์น้ำ (อุโมงค์ปลา)',
  },
  'ภูเก็ต|เมืองเก่าภูเก็ต': { wheelchair: 'limited', osmId: 'node/4395955589' },
  'ชลบุรี|บางแสน': { wheelchair: 'limited', osmId: 'way/32877657', note: 'ข้อมูลของหาดบางแสน' },
  'เชียงใหม่|ดอยอินทนนท์': { wheelchair: 'no', osmId: 'node/259288817' },
  'อุบลราชธานี|ผาแต้ม': { wheelchair: 'no', osmId: 'node/418091694' },
  'กระบี่|ทะเลแหวก': { wheelchair: 'no', osmId: 'relation/5843327' },
};

export const WHEELCHAIR_META: Record<WheelchairAccess, { label: string; short: string; color: string }> = {
  yes: { label: 'รองรับผู้ใช้วีลแชร์', short: 'เข้าถึงได้', color: '#2563eb' },
  limited: { label: 'ผู้ใช้วีลแชร์เข้าถึงได้บางส่วน', short: 'บางส่วน', color: '#d97706' },
  no: { label: 'ไม่สะดวกสำหรับผู้ใช้วีลแชร์', short: 'ไม่สะดวก', color: '#64748b' },
};

export const accessibilityOf = (province: string, place: string) => PLACE_ACCESSIBILITY[`${province}|${place}`];
