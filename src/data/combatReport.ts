import type { DamageRow, IncomingSource } from '../shared/combatSummary';
import type { Profile } from '../shared/models';
import { skills } from './skills.ts';
import { pets } from './pets.ts';
import { enemies } from './enemies.ts';

export function damageSourceName(row: Readonly<DamageRow>, profile: Profile): string {
  if (row.id.startsWith('pet-')) {
    const id = row.id.slice(4),
      pet = pets[id];
    return pet ? (profile.pets[id]?.evolved ? pet.evolvedName : pet.name) : 'Linh thú';
  }
  const skill = skills[row.id];
  return (row.awakened ? skill?.awakened : skill?.name) ?? 'Sát thương khác';
}

const hazardNames = {
  poison: 'Độc chướng',
  fire: 'Hỏa tuyến',
  dark: 'Ám vực bùng nổ',
  ice: 'Băng trận',
  soul: 'Trận đồ thần hồn',
  bone: 'Cốt trận',
  demon: 'Ma trận',
};
const deliveryNames = {
  melee: 'Đòn cận chiến',
  charge: 'Lao tới',
  fan: 'Loạt đạn',
  ring: 'Vòng đạn',
};
const effectNames: Record<string, string> = {
  'poison-bolt': 'độc',
  'fire-palm': 'hỏa',
  'spirit-bolt': 'linh lực',
  'sword-slash': 'kiếm khí',
  'wind-feather': 'linh vũ',
};
export function incomingSourceName(source: IncomingSource): { name: string; detail: string } {
  if (source.kind === 'hazard')
    return { name: hazardNames[source.hazard], detail: 'Hiểm họa địa hình' };
  if (source.kind === 'unknown')
    return { name: 'Sát thương chưa xác định', detail: 'Không có dữ liệu nguồn đòn' };
  const effect = ['fan', 'ring'].includes(source.delivery) ? effectNames[source.effect] : '';
  return {
    name: enemies[source.enemyType]?.name ?? 'Kẻ địch',
    detail: `${deliveryNames[source.delivery]}${effect ? ` ${effect}` : ''}${source.attack > 0 ? ` · chiêu ${source.attack}` : ''}`,
  };
}
