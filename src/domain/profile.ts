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
import { allStages as stages } from '../data/stages.ts';
import { availableStages, clearedMilestone, stageUnlocked } from '../data/campaign.ts';
import {
  petFeedCost,
  petRealmCap,
  worldTwoPetPassive,
  worldTwoUpgradeCost,
} from '../data/worldTwoEconomy.ts';
import { pillName } from '../data/recipes.ts';

export function newProfile(now = Date.now()): Profile {
  return {
    version: 3,
    stone: 180,
    cultivation: 0,
    realm: 0,
    permanentPills: 0,
    worldTwoPills: 0,
    relicUnlocked: false,
    storySeen: [],
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
      'linh-tai-thong-huyen': 0,
    },
    pills: { 'tu-vi-dan': 0, 'cuong-the-dan': 0, 'hoi-nguyen-dan': 2 },
    equipment: { 'dong-quyen-sao': 0, 'thiet-kiem': 0, 'vo-phuc': 0 },
    equipped: {
      weapon: 'dong-quyen-sao',
      head: null,
      body: 'vo-phuc',
      hands: null,
      feet: null,
      jewel: null,
      relic: null,
    },
    blueprints: [],
    pets: {},
    activePet: null,
    selectedSkills: ['cuong-the'],
    alchemyXp: 0,
    forgeXp: 0,
    wins: 0,
    runs: 0,
    stageProgress: {},
    selectedStageId: 'hac-phong-son',
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
export function skillUnlocked(profile: Profile, id: string): boolean {
  const skill = skills[id];
  return (
    !!skill &&
    skill.realm <= profile.realm &&
    (!skill.requiredStageId || !!profile.stageProgress[skill.requiredStageId]?.wins)
  );
}
export function cleanLoadout(profile: Profile, ignoreStory = false): void {
  profile.selectedSkills = [...new Set(profile.selectedSkills)]
    .filter(
      (id) =>
        skills[id] &&
        (ignoreStory
          ? !!skills[id] && skills[id].realm <= profile.realm
          : skillUnlocked(profile, id)) &&
        !['cuong-quyen', 'nguyen-khi-tram'].includes(id),
    )
    .slice(0, realms[profile.realm].slots - 1);
}
export function permanentStats(profile: Profile): Stats {
  // Đầu game giữ nguyên nhịp cũ; các đại cảnh giới sau tăng sức mạnh đủ đối đầu màn mới.
  const baseRealm = Math.min(46, profile.realm);
  const advancement = Math.max(0, baseRealm - 10);
  const multiplier = 1.15 ** Math.max(0, profile.realm - 46);
  const stats: Stats = {
    hp:
      (110 + baseRealm * 7 + advancement ** 2 * 0.24) * multiplier +
      profile.permanentPills * 8 +
      (profile.worldTwoPills ?? 0) * 30,
    damage:
      (13 + baseRealm * 1.7 + advancement ** 2 * 0.07) * multiplier +
      profile.permanentPills +
      (profile.worldTwoPills ?? 0) * 4,
    speed: 2.4,
    armor: Math.floor(baseRealm / 3) + Math.max(0, profile.realm - 46) * 2,
    crit: 0.05,
    pickup: 1.35,
    regen: (0.18 + advancement * 0.018) * multiplier,
    haste: 0,
  };
  for (const [slot, id] of Object.entries(profile.equipped))
    if (id && equipment[id] && (slot !== 'relic' || profile.relicUnlocked)) {
      const level = profile.equipment[id] ?? 0;
      for (const [key, value] of Object.entries(equipment[id].stats))
        stats[key as keyof Stats] += value * (1 + level * 0.2);
    }
  // Nội tại mọi sủng vật đã mở luôn có hiệu lực, kể cả khi không mang theo.
  for (const [id, pet] of Object.entries(profile.pets))
    if (pets[id]) {
      const passive =
        pet.level > 5
          ? worldTwoPetPassive(id, pet.level)
          : Object.fromEntries(
              Object.entries(pets[id].passive).map(([key, value]) => [key, value * pet.level]),
            );
      for (const [key, value] of Object.entries(passive))
        stats[key as keyof Stats] += value * (pet.evolved ? 2 : 1);
    }
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
  const amount = seconds * cultivationIdleRate(profile);
  profile.cultivation += amount;
  profile.totalIdle += amount;
  profile.lastIdleAt = Math.max(now, profile.lastIdleAt);
  return amount;
}
export function cultivationIdleRate(profile: Profile): number {
  return idlePerSecond(profile.realm, clearedMilestone(profile));
}
export function breakthroughLockReason(profile: Profile): string {
  if (profile.realm >= realms.length - 1) return 'Đã đạt Nhập Thánh tam tầng đỉnh phong.';
  const realm = realms[profile.realm];
  if (profile.cultivation < realm.cost) return 'Chưa đủ tu vi.';
  if (realm.requiredStageId && !profile.stageProgress[realm.requiredStageId]?.wins) {
    const stage = stages.find((entry) => entry.id === realm.requiredStageId);
    return `Cần vượt ${stage?.name ?? realm.requiredStageId} trước khi đột phá đại cảnh giới.`;
  }
  const extra = realm.breakthroughCost;
  if (extra && !canPay(profile, extra))
    return 'Đột phá đại cảnh giới cần 1 Hạt sen đột phá và 2 Tu Vi Đan.';
  if (extra?.pills && profile.pills['tu-vi-dan'] < extra.pills['tu-vi-dan'])
    return 'Đột phá đại cảnh giới cần 1 Hạt sen đột phá và 2 Tu Vi Đan.';
  return '';
}
export function breakthrough(profile: Profile): string {
  const reason = breakthroughLockReason(profile);
  if (reason) return reason;
  const realm = realms[profile.realm];
  if (realm.breakthroughCost) pay(profile, realm.breakthroughCost);
  if (realm.breakthroughCost?.pills)
    profile.pills['tu-vi-dan'] -= realm.breakthroughCost.pills['tu-vi-dan'];
  profile.cultivation -= realm.cost;
  profile.realm++;
  cleanLoadout(profile);
  return `Đột phá thành công: ${realms[profile.realm].name}!`;
}
export function maxBrew(profile: Profile, id: PillId): number {
  const recipe = recipes.find((entry) => entry.id === id);
  if (!recipe || profile.alchemyXp < recipe.xp) return 0;
  return Math.max(
    0,
    Math.floor(
      Math.min(
        profile.stone / (recipe.cost.stone ?? 1),
        ...Object.entries(recipe.cost.resources ?? {})
          .filter(([, v]) => v > 0)
          .map(([key, v]) => profile.resources[key as Resource] / v),
      ),
    ),
  );
}
export function brew(profile: Profile, id: PillId, quantity: number | 'max' = 1): string {
  const recipe = recipes.find((recipe) => recipe.id === id);
  if (!recipe || profile.alchemyXp < recipe.xp) return 'Chưa đủ trình độ luyện đan.';
  const count = quantity === 'max' ? maxBrew(profile, id) : quantity;
  if (!Number.isSafeInteger(count) || count < 1 || maxBrew(profile, id) < count)
    return 'Thiếu linh thạch hoặc dược liệu.';
  pay(profile, {
    stone: (recipe.cost.stone ?? 0) * count,
    resources: Object.fromEntries(
      Object.entries(recipe.cost.resources ?? {}).map(([key, v]) => [key, v * count]),
    ),
  });
  profile.pills[id] += count;
  profile.alchemyXp += count;
  return `Luyện thành ${count} ${pillName(profile.realm, id)}.`;
}
export function permanentPillRemaining(profile: Profile): number {
  return 5 - profile.permanentPills + (profile.realm >= 47 ? 5 - profile.worldTwoPills : 0);
}
export function usePill(profile: Profile, id: PillId): string {
  if (!profile.pills[id]) return 'Không có đan dược này.';
  if (id === 'hoi-nguyen-dan') return 'Hồi Nguyên Đan dùng trong màn bằng phím Q.';
  if (id === 'cuong-the-dan' && permanentPillRemaining(profile) <= 0)
    return profile.realm < 47
      ? 'Đã dùng đủ 5 viên nền. Siêu Phàm mở thêm 5 suất Tẩy Tủy.'
      : 'Đã dùng đủ đan vĩnh viễn.';
  const advanced = id === 'cuong-the-dan' && profile.permanentPills >= 5;
  profile.pills[id]--;
  const cultivation = pillCultivation(profile);
  if (id === 'tu-vi-dan') profile.cultivation += cultivation;
  else if (advanced) profile.worldTwoPills++;
  else profile.permanentPills++;
  return id === 'tu-vi-dan'
    ? `Nhận ${cultivation} tu vi.`
    : advanced
      ? 'Vĩnh viễn +30 máu, +4 công kích.'
      : 'Vĩnh viễn +8 máu, +1 công kích.';
}
export function pillCultivation(profile: Profile): number {
  return profile.realm >= 47
    ? [4000, 6000, 9000, 12000, 16000, 20000][Math.min(5, profile.realm - 47)]
    : 80 * (1 + Math.floor(profile.realm / 10) * 4);
}
export function forge(profile: Profile, id: string): string {
  const item = equipment[id];
  if (!item) return 'Trang bị không hợp lệ.';
  if (profile.realm < (item.requiredRealm ?? 0))
    return `Cần đạt ${realms[item.requiredRealm!].name} để chế tạo ${item.name}.`;
  if (item.special && !profile.blueprints.includes(id)) return 'Cần tìm bản vẽ trong màn.';
  if (id in profile.equipment) return 'Đã sở hữu; có thể cường hóa ở kho đồ.';
  if (!canPay(profile, item.cost)) return 'Thiếu linh thạch hoặc nguyên liệu.';
  pay(profile, item.cost);
  profile.equipment[id] = 0;
  profile.forgeXp++;
  return `Chế tạo thành công ${item.name}.`;
}
export function upgradeCost(level: number, id?: string): Cost {
  if (id && (equipment[id]?.requiredRealm ?? 0) >= 47)
    return worldTwoUpgradeCost(level, (equipment[id].requiredRealm ?? 0) >= 50);
  return { stone: 35 + level * 30, resources: { 'thiet-khoang': 3 + level * 2 } };
}
export function upgrade(profile: Profile, id: string): string {
  if (!(id in profile.equipment)) return 'Chưa sở hữu trang bị.';
  const level = profile.equipment[id];
  if (level >= 5) return 'Đã cường hóa tối đa +5.';
  const cost = upgradeCost(level, id);
  if (!canPay(profile, cost)) return 'Thiếu tài nguyên cường hóa.';
  pay(profile, cost);
  profile.equipment[id]++;
  profile.forgeXp++;
  return `${equipment[id].name} đạt +${level + 1}.`;
}
export function equip(profile: Profile, id: string): string {
  const item = equipment[id];
  if (!item || !(id in profile.equipment)) return 'Chưa sở hữu trang bị.';
  if (item.slot === 'relic' && !profile.relicUnlocked) return 'Thắng Hắc Phong Sơn để mở ô bí bảo.';
  if (profile.realm < (item.requiredRealm ?? 0))
    return `Cần đạt ${realms[item.requiredRealm!].name} để trang bị ${item.name}.`;
  profile.equipped[item.slot] = id;
  cleanLoadout(profile);
  return `Đã trang bị ${item.name}.`;
}
export function unequip(profile: Profile, id: string): string {
  const item = equipment[id];
  if (!item || profile.equipped[item.slot] !== id) return 'Món này không được trang bị.';
  if (item.slot === 'weapon') return 'Hãy đổi sang vũ khí khác để giữ bộ chiêu đang dùng.';
  profile.equipped[item.slot] = null;
  return `Đã tháo ${item.name}.`;
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
  if (pet.level >= petRealmCap(profile.realm))
    return 'Đã đạt trần linh thú của cảnh giới hiện tại.';
  const cost = petFeedCost(pet.level);
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
  if (result.settled) return;
  const stage = stages.find((entry) => entry.id === result.stageId);
  if (!stage) throw new Error('Không thể nhận thưởng từ màn lịch luyện không tồn tại.');
  const before = new Set(availableStages(profile).map((entry) => entry.id));
  const previous = profile.stageProgress[stage.id];
  if (result.won && !previous?.wins) {
    // Thưởng vượt lần đầu nằm ngoài phép nhân 30% và chỉ có ở lượt thắng đầu tiên.
    const first = structuredClone(stage.firstClear);
    result.firstClearRewards = first;
    result.rewards = mergeLoot(result.rewards, first);
  }
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
  if (result.won) {
    if (stage.id === 'hac-phong-son') profile.relicUnlocked = true;
    profile.wins++;
    profile.stageProgress[stage.id] = {
      wins: (previous?.wins ?? 0) + 1,
      bestTime:
        previous?.bestTime && previous.bestTime < result.time ? previous.bestTime : result.time,
      bestKills: Math.max(previous?.bestKills ?? 0, result.kills),
    };
  }
  result.newStageUnlocked = availableStages(profile).find((entry) => !before.has(entry.id))?.id;
  result.settled = true;
}
function mergeLoot(base: Loot, bonus: Loot): Loot {
  const resources = { ...base.resources };
  for (const [id, amount] of Object.entries(bonus.resources))
    resources[id as Resource] = (resources[id as Resource] ?? 0) + amount;
  return {
    stone: base.stone + bonus.stone,
    cultivation: base.cultivation + bonus.cultivation,
    resources,
    equipment: [...base.equipment, ...bonus.equipment],
    blueprints: [...new Set([...base.blueprints, ...bonus.blueprints])],
  };
}
export function validateProfile(input: unknown): Profile {
  if (!input || typeof input !== 'object') throw new Error('File lưu không hợp lệ.');
  const data = input as Profile;
  const version = (input as { version?: unknown }).version;
  if (version !== 1 && version !== 2 && version !== 3)
    throw new Error('Phiên bản file lưu không được hỗ trợ.');
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
  profile.cultivation = number(data.cultivation, Number.MAX_SAFE_INTEGER, false);
  profile.realm = number(data.realm, version === 1 ? 10 : version === 2 ? 46 : realms.length - 1);
  profile.permanentPills = number(data.permanentPills, 5);
  profile.worldTwoPills = version === 3 ? number(data.worldTwoPills, 5) : 0;
  if (
    version === 3 &&
    data.storySeen !== undefined &&
    (!Array.isArray(data.storySeen) || data.storySeen.some((id) => id !== 'ma-do'))
  )
    throw new Error('Sự kiện truyện không hợp lệ.');
  profile.storySeen = version === 3 ? [...new Set(data.storySeen ?? [])] : [];
  if (profile.worldTwoPills && (profile.realm < 47 || profile.permanentPills < 5))
    throw new Error('Hạn mức đan vĩnh viễn không hợp lệ.');
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
    profile.resources[id] = number(
      id === 'linh-tai-thong-huyen' && version !== 3 ? 0 : data.resources[id],
    );
  for (const id of ['tu-vi-dan', 'cuong-the-dan', 'hoi-nguyen-dan'] as PillId[])
    profile.pills[id] = number(data.pills[id]);
  profile.equipment = {};
  for (const [id, value] of Object.entries(data.equipment)) {
    if (!Object.hasOwn(equipment, id)) throw new Error('Trang bị không hợp lệ.');
    profile.equipment[id] = number(value, 5);
  }
  for (const slot of Object.keys(profile.equipped) as Slot[]) {
    const legacy = data.equipped as unknown as Record<string, string | null>;
    const id =
      version !== 3 && slot === 'body'
        ? (legacy.armor ?? legacy.body ?? null)
        : version !== 3 && ['head', 'hands', 'feet'].includes(slot)
          ? null
          : data.equipped[slot];
    if (id !== null && (!(id in profile.equipment) || equipment[id].slot !== slot))
      throw new Error('Ô trang bị không hợp lệ.');
    profile.equipped[slot] = id;
    if (id && (equipment[id].requiredRealm ?? 0) > profile.realm)
      throw new Error('Cảnh giới chưa đủ dùng trang bị.');
  }
  profile.relicUnlocked =
    version === 3
      ? data.relicUnlocked === true
      : Object.keys(profile.equipment).some((id) => equipment[id].slot === 'relic') ||
        !!data.stageProgress?.['hac-phong-son']?.wins ||
        (version === 1 && data.wins > 0);
  if (version === 3 && typeof data.relicUnlocked !== 'boolean')
    throw new Error('Trạng thái bí bảo không hợp lệ.');
  if (profile.equipped.relic && !profile.relicUnlocked) throw new Error('Ô bí bảo chưa mở.');
  if (!profile.equipped.weapon) throw new Error('Thiếu vũ khí.');
  profile.pets = {};
  for (const [id, value] of Object.entries(data.pets)) {
    if (!Object.hasOwn(pets, id) || !value || typeof value.evolved !== 'boolean')
      throw new Error('Sủng vật không hợp lệ.');
    const level = number(value.level, version === 3 ? petRealmCap(profile.realm) : 5);
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
  for (const key of ['music', 'sound', 'reducedEffects'] as const) {
    if (typeof data.settings[key] !== 'boolean') throw new Error('Cài đặt không hợp lệ.');
    profile.settings[key] = data.settings[key];
  }
  if (version === 1) {
    // Bản 1.x chỉ có Hắc Phong Sơn; không suy ra thắng các màn mở rộng.
    if (profile.wins > 0)
      profile.stageProgress['hac-phong-son'] = {
        wins: profile.wins,
        bestTime: 0,
        bestKills: 0,
      };
  } else {
    if (
      !data.stageProgress ||
      typeof data.stageProgress !== 'object' ||
      Array.isArray(data.stageProgress)
    )
      throw new Error('Tiến trình màn chơi không hợp lệ.');
    for (const [id, record] of Object.entries(data.stageProgress)) {
      if (!stages.some((entry) => entry.id === id) || !record || typeof record !== 'object')
        throw new Error('Tiến trình màn chơi không hợp lệ.');
      const wins = number(record.wins);
      if (wins < 1) throw new Error('Tiến trình màn chơi không hợp lệ.');
      profile.stageProgress[id] = {
        wins,
        bestTime: number(record.bestTime, 1000000, false),
        bestKills: number(record.bestKills),
      };
    }
    if (
      typeof data.selectedStageId !== 'string' ||
      !stages.some((entry) => entry.id === data.selectedStageId)
    )
      throw new Error('Màn đã chọn không hợp lệ.');
    profile.selectedStageId = data.selectedStageId;
    // Màn được lưu nhưng chưa đủ điều kiện trở về màn đầu thay vì tạo nút bắt đầu bị kẹt.
    if (!stageUnlocked(profile, profile.selectedStageId)) profile.selectedStageId = 'hac-phong-son';
  }
  // Cổng truyền thừa phải xét tiến trình vừa đọc, không xét stageProgress rỗng lúc khởi tạo.
  cleanLoadout(profile);
  return profile;
}
