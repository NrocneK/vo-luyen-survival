import type { AugmentId } from '../shared/augments';
import { augments, augmentRules } from './augments.ts';
import {
  primaryAttack,
  firePalmAttack,
  lightningAttack,
  type PrimarySkillId,
} from './combatSkills.ts';
import { flameRingRadius } from './skillEffects.ts';
import { advancedDescription, worldTwoAttackIds, type WorldTwoAttackId } from './worldTwoSkills.ts';

export type AttackSkillId =
  | PrimarySkillId
  | 'duong-viem-chuong'
  | 'viem-hoan'
  | 'loi-lien'
  | WorldTwoAttackId;
export interface AwakeningDef {
  skill: AttackSkillId;
  support: string;
  name: string;
  icon: string;
  identity: string;
}
export const awakenings: Record<AttackSkillId, AwakeningDef> = {
  'diet-hon-kim-quang': {
    skill: 'diet-hon-kim-quang',
    support: 'nhap-ma',
    name: 'Diệt Thế Kim Quang',
    icon: 'diet-the-kim-quang',
    identity: 'Ấn thần hồn nổ sau 2 giây; làm mới không lùi lần nổ.',
  },
  'gia-thien-thu': {
    skill: 'gia-thien-thu',
    support: 'nhap-ma',
    name: 'Già Thiên Ma Thủ',
    icon: 'gia-thien-ma-thu',
    identity: 'Một xung chấn sau chuỗi chưởng, giữ nguyên biến chiêu.',
  },
  'kim-long-hien-hoa': {
    skill: 'kim-long-hien-hoa',
    support: 'phong-loi-vu-duc',
    name: 'Phong Lôi Kim Long',
    icon: 'phong-loi-kim-long',
    identity: 'Long ảnh và lôi kình dùng chung vùng thật.',
  },
  'cuong-quyen': {
    skill: 'cuong-quyen',
    support: 'cuong-the',
    name: 'Long Viêm Quyền',
    icon: 'long-viem-quyen',
    identity: 'Quyền kình mạnh, xuyên suốt đội hình.',
  },
  'nguyen-khi-tram': {
    skill: 'nguyen-khi-tram',
    support: 'tu-khi',
    name: 'Kiếm Khí Phong Bạo',
    icon: 'kiem-khi-phong-bao',
    identity: 'Kiếm khí nhanh, nhiều đường và xuyên không giới hạn.',
  },
  'duong-viem-chuong': {
    skill: 'duong-viem-chuong',
    support: 'hoa-linh',
    name: 'Kim Ô Phần Thiên Chưởng',
    icon: 'duong-viem-chuong',
    identity: 'Ba chưởng kim diễm xuyên địch, nổ lớn ở va chạm đầu.',
  },
  'viem-hoan': {
    skill: 'viem-hoan',
    support: 'hoa-linh',
    name: 'Liên Hoa Viêm Giới',
    icon: 'duong-viem-chuong',
    identity: 'Vùng lửa lớn bám nhân vật, đốt liên tục và phát sóng nhiệt.',
  },
  'loi-lien': {
    skill: 'loi-lien',
    support: 'loi-tam',
    name: 'Cửu Thiên Lôi Liên',
    icon: 'nguyen-khi-tram',
    identity: 'Lôi liên xa và nhanh hơn, truyền tới mười mục tiêu mỗi chuỗi.',
  },
};
export function awakeningFor(id: string): AwakeningDef | undefined {
  return Object.hasOwn(awakenings, id) ? awakenings[id as AttackSkillId] : undefined;
}
export function awakeningLink(id: AttackSkillId) {
  const def = awakenings[id];
  return { linked: def.support, awakened: def.name };
}
export function canAwaken(id: string, ranks: Record<string, number>): boolean {
  const def = awakeningFor(id);
  const support = def ? (ranks[def.support] ?? 0) : 0;
  return !!def && ranks[id] === 5 && Number.isInteger(support) && support >= 1 && support <= 5;
}
const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
export function awakeningDescription(id: AttackSkillId, chosen: AugmentId[] = []): string {
  if ((worldTwoAttackIds as readonly string[]).includes(id)) {
    const augment = chosen.map((entry) => augments[entry]).find((def) => def.skill === id);
    return advancedDescription(id as WorldTwoAttackId) + (augment ? ` Giữ ${augment.name}.` : '');
  }
  let description: string;
  if (id === 'cuong-quyen' || id === 'nguyen-khi-tram') {
    const attack = primaryAttack(id, 6, chosen);
    description = `${attack.count} luồng ${id === 'cuong-quyen' ? 'quyền kình' : 'kiếm khí'}, mỗi luồng ${number(attack.power)}× công kích, xuyên không giới hạn.`;
    if (chosen.includes('kiem-hoi-phong'))
      description += ' Quay về sau 7 đơn vị hoặc chạm biên; trúng một lần mỗi chiều.';
    else if (id === 'nguyen-khi-tram') description += ' Kiếm khí bay nhanh hơn.';
  } else if (id === 'duong-viem-chuong') {
    const attack = firePalmAttack(6, chosen);
    description = `${attack.count} chưởng kim diễm, mỗi chưởng ${number(attack.power)}× công kích, xuyên không giới hạn. Nổ một lần tại mục tiêu đầu, bán kính ${number(attack.splashRadius)}; hồi chiêu ${number(attack.cooldown)} giây trước tốc đánh.`;
  } else if (id === 'viem-hoan') {
    const radius =
      flameRingRadius(6) * (chosen.includes('hoan-quang-vuc') ? augmentRules.wideRadius : 1);
    description = `Vòng lửa bán kính ${number(radius)}, đốt liên tục với DPS cơ bản tăng mạnh. Sóng nhiệt bám nhân vật và lan tới rìa vòng.`;
  } else {
    const attack = lightningAttack(6, chosen);
    description = attack.focused
      ? 'Ba nhịp sét tập trung vào một địch, mỗi nhịp mạnh hơn; tầm chọn mục tiêu tăng lên 10 đơn vị.'
      : `${attack.branches} chuỗi sét, mỗi chuỗi truyền tối đa ${attack.hits} mục tiêu.${attack.branches === 2 ? ' Hai chuỗi không đánh trùng địch.' : ''} Tầm mở đầu 10, tầm truyền 5 đơn vị.`;
    description += ` Hồi chiêu ${number(attack.cooldown)} giây trước tốc đánh.`;
  }
  const augment = chosen.map((id) => augments[id]).find((def) => def.skill === id);
  return `${description}${augment ? ` Giữ ${augment.name}.` : ''}`;
}
