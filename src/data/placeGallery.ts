// Hand-picked local photos per attraction, keyed by "จังหวัด|สถานที่" (same keys as PLACE_PHOTOS).
// Files live in /public/images/places; the first entry is used as the cover image.
const g = (slug: string, order: number[]) => order.map((n) => `/images/places/${slug}-${n}.jpg`);

export const PLACE_GALLERY: Record<string, string[]> = {
  'สิงห์บุรี|อุทยานวีรชนค่ายบางระจัน': g('bang-rachan', [1, 3, 2]),
  'สิงห์บุรี|วัดพระนอนจักรสีห์': g('wat-phra-non-chaksi', [3, 1, 2]),
  'ชัยนาท|เขื่อนเจ้าพระยา': g('chao-phraya-dam', [3, 2, 1]),
  'ชัยนาท|สวนนกชัยนาท': g('chainat-bird-park', [2, 3, 1]),
  'อุทัยธานี|วัดจันทาราม': g('wat-chantharam', [3, 2, 1]),
  'อุทัยธานี|เขาสะแกกรัง': g('khao-sakae-krang', [2, 3, 1]),
  'อุทัยธานี|หุบป่าตาด': g('hup-pa-tat', [2, 1, 3]),
  'นครสวรรค์|เขาหน่อ': g('khao-nor', [2, 3, 1]),
  'นครสวรรค์|พาสาน': g('paknampho', [1, 2, 3]),
  'นครสวรรค์|บึงบอระเพ็ด': g('bueng-boraphet', [2, 1, 3]),
};
