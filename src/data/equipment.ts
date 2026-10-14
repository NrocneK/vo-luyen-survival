import type { Cost, Slot, Stats, PillId, Resource } from '../shared/models';
export interface EquipmentDef {
  id: string;
  name: string;
  slot: Slot;
  special: boolean;
  stats: Partial<Stats>;
  cost: Cost;
  description: string;
}
export const equipment: Record<string, EquipmentDef> = {
  'dong-quyen-sao': {
    id: 'dong-quyen-sao',
    name: 'Đồng Quyền Sáo',
    slot: 'weapon',
    special: false,
    stats: { damage: 2 },
    cost: { stone: 40, resources: { 'thiet-khoang': 4 } },
    description: 'Quyền pháp; Cương Quyền là kỹ năng mặc định.',
  },
  'thiet-kiem': {
    id: 'thiet-kiem',
    name: 'Thiết Kiếm',
    slot: 'weapon',
    special: false,
    stats: { damage: 3 },
    cost: { stone: 50, resources: { 'thiet-khoang': 5 } },
    description: 'Kiếm pháp; Nguyên Khí Trảm là kỹ năng mặc định.',
  },
  'vo-phuc': {
    id: 'vo-phuc',
    name: 'Võ Phục',
    slot: 'armor',
    special: false,
    stats: { hp: 15, armor: 1 },
    cost: { stone: 45, resources: { 'da-thu': 5 } },
    description: 'Bảo vệ người lịch luyện.',
  },
  'ngoc-gioi': {
    id: 'ngoc-gioi',
    name: 'Ngọc Giới',
    slot: 'jewel',
    special: false,
    stats: { crit: 0.04, pickup: 0.25 },
    cost: { stone: 70, resources: { 'yeu-dan': 2, 'thiet-khoang': 4 } },
    description: 'Linh thức nhạy bén, đòn đánh chính xác.',
  },
  'liet-duong-kiem': {
    id: 'liet-duong-kiem',
    name: 'Liệt Dương Kiếm',
    slot: 'weapon',
    special: true,
    stats: { damage: 10, crit: 0.05 },
    cost: { stone: 220, resources: { 'thiet-khoang': 14, 'yeu-dan': 6 } },
    description: 'Cần bản vẽ. Kiếm khí mang sức mạnh hỏa nguyên.',
  },
  'ngoc-lien-bi-bao': {
    id: 'ngoc-lien-bi-bao',
    name: 'Ngọc Liên Bí Bảo',
    slot: 'relic',
    special: true,
    stats: { hp: 25, regen: 0.4, armor: 2 },
    cost: { stone: 220, resources: { 'linh-thao': 14, 'yeu-dan': 6 } },
    description: 'Cần bản vẽ. Bảo vật duy trì sinh cơ.',
  },
};
export const slotNames: Record<Slot, string> = {
  weapon: 'Vũ khí',
  armor: 'Áo giáp',
  jewel: 'Trang sức',
  relic: 'Bí bảo',
};
export const resourceNames: Record<Resource, string> = {
  'linh-thao': 'Linh thảo',
  'thiet-khoang': 'Thiết khoáng',
  'da-thu': 'Da thú',
  'yeu-dan': 'Yêu đan',
  'thuc-an-sung-vat': 'Thức ăn linh thú',
  'tinh-thach-tien-hoa': 'Tinh thạch tiến hóa',
  'hat-sen-dot-pha': 'Hạt sen đột phá',
  'trung-linh-ho': 'Trứng Linh Hồ',
  'trung-thanh-dieu': 'Trứng Thanh Điểu',
};
export const pillNames: Record<PillId, string> = {
  'tu-vi-dan': 'Tu Vi Đan',
  'cuong-the-dan': 'Cường Thể Đan',
  'hoi-nguyen-dan': 'Hồi Nguyên Đan',
};
