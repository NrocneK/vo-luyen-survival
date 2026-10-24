import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultTestSettings, normalizeTestSettings } from '../src/data/testing.ts';
import type { TestSettings } from '../src/data/testing.ts';
import {
  applyTestAction,
  loadTestProfile,
  replenishTestResources,
  saveTestProfile,
  TEST_PROFILE_KEY,
  TEST_RESOURCE_AMOUNT,
} from '../src/domain/testing.ts';
import { applyResult, brew, newProfile, validateProfile } from '../src/domain/profile.ts';
import { equipment } from '../src/data/equipment.ts';
import { pets } from '../src/data/pets.ts';
import { stages } from '../src/data/stages.ts';
import { realms } from '../src/data/realms.ts';
import type { RunResult } from '../src/shared/models';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
}

test('Công cụ test mặc định tắt; chỉ chấp nhận các hệ số hỗ trợ', () => {
  assert.deepEqual(normalizeTestSettings({}), defaultTestSettings);
  assert.deepEqual(normalizeTestSettings({ enabled: true, timeScale: 6, damageMultiplier: 100 }), {
    enabled: true,
    unlimitedResources: false,
    timeScale: 6,
    damageMultiplier: 100,
  });
  const invalid = {
    timeScale: Infinity,
    damageMultiplier: -10,
  } as unknown as Partial<TestSettings>;
  assert.equal(normalizeTestSettings(invalid).timeScale, 1);
  assert.equal(normalizeTestSettings(invalid).damageMultiplier, 1);
});

test('Bản test là bản sao riêng; cấp tu vi, đồ và cảnh giới không sửa nhân vật thật', () => {
  const main = newProfile(1000);
  const before = structuredClone(main);
  const { profile } = loadTestProfile(main, memoryStorage());
  applyTestAction(profile, 'cultivation', 100_000);
  applyTestAction(profile, 'gear');
  applyTestAction(profile, 'realm');
  assert.deepEqual(main, before);
  assert.equal(profile.cultivation, 100_000);
  assert.equal(profile.realm, realms.length - 1);
  assert.equal(profile.realm, 52);
  assert.ok(Object.keys(equipment).every((id) => profile.equipment[id] === 5));
  assert.ok(
    Object.values(equipment)
      .filter((item) => item.special)
      .every((item) => profile.blueprints.includes(item.id)),
  );
  assert.ok(
    Object.keys(pets).every((id) => profile.pets[id].level === 5 && profile.pets[id].evolved),
  );
  assert.equal(profile.wins, 0);
  assert.deepEqual(profile.stageProgress, {});
  validateProfile(profile);
});

test('Tài nguyên vô hạn dùng số hữu hạn, bù đủ sau khi tiêu hao và vẫn lưu hợp lệ', () => {
  const profile = newProfile(1000);
  replenishTestResources(profile);
  const storage = memoryStorage();
  brew(profile, 'tu-vi-dan');
  assert.ok(profile.stone < TEST_RESOURCE_AMOUNT);
  replenishTestResources(profile);
  assert.equal(profile.stone, TEST_RESOURCE_AMOUNT);
  assert.ok(Object.values(profile.resources).every((amount) => amount === TEST_RESOURCE_AMOUNT));
  assert.ok(Object.values(profile.pills).every((amount) => amount === TEST_RESOURCE_AMOUNT));
  assert.equal(saveTestProfile(profile, storage), true);
  assert.equal(
    loadTestProfile(newProfile(), storage).profile.pills['tu-vi-dan'],
    TEST_RESOURCE_AMOUNT,
  );
});

test('Thưởng thắng và autosave test chỉ ghi khóa test, giữ nguyên tiến trình chính', () => {
  const main = newProfile(1000);
  const mainKey = 'vo-luyen.profile.v1';
  const mainJson = JSON.stringify(main);
  const storage = memoryStorage({ [mainKey]: mainJson });
  const { profile } = loadTestProfile(main, storage);
  const result: RunResult = {
    stageId: stages[0].id,
    won: true,
    time: 650,
    kills: 100,
    level: 4,
    seed: 5,
    reason: 'Test',
    raw: { stone: 50, cultivation: 100, resources: {}, equipment: [], blueprints: [] },
    rewards: { stone: 50, cultivation: 100, resources: {}, equipment: [], blueprints: [] },
  };
  applyResult(profile, result);
  assert.equal(saveTestProfile(profile, storage), true);
  assert.equal(storage.getItem(mainKey), mainJson);
  assert.equal(storage.values.size, 2);
  assert.equal(loadTestProfile(main, storage).profile.stageProgress[stages[0].id].wins, 1);
  assert.deepEqual(main.stageProgress, {});
});

test('Bản test giữ lựa chọn màn khóa mà không tạo thành tích thắng giả', () => {
  const main = newProfile(1000);
  const { profile } = loadTestProfile(main, memoryStorage());
  profile.selectedStageId = stages.at(-1)!.id;
  const storage = memoryStorage();
  assert.equal(saveTestProfile(profile, storage), true);
  const loaded = loadTestProfile(main, storage).profile;
  assert.equal(loaded.selectedStageId, stages.at(-1)!.id);
  assert.equal(loaded.wins, 0);
  assert.deepEqual(loaded.stageProgress, {});
});

test('Bản test lỗi trở về bản sao hợp lệ, không ghi lại dữ liệu chính hoặc giá trị Infinity', () => {
  const main = newProfile(1000);
  const storage = memoryStorage({ [TEST_PROFILE_KEY]: '{broken' });
  const loaded = loadTestProfile(main, storage);
  assert.ok(loaded.warning);
  assert.deepEqual(loaded.profile, main);
  loaded.profile.stone = Infinity;
  assert.equal(saveTestProfile(loaded.profile, storage), false);
  assert.equal(storage.getItem(TEST_PROFILE_KEY), '{broken');
  assert.equal(storage.values.size, 1);
});

test('Cộng tu vi trực tiếp không tiêu tài nguyên; giới hạn bảo toàn dữ liệu lưu', () => {
  const profile = newProfile(1000);
  const resources = structuredClone(profile.resources);
  applyTestAction(profile, 'cultivation', 10_000);
  assert.equal(profile.cultivation, 10_000);
  assert.deepEqual(profile.resources, resources);
  assert.equal(profile.stone, 180);
  applyTestAction(profile, 'cultivation', Infinity);
  assert.equal(profile.cultivation, 10_000);
  applyTestAction(profile, 'cultivation', 200_000_000);
  assert.equal(profile.cultivation, 200_010_000);
  validateProfile(profile);
});
