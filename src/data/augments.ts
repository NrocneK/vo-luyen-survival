import type { AugmentDef, AugmentId } from '../shared/augments';
import type { Card } from '../shared/models';
import { worldTwoAugments } from './worldTwoSkills.ts';

// Mỗi kỹ năng chỉ nhận một biến chiêu. Toàn bộ lựa chọn được đặt lại khi sang lượt mới.
export const augments: Record<AugmentId, AugmentDef> = {
  ...worldTwoAugments,
  'quyen-lien-kich': {
    id: 'quyen-lien-kich',
    skill: 'cuong-quyen',
    name: 'Liên Hoàn Kình',
    icon: 'cuong-quyen',
    minRank: 2,
    description:
      'Sau mỗi đòn quyền, phóng thêm một đợt dư kình cùng hướng sau 0,18 giây, gây 55% sát thương đòn chính.',
  },
  'quyen-bang-son': {
    id: 'quyen-bang-son',
    skill: 'cuong-quyen',
    name: 'Băng Sơn Kình',
    icon: 'cuong-quyen',
    minRank: 2,
    description:
      'Gộp các luồng quyền kình thành một luồng lớn, giữ tổng sát thương rồi tăng thêm 45%. Xuyên thêm 2 mục tiêu, đẩy quái thường 0,9 đơn vị; hồi chiêu tăng 20%. Boss và tinh anh không bị đẩy.',
  },
  'kiem-hoi-phong': {
    id: 'kiem-hoi-phong',
    skill: 'nguyen-khi-tram',
    name: 'Hồi Phong Kiếm',
    icon: 'nguyen-khi-tram',
    minRank: 2,
    description:
      'Kiếm khí bay 7 đơn vị rồi quay về, xuyên mọi mục tiêu trên cả hai chiều. Mỗi địch trúng tối đa một lần mỗi chiều; sát thương mỗi lần giảm 15%. Chạm biên bản đồ thì quay về sớm.',
  },
  'kiem-tan-anh': {
    id: 'kiem-tan-anh',
    skill: 'nguyen-khi-tram',
    name: 'Tán Ảnh Kiếm',
    icon: 'nguyen-khi-tram',
    minRank: 2,
    description:
      'Thêm 2 đường kiếm khí và tỏa thành quạt rộng. Mỗi đường gây 70% sát thương gốc, giữ nguyên khả năng xuyên theo bậc.',
  },
  'chuong-tam-hoa': {
    id: 'chuong-tam-hoa',
    skill: 'duong-viem-chuong',
    name: 'Tam Hoa Chưởng',
    icon: 'duong-viem-chuong',
    minRank: 2,
    description:
      'Thêm 2 chưởng lửa theo hình quạt. Mỗi chưởng gây 65% sát thương gốc và nổ riêng khi chạm mục tiêu đầu.',
  },
  'chuong-luu-hoa': {
    id: 'chuong-luu-hoa',
    skill: 'duong-viem-chuong',
    name: 'Lưu Hỏa Chưởng',
    icon: 'duong-viem-chuong',
    minRank: 2,
    description:
      'Vụ nổ để lại vùng lửa trong 3 giây. Mỗi 0,5 giây, địch trong vùng chịu thêm 20% sát thương chưởng; tối đa 8 vùng cùng lúc.',
  },
  'hoan-quang-vuc': {
    id: 'hoan-quang-vuc',
    skill: 'viem-hoan',
    name: 'Quảng Vực Viêm Hoàn',
    icon: 'duong-viem-chuong',
    minRank: 2,
    description:
      'Bán kính Viêm Hoàn tăng thêm 60%, giữ nguyên sát thương mỗi giây. Vòng lửa tiếp tục lớn theo bậc kỹ năng và bám theo nhân vật.',
  },
  'hoan-liet-diem': {
    id: 'hoan-liet-diem',
    skill: 'viem-hoan',
    name: 'Liệt Diễm Viêm Hoàn',
    icon: 'duong-viem-chuong',
    minRank: 2,
    description:
      'Sát thương mỗi giây của Viêm Hoàn tăng 60%, giữ nguyên bán kính theo bậc kỹ năng. Lửa và sóng nhiệt chuyển sang sắc đỏ rực.',
  },
  'loi-song-lien': {
    id: 'loi-song-lien',
    skill: 'loi-lien',
    name: 'Song Liên Lôi',
    icon: 'nguyen-khi-tram',
    minRank: 2,
    description:
      'Phát hai chuỗi sét, mỗi chuỗi giữ số lần truyền theo bậc và gây 70% sát thương. Hai chuỗi không đánh trùng cùng một địch.',
  },
  'loi-tap-kich': {
    id: 'loi-tap-kich',
    skill: 'loi-lien',
    name: 'Tam Điệp Lôi Kích',
    icon: 'nguyen-khi-tram',
    minRank: 2,
    description:
      'Thay chuỗi lan bằng 3 nhịp sét vào một mục tiêu gần nhất, cách nhau 0,16 giây. Mỗi nhịp gây 55% sát thương gốc; dừng nếu mục tiêu đã bị hạ.',
  },
};

export const augmentRules = {
  echoDelay: 0.18,
  echoDamage: 0.55,
  heavyDamage: 1.45,
  heavyCooldown: 1.2,
  heavyPierce: 2,
  knockback: 0.9,
  returnDistance: 7,
  returnDamage: 0.85,
  swordFanDamage: 0.7,
  fireFanDamage: 0.65,
  fanExtra: 2,
  fanSpread: 0.3,
  burnDuration: 3,
  burnInterval: 0.5,
  burnDamage: 0.2,
  maxBurns: 8,
  wideRadius: 1.6,
  ringDamage: 1.6,
  forkDamage: 0.7,
  focusedHits: 3,
  focusedDelay: 0.16,
  focusedDamage: 0.55,
} as const;

export function eligibleAugments(
  selected: string[],
  ranks: Record<string, number>,
  chosen: AugmentId[],
): Card[] {
  const specialized = new Set(chosen.map((id) => augments[id]?.skill));
  return Object.values(augments)
    .filter(
      (def) =>
        selected.includes(def.skill) &&
        (ranks[def.skill] ?? 0) >= def.minRank &&
        !specialized.has(def.skill),
    )
    .map((def) => ({
      id: `augment:${def.id}`,
      kind: 'augment',
      augment: def.id,
      name: def.name,
      icon: def.icon,
      description: def.description,
    }));
}
