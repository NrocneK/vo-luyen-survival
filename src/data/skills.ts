import type { SkillDef, Card, Stats } from '../shared/models';
export const skills: Record<string, SkillDef> = {
  'cuong-quyen': {
    id: 'cuong-quyen',
    name: 'Cương Quyền',
    icon: 'cuong-quyen',
    kind: 'attack',
    realm: 0,
    description: 'Ba đòn đổi tay, phóng quyền kình xuyên mục tiêu.',
    linked: 'cuong-the',
    awakened: 'Long Viêm Quyền',
    effect: 'qi-punch',
  },
  'nguyen-khi-tram': {
    id: 'nguyen-khi-tram',
    name: 'Nguyên Khí Trảm',
    icon: 'nguyen-khi-tram',
    kind: 'attack',
    realm: 0,
    description: 'Ba đường kiếm, kiếm khí xuyên qua nhiều đối thủ.',
    linked: 'tu-khi',
    awakened: 'Kiếm Khí Phong Bạo',
    effect: 'sword-slash',
  },
  'duong-viem-chuong': {
    id: 'duong-viem-chuong',
    name: 'Dương Viêm Chưởng',
    icon: 'duong-viem-chuong',
    kind: 'attack',
    realm: 1,
    description: 'Phóng chưởng lửa nổ quanh mục tiêu. Mỗi bậc tăng sát thương và phạm vi.',
    effect: 'fire-palm',
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
export function eligibleCards(selected: string[], ranks: Record<string, number>): Card[] {
  const result: Card[] = [];
  for (const id of selected) {
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
    else if (rank === 5 && skill.linked && (ranks[skill.linked] ?? 0) >= 1)
      result.push({
        id: `awaken:${id}`,
        kind: 'awaken',
        skill: id,
        name: `Thức tỉnh · ${skill.awakened}`,
        icon: id === 'cuong-quyen' ? 'long-viem-quyen' : 'kiem-khi-phong-bao',
        description: 'Bậc 6: tăng mạnh sát thương, thêm đạn và phạm vi. Giữ đến hết lượt.',
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
  return result;
}
