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
  // North (batch 2)
  'เชียงราย|วัดร่องขุ่น': g('wat-rong-khun', [1, 2, 3]),
  'เชียงราย|ภูชี้ฟ้า': g('phu-chi-fa', [1, 2]),
  'เชียงราย|ดอยตุง': g('doi-tung', [1, 2]),
  'เชียงราย|ไร่ชาฉุยฟง': g('choui-fong', [1]),
  'เชียงราย|สามเหลี่ยมทองคำ': g('golden-triangle', [1, 2]),
  'เชียงใหม่|ดอยสุเทพ': g('doi-suthep', [1, 2, 3]),
  'เชียงใหม่|ม่อนแจ่ม': g('mon-jam', [1, 2]),
  'แม่ฮ่องสอน|บ้านรักไทย': g('ban-rak-thai', [1, 2]),
  'แม่ฮ่องสอน|ปางอุ๋ง': g('pang-ung', [1, 2, 3]),
  'น่าน|วัดภูมินทร์': g('wat-phumin', [1, 2, 3]),
  'น่าน|บ่อเกลือสินเธาว์': g('bo-kluea', [1, 2]),
  'พะเยา|กว๊านพะเยา': g('kwan-phayao', [1, 2, 3]),
  'พะเยา|วัดศรีโคมคำ': g('wat-si-khom-kham', [1]),
  'แพร่|แพะเมืองผี': g('phae-mueang-phi', [1, 2, 3, 4]),
  'แพร่|คุ้มวงศ์บุรี': g('vongburi-house', [1, 2, 3]),
  'สุโขทัย|อุทยานประวัติศาสตร์สุโขทัย': g('sukhothai-park', [1, 2, 3, 4]),
  'พิษณุโลก|วัดพระศรีรัตนมหาธาตุ': g('phra-buddha-chinnarat', [1, 2]),
  'พิษณุโลก|ภูหินร่องกล้า': g('phu-hin-rong-kla', [1, 2]),
  'เพชรบูรณ์|วัดพระธาตุผาซ่อนแก้ว': g('pha-son-kaew', [1, 2, 3]),
  'ตาก|น้ำตกทีลอซู': g('thi-lo-su', [1, 2, 3]),
  'กำแพงเพชร|อุทยานประวัติศาสตร์กำแพงเพชร': g('kamphaeng-phet-park', [1]),
};
