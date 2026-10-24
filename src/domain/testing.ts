import type { Profile, Resource, PillId } from '../shared/models';
import { equipment, resourceNames } from '../data/equipment.ts';
import { pets } from '../data/pets.ts';
import { realms } from '../data/realms.ts';
import { allStages as stages } from '../data/stages.ts';
import { cleanLoadout, validateProfile } from './profile.ts';

export const TEST_PROFILE_KEY = 'vo-luyen.profile.test.v1';
export const TEST_RESOURCE_AMOUNT = 1_000_000;
type TestStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type TestAction = 'cultivation' | 'gear' | 'realm';

export function loadTestProfile(
  mainProfile: Profile,
  storage: TestStorage = localStorage,
): { profile: Profile; warning: string } {
  try {
    const raw = storage.getItem(TEST_PROFILE_KEY);
    if (!raw) return { profile: structuredClone(mainProfile), warning: '' };
    const data = JSON.parse(raw);
    const profile = validateProfile(data);
    if (Array.isArray(data.selectedSkills)) {
      profile.selectedSkills = data.selectedSkills;
      cleanLoadout(profile, true);
    }
    // Bản lưu test được chọn màn khóa mà không giả thành tích vượt ải.
    if (stages.some((stage) => stage.id === data.selectedStageId))
      profile.selectedStageId = data.selectedStageId;
    return { profile, warning: '' };
  } catch {
    return {
      profile: structuredClone(mainProfile),
      warning: 'Không đọc được bản test cũ; đã tạo bản test từ tiến trình chính.',
    };
  }
}

export function saveTestProfile(profile: Profile, storage: TestStorage = localStorage): boolean {
  try {
    validateProfile(profile);
    storage.setItem(TEST_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function replenishTestResources(profile: Profile): void {
  // Dùng số hữu hạn để JSON và hệ thống lưu vẫn kiểm tra được dữ liệu.
  profile.stone = TEST_RESOURCE_AMOUNT;
  for (const id of Object.keys(resourceNames) as Resource[])
    profile.resources[id] = TEST_RESOURCE_AMOUNT;
  for (const id of Object.keys(profile.pills) as PillId[]) profile.pills[id] = TEST_RESOURCE_AMOUNT;
}

export function applyTestAction(profile: Profile, action: TestAction, amount = 10_000): string {
  if (action === 'cultivation') {
    if (!Number.isFinite(amount) || amount <= 0) return 'Lượng tu vi không hợp lệ.';
    const previous = profile.cultivation;
    profile.cultivation = Math.min(Number.MAX_SAFE_INTEGER, previous + Math.floor(amount));
    return `Test: +${Math.floor(profile.cultivation - previous).toLocaleString('vi-VN')} tu vi.`;
  }
  if (action === 'realm') {
    profile.realm = realms.length - 1;
    cleanLoadout(profile);
    return `Test: đã đạt ${realms[profile.realm].name}.`;
  }
  for (const item of Object.values(equipment)) profile.equipment[item.id] = 5;
  profile.relicUnlocked = true;
  profile.blueprints = Object.values(equipment)
    .filter((item) => item.special)
    .map((item) => item.id);
  for (const id of Object.keys(pets)) profile.pets[id] = { level: 5, evolved: true };
  profile.activePet ??= Object.keys(pets)[0] ?? null;
  profile.alchemyXp = Math.max(profile.alchemyXp, 1000);
  profile.forgeXp = Math.max(profile.forgeXp, 1000);
  return 'Test: đã cấp toàn bộ trang bị +5, bản vẽ và linh thú bậc 5 tiến hóa.';
}
