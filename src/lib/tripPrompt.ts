// Turns the planner's traveller preferences into detailed Thai instructions for the AI.
// Pure (no server imports) so the form can preview exactly what the API route sends.
import { FoodStyle, Tolerance, TransportMode, TripPreferences } from './types';

export const DEFAULT_PREFERENCES: TripPreferences = {
  foodStyles: [],
  sunTolerance: 'medium',
  rainTolerance: 'medium',
  elderlyCount: 0,
  disabledCount: 0,
  transport: 'public',
  elderlyNote: '',
  disabledNote: '',
  transportNote: '',
};

export const NOTE_MAX_LENGTH = 200;

// Example text shown as placeholders so people know what to write
export const NOTE_EXAMPLES = {
  elderly: 'เช่น คุณยายอายุ 78 ปี เดินได้ช้า ใช้ไม้เท้า ขึ้นบันไดสูงไม่ไหว',
  disabled: 'เช่น ใช้วีลแชร์แบบพับได้ 1 คน ต้องการห้องน้ำคนพิการและทางลาด',
  transport: {
    private_car: 'เช่น รถเก๋ง 5 ที่นั่ง 1 คัน ออกจากกรุงเทพฯ',
    rental_car: 'เช่น อยากเช่า SUV 7 ที่นั่ง รับรถที่สนามบินเชียงใหม่',
    public: 'เช่น นั่งรถไฟไป แล้วเรียก Grab หรือเช่ามอเตอร์ไซค์ในเมือง',
  } as Record<TransportMode, string>,
};

export const FOOD_OPTIONS: { id: FoodStyle; label: string; rule: string }[] = [
  { id: 'local', label: '🍜 อาหารท้องถิ่น/สตรีทฟู้ด', rule: 'เน้นร้านอาหารท้องถิ่นและสตรีทฟู้ดขึ้นชื่อของจังหวัด ระบุเมนูเด็ดของแต่ละร้าน' },
  { id: 'seafood', label: '🦐 ซีฟู้ด', rule: 'มีมื้อซีฟู้ดอย่างน้อยวันละ 1 มื้อ เลือกร้านที่ราคาสมเหตุสมผลและบอกช่วงราคาต่อคน' },
  { id: 'cafe', label: '☕ คาเฟ่ & ขนม', rule: 'แทรกคาเฟ่หรือร้านขนมวันละ 1 แห่งในช่วงบ่าย ระบุจุดถ่ายรูปเด่น' },
  { id: 'vegetarian', label: '🥗 มังสวิรัติ/เจ', rule: 'ทุกมื้อต้องมีตัวเลือกมังสวิรัติหรืออาหารเจที่ชัดเจน ห้ามแนะนำร้านที่ไม่มีเมนูไร้เนื้อสัตว์' },
  { id: 'halal', label: '☪️ ฮาลาล', rule: 'แนะนำเฉพาะร้านที่มีเครื่องหมายฮาลาลหรือร้านมุสลิม และระบุว่าร้านนั้นฮาลาล หากไม่แน่ใจให้บอกให้ผู้ใช้สอบถามร้านก่อน' },
  { id: 'not_spicy', label: '🌶️ ไม่ทานเผ็ด', rule: 'เลือกเมนูไม่เผ็ดหรือสั่งลดเผ็ดได้ และเตือนเมนูท้องถิ่นที่เผ็ดเป็นพิเศษ' },
  { id: 'famous', label: '⭐ ร้านดัง/รีวิวดี', rule: 'ให้น้ำหนักร้านที่มีชื่อเสียงหรือรีวิวดี พร้อมเตือนช่วงเวลาที่คิวยาวและเวลาที่ควรไป' },
];

export const SUN_OPTIONS: { id: Tolerance; label: string; rule: string }[] = [
  { id: 'low', label: '🥵 ไม่ชอบแดด', rule: 'ห้ามจัดกิจกรรมกลางแจ้งช่วง 11:00-15:00 ให้ย้ายไปเช้าหรือเย็น และใช้ช่วงกลางวันกับที่ร่ม พิพิธภัณฑ์ คาเฟ่ หรือห้าง' },
  { id: 'medium', label: '😊 ปานกลาง', rule: 'กิจกรรมกลางแจ้งได้ แต่ช่วงเที่ยงควรมีที่ร่มหรือพักในร่มอย่างน้อย 1 ชั่วโมง' },
  { id: 'high', label: '😎 ลุยแดดได้', rule: 'จัดกิจกรรมกลางแจ้งได้เต็มที่ทั้งวัน แต่ให้เตือนเรื่องดื่มน้ำและครีมกันแดด' },
];

export const RAIN_OPTIONS: { id: Tolerance; label: string; rule: string }[] = [
  { id: 'low', label: '☔ เลี่ยงฝน', rule: 'ทุกวันต้องมีแผนสำรองในร่มที่อยู่ใกล้กัน และย้ายกิจกรรมกลางแจ้งไปช่วงที่ฝนน้อยตามพยากรณ์' },
  { id: 'medium', label: '🌦️ พอได้', rule: 'มีแผนสำรองในร่มอย่างน้อย 1 อย่างสำหรับวันที่มีโอกาสฝนสูง' },
  { id: 'high', label: '🌧️ ฝนไม่เป็นไร', rule: 'ฝนไม่ใช่ข้อจำกัด จัดกิจกรรมกลางแจ้งได้ แต่หลีกเลี่ยงทะเล น้ำตก และเดินป่าเมื่อมีพายุหรือประกาศเตือน' },
];

export const TRANSPORT_OPTIONS: { id: TransportMode; label: string; desc: string; rule: string }[] = [
  {
    id: 'private_car',
    label: '🚗 รถส่วนตัว',
    desc: 'ขับเอง คิดค่าน้ำมัน/ทางด่วน',
    rule: 'เดินทางด้วยรถส่วนตัว: คำนวณค่าน้ำมันโดยประมาณ ค่าทางด่วน และค่าจอดรถ เรียงสถานที่ตามเส้นทางขับรถที่ไม่ย้อนไปมา เลือกที่พักที่มีที่จอดรถ และระบุเวลาขับรถระหว่างจุด',
  },
  {
    id: 'rental_car',
    label: '🚙 รถเช่า',
    desc: 'รับ-คืนรถ คิดค่าเช่ารายวัน',
    rule: 'เดินทางด้วยรถเช่า: รวมค่าเช่ารถรายวัน ประกัน และค่าน้ำมันในงบ ระบุจุดรับ-คืนรถที่สะดวก (สนามบิน/สถานีขนส่ง) เรียงเส้นทางขับรถให้คุ้มค่า และเลือกที่พักที่มีที่จอดรถ',
  },
  {
    id: 'public',
    label: '🚌 ขนส่งสาธารณะ',
    desc: 'รถทัวร์ รถไฟ รถตู้ Grab',
    rule: 'เดินทางด้วยขนส่งสาธารณะ: ระบุวิธีไปแต่ละจุด (รถทัวร์ รถไฟ รถตู้ สองแถว เรือ วินมอเตอร์ไซค์ หรือแอปเรียกรถ) พร้อมค่าโดยสารและจุดขึ้นรถ เลือกสถานที่ที่ไปถึงได้จริงโดยไม่มีรถ และเลือกที่พักใกล้จุดขนส่ง',
  },
];

const pick = <T extends { id: string }>(list: T[], id: string) => list.find((o) => o.id === id) ?? list[0];

/** Clamp untrusted input (from the request body) into valid preferences */
export const sanitizePreferences = (raw: unknown, travelersCount: number): TripPreferences => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof TripPreferences, unknown>>;
  const tol = (v: unknown): Tolerance => (v === 'low' || v === 'high' ? v : 'medium');
  const count = (v: unknown) => Math.min(Math.max(0, Math.floor(Number(v) || 0)), Math.max(0, travelersCount));
  const foods = Array.isArray(r.foodStyles) ? r.foodStyles : [];
  // Free text goes into the prompt: one line, trimmed, length-capped
  const note = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX_LENGTH) : '');
  return {
    foodStyles: FOOD_OPTIONS.map((o) => o.id).filter((id) => foods.includes(id)),
    sunTolerance: tol(r.sunTolerance),
    rainTolerance: tol(r.rainTolerance),
    elderlyCount: count(r.elderlyCount),
    disabledCount: count(r.disabledCount),
    transport: r.transport === 'private_car' || r.transport === 'rental_car' ? r.transport : 'public',
    elderlyNote: note(r.elderlyNote),
    disabledNote: note(r.disabledNote),
    transportNote: note(r.transportNote),
  };
};

/** Short notes for the offline fallback plans (no AI key), so preferences still show up */
export const preferenceNotes = (prefs: TripPreferences): string[] => {
  const notes: string[] = [];
  const transport = pick(TRANSPORT_OPTIONS, prefs.transport);
  notes.push(`${transport.label}: ${prefs.transportNote || transport.desc}`);
  if (prefs.foodStyles.length) notes.push(`🍽️ สไตล์การกิน: ${prefs.foodStyles.map((id) => pick(FOOD_OPTIONS, id).label).join(', ')}`);
  if (prefs.sunTolerance === 'low') notes.push('☀️ เลี่ยงกิจกรรมกลางแจ้งช่วง 11:00-15:00 ใช้เวลานั้นกับที่ร่มหรือคาเฟ่');
  if (prefs.rainTolerance === 'low') notes.push('☔ เตรียมแผนสำรองในร่มทุกวัน เผื่อฝนตก');
  if (prefs.elderlyCount > 0 || prefs.elderlyNote)
    notes.push(`👵 ผู้สูงอายุ${prefs.elderlyCount ? ` ${prefs.elderlyCount} คน` : ''}${prefs.elderlyNote ? ` (${prefs.elderlyNote})` : ''}: เที่ยววันละ 3-4 จุด พักบ่อย เลี่ยงเดินไกลและบันไดสูง`);
  if (prefs.disabledCount > 0 || prefs.disabledNote)
    notes.push(`♿ ผู้พิการ/ใช้วีลแชร์${prefs.disabledCount ? ` ${prefs.disabledCount} คน` : ''}${prefs.disabledNote ? ` (${prefs.disabledNote})` : ''}: โทรถามสถานที่เรื่องทางลาดและห้องน้ำคนพิการก่อนไปทุกจุด`);
  return notes;
};

export const transportLabel = (mode: TransportMode) => pick(TRANSPORT_OPTIONS, mode).label;

/** Detailed instruction block appended to the AI prompt */
export const buildPreferencePrompt = (prefs: TripPreferences, travelersCount: number, perPersonBudget: number): string => {
  const lines: string[] = [];

  lines.push(
    `- งบต่อคน: ไม่เกิน ${perPersonBudget.toLocaleString()} บาท (รวมเดินทาง ที่พัก อาหาร กิจกรรม) ค่า totalEstimatedCost ต้องเป็นยอดต่อคนและห้ามเกินงบนี้ ถ้างบไม่พอให้บอกตรงๆ ว่าตัดอะไรออกหรือเสนอทางประหยัด`
  );

  if (prefs.foodStyles.length) {
    lines.push('- สไตล์การกิน:');
    prefs.foodStyles.forEach((id) => lines.push(`  • ${pick(FOOD_OPTIONS, id).rule}`));
  } else {
    lines.push('- สไตล์การกิน: ไม่มีข้อจำกัด แนะนำอาหารขึ้นชื่อของจังหวัดหลากหลายระดับราคา');
  }

  lines.push(`- ความทนแดด: ${pick(SUN_OPTIONS, prefs.sunTolerance).rule}`);
  lines.push(`- ความทนฝน: ${pick(RAIN_OPTIONS, prefs.rainTolerance).rule}`);

  // User-typed details are quoted so the model treats them as information, not instructions
  const detail = (text: string) => (text ? `\n  • รายละเอียดจากผู้ใช้: "${text}"` : '');

  if (prefs.elderlyCount > 0 || prefs.elderlyNote) {
    lines.push(
      `- มีผู้สูงอายุ ${prefs.elderlyCount || 'อย่างน้อย 1'} จาก ${travelersCount} คน: จัดจังหวะเที่ยวช้า วันละไม่เกิน 3-4 จุด พักทุก 2 ชั่วโมง หลีกเลี่ยงการเดินไกลเกิน 1 กม. บันไดสูงชัน และกิจกรรมเสี่ยง เลือกจุดที่มีห้องน้ำและที่นั่งพัก และระบุโรงพยาบาลใกล้ที่พัก${detail(prefs.elderlyNote)}`
    );
  }
  if (prefs.disabledCount > 0 || prefs.disabledNote) {
    lines.push(
      `- มีผู้พิการ/ผู้ใช้วีลแชร์ ${prefs.disabledCount || 'อย่างน้อย 1'} คน: เลือกสถานที่ ร้านอาหาร และที่พักที่มีทางลาด ลิฟต์ ห้องน้ำคนพิการ และที่จอดรถคนพิการ ในคำอธิบายแต่ละกิจกรรมให้บอกว่าเข้าถึงด้วยวีลแชร์ได้หรือไม่ ถ้าไม่มีข้อมูลยืนยันให้เขียนว่า "ควรโทรสอบถามก่อน" ห้ามเดาว่าเข้าถึงได้ และหลีกเลี่ยงเรือเล็ก ทางเดินลูกรัง และจุดชมวิวที่ต้องเดินขึ้นเขา${detail(prefs.disabledNote)}`
    );
  }

  lines.push(`- ${pick(TRANSPORT_OPTIONS, prefs.transport).rule}${detail(prefs.transportNote)}`);
  if (prefs.disabledCount > 0 && prefs.transport === 'public') {
    lines.push('  • เนื่องจากมีผู้ใช้วีลแชร์และใช้ขนส่งสาธารณะ ให้เลือกยานพาหนะที่ขึ้นลงสะดวก เช่น รถไฟ หรือแอปเรียกรถคันใหญ่ แทนสองแถวหรือวินมอเตอร์ไซค์');
  }

  return lines.join('\n');
};
