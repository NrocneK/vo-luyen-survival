import test from 'node:test';
import assert from 'node:assert/strict';
import { newProfile } from '../src/domain/profile.ts';
import { loadProfile, saveProfile, importSave } from '../src/persistence/save.ts';

function storage() {
  const values = new Map<string, string>();
  const mock = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mock, configurable: true });
  return { values, mock };
}
test('Bản dự phòng tốt khôi phục khi bản chính hỏng và không bị autosave đè bằng dữ liệu hỏng', () => {
  const { values } = storage(),
    profile = newProfile();
  profile.stone = 999;
  values.set('vo-luyen.profile.v1', '{broken');
  values.set('vo-luyen.profile.backup.v1', JSON.stringify(profile));
  const loaded = loadProfile();
  assert.equal(loaded.profile.stone, 999);
  assert.ok(loaded.warning);
  assert.equal(saveProfile(loaded.profile), true);
  assert.equal(JSON.parse(values.get('vo-luyen.profile.backup.v1')!).stone, 999);
});
test('Bản hỏng được giữ riêng; lỗi quota trả trạng thái thất bại', () => {
  const { values, mock } = storage();
  values.set('vo-luyen.profile.v1', '{broken');
  loadProfile();
  assert.equal(values.get('vo-luyen.profile.recovery.v1'), '{broken');
  mock.setItem = () => {
    throw new Error('quota');
  };
  assert.equal(saveProfile(newProfile()), false);
});
test('Nhập file giữ cấu trúc, từ chối game sai, số liệu sai và file vượt giới hạn', async () => {
  const profile = newProfile();
  const good = new File([JSON.stringify({ game: 'vo-luyen', profile })], 'save.json');
  assert.deepEqual(await importSave(good), profile);
  await assert.rejects(importSave(new File(['{"game":"other"}'], 'wrong.json')));
  await assert.rejects(
    importSave(
      new File(
        [JSON.stringify({ game: 'vo-luyen', profile: { ...profile, stone: -1 } })],
        'bad.json',
      ),
    ),
  );
  await assert.rejects(importSave(new File(['x'.repeat(128001)], 'large.json')));
});
