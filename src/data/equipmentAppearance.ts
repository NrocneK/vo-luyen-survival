import { equipment } from './equipment.ts';
import type { Profile, Slot } from '../shared/models.ts';

export interface EquipmentLook {
  id: string;
  slot: Slot;
  tier: 0 | 1 | 2;
  clothTint?: number;
}

/** Hộ uyển nằm trên cẳng tay; quyền sáo/chuôi kiếm phải hiện phía trên, ở bàn tay. */
export function equipmentLayerOrder(slot: Slot): number {
  return ['body', 'feet', 'head', 'jewel', 'hands', 'weapon', 'relic'].indexOf(slot);
}
const sacred = new Set([
  'thanh-nguyen-quyen-sao',
  'huyen-duong-thanh-kiem',
  'huyen-quang-quan',
  'thanh-nguyen-chien-y',
  'kim-cuong-ho-uyen',
  'ngu-phong-ngoa',
  'thanh-tam-ngoc-boi',
  'thanh-chu-ngoc-an',
  'chan-duong-kiem',
]);
const plain = new Set([
  'dong-quyen-sao',
  'thiet-kiem',
  'ngoc-gioi',
  'than-thuc-ngoc',
  'ngoc-lien-bi-bao',
  'truyen-thua-bi-bao',
]);

/** Ngoại quan đọc trang bị thật; không thêm dữ liệu vào save hoặc đổi chỉ số. */
export function equipmentLook(id: string, slot: Slot): EquipmentLook | null {
  if (equipment[id]?.slot !== slot) return null;
  const tier = sacred.has(id) ? 2 : plain.has(id) ? 0 : 1;
  return {
    id,
    slot,
    tier,
    ...(slot === 'body'
      ? { clothTint: id === 'huyen-giap' ? 0x768697 : tier === 2 ? 0xf2e4bd : 0x648eb9 }
      : {}),
  };
}
export function equippedLooks(
  profile: Pick<Profile, 'equipped' | 'relicUnlocked'>,
): EquipmentLook[] {
  return (Object.entries(profile.equipped) as [Slot, string | null][]).flatMap(([slot, id]) => {
    if (!id || (slot === 'relic' && !profile.relicUnlocked)) return [];
    const look = equipmentLook(id, slot);
    return look ? [look] : [];
  });
}

/** Đòn thật chạm ở nửa nhịp engine; ánh xạ nhịp đó vào tư thế tiếp xúc của rig. */
export function attackPosePhase(phase: number, impact: number | null): number {
  const p = Math.max(0, Math.min(0.999999, phase));
  const contact = impact ?? 0.5;
  return p < 0.5 ? p * 2 * contact : contact + (p - 0.5) * 2 * (1 - contact);
}
