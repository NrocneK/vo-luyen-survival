import test from 'node:test';
import assert from 'node:assert/strict';
import type { Loot, RunResult } from '../src/shared/models';
import {
  newProfile,
  validateProfile,
  applyResult,
  breakthrough,
  breakthroughLockReason,
  cultivationIdleRate,
  claimIdle,
  brew,
  usePill,
  pillCultivation,
  forge,
  equip,
  permanentStats,
} from '../src/domain/profile.ts';
import { realms, WORLD_ONE_REALM_CAP } from '../src/data/realms.ts';
import { stages } from '../src/data/stages.ts';
import { equipment } from '../src/data/equipment.ts';
import {
  availableStages,
  stageLockReason,
  stageUnlocked,
  worldProgress,
} from '../src/data/campaign.ts';

const emptyLoot = (): Loot => ({
  stone: 0,
  cultivation: 0,
  resources: {},
  equipment: [],
  blueprints: [],
});
const result = (stageId: string, won = true, loot = emptyLoot(), time = 650): RunResult => ({
  stageId,
  won,
  time,
  kills: 1000,
  level: 30,
  rewards: structuredClone(loot),
  raw: structuredClone(loot),
  seed: 87,
  reason: '',
});

test('47 cảnh giới giữ mốc save cũ và dừng đúng Thần Du đỉnh phong', () => {
  assert.equal(realms.length, 53);
  assert.equal(WORLD_ONE_REALM_CAP, 46);
  for (const [index, name] of [
    [0, 'Thối Thể tầng 1'],
    [9, 'Thối Thể đỉnh phong'],
    [10, 'Khai Nguyên tầng 1'],
    [18, 'Khai Nguyên tầng 9'],
    [19, 'Khí Động tầng 1'],
    [28, 'Chân Nguyên tầng 1'],
    [37, 'Thần Du tầng 1'],
    [43, 'Thần Du tầng 7'],
    [46, 'Thần Du đỉnh phong'],
  ] as const)
    assert.equal(realms[index].name, name);
  const profile = newProfile();
  profile.realm = 46;
  profile.cultivation = 100000;
  const before = structuredClone(profile);
  assert.match(breakthrough(profile), /Cần vượt/);
  assert.deepEqual(profile, before);
  assert.ok(realms.every((realm) => realm.slots <= 6));
});

test('Bản lưu v1 nâng lên v2 giữ tài sản và chỉ suy ra thắng Hắc Phong Sơn', () => {
  const original = newProfile(1234);
  original.realm = 10;
  original.stone = 987;
  original.cultivation = 456.75;
  original.wins = 3;
  original.runs = 7;
  original.equipment['liet-duong-kiem'] = 4;
  original.equipped.weapon = 'liet-duong-kiem';
  original.pets['linh-ho'] = { level: 3, evolved: true };
  original.activePet = 'linh-ho';
  const { stageProgress: _progress, selectedStageId: _selected, ...legacy } = original;
  const migrated = validateProfile({ ...legacy, version: 1 });
  assert.equal(migrated.version, 3);
  assert.equal(migrated.realm, original.realm);
  assert.equal(migrated.stone, original.stone);
  assert.equal(migrated.cultivation, original.cultivation);
  assert.deepEqual(migrated.equipment, original.equipment);
  assert.deepEqual(migrated.pets, original.pets);
  assert.deepEqual(migrated.stageProgress, {
    'hac-phong-son': { wins: 3, bestTime: 0, bestKills: 0 },
  });
  assert.equal(migrated.selectedStageId, 'hac-phong-son');
  assert.deepEqual(
    availableStages(migrated).map((stage) => stage.id),
    ['hac-phong-son', 'truyen-thua-dong-thien'],
  );
  assert.deepEqual(validateProfile(JSON.parse(JSON.stringify(migrated))), migrated);
  assert.deepEqual(validateProfile({ ...legacy, version: 1, wins: 0 }).stageProgress, {});
  assert.throws(() => validateProfile({ ...legacy, version: 1, realm: 11 }));
});

test('Mở màn cần đồng thời cảnh giới và chiến thắng màn trước, thất bại không mở khóa', () => {
  const profile = newProfile();
  assert.deepEqual(
    availableStages(profile).map((stage) => stage.id),
    ['hac-phong-son'],
  );
  assert.equal(stageUnlocked(profile, 'not-a-stage'), false);
  profile.realm = 10;
  assert.match(stageLockReason(profile, stages[1].id), /Cần vượt/);
  applyResult(profile, result(stages[0].id, false));
  assert.equal(stageUnlocked(profile, stages[1].id), false);
  const won = result(stages[0].id);
  applyResult(profile, won);
  assert.equal(won.newStageUnlocked, stages[1].id);
  assert.equal(stageUnlocked(profile, stages[1].id), true);
  assert.equal(stageUnlocked(profile, stages[2].id), false);
  profile.realm = 9;
  assert.match(stageLockReason(profile, stages[1].id), /Khai Nguyên tầng 1/);
});

test('Thưởng lần đầu cộng một lần vào kết quả; thành tích chỉ ghi khi thắng', () => {
  const profile = newProfile();
  const base = { ...emptyLoot(), stone: 101, cultivation: 123.5, resources: { 'linh-thao': 4 } };
  const first = result(stages[0].id, true, base);
  const before = structuredClone(profile);
  applyResult(profile, first);
  assert.deepEqual(first.firstClearRewards, stages[0].firstClear);
  assert.equal(first.rewards.cultivation, base.cultivation + stages[0].firstClear.cultivation);
  assert.equal(profile.cultivation, before.cultivation + first.rewards.cultivation);
  assert.equal(profile.stone, before.stone + first.rewards.stone);
  assert.equal(first.raw.cultivation, base.cultivation);
  const second = result(stages[0].id, true, base, 620);
  second.kills = 900;
  applyResult(profile, second);
  assert.equal(second.firstClearRewards, undefined);
  assert.equal(second.rewards.cultivation, base.cultivation);
  assert.deepEqual(profile.stageProgress[stages[0].id], {
    wins: 2,
    bestTime: 620,
    bestKills: 1000,
  });
  applyResult(profile, result(stages[0].id, false, emptyLoot(), 100));
  assert.deepEqual(profile.stageProgress[stages[0].id], {
    wins: 2,
    bestTime: 620,
    bestKills: 1000,
  });
  assert.equal(profile.runs, 3);
  assert.equal(profile.wins, 2);
});

test('Đột phá đại cảnh giới kiểm tra mốc boss, đan và nguyên liệu trước khi trừ', () => {
  const profile = newProfile();
  for (const index of [9, 18, 27, 36]) {
    profile.realm = index;
    profile.cultivation = realms[index].cost;
    profile.resources['hat-sen-dot-pha'] = 1;
    profile.pills['tu-vi-dan'] = 2;
    assert.match(breakthroughLockReason(profile), /Cần vượt/);
    const before = structuredClone(profile);
    breakthrough(profile);
    assert.deepEqual(profile, before);
    profile.stageProgress[realms[index].requiredStageId!] = {
      wins: 1,
      bestTime: 650,
      bestKills: 1000,
    };
    profile.pills['tu-vi-dan'] = 1;
    assert.match(breakthroughLockReason(profile), /2 Tu Vi Đan/);
    profile.pills['tu-vi-dan'] = 2;
    assert.equal(breakthroughLockReason(profile), '');
    breakthrough(profile);
    assert.equal(profile.realm, index + 1);
    assert.equal(profile.cultivation, 0);
    assert.equal(profile.resources['hat-sen-dot-pha'], 0);
    assert.equal(profile.pills['tu-vi-dan'], 0);
  }
});

test('Kết quả đã tổng kết không cộng thưởng lại, kể cả bản clone còn mang thưởng lần đầu', () => {
  const profile = newProfile();
  const base = { ...emptyLoot(), stone: 100, cultivation: 1000 };
  const first = result(stages[0].id, true, base);
  applyResult(profile, first);
  assert.equal(first.settled, true);
  const settled = structuredClone(profile);
  applyResult(profile, first);
  assert.deepEqual(profile, settled);
  applyResult(profile, structuredClone(first));
  assert.deepEqual(profile, settled);
  const next = result(stages[0].id, true, base);
  applyResult(profile, next);
  assert.equal(next.firstClearRewards, undefined);
  assert.equal(profile.cultivation - settled.cultivation, base.cultivation);
  assert.equal(profile.stone - settled.stone, base.stone);
  assert.equal(profile.wins, settled.wins + 1);
});

test('Idle tăng theo chặng, giữ trần 8 giờ; Tu Vi Đan tăng đúng cảnh giới', () => {
  const profile = newProfile(0);
  const initial = cultivationIdleRate(profile);
  profile.stageProgress[stages[0].id] = { wins: 1, bestTime: 630, bestKills: 1000 };
  assert.ok(cultivationIdleRate(profile) > initial);
  const rate = cultivationIdleRate(profile);
  assert.equal(claimIdle(profile, 12 * 3600000), rate * 8 * 3600);
  assert.equal(profile.realm, 0);
  for (const realm of [0, 10, 19, 28, 37, 46]) {
    profile.realm = realm;
    profile.pills['tu-vi-dan'] = 1;
    const before = profile.cultivation;
    const expected = 80 * (1 + Math.floor(realm / 10) * 4);
    assert.equal(pillCultivation(profile), expected);
    usePill(profile, 'tu-vi-dan');
    assert.equal(profile.cultivation - before, expected);
  }
});

test('Trang bị cảnh giới mới kiểm tra điều kiện chế tạo và trang bị', () => {
  const profile = newProfile();
  profile.relicUnlocked = true;
  profile.stone = 100000;
  for (const key of Object.keys(profile.resources) as (keyof typeof profile.resources)[])
    profile.resources[key] = 1000;
  for (const item of Object.values(equipment).filter((item) => item.requiredRealm)) {
    profile.realm = item.requiredRealm! - 1;
    profile.blueprints.push(item.id);
    const before = structuredClone(profile);
    assert.match(forge(profile, item.id), /Cần đạt/);
    assert.deepEqual(profile, before);
    profile.equipment[item.id] = 0;
    assert.match(equip(profile, item.id), /Cần đạt/);
    profile.realm = item.requiredRealm!;
    delete profile.equipment[item.id];
    assert.match(forge(profile, item.id), /thành công/);
    assert.match(equip(profile, item.id), /Đã trang bị/);
    assert.equal(profile.equipped[item.slot], item.id);
  }
});

test('Thế giới chỉ hoàn tất khi đủ sáu chiến thắng và Thần Du đỉnh phong', () => {
  const profile = newProfile();
  profile.realm = WORLD_ONE_REALM_CAP;
  for (const stage of stages.slice(0, -1)) applyResult(profile, result(stage.id));
  assert.deepEqual(worldProgress(profile), {
    world: 1,
    cleared: 5,
    total: 6,
    completed: false,
    nextWorldUnlocked: false,
  });
  profile.realm = 45;
  applyResult(profile, result(stages[5].id));
  assert.equal(worldProgress(profile).completed, false);
  profile.realm = 46;
  assert.deepEqual(worldProgress(profile), {
    world: 1,
    cleared: 6,
    total: 6,
    completed: true,
    nextWorldUnlocked: true,
  });
  const max = permanentStats(profile);
  profile.realm = 0;
  assert.ok(max.damage > permanentStats(profile).damage * 9);
});

test('Validator từ chối tiến trình sai và phục hồi màn chọn đã khóa', () => {
  const profile = newProfile();
  assert.throws(() => validateProfile({ ...profile, realm: 53 }));
  assert.throws(() => validateProfile({ ...profile, selectedStageId: 'unknown' }));
  assert.throws(() =>
    validateProfile({
      ...profile,
      stageProgress: { unknown: { wins: 1, bestTime: 1, bestKills: 1 } },
    }),
  );
  for (const record of [
    { wins: 0, bestTime: 1, bestKills: 1 },
    { wins: 1, bestTime: -1, bestKills: 1 },
    { wins: 1, bestTime: Infinity, bestKills: 1 },
    { wins: 1, bestTime: 650, bestKills: 1.5 },
  ])
    assert.throws(() =>
      validateProfile({ ...profile, stageProgress: { 'hac-phong-son': record } }),
    );
  assert.equal(
    validateProfile({ ...profile, selectedStageId: stages[5].id }).selectedStageId,
    stages[0].id,
  );
});

test('Kinh tế chiến dịch có đường đi tới trần mà không cần idle hoặc vật liệu sau cổng khóa', () => {
  const profile = newProfile();
  let clears = 0;
  for (let index = 0; index < stages.length; index++) {
    const stage = stages[index];
    assert.equal(stageLockReason(profile, stage.id), '');
    const target = stages[index + 1]?.requiredRealm ?? WORLD_ONE_REALM_CAP;
    // Mô phỏng phần thưởng cấu hình, thêm nguyên liệu thường từ hai tinh anh mỗi lượt.
    for (let attempts = 0; profile.realm < target && attempts < 4; attempts++) {
      const loot = structuredClone(stage.rewards);
      loot.resources['linh-thao'] = (loot.resources['linh-thao'] ?? 0) + 12;
      loot.cultivation += 600;
      applyResult(profile, result(stage.id, true, loot));
      clears++;
      for (let tries = 0; profile.pills['tu-vi-dan'] < 2 && tries < 2; tries++)
        brew(profile, 'tu-vi-dan');
      assert.equal(profile.pills['tu-vi-dan'], 2, `Thiếu nguyên liệu luyện đan tại ${stage.name}`);
      while (profile.realm < target && !breakthroughLockReason(profile)) breakthrough(profile);
    }
    assert.equal(profile.realm, target, `Không thể qua cổng ${stage.name}`);
    if (!profile.stageProgress[stage.id]) {
      applyResult(profile, result(stage.id, true, stage.rewards));
      clears++;
    }
    validateProfile(JSON.parse(JSON.stringify(profile)));
  }
  assert.equal(worldProgress(profile).completed, true);
  assert.ok(clears <= 12, `Chiến dịch đòi hỏi ${clears} lượt thắng`);
});
