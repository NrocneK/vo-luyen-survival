import type { Cost, PillId } from '../shared/models';
export function pillName(realm: number, id: PillId): string {
  return (
    realm >= 47
      ? {
          'tu-vi-dan': 'Ngưng Nguyên Đan',
          'hoi-nguyen-dan': 'Hồi Xuân Đan',
          'cuong-the-dan': 'Tẩy Tủy Đan',
        }
      : {
          'tu-vi-dan': 'Tu Vi Đan',
          'hoi-nguyen-dan': 'Hồi Nguyên Đan',
          'cuong-the-dan': 'Cường Thể Đan',
        }
  )[id];
}
export const recipes: { id: PillId; name: string; xp: number; cost: Cost; description: string }[] =
  [
    {
      id: 'tu-vi-dan',
      name: 'Tu Vi Đan',
      xp: 0,
      cost: { stone: 25, resources: { 'linh-thao': 3 } },
      description: 'Dùng tại lobby để tăng tu vi; hiệu lực tăng theo cảnh giới. Không tự đột phá.',
    },
    {
      id: 'hoi-nguyen-dan',
      name: 'Hồi Nguyên Đan',
      xp: 0,
      cost: { stone: 20, resources: { 'linh-thao': 2 } },
      description: 'Mang tối đa 3 viên vào màn. Phím Q hồi 45% máu; hồi chiêu 20 giây.',
    },
    {
      id: 'cuong-the-dan',
      name: 'Cường Thể Đan',
      xp: 4,
      cost: { stone: 60, resources: { 'linh-thao': 5, 'yeu-dan': 2 } },
      description: 'Dùng tại lobby: vĩnh viễn +8 máu, +1 công. Tối đa 5 viên.',
    },
  ];
