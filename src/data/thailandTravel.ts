// Generated: 77 provinces with attractions (from the TripSure attraction list) + centroids from
// OpenGISData-Thailand. Regenerate instead of editing by hand when the list changes.

export type RegionId = 'north' | 'northeast' | 'central' | 'east' | 'south';

export type AttractionCategory =
  | 'waterfall'
  | 'beach'
  | 'temple'
  | 'history'
  | 'cave'
  | 'lake'
  | 'market'
  | 'mountain'
  | 'nature'
  | 'town'
  | 'viewpoint'
  | 'landmark';

export interface Attraction {
  name: string;
  category: AttractionCategory;
}

export interface ProvinceTravel {
  name: string;
  nameEn: string;
  region: RegionId;
  lat: number;
  lon: number;
  attractions: Attraction[];
}

export const PROVINCE_TRAVEL: ProvinceTravel[] = [
 {
  "name": "เชียงราย",
  "nameEn": "Chiang Rai",
  "region": "north",
  "lat": 19.8469,
  "lon": 99.8655,
  "attractions": [
   {
    "name": "วัดร่องขุ่น",
    "category": "temple"
   },
   {
    "name": "ภูชี้ฟ้า",
    "category": "mountain"
   },
   {
    "name": "ดอยตุง",
    "category": "mountain"
   },
   {
    "name": "ไร่ชาฉุยฟง",
    "category": "town"
   },
   {
    "name": "สามเหลี่ยมทองคำ",
    "category": "history"
   }
  ]
 },
 {
  "name": "เชียงใหม่",
  "nameEn": "Chiang Mai",
  "region": "north",
  "lat": 18.7886,
  "lon": 98.726,
  "attractions": [
   {
    "name": "ดอยอินทนนท์",
    "category": "mountain"
   },
   {
    "name": "ดอยสุเทพ",
    "category": "mountain"
   },
   {
    "name": "ม่อนแจ่ม",
    "category": "mountain"
   },
   {
    "name": "แม่กำปอง",
    "category": "town"
   },
   {
    "name": "ดอยอ่างขาง",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "แม่ฮ่องสอน",
  "nameEn": "Mae Hong Son",
  "region": "north",
  "lat": 18.8092,
  "lon": 98.03,
  "attractions": [
   {
    "name": "ปาย",
    "category": "town"
   },
   {
    "name": "บ้านรักไทย",
    "category": "town"
   },
   {
    "name": "ปางอุ๋ง",
    "category": "nature"
   },
   {
    "name": "สะพานซูตองเป้",
    "category": "viewpoint"
   }
  ]
 },
 {
  "name": "น่าน",
  "nameEn": "Nan",
  "region": "north",
  "lat": 18.85,
  "lon": 100.8347,
  "attractions": [
   {
    "name": "ดอยเสมอดาว",
    "category": "mountain"
   },
   {
    "name": "ถนนลอยฟ้า 1081",
    "category": "viewpoint"
   },
   {
    "name": "บ่อเกลือสินเธาว์",
    "category": "town"
   },
   {
    "name": "วัดภูมินทร์",
    "category": "temple"
   }
  ]
 },
 {
  "name": "พะเยา",
  "nameEn": "Phayao",
  "region": "north",
  "lat": 19.2342,
  "lon": 100.1914,
  "attractions": [
   {
    "name": "กว๊านพะเยา",
    "category": "lake"
   },
   {
    "name": "ภูลังกา",
    "category": "mountain"
   },
   {
    "name": "วัดศรีโคมคำ",
    "category": "temple"
   }
  ]
 },
 {
  "name": "ลำปาง",
  "nameEn": "Lampang",
  "region": "north",
  "lat": 18.3261,
  "lon": 99.5113,
  "attractions": [
   {
    "name": "วัดพระธาตุลำปางหลวง",
    "category": "temple"
   },
   {
    "name": "กาดกองต้า",
    "category": "market"
   },
   {
    "name": "อุทยานแห่งชาติแจ้ซ้อน",
    "category": "nature"
   }
  ]
 },
 {
  "name": "ลำพูน",
  "nameEn": "Lamphun",
  "region": "north",
  "lat": 18.1185,
  "lon": 98.9544,
  "attractions": [
   {
    "name": "วัดพระธาตุหริภุญชัย",
    "category": "temple"
   },
   {
    "name": "อุทยานแห่งชาติแม่ปิง",
    "category": "nature"
   }
  ]
 },
 {
  "name": "แพร่",
  "nameEn": "Phrae",
  "region": "north",
  "lat": 18.1995,
  "lon": 100.0643,
  "attractions": [
   {
    "name": "แพะเมืองผี",
    "category": "nature"
   },
   {
    "name": "คุ้มวงศ์บุรี",
    "category": "history"
   },
   {
    "name": "วัดพระธาตุช่อแฮ",
    "category": "temple"
   }
  ]
 },
 {
  "name": "อุตรดิตถ์",
  "nameEn": "Uttaradit",
  "region": "north",
  "lat": 17.7495,
  "lon": 100.5162,
  "attractions": [
   {
    "name": "เขื่อนสิริกิติ์",
    "category": "lake"
   },
   {
    "name": "ภูสอยดาว",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "สุโขทัย",
  "nameEn": "Sukhothai",
  "region": "north",
  "lat": 17.2632,
  "lon": 99.7111,
  "attractions": [
   {
    "name": "อุทยานประวัติศาสตร์สุโขทัย",
    "category": "history"
   },
   {
    "name": "อุทยานประวัติศาสตร์ศรีสัชนาลัย",
    "category": "history"
   }
  ]
 },
 {
  "name": "พิษณุโลก",
  "nameEn": "Phitsanulok",
  "region": "north",
  "lat": 16.9827,
  "lon": 100.5428,
  "attractions": [
   {
    "name": "วัดพระศรีรัตนมหาธาตุ",
    "category": "temple"
   },
   {
    "name": "ภูหินร่องกล้า",
    "category": "mountain"
   },
   {
    "name": "น้ำตกชาติตระการ",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "เพชรบูรณ์",
  "nameEn": "Phetchabun",
  "region": "north",
  "lat": 16.2771,
  "lon": 101.1461,
  "attractions": [
   {
    "name": "ภูทับเบิก",
    "category": "mountain"
   },
   {
    "name": "เขาค้อ",
    "category": "mountain"
   },
   {
    "name": "วัดพระธาตุผาซ่อนแก้ว",
    "category": "temple"
   },
   {
    "name": "อุทยานแห่งชาติน้ำหนาว",
    "category": "nature"
   }
  ]
 },
 {
  "name": "ตาก",
  "nameEn": "Tak",
  "region": "north",
  "lat": 16.7166,
  "lon": 98.794,
  "attractions": [
   {
    "name": "น้ำตกทีลอซู",
    "category": "waterfall"
   },
   {
    "name": "ดอยมะม่วงสามหมื่น",
    "category": "mountain"
   },
   {
    "name": "อุ้มผาง",
    "category": "town"
   }
  ]
 },
 {
  "name": "กำแพงเพชร",
  "nameEn": "Kamphaeng Phet",
  "region": "north",
  "lat": 16.3309,
  "lon": 99.5348,
  "attractions": [
   {
    "name": "อุทยานประวัติศาสตร์กำแพงเพชร",
    "category": "history"
   },
   {
    "name": "บ่อน้ำพุร้อนพระร่วง",
    "category": "lake"
   }
  ]
 },
 {
  "name": "พิจิตร",
  "nameEn": "Phichit",
  "region": "north",
  "lat": 16.2596,
  "lon": 100.3431,
  "attractions": [
   {
    "name": "บึงสีไฟ",
    "category": "lake"
   },
   {
    "name": "วัดท่าหลวง",
    "category": "temple"
   }
  ]
 },
 {
  "name": "เลย",
  "nameEn": "Loei",
  "region": "northeast",
  "lat": 17.4083,
  "lon": 101.635,
  "attractions": [
   {
    "name": "ภูกระดึง",
    "category": "mountain"
   },
   {
    "name": "ภูเรือ",
    "category": "mountain"
   },
   {
    "name": "เชียงคาน",
    "category": "town"
   },
   {
    "name": "ภูป่าเปาะ",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "หนองคาย",
  "nameEn": "Nong Khai",
  "region": "northeast",
  "lat": 17.9403,
  "lon": 102.8332,
  "attractions": [
   {
    "name": "สกายวอล์กวัดผาตากเสื้อ",
    "category": "viewpoint"
   },
   {
    "name": "ศาลาแก้วกู่",
    "category": "temple"
   },
   {
    "name": "ตลาดท่าเสด็จ",
    "category": "market"
   }
  ]
 },
 {
  "name": "บึงกาฬ",
  "nameEn": "Bueng Kan",
  "region": "northeast",
  "lat": 18.1486,
  "lon": 103.7105,
  "attractions": [
   {
    "name": "หินสามวาฬ",
    "category": "nature"
   },
   {
    "name": "ภูทอก",
    "category": "mountain"
   },
   {
    "name": "น้ำตกถ้ำพระ",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "อุดรธานี",
  "nameEn": "Udon Thani",
  "region": "northeast",
  "lat": 17.4249,
  "lon": 102.8637,
  "attractions": [
   {
    "name": "ทะเลบัวแดง",
    "category": "lake"
   },
   {
    "name": "บ้านเชียง",
    "category": "history"
   },
   {
    "name": "วัดป่าภูก้อน",
    "category": "temple"
   }
  ]
 },
 {
  "name": "หนองบัวลำภู",
  "nameEn": "Nong Bua Lamphu",
  "region": "northeast",
  "lat": 17.1818,
  "lon": 102.3023,
  "attractions": [
   {
    "name": "วัดถ้ำกลองเพล",
    "category": "temple"
   },
   {
    "name": "อุทยานแห่งชาติภูเก้า–ภูพานคำ",
    "category": "nature"
   }
  ]
 },
 {
  "name": "สกลนคร",
  "nameEn": "Sakon Nakhon",
  "region": "northeast",
  "lat": 17.3896,
  "lon": 103.8247,
  "attractions": [
   {
    "name": "วัดพระธาตุเชิงชุม",
    "category": "temple"
   },
   {
    "name": "หนองหาร",
    "category": "lake"
   },
   {
    "name": "ภูพาน",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "นครพนม",
  "nameEn": "Nakhon Phanom",
  "region": "northeast",
  "lat": 17.3834,
  "lon": 104.4291,
  "attractions": [
   {
    "name": "วัดพระธาตุพนม",
    "category": "temple"
   },
   {
    "name": "ลานพญาศรีสัตตนาคราช",
    "category": "temple"
   }
  ]
 },
 {
  "name": "มุกดาหาร",
  "nameEn": "Mukdahan",
  "region": "northeast",
  "lat": 16.5616,
  "lon": 104.5176,
  "attractions": [
   {
    "name": "ภูมโนรมย์",
    "category": "mountain"
   },
   {
    "name": "หอแก้วมุกดาหาร",
    "category": "viewpoint"
   },
   {
    "name": "ตลาดอินโดจีน",
    "category": "market"
   }
  ]
 },
 {
  "name": "กาฬสินธุ์",
  "nameEn": "Kalasin",
  "region": "northeast",
  "lat": 16.6281,
  "lon": 103.6218,
  "attractions": [
   {
    "name": "พิพิธภัณฑ์สิรินธร",
    "category": "history"
   },
   {
    "name": "เขื่อนลำปาว",
    "category": "lake"
   }
  ]
 },
 {
  "name": "ขอนแก่น",
  "nameEn": "Khon Kaen",
  "region": "northeast",
  "lat": 16.4081,
  "lon": 102.5787,
  "attractions": [
   {
    "name": "วัดหนองแวง",
    "category": "temple"
   },
   {
    "name": "บึงแก่นนคร",
    "category": "lake"
   },
   {
    "name": "เขื่อนอุบลรัตน์",
    "category": "lake"
   }
  ]
 },
 {
  "name": "มหาสารคาม",
  "nameEn": "Maha Sarakham",
  "region": "northeast",
  "lat": 15.9994,
  "lon": 103.1655,
  "attractions": [
   {
    "name": "พระธาตุนาดูน",
    "category": "temple"
   },
   {
    "name": "สะพานไม้แกดำ",
    "category": "viewpoint"
   }
  ]
 },
 {
  "name": "ร้อยเอ็ด",
  "nameEn": "Roi Et",
  "region": "northeast",
  "lat": 15.9193,
  "lon": 103.813,
  "attractions": [
   {
    "name": "หอโหวด 101",
    "category": "viewpoint"
   },
   {
    "name": "บึงพลาญชัย",
    "category": "lake"
   }
  ]
 },
 {
  "name": "ยโสธร",
  "nameEn": "Yasothon",
  "region": "northeast",
  "lat": 15.8953,
  "lon": 104.3382,
  "attractions": [
   {
    "name": "พระธาตุก่องข้าวน้อย",
    "category": "temple"
   },
   {
    "name": "พิพิธภัณฑ์พญาคันคาก",
    "category": "history"
   }
  ]
 },
 {
  "name": "อำนาจเจริญ",
  "nameEn": "Amnat Charoen",
  "region": "northeast",
  "lat": 15.8922,
  "lon": 104.7407,
  "attractions": [
   {
    "name": "พุทธอุทยานพระมงคลมิ่งเมือง",
    "category": "temple"
   },
   {
    "name": "วัดถ้ำแสงเพชร",
    "category": "temple"
   }
  ]
 },
 {
  "name": "อุบลราชธานี",
  "nameEn": "Ubon Ratchathani",
  "region": "northeast",
  "lat": 15.1832,
  "lon": 105.1108,
  "attractions": [
   {
    "name": "สามพันโบก",
    "category": "nature"
   },
   {
    "name": "ผาแต้ม",
    "category": "mountain"
   },
   {
    "name": "น้ำตกแสงจันทร์",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "ศรีสะเกษ",
  "nameEn": "Sisaket",
  "region": "northeast",
  "lat": 14.8561,
  "lon": 104.3689,
  "attractions": [
   {
    "name": "ผามออีแดง",
    "category": "mountain"
   },
   {
    "name": "วัดไพรพัฒนา",
    "category": "temple"
   }
  ]
 },
 {
  "name": "สุรินทร์",
  "nameEn": "Surin",
  "region": "northeast",
  "lat": 14.8855,
  "lon": 103.6555,
  "attractions": [
   {
    "name": "หมู่บ้านช้างบ้านตากลาง",
    "category": "town"
   },
   {
    "name": "ปราสาทศีขรภูมิ",
    "category": "history"
   }
  ]
 },
 {
  "name": "บุรีรัมย์",
  "nameEn": "Buriram",
  "region": "northeast",
  "lat": 14.8206,
  "lon": 102.9567,
  "attractions": [
   {
    "name": "ปราสาทหินพนมรุ้ง",
    "category": "history"
   },
   {
    "name": "ปราสาทเมืองต่ำ",
    "category": "history"
   },
   {
    "name": "สนามช้างอินเตอร์เนชั่นแนลเซอร์กิต",
    "category": "landmark"
   }
  ]
 },
 {
  "name": "นครราชสีมา",
  "nameEn": "Nakhon Ratchasima",
  "region": "northeast",
  "lat": 14.9563,
  "lon": 102.1092,
  "attractions": [
   {
    "name": "เขาใหญ่",
    "category": "mountain"
   },
   {
    "name": "วังน้ำเขียว",
    "category": "town"
   },
   {
    "name": "พิมาย",
    "category": "history"
   },
   {
    "name": "เขื่อนลำตะคอง",
    "category": "lake"
   }
  ]
 },
 {
  "name": "ชัยภูมิ",
  "nameEn": "Chaiyaphum",
  "region": "northeast",
  "lat": 16.0312,
  "lon": 101.8171,
  "attractions": [
   {
    "name": "ทุ่งดอกกระเจียว",
    "category": "nature"
   },
   {
    "name": "มอหินขาว",
    "category": "mountain"
   },
   {
    "name": "น้ำตกตาดโตน",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "นครสวรรค์",
  "nameEn": "Nakhon Sawan",
  "region": "central",
  "lat": 15.6837,
  "lon": 100.1501,
  "attractions": [
   {
    "name": "บึงบอระเพ็ด",
    "category": "lake"
   },
   {
    "name": "พาสาน",
    "category": "viewpoint"
   },
   {
    "name": "เขาหน่อ",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "อุทัยธานี",
  "nameEn": "Uthai Thani",
  "region": "central",
  "lat": 15.3494,
  "lon": 99.4776,
  "attractions": [
   {
    "name": "หุบป่าตาด",
    "category": "nature"
   },
   {
    "name": "เขาสะแกกรัง",
    "category": "mountain"
   },
   {
    "name": "วัดจันทาราม",
    "category": "temple"
   }
  ]
 },
 {
  "name": "ชัยนาท",
  "nameEn": "Chainat",
  "region": "central",
  "lat": 15.1327,
  "lon": 100.0279,
  "attractions": [
   {
    "name": "สวนนกชัยนาท",
    "category": "nature"
   },
   {
    "name": "เขื่อนเจ้าพระยา",
    "category": "lake"
   }
  ]
 },
 {
  "name": "สิงห์บุรี",
  "nameEn": "Sing Buri",
  "region": "central",
  "lat": 14.912,
  "lon": 100.3472,
  "attractions": [
   {
    "name": "วัดพระนอนจักรสีห์",
    "category": "temple"
   },
   {
    "name": "อุทยานวีรชนค่ายบางระจัน",
    "category": "history"
   }
  ]
 },
 {
  "name": "ลพบุรี",
  "nameEn": "Lopburi",
  "region": "central",
  "lat": 15.1089,
  "lon": 100.9079,
  "attractions": [
   {
    "name": "พระปรางค์สามยอด",
    "category": "temple"
   },
   {
    "name": "เขื่อนป่าสักชลสิทธิ์",
    "category": "lake"
   }
  ]
 },
 {
  "name": "อ่างทอง",
  "nameEn": "Ang Thong",
  "region": "central",
  "lat": 14.624,
  "lon": 100.3484,
  "attractions": [
   {
    "name": "วัดม่วง",
    "category": "temple"
   },
   {
    "name": "วัดขุนอินทประมูล",
    "category": "temple"
   }
  ]
 },
 {
  "name": "สระบุรี",
  "nameEn": "Saraburi",
  "region": "central",
  "lat": 14.6272,
  "lon": 101.0167,
  "attractions": [
   {
    "name": "น้ำตกเจ็ดสาวน้อย",
    "category": "waterfall"
   },
   {
    "name": "วัดพระพุทธบาท",
    "category": "temple"
   },
   {
    "name": "ทุ่งทานตะวัน",
    "category": "nature"
   }
  ]
 },
 {
  "name": "พระนครศรีอยุธยา",
  "nameEn": "Phra Nakhon Si Ayutthaya",
  "region": "central",
  "lat": 14.3452,
  "lon": 100.5271,
  "attractions": [
   {
    "name": "อุทยานประวัติศาสตร์พระนครศรีอยุธยา",
    "category": "history"
   },
   {
    "name": "วัดมหาธาตุ",
    "category": "temple"
   },
   {
    "name": "วัดไชยวัฒนาราม",
    "category": "temple"
   }
  ]
 },
 {
  "name": "สุพรรณบุรี",
  "nameEn": "Suphan Buri",
  "region": "central",
  "lat": 14.6088,
  "lon": 99.8922,
  "attractions": [
   {
    "name": "บึงฉวาก",
    "category": "lake"
   },
   {
    "name": "หอคอยบรรหาร–แจ่มใส",
    "category": "viewpoint"
   },
   {
    "name": "วัดป่าเลไลยก์",
    "category": "temple"
   }
  ]
 },
 {
  "name": "กาญจนบุรี",
  "nameEn": "Kanchanaburi",
  "region": "central",
  "lat": 14.5838,
  "lon": 99.049,
  "attractions": [
   {
    "name": "น้ำตกเอราวัณ",
    "category": "waterfall"
   },
   {
    "name": "สะพานข้ามแม่น้ำแคว",
    "category": "history"
   },
   {
    "name": "สังขละบุรี",
    "category": "town"
   },
   {
    "name": "เขื่อนศรีนครินทร์",
    "category": "lake"
   }
  ]
 },
 {
  "name": "ราชบุรี",
  "nameEn": "Ratchaburi",
  "region": "central",
  "lat": 13.5346,
  "lon": 99.5778,
  "attractions": [
   {
    "name": "สวนผึ้ง",
    "category": "nature"
   },
   {
    "name": "ตลาดน้ำดำเนินสะดวก",
    "category": "market"
   },
   {
    "name": "อุทยานหินเขางู",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "นครปฐม",
  "nameEn": "Nakhon Pathom",
  "region": "central",
  "lat": 13.9242,
  "lon": 100.1026,
  "attractions": [
   {
    "name": "พระปฐมเจดีย์",
    "category": "temple"
   },
   {
    "name": "ตลาดน้ำดอนหวาย",
    "category": "market"
   },
   {
    "name": "พระราชวังสนามจันทร์",
    "category": "history"
   }
  ]
 },
 {
  "name": "นนทบุรี",
  "nameEn": "Nonthaburi",
  "region": "central",
  "lat": 13.925,
  "lon": 100.3922,
  "attractions": [
   {
    "name": "เกาะเกร็ด",
    "category": "town"
   },
   {
    "name": "วัดเฉลิมพระเกียรติ",
    "category": "temple"
   }
  ]
 },
 {
  "name": "ปทุมธานี",
  "nameEn": "Pathum Thani",
  "region": "central",
  "lat": 14.065,
  "lon": 100.682,
  "attractions": [
   {
    "name": "วัดปัญญานันทาราม",
    "category": "temple"
   },
   {
    "name": "พิพิธภัณฑ์วิทยาศาสตร์แห่งชาติ",
    "category": "history"
   }
  ]
 },
 {
  "name": "กรุงเทพมหานคร",
  "nameEn": "Bangkok",
  "region": "central",
  "lat": 13.771,
  "lon": 100.6219,
  "attractions": [
   {
    "name": "พระบรมมหาราชวัง",
    "category": "history"
   },
   {
    "name": "วัดอรุณ",
    "category": "temple"
   },
   {
    "name": "เยาวราช",
    "category": "market"
   },
   {
    "name": "วัดโพธิ์",
    "category": "temple"
   },
   {
    "name": "สวนเบญจกิติ",
    "category": "nature"
   }
  ]
 },
 {
  "name": "สมุทรปราการ",
  "nameEn": "Samut Prakan",
  "region": "central",
  "lat": 13.5961,
  "lon": 100.709,
  "attractions": [
   {
    "name": "เมืองโบราณ",
    "category": "history"
   },
   {
    "name": "สถานตากอากาศบางปู",
    "category": "beach"
   },
   {
    "name": "พิพิธภัณฑ์ช้างเอราวัณ",
    "category": "history"
   }
  ]
 },
 {
  "name": "สมุทรสาคร",
  "nameEn": "Samut Sakhon",
  "region": "central",
  "lat": 13.5689,
  "lon": 100.2124,
  "attractions": [
   {
    "name": "ตลาดมหาชัย",
    "category": "market"
   },
   {
    "name": "สะพานแดง จุดชมปลาโลมา",
    "category": "viewpoint"
   }
  ]
 },
 {
  "name": "สมุทรสงคราม",
  "nameEn": "Samut Songkhram",
  "region": "central",
  "lat": 13.397,
  "lon": 99.9534,
  "attractions": [
   {
    "name": "ตลาดน้ำอัมพวา",
    "category": "market"
   },
   {
    "name": "ตลาดร่มหุบ",
    "category": "market"
   },
   {
    "name": "ดอนหอยหลอด",
    "category": "beach"
   }
  ]
 },
 {
  "name": "นครนายก",
  "nameEn": "Nakhon Nayok",
  "region": "east",
  "lat": 14.2172,
  "lon": 101.171,
  "attractions": [
   {
    "name": "เขื่อนขุนด่านปราการชล",
    "category": "lake"
   },
   {
    "name": "น้ำตกนางรอง",
    "category": "waterfall"
   },
   {
    "name": "น้ำตกสาริกา",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "ปราจีนบุรี",
  "nameEn": "Prachin Buri",
  "region": "east",
  "lat": 14.0479,
  "lon": 101.6481,
  "attractions": [
   {
    "name": "อุทยานแห่งชาติทับลาน",
    "category": "nature"
   },
   {
    "name": "น้ำตกเหวนรกฝั่งเขาใหญ่",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "สระแก้ว",
  "nameEn": "Sa Kaeo",
  "region": "east",
  "lat": 13.7883,
  "lon": 102.3218,
  "attractions": [
   {
    "name": "ละลุ",
    "category": "nature"
   },
   {
    "name": "ปราสาทสด๊กก๊อกธม",
    "category": "history"
   }
  ]
 },
 {
  "name": "ฉะเชิงเทรา",
  "nameEn": "Chachoengsao",
  "region": "east",
  "lat": 13.6065,
  "lon": 101.4257,
  "attractions": [
   {
    "name": "วัดโสธรวราราม",
    "category": "temple"
   },
   {
    "name": "ตลาดบ้านใหม่ 100 ปี",
    "category": "market"
   }
  ]
 },
 {
  "name": "ชลบุรี",
  "nameEn": "Chonburi",
  "region": "east",
  "lat": 13.1907,
  "lon": 101.2024,
  "attractions": [
   {
    "name": "เกาะล้าน",
    "category": "beach"
   },
   {
    "name": "พัทยา",
    "category": "beach"
   },
   {
    "name": "บางแสน",
    "category": "beach"
   },
   {
    "name": "เกาะสีชัง",
    "category": "beach"
   },
   {
    "name": "สวนนงนุช",
    "category": "nature"
   }
  ]
 },
 {
  "name": "ระยอง",
  "nameEn": "Rayong",
  "region": "east",
  "lat": 12.8534,
  "lon": 101.4288,
  "attractions": [
   {
    "name": "เกาะเสม็ด",
    "category": "beach"
   },
   {
    "name": "หาดแม่รำพึง",
    "category": "beach"
   },
   {
    "name": "ทุ่งโปรงทอง",
    "category": "nature"
   }
  ]
 },
 {
  "name": "จันทบุรี",
  "nameEn": "Chanthaburi",
  "region": "east",
  "lat": 12.8805,
  "lon": 102.1299,
  "attractions": [
   {
    "name": "น้ำตกพลิ้ว",
    "category": "waterfall"
   },
   {
    "name": "อ่าวคุ้งกระเบน",
    "category": "beach"
   },
   {
    "name": "เขาคิชฌกูฏ",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "ตราด",
  "nameEn": "Trat",
  "region": "east",
  "lat": 12.3173,
  "lon": 102.5206,
  "attractions": [
   {
    "name": "เกาะช้าง",
    "category": "beach"
   },
   {
    "name": "เกาะกูด",
    "category": "beach"
   },
   {
    "name": "เกาะหมาก",
    "category": "beach"
   },
   {
    "name": "หาดบานชื่น",
    "category": "beach"
   }
  ]
 },
 {
  "name": "เพชรบุรี",
  "nameEn": "Phetchaburi",
  "region": "south",
  "lat": 12.9471,
  "lon": 99.6187,
  "attractions": [
   {
    "name": "ชะอำ",
    "category": "beach"
   },
   {
    "name": "เขาวัง",
    "category": "mountain"
   },
   {
    "name": "ถ้ำเขาหลวง",
    "category": "cave"
   },
   {
    "name": "แก่งกระจาน",
    "category": "nature"
   }
  ]
 },
 {
  "name": "ประจวบคีรีขันธ์",
  "nameEn": "Prachuap Khiri Khan",
  "region": "south",
  "lat": 11.9458,
  "lon": 99.6347,
  "attractions": [
   {
    "name": "หัวหิน",
    "category": "beach"
   },
   {
    "name": "อ่าวมะนาว",
    "category": "beach"
   },
   {
    "name": "เขาสามร้อยยอด",
    "category": "mountain"
   },
   {
    "name": "หาดบ้านกรูด",
    "category": "beach"
   }
  ]
 },
 {
  "name": "ชุมพร",
  "nameEn": "Chumphon",
  "region": "south",
  "lat": 10.3442,
  "lon": 99.0613,
  "attractions": [
   {
    "name": "หาดทุ่งวัวแล่น",
    "category": "beach"
   },
   {
    "name": "เกาะง่าม",
    "category": "beach"
   },
   {
    "name": "จุดชมวิวเขามัทรี",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "ระนอง",
  "nameEn": "Ranong",
  "region": "south",
  "lat": 9.9702,
  "lon": 98.699,
  "attractions": [
   {
    "name": "เกาะพยาม",
    "category": "beach"
   },
   {
    "name": "บ่อน้ำร้อนรักษะวาริน",
    "category": "lake"
   },
   {
    "name": "ภูเขาหญ้า",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "สุราษฎร์ธานี",
  "nameEn": "Surat Thani",
  "region": "south",
  "lat": 9.0512,
  "lon": 99.0893,
  "attractions": [
   {
    "name": "เกาะสมุย",
    "category": "beach"
   },
   {
    "name": "เกาะพะงัน",
    "category": "beach"
   },
   {
    "name": "เกาะเต่า",
    "category": "beach"
   },
   {
    "name": "เขื่อนเชี่ยวหลาน",
    "category": "lake"
   },
   {
    "name": "เขาสก",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "พังงา",
  "nameEn": "Phang Nga",
  "region": "south",
  "lat": 8.6759,
  "lon": 98.417,
  "attractions": [
   {
    "name": "หมู่เกาะสิมิลัน",
    "category": "beach"
   },
   {
    "name": "เกาะตาชัย",
    "category": "beach"
   },
   {
    "name": "เขาตะปู",
    "category": "mountain"
   },
   {
    "name": "เสม็ดนางชี",
    "category": "viewpoint"
   }
  ]
 },
 {
  "name": "ภูเก็ต",
  "nameEn": "Phuket",
  "region": "south",
  "lat": 7.9704,
  "lon": 98.3457,
  "attractions": [
   {
    "name": "แหลมพรหมเทพ",
    "category": "beach"
   },
   {
    "name": "หาดป่าตอง",
    "category": "beach"
   },
   {
    "name": "หาดกะตะ",
    "category": "beach"
   },
   {
    "name": "เมืองเก่าภูเก็ต",
    "category": "history"
   }
  ]
 },
 {
  "name": "กระบี่",
  "nameEn": "Krabi",
  "region": "south",
  "lat": 8.1411,
  "lon": 99.0076,
  "attractions": [
   {
    "name": "หาดไร่เลย์",
    "category": "beach"
   },
   {
    "name": "ทะเลแหวก",
    "category": "beach"
   },
   {
    "name": "หมู่เกาะพีพี",
    "category": "beach"
   },
   {
    "name": "สระมรกต",
    "category": "lake"
   }
  ]
 },
 {
  "name": "นครศรีธรรมราช",
  "nameEn": "Nakhon Si Thammarat",
  "region": "south",
  "lat": 8.3793,
  "lon": 99.7869,
  "attractions": [
   {
    "name": "หมู่บ้านคีรีวง",
    "category": "town"
   },
   {
    "name": "วัดพระมหาธาตุ",
    "category": "temple"
   },
   {
    "name": "ขนอม",
    "category": "beach"
   },
   {
    "name": "น้ำตกกรุงชิง",
    "category": "waterfall"
   }
  ]
 },
 {
  "name": "ตรัง",
  "nameEn": "Trang",
  "region": "south",
  "lat": 7.544,
  "lon": 99.5951,
  "attractions": [
   {
    "name": "ถ้ำมรกต",
    "category": "cave"
   },
   {
    "name": "เกาะกระดาน",
    "category": "beach"
   },
   {
    "name": "เกาะมุก",
    "category": "beach"
   }
  ]
 },
 {
  "name": "พัทลุง",
  "nameEn": "Phatthalung",
  "region": "south",
  "lat": 7.5163,
  "lon": 100.0702,
  "attractions": [
   {
    "name": "ทะเลน้อย",
    "category": "lake"
   },
   {
    "name": "เขาอกทะลุ",
    "category": "mountain"
   },
   {
    "name": "ควนนกเต้น",
    "category": "mountain"
   }
  ]
 },
 {
  "name": "สตูล",
  "nameEn": "Satun",
  "region": "south",
  "lat": 6.8347,
  "lon": 99.9282,
  "attractions": [
   {
    "name": "เกาะหลีเป๊ะ",
    "category": "beach"
   },
   {
    "name": "เกาะอาดัง",
    "category": "beach"
   },
   {
    "name": "ปราสาทหินพันยอด",
    "category": "history"
   }
  ]
 },
 {
  "name": "สงขลา",
  "nameEn": "Songkhla",
  "region": "south",
  "lat": 6.9341,
  "lon": 100.5458,
  "attractions": [
   {
    "name": "หาดสมิหลา",
    "category": "beach"
   },
   {
    "name": "เมืองเก่าสงขลา",
    "category": "history"
   },
   {
    "name": "เกาะยอ",
    "category": "beach"
   }
  ]
 },
 {
  "name": "ปัตตานี",
  "nameEn": "Pattani",
  "region": "south",
  "lat": 6.7307,
  "lon": 101.3498,
  "attractions": [
   {
    "name": "มัสยิดกรือเซะ",
    "category": "temple"
   },
   {
    "name": "หาดตะโละกาโปร์",
    "category": "beach"
   }
  ]
 },
 {
  "name": "ยะลา",
  "nameEn": "Yala",
  "region": "south",
  "lat": 6.1904,
  "lon": 101.2279,
  "attractions": [
   {
    "name": "ทะเลหมอกอัยเยอร์เวง",
    "category": "mountain"
   },
   {
    "name": "เขื่อนบางลาง",
    "category": "lake"
   },
   {
    "name": "เบตง",
    "category": "town"
   }
  ]
 },
 {
  "name": "นราธิวาส",
  "nameEn": "Narathiwat",
  "region": "south",
  "lat": 6.1779,
  "lon": 101.7185,
  "attractions": [
   {
    "name": "หาดนราทัศน์",
    "category": "beach"
   },
   {
    "name": "ป่าพรุโต๊ะแดง",
    "category": "nature"
   },
   {
    "name": "อ่าวมะนาว",
    "category": "beach"
   }
  ]
 }
];
