import type { SkillDef } from '../shared/models';
import type { AugmentDef } from '../shared/augments';

export const worldTwoAttackIds = [
  'diet-hon-kim-quang',
  'gia-thien-thu',
  'kim-long-hien-hoa',
] as const;
export type WorldTwoAttackId = (typeof worldTwoAttackIds)[number];
export const advancedRules = {
  'diet-hon-kim-quang': {
    power: [1.5, 1.85, 2.2, 2.55, 2.9, 4],
    cooldown: [3.8, 3.6, 3.4, 3.2, 3, 2.8],
    minimum: 1,
    windup: 0.2,
  },
  'gia-thien-thu': {
    power: [3, 3.8, 4.6, 5.4, 6.2, 8],
    cooldown: [5.5, 5.3, 5.1, 4.9, 4.7, 4.5],
    radius: [1.6, 1.8, 2, 2.2, 2.4, 2.6],
    minimum: 1.5,
    windup: 0.8,
  },
  'kim-long-hien-hoa': {
    power: [6, 8, 10, 12, 14, 18],
    cooldown: [9, 8.6, 8.2, 7.8, 7.4, 7],
    length: [7, 7.5, 8, 8.5, 9, 10],
    width: [1.2, 1.3, 1.4, 1.5, 1.6, 1.8],
    minimum: 2,
    windup: 0.35,
    roamDuration: 4.8,
    contactInterval: 1,
    contactPower: 0.4,
  },
} as const;
export const worldTwoSkillDefs: Record<string, SkillDef> = {
  'diet-hon-kim-quang': {
    id: 'diet-hon-kim-quang',
    name: 'Diệt Hồn Kim Quang',
    kind: 'attack',
    realm: 47,
    requiredStageId: 'co-ma',
    icon: 'diet-hon-kim-quang',
    effect: 'soul-beam',
    linked: 'nhap-ma',
    awakened: 'Diệt Thế Kim Quang',
    description:
      'Tia Kim Quang xuyên thẳng tầm 12, đánh dấu địch 3 giây để tăng sát thương từ nhân vật và linh thú.',
  },
  'gia-thien-thu': {
    id: 'gia-thien-thu',
    name: 'Già Thiên Thủ',
    kind: 'attack',
    realm: 50,
    requiredStageId: 'thanh-lang',
    icon: 'gia-thien-thu',
    effect: 'demon-palm',
    linked: 'nhap-ma',
    awakened: 'Già Thiên Ma Thủ',
    description:
      'Chưởng lực tụ trên không rồi giáng sau 0,8 giây, để lại dấu bàn tay; đẩy quái thường. Thức tỉnh thêm một chưởng chấn.',
  },
  'kim-long-hien-hoa': {
    id: 'kim-long-hien-hoa',
    name: 'Kim Long Hiển Hóa',
    kind: 'attack',
    realm: 51,
    requiredStageId: 'long-phuong-phu',
    icon: 'kim-long-hien-hoa',
    effect: 'golden-dragon',
    linked: 'phong-loi-vu-duc',
    awakened: 'Phong Lôi Kim Long',
    description:
      'Kim long bay từ nhân vật, lượn quanh người 4,8 giây và gây sát thương khi thân rồng chạm địch. Chọn Du Long hoặc Long Tức.',
  },
  'nhap-ma': {
    id: 'nhap-ma',
    name: 'Nhập Ma',
    kind: 'support',
    realm: 47,
    requiredStageId: 'co-ma',
    icon: 'nhap-ma',
    effect: 'demon-aura',
    description:
      'Bạo phát mỗi 12 giây: tăng 20–40% công và giảm 10–18% sát thương nhận trong 3–5 giây. Liên kết thức tỉnh Kim Quang/Già Thiên.',
  },
  'phong-loi-vu-duc': {
    id: 'phong-loi-vu-duc',
    name: 'Phong Lôi Vũ Dực',
    kind: 'support',
    realm: 47,
    requiredStageId: 'phe-hon-trung',
    icon: 'phong-loi-vu-duc',
    effect: 'wind-feather',
    description:
      'Hai lượt lướt hồi lần lượt. Mỗi bậc giảm hồi từ 4,2 xuống 3 giây; kết hợp Khinh Thân Quyết, không tăng bất tử.',
  },
};
export type NewAugmentId =
  | 'quang-tan'
  | 'quang-pha-hon'
  | 'thu-tran-dia'
  | 'thu-diep-chuong'
  | 'long-du'
  | 'long-tuc';
export const worldTwoAugments: Record<NewAugmentId, AugmentDef> = {
  'quang-tan': {
    id: 'quang-tan',
    skill: 'diet-hon-kim-quang',
    name: 'Tán Quang',
    icon: 'quang-tan',
    minRank: 2,
    description:
      'Ba tia xuyên thẳng tầm 12, xòe 34°. Sát thương còn 80%, dấu ấn còn 75%; một địch chỉ nhận một lần mỗi lần bắn.',
  },
  'quang-pha-hon': {
    id: 'quang-pha-hon',
    skill: 'diet-hon-kim-quang',
    name: 'Phá Hồn',
    icon: 'quang-pha-hon',
    minRank: 2,
    description:
      'Tia hội tụ tầm 16; sát thương tăng 30%, sức mạnh dấu ấn tăng 25%. Ưu tiên hướng boss/tinh anh.',
  },
  'thu-tran-dia': {
    id: 'thu-tran-dia',
    skill: 'gia-thien-thu',
    name: 'Trấn Địa',
    icon: 'thu-tran-dia',
    minRank: 2,
    description:
      'Chưởng còn 85% sát thương; vùng ấn 2,5 giây làm chậm quái thường/tinh anh/boss 35/20/10%.',
  },
  'thu-diep-chuong': {
    id: 'thu-diep-chuong',
    skill: 'gia-thien-thu',
    name: 'Điệp Chưởng',
    icon: 'thu-diep-chuong',
    minRank: 2,
    description:
      'Hai chưởng cùng tâm, cách 0,3 giây, mỗi chưởng 65% sát thương. Chỉ chưởng cuối đẩy.',
  },
  'long-du': {
    id: 'long-du',
    skill: 'kim-long-hien-hoa',
    name: 'Du Long',
    icon: 'long-du',
    minRank: 2,
    description:
      'Rồng bay lượn ngẫu nhiên quanh nhân vật trong 6 giây, vùng bay rộng hơn 40%, thân rộng hơn 25%. Va chạm gây 40% sát thương cơ bản, mỗi địch cách ít nhất 1 giây.',
  },
  'long-tuc': {
    id: 'long-tuc',
    skill: 'kim-long-hien-hoa',
    name: 'Long Tức',
    icon: 'long-tuc',
    minRank: 2,
    description:
      'Luồng phun cố định 1,4 giây, bảy nhịp mỗi 0,2 giây. Giữ địch trong toàn luồng gây tổng 140% sát thương cơ bản.',
  },
};
export function advancedDescription(id: WorldTwoAttackId): string {
  const rule = advancedRules[id];
  return (
    `Bậc 6: ${rule.power[5]}× công kích; hồi ${rule.cooldown[5]} giây trước tốc đánh. ` +
    (id === 'diet-hon-kim-quang'
      ? 'Giữ nhánh; ấn tăng 20% sát thương (boss 10%), nổ thần hồn sau 2 giây.'
      : id === 'gia-thien-thu'
        ? 'Giữ nhánh; thêm đúng một chưởng chấn 3× công, kích thước 3, cùng hình bàn tay.'
        : 'Giữ nhánh; Du Long thêm 35% sát thương va chạm, Long Tức thêm lôi kình trong luồng phun.')
  );
}
