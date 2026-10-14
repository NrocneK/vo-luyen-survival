import type { Cost, Stats } from '../shared/models';
export const pets: Record<
  string,
  {
    id: string;
    name: string;
    evolvedName: string;
    actor: string;
    evolvedActor: string;
    egg: 'trung-linh-ho' | 'trung-thanh-dieu';
    cost: Cost;
    passive: Partial<Stats>;
    description: string;
  }
> = {
  'linh-ho': {
    id: 'linh-ho',
    name: 'Linh Hồ',
    evolvedName: 'Ngọc Vĩ Linh Hồ',
    actor: 'linh-ho',
    evolvedActor: 'linh-ho-tien-hoa',
    egg: 'trung-linh-ho',
    cost: { stone: 80, resources: { 'trung-linh-ho': 1 } },
    passive: { pickup: 0.2, hp: 5 },
    description: 'Nội tại tăng máu/hút XP cho mỗi bậc; đồng hành cắn, quật đuôi, vồ địch.',
  },
  'thanh-dieu': {
    id: 'thanh-dieu',
    name: 'Thanh Điểu',
    evolvedName: 'Phong Linh Loan',
    actor: 'thanh-dieu',
    evolvedActor: 'thanh-dieu-tien-hoa',
    egg: 'trung-thanh-dieu',
    cost: { stone: 100, resources: { 'trung-thanh-dieu': 1 } },
    passive: { damage: 1, crit: 0.01 },
    description: 'Nội tại tăng công/chí mạng cho mỗi bậc; đồng hành bắn linh vũ từ xa.',
  },
};
