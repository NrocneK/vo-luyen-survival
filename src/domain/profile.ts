import type {
  Profile,
  Cost,
  Stats,
  Loot,
  RunResult,
  PillId,
  Slot,
  Resource,
} from '../shared/models';
import { equipment, resourceNames } from '../data/equipment.ts';
import { realms, idlePerSecond } from '../data/realms.ts';
import { recipes } from '../data/recipes.ts';
import { pets } from '../data/pets.ts';
import { skills } from '../data/skills.ts';
import { weaponFromEquipment } from '../shared/models.ts';

export function newProfile(now = Date.now()): Profile {
  return {
    version: 1,
    stone: 180,
    cultivation: 0,
    realm: 0,
    permanentPills: 0,
    resources: {
      'linh-thao': 12,
      'thiet-khoang': 10,
      'da-thu': 6,
      'yeu-dan': 2,
      'thuc-an-sung-vat': 4,
      'tinh-thach-tien-hoa': 0,
      'hat-sen-dot-pha': 0,
      'trung-linh-ho': 0,
      'trung-thanh-dieu': 0,
    },
    pills: { 'tu-vi-dan': 0, 'cuong-the-dan': 0, 'hoi-nguyen-dan': 2 },
    equipment: { 'dong-quyen-sao': 0, 'thiet-kiem': 0, 'vo-phuc': 0 },
    equipped: { weapon: 'dong-quyen-sao', armor: 'vo-phuc', jewel: null, relic: null },
    blueprints: [],
    pets: {},
    activePet: null,
    selectedSkills: ['cuong-the'],
    alchemyXp: 0,
    forgeXp: 0,
    wins: 0,
    runs: 0,
    lastIdleAt: now,
    totalIdle: 0,
    settings: { music: true, sound: true, reducedEffects: false },
  };
}
export function startingSkill(profile: Profile): string {
  return weaponFromEquipment(profile.equipped.weapon) === 'sword'
    ? 'nguyen-khi-tram'
    : 'cuong-quyen';
}
export function cleanLoadout(profile: Profile): void {
  profile.selectedSkills = [...new Set(profile.selectedSkills)]
    .filter(
      (id) =>
        skills[id] &&
        skills[id].realm <= profile.realm &&
        !['cuong-quyen', 'nguyen-khi-tram'].includes(id),
    )
    .slice(0, realms[profile.realm].slots - 1);
}
export function permanentStats(profile: Profile): Stats {
  const stats: Stats = {
    hp: 110 + profile.realm * 7 + profile.permanentPills * 8,
    damage: 13 + profile.realm * 1.7 + profile.permanentPills,
    speed: 2.4,
    armor: Math.floor(profile.realm / 3),
    crit: 0.05,
    pickup: 1.35,
    regen: 0.18,
    haste: 0,
  };
  for (const id of Object.values(profile.equipped))
    if (id && equipment[id]) {
      const level = profile.equipment[id] ?? 0;
      for (const [key, value] of Object.entries(equipment[id].stats))
        stats[key as keyof Stats] += value * (1 + level * 0.2);
    }
  // Nội tại mọi sủng vật đã mở luôn có hiệu lực, kể cả khi không mang theo.
  for (const [id, pet] of Object.entries(profile.pets))
    if (pets[id])
      for (const [key, value] of Object.entries(pets[id].passive))
        stats[key as keyof Stats] += value * pet.level * (pet.evolved ? 2 : 1);
  return stats;
}
export function canPay(profile: Profile, cost: Cost): boolean {
  return (
    profile.stone >= (cost.stone ?? 0) &&
    Object.entries(cost.resources ?? {}).every(
      ([id, amount]) => profile.resources[id as Resource] >= amount,
    )
  );
}
function pay(profile: Profile, cost: Cost): void {
  profile.stone -= cost.stone ?? 0;
  for (const [id, amount] of Object.entries(cost.resources ?? {}))
    profile.resources[id as Resource] -= amount;
}
export function claimIdle(profile: Profile, now: number): number {
  const seconds = Math.min(8 * 3600, Math.max(0, (now - profile.lastIdleAt) / 1000));
  const amount = seconds * idlePerSecond(profile.realm);
  profile.cultivation += amount;
  profile.totalIdle += amount;
  profile.lastIdleAt = Math.max(now, profile.lastIdleAt);
  return amount;
}
export function breakthrough(profile: Profile): string {
  if (profile.realm >= realms.length - 1) return 'Đã đạt mốc cảnh giới của map đầu tiên.';
  const cost = realms[profile.realm].cost;
  if (profile.cultivation < cost) return 'Chưa đủ tu vi.';
  if (
    profile.realm === 9 &&
    (profile.resources['hat-sen-dot-pha'] < 1 || profile.pills['tu-vi-dan'] < 2)
  )
    return 'Đột phá Khai Nguyên cần 1 Hạt sen và 2 Tu Vi Đan.';
  if (profile.realm === 9) {
    profile.resources['hat-sen-dot-pha']--;
    profile.pills['tu-vi-dan'] -= 2;
  }
  profile.cultivation -= cost;
  profile.realm++;
  cleanLoadout(profile);
  return `Đột phá thành công: ${realms[profile.realm].name}!`;
}
export function brew(profile: Profile, id: PillId): string {
  const recipe = recipes.find((recipe) => recipe.id === id);
  if (!recipe || profile.alchemyXp < recipe.xp) return 'Chưa đủ trình độ luyện đan.';
  if (!canPay(profile, recipe.cost)) return 'Thiếu linh thạch hoặc dược liệu.';
  pay(profile, recipe.cost);
  profile.pills[id]++;
  profile.alchemyXp++;
  return `Luyện thành 1 ${recipe.name}.`;
}
export function usePill(profile: Profile, id: PillId): string {
  if (!profile.pills[id]) return 'Không có đan dược này.';
  if (id === 'hoi-nguyen-dan') return 'Hồi Nguyên Đan dùng trong màn bằng phím Q.';
  if (id === 'cuong-the-dan' && profile.permanentPills >= 5) return 'Đã dùng đủ 5 Cường Thể Đan.';
  profile.pills[id]--;
  if (id === 'tu-vi-dan') profile.cultivation += 80;
  else profile.permanentPills++;
  return id === 'tu-vi-dan' ? 'Nhận 80 tu vi.' : 'Vĩnh viễn +8 máu, +1 công kích.';
}
export function forge(profile: Profile, id: string): string {
  const item = equipment[id];
  if (!item) return 'Trang bị không hợp lệ.';
  if (item.special && !profile.blueprints.includes(id)) return 'Cần tìm bản vẽ trong màn.';
  if (id in profile.equipment) return 'Đã sở hữu; có thể cường hóa ở kho đồ.';
  if (!canPay(profile, item.cost)) return 'Thiếu linh thạch hoặc nguyên liệu.';
  pay(profile, item.cost);
  profile.equipment[id] = 0;
  profile.forgeXp++;
  return `Chế tạo thành công ${item.name}.`;
}
export function upgradeCost(level: number): Cost {
  return { stone: 35 + level * 30, resources: { 'thiet-khoang': 3 + level * 2 } };
}
export function upgrade(profile: Profile, id: string): string {
  if (!(id in profile.equipment)) return 'Chưa sở hữu trang bị.';
  const level = profile.equipment[id];
  if (level >= 5) return 'Đã cường hóa tối đa +5.';
  const cost = upgradeCost(level);
  if (!canPay(profile, cost)) return 'Thiếu tài nguyên cường hóa.';
  pay(profile, cost);
  profile.equipment[id]++;
  profile.forgeXp++;
  return `${equipment[id].name} đạt +${level + 1}.`;
}
export function equip(profile: Profile, id: string): string {
  const item = equipment[id];
  if (!item || !(id in profile.equipment)) return 'Chưa sở hữu trang bị.';
  profile.equipped[item.slot] = id;
  cleanLoadout(profile);
  return `Đã trang bị ${item.name}.`;
}
export function unlockPet(profile: Profile, id: string): string {
  const pet = pets[id];
  if (!pet || profile.pets[id]) return 'Sủng vật đã mở hoặc không hợp lệ.';
  if (!canPay(profile, pet.cost)) return 'Thiếu trứng linh thú hoặc linh thạch.';
  pay(profile, pet.cost);
  profile.pets[id] = { level: 1, evolved: false };
  profile.activePet ??= id;
  return `${pet.name} đã thức tỉnh. Nội tại có hiệu lực vĩnh viễn.`;
}
export function feedPet(profile: Profile, id: string): string {
  const pet = profile.pets[id];
  if (!pet) return 'Chưa mở sủng vật.';
  if (pet.level >= 5) return 'Sủng vật đã đạt bậc 5.';
  const cost = { stone: 20 * pet.level, resources: { 'thuc-an-sung-vat': pet.level + 1 } };
  if (!canPay(profile, cost)) return 'Thiếu thức ăn hoặc linh thạch.';
  pay(profile, cost);
  pet.level++;
  return `${pets[id].name} đạt bậc ${pet.level}.`;
}
export function evolvePet(profile: Profile, id: string): string {
  const pet = profile.pets[id];
  if (!pet || pet.level < 3 || pet.evolved) return 'Cần sủng vật bậc 3 và chưa tiến hóa.';
  const cost = { stone: 180, resources: { 'tinh-thach-tien-hoa': 2, 'yeu-dan': 4 } };
  if (!canPay(profile, cost)) return 'Thiếu tài nguyên tiến hóa.';
  pay(profile, cost);
  pet.evolved = true;
  return `Tiến hóa thành ${pets[id].evolvedName}!`;
}
export function settleLoot(raw: Loot, won: boolean, random: () => number): Loot {
  const ratio = won ? 1 : 0.3;
  return {
    stone: Math.floor(raw.stone * ratio),
    cultivation: raw.cultivation * ratio,
    resources: Object.fromEntries(
      Object.entries(raw.resources).map(([id, amount]) => [id, Math.floor(amount * ratio)]),
    ),
    equipment: raw.equipment.filter(() => won || random() < 0.3),
    blueprints: raw.blueprints.filter(() => won || random() < 0.3),
  };
}
export function applyResult(profile: Profile, result: RunResult): void {
  const loot = result.rewards;
  profile.stone += loot.stone;
  profile.cultivation += loot.cultivation;
  for (const [id, amount] of Object.entries(loot.resources))
    profile.resources[id as Resource] += amount;
  for (const id of loot.equipment) {
    if (id in profile.equipment) profile.stone += 25;
    else profile.equipment[id] = 0;
  }
  profile.blueprints = [...new Set([...profile.blueprints, ...loot.blueprints])];
  profile.runs++;
  if (result.won) profile.wins++;
}
export function validateProfile(input: unknown): Profile {
  if (!input || typeof input !== 'object') throw new Error('File lưu không hợp lệ.');
  const data = input as Profile;
  if (data.version !== 1) throw new Error('Phiên bản file lưu không được hỗ trợ.');
  const profile = newProfile();
  const number = (value: unknown, max = 100000000, integer = true) => {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > max ||
      (integer && !Number.isInteger(value))
    )
      throw new Error('Số liệu lưu không hợp lệ.');
    return value;
  };
  for (const key of ['stone', 'alchemyXp', 'forgeXp', 'runs', 'wins'] as const)
    profile[key] = number(data[key]);
  profile.cultivation = number(data.cultivation, 100000000, false);
  profile.realm = number(data.realm, 10);
  profile.permanentPills = number(data.permanentPills, 5);
  profile.lastIdleAt = number(data.lastIdleAt, 1e14, false);
  profile.totalIdle = number(data.totalIdle, 1e10, false);
  if (
    !data.resources ||
    !data.pills ||
    !data.equipment ||
    !data.equipped ||
    !data.pets ||
    !data.settings
  )
    throw new Error('File lưu thiếu dữ liệu.');
  for (const id of Object.keys(resourceNames) as Resource[])
    profile.resources[id] = number(data.resources[id]);
  for (const id of ['tu-vi-dan', 'cuong-the-dan', 'hoi-nguyen-dan'] as PillId[])
    profile.pills[id] = number(data.pills[id]);
  profile.equipment = {};
  for (const [id, value] of Object.entries(data.equipment)) {
    if (!Object.hasOwn(equipment, id)) throw new Error('Trang bị không hợp lệ.');
    profile.equipment[id] = number(value, 5);
  }
  for (const slot of ['weapon', 'armor', 'jewel', 'relic'] as Slot[]) {
    const id = data.equipped[slot];
    if (id !== null && (!(id in profile.equipment) || equipment[id].slot !== slot))
      throw new Error('Ô trang bị không hợp lệ.');
    profile.equipped[slot] = id;
  }
  if (!profile.equipped.weapon) throw new Error('Thiếu vũ khí.');
  profile.pets = {};
  for (const [id, value] of Object.entries(data.pets)) {
    if (!Object.hasOwn(pets, id) || !value || typeof value.evolved !== 'boolean')
      throw new Error('Sủng vật không hợp lệ.');
    const level = number(value.level, 5);
    if (level < 1) throw new Error('Bậc sủng vật không hợp lệ.');
    profile.pets[id] = { level, evolved: value.evolved };
  }
  if (data.activePet !== null && !profile.pets[data.activePet])
    throw new Error('Sủng vật đồng hành không hợp lệ.');
  profile.activePet = data.activePet;
  if (
    !Array.isArray(data.blueprints) ||
    data.blueprints.some((id) => !Object.hasOwn(equipment, id) || !equipment[id].special)
  )
    throw new Error('Bản vẽ không hợp lệ.');
  profile.blueprints = [...new Set(data.blueprints)];
  if (
    !Array.isArray(data.selectedSkills) ||
    data.selectedSkills.some((id) => !Object.hasOwn(skills, id))
  )
    throw new Error('Kỹ năng không hợp lệ.');
  profile.selectedSkills = [...data.selectedSkills];
  cleanLoadout(profile);
  for (const key of ['music', 'sound', 'reducedEffects'] as const) {
    if (typeof data.settings[key] !== 'boolean') throw new Error('Cài đặt không hợp lệ.');
    profile.settings[key] = data.settings[key];
  }
  return profile;
}
