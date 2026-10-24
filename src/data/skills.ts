import type { SkillDef, Card, Stats } from '../shared/models';
import type { AugmentId } from '../shared/augments';
import { worldTwoSkillDefs } from './worldTwoSkills.ts';
import { eligibleAugments } from './augments.ts';
import { awakeningLink, awakeningFor, awakeningDescription, canAwaken } from './awakenings.ts';
export const skills: Record<string, SkillDef> = {
  ...worldTwoSkillDefs,
  'cuong-quyen': {
    id: 'cuong-quyen',
    name: 'Cương Quyền',
    icon: 'cuong-quyen',
    kind: 'attack',
    realm: 0,
    description:
      'Ba đòn đổi tay, phóng quyền kình tới khi chạm địch hoặc ra khỏi map. Bậc 1–5 trúng 1–5 mục tiêu; thức tỉnh xuyên không giới hạn.',
    ...awakeningLink('cuong-quyen'),
    effect: 'qi-punch',
  },
  'nguyen-khi-tram': {
    id: 'nguyen-khi-tram',
    name: 'Nguyên Khí Trảm',
    icon: 'nguyen-khi-tram',
    kind: 'attack',
    realm: 0,
    description:
      'Ba đường kiếm, kiếm khí bay tới khi chạm địch hoặc ra khỏi map. Bậc 1–5 trúng 1–5 mục tiêu; thức tỉnh xuyên không giới hạn.',
    ...awakeningLink('nguyen-khi-tram'),
    effect: 'sword-slash',
  },
  'duong-viem-chuong': {
    id: 'duong-viem-chuong',
    name: 'Dương Viêm Chưởng',
    icon: 'duong-viem-chuong',
    kind: 'attack',
    realm: 1,
    description:
      'Chưởng lửa bay tới địch, nổ một lần khi chạm mục tiêu đầu. Bậc 1–5 xuyên qua 1–5 mục tiêu trực tiếp; mỗi mục tiêu chỉ chịu một lần sát thương từ cùng viên đạn.',
    effect: 'fire-palm',
    ...awakeningLink('duong-viem-chuong'),
  },
  'cuong-the': {
    id: 'cuong-the',
    name: 'Cường Thể',
    icon: 'cuong-the',
    kind: 'support',
    realm: 0,
    description: 'Mỗi bậc +12 sinh lực, +1 giáp. Liên kết thức tỉnh Cương Quyền.',
    effect: 'healing',
  },
  'tu-khi': {
    id: 'tu-khi',
    name: 'Tụ Khí',
    icon: 'tu-khi',
    kind: 'support',
    realm: 2,
    description: 'Mỗi bậc +8% tốc đánh, +0,25 phạm vi hút XP. Liên kết thức tỉnh Nguyên Khí Trảm.',
    effect: 'level-up',
  },
  'viem-hoan': {
    id: 'viem-hoan',
    name: 'Viêm Hoàn',
    icon: 'duong-viem-chuong',
    kind: 'attack',
    realm: 19,
    description:
      'Vòng lửa bám theo nhân vật, gây sát thương liên tục cho địch bên trong. Bán kính tăng theo bậc; sóng nhiệt lan từ tâm đến rìa vòng.',
    ...awakeningLink('viem-hoan'),
    effect: 'fire-palm',
  },
  'hoa-linh': {
    id: 'hoa-linh',
    name: 'Hỏa Linh',
    icon: 'sat-thuong',
    kind: 'support',
    realm: 19,
    description:
      'Mỗi bậc +5 công kích và +0,08 hồi máu/giây. Liên kết thức tỉnh Dương Viêm Chưởng và Viêm Hoàn.',
    effect: 'healing',
  },
  'loi-lien': {
    id: 'loi-lien',
    name: 'Lôi Liên',
    icon: 'nguyen-khi-tram',
    kind: 'attack',
    realm: 28,
    description: 'Lôi kình truyền qua những mục tiêu gần nhau; tăng bậc để tăng số lần truyền.',
    ...awakeningLink('loi-lien'),
    effect: 'spirit-bolt',
  },
  'loi-tam': {
    id: 'loi-tam',
    name: 'Lôi Tâm',
    icon: 'chi-mang',
    kind: 'support',
    realm: 28,
    description: 'Mỗi bậc +3% chí mạng và +4% tốc đánh. Liên kết thức tỉnh Lôi Liên.',
    effect: 'level-up',
  },
  'khinh-than': {
    id: 'khinh-than',
    name: 'Khinh Thân Quyết',
    icon: 'toc-do',
    kind: 'support',
    realm: 37,
    description:
      'Mỗi bậc +0,13 tốc chạy, giảm 5% hồi chiêu lướt và tăng 0,05 giây bất tử khi lướt.',
    effect: 'wind-feather',
  },
};
export const statCards: {
  stat: keyof Stats;
  name: string;
  icon: string;
  description: string;
  amount: number;
}[] = [
  {
    stat: 'damage',
    name: 'Tâm pháp công kích',
    icon: 'sat-thuong',
    description: '+3 công kích trong lượt.',
    amount: 3,
  },
  {
    stat: 'hp',
    name: 'Sinh lực sung mãn',
    icon: 'sinh-luc',
    description: '+15 máu tối đa, hồi 15 máu.',
    amount: 15,
  },
  {
    stat: 'haste',
    name: 'Liên chiêu',
    icon: 'toc-danh',
    description: '+8% tốc đánh trong lượt.',
    amount: 0.08,
  },
  {
    stat: 'speed',
    name: 'Khinh thân',
    icon: 'toc-do',
    description: '+0,18 tốc độ di chuyển.',
    amount: 0.18,
  },
  {
    stat: 'pickup',
    name: 'Linh thức',
    icon: 'thu-hut',
    description: '+0,4 phạm vi hút XP.',
    amount: 0.4,
  },
  {
    stat: 'crit',
    name: 'Phá điểm',
    icon: 'chi-mang',
    description: '+5% chí mạng (sát thương gấp đôi).',
    amount: 0.05,
  },
  { stat: 'armor', name: 'Hộ thể', icon: 'giap', description: '+1 giáp trong lượt.', amount: 1 },
  {
    stat: 'regen',
    name: 'Sinh tức',
    icon: 'hoi-phuc',
    description: '+0,25 hồi máu mỗi giây.',
    amount: 0.25,
  },
];
export function eligibleCards(
  selected: string[],
  ranks: Record<string, number>,
  chosen: AugmentId[] = [],
): Card[] {
  const result: Card[] = [];
  for (const id of new Set(selected)) {
    const skill = skills[id];
    if (!skill) continue;
    const rank = ranks[id] ?? 0;
    if (rank < 5)
      result.push({
        id: `skill:${id}`,
        kind: 'skill',
        skill: id,
        name: rank ? `${skill.name} · Bậc ${rank + 1}` : `Kích hoạt ${skill.name}`,
        icon: skill.icon,
        description: rank ? `Cường hóa ${skill.name}. ${skill.description}` : skill.description,
      });
    else if (canAwaken(id, ranks))
      result.push({
        id: `awaken:${id}`,
        kind: 'awaken',
        skill: id,
        name: `Thức tỉnh · ${skill.awakened}`,
        icon: awakeningFor(id)!.icon,
        description: awakeningDescription(awakeningFor(id)!.skill, chosen),
      });
  }
  for (const card of statCards)
    result.push({
      id: `stat:${card.stat}`,
      kind: 'stat',
      stat: card.stat,
      name: card.name,
      icon: card.icon,
      description: card.description,
    });
  return [...result, ...eligibleAugments(selected, ranks, chosen)];
}
