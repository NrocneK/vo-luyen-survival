import type { WeaponId } from '../shared/types';

// Vũ khí quyết định actor tám hướng và kỹ năng mặc định bậc 1 của mỗi lượt.
export const weapons = {
  fists: {
    id: 'fists',
    name: 'Đồng Quyền Sáo',
    discipline: 'Quyền pháp',
    actorId: 'duong-khai',
    icon: 'assets/v3/equipment/equipment/dong-quyen-sao.png',
    description: 'Đấm thẳng, đổi tay và móc lên.',
    startingSkill: 'cuong-quyen',
  },
  sword: {
    id: 'sword',
    name: 'Thiết Kiếm',
    discipline: 'Kiếm pháp',
    actorId: 'duong-khai-kiem',
    icon: 'assets/v3/equipment/equipment/thiet-kiem.png',
    description: 'Chém chéo thuận, chéo ngược và quét ngang.',
    startingSkill: 'nguyen-khi-tram',
  },
} as const satisfies Record<
  WeaponId,
  {
    id: WeaponId;
    name: string;
    discipline: string;
    actorId: string;
    icon: string;
    description: string;
    startingSkill: string;
  }
>;
