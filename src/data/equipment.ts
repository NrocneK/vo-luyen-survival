import type { Cost, Slot, Stats, PillId, Resource } from '../shared/models';
import { worldTwoEquipment } from './worldTwoEquipment.ts';
export interface EquipmentDef {
  id: string;
  name: string;
  slot: Slot;
  special: boolean;
  stats: Partial<Stats>;
  cost: Cost;
  description: string;
  icon?: string;
  requiredRealm?: number;
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
    slot: 'body',
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
  'huyen-thiet-quyen-sao': {
    id: 'huyen-thiet-quyen-sao',
    name: 'Huyền Thiết Quyền Sáo',
    icon: 'dong-quyen-sao',
    slot: 'weapon',
    special: false,
    requiredRealm: 19,
    stats: { damage: 20, armor: 2 },
    cost: { stone: 650, resources: { 'thiet-khoang': 30, 'yeu-dan': 8 } },
    description: 'Quyền sáo Khí Động. Cường hóa quyền kình và hộ thể.',
  },
  'huyen-giap': {
    id: 'huyen-giap',
    name: 'Huyền Giáp',
    icon: 'vo-phuc',
    slot: 'body',
    special: false,
    requiredRealm: 19,
    stats: { hp: 100, armor: 5 },
    cost: { stone: 600, resources: { 'da-thu': 28, 'thiet-khoang': 18 } },
    description: 'Giáp lịch luyện Khí Động, tăng sức chống chịu trước tinh anh.',
  },
  'chan-duong-kiem': {
    id: 'chan-duong-kiem',
    name: 'Chân Dương Kiếm',
    icon: 'liet-duong-kiem',
    slot: 'weapon',
    special: true,
    requiredRealm: 28,
    stats: { damage: 40, crit: 0.08 },
    cost: { stone: 1400, resources: { 'thiet-khoang': 55, 'yeu-dan': 22 } },
    description: 'Kiếm Chân Nguyên. Bản vẽ nhận khi lần đầu vượt Cửu Âm Sơn Cốc.',
  },
  'than-thuc-ngoc': {
    id: 'than-thuc-ngoc',
    name: 'Thần Thức Ngọc',
    icon: 'ngoc-gioi',
    slot: 'jewel',
    special: false,
    requiredRealm: 37,
    stats: { crit: 0.1, haste: 0.1, pickup: 0.6 },
    cost: { stone: 1800, resources: { 'yeu-dan': 28, 'thiet-khoang': 40 } },
    description: 'Trang sức Thần Du, tăng chí mạng, tốc đánh và tầm thu thập.',
  },
  'truyen-thua-bi-bao': {
    id: 'truyen-thua-bi-bao',
    name: 'Truyền Thừa Bí Bảo',
    icon: 'ngoc-lien-bi-bao',
    slot: 'relic',
    special: true,
    requiredRealm: 37,
    stats: { hp: 160, regen: 1.2, armor: 7 },
    cost: { stone: 1900, resources: { 'linh-thao': 60, 'yeu-dan': 30 } },
    description: 'Bí bảo Thần Du. Bản vẽ nhận khi lần đầu vượt Ly Địa.',
  },
};
Object.assign(equipment, worldTwoEquipment);
export const slotNames: Record<Slot, string> = {
  weapon: 'Vũ khí',
  head: 'Đầu',
  body: 'Thân',
  hands: 'Tay',
  feet: 'Chân',
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
  'linh-tai-thong-huyen': 'Linh Tài Thông Huyền',
};
export const pillNames: Record<PillId, string> = {
  'tu-vi-dan': 'Tu Vi Đan',
  'cuong-the-dan': 'Cường Thể Đan',
  'hoi-nguyen-dan': 'Hồi Nguyên Đan',
};
