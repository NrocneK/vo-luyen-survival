import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProfile,
  claimIdle,
  breakthrough,
  brew,
  usePill,
  forge,
  upgrade,
  equip,
  unequip,
  unlockPet,
  feedPet,
  evolvePet,
  permanentStats,
  settleLoot,
  validateProfile,
  applyResult,
} from '../src/domain/profile.ts';
import { eligibleCards } from '../src/data/skills.ts';
import { stage } from '../src/data/stages.ts';

test('tháo áo giữ món sở hữu, tiền và tu vi; bỏ đúng chỉ số, lưu/tải được và giữ vũ khí', () => {
  const profile = newProfile();
  const before = structuredClone(profile);
  const stats = permanentStats(profile);
  unequip(profile, 'vo-phuc');
  assert.equal(profile.equipped.body, null);
  assert.deepEqual(profile.equipment, before.equipment);
  assert.equal(profile.stone, before.stone);
  assert.equal(profile.cultivation, before.cultivation);
  assert.equal(permanentStats(profile).hp, stats.hp - 15);
  assert.equal(validateProfile(structuredClone(profile)).equipped.body, null);
  unequip(profile, 'dong-quyen-sao');
  assert.equal(profile.equipped.weapon, 'dong-quyen-sao');
  equip(profile, 'vo-phuc');
  assert.deepEqual(permanentStats(profile), stats);
});

test('Idle giới hạn 8 giờ, đồng hồ lùi không sinh tu vi âm', () => {
  const profile = newProfile(1000);
  assert.equal(claimIdle(profile, 1000 + 12 * 3600000), 115.2);
  const previous = profile.cultivation;
  assert.equal(claimIdle(profile, 500), 0);
  assert.equal(profile.cultivation, previous);
});
test('Tu vi không tự tăng cảnh giới; đột phá trừ đúng tài nguyên', () => {
  const profile = newProfile();
  profile.cultivation = 200;
  assert.equal(profile.realm, 0);
  breakthrough(profile);
  assert.equal(profile.realm, 1);
  assert.equal(profile.cultivation, 140);
  profile.realm = 9;
  profile.cultivation = 1000;
  breakthrough(profile);
  assert.equal(profile.realm, 9);
  profile.resources['hat-sen-dot-pha'] = 1;
  profile.pills['tu-vi-dan'] = 2;
  profile.stageProgress['hac-phong-son'] = { wins: 1, bestTime: 630, bestKills: 1000 };
  breakthrough(profile);
  assert.equal(profile.realm, 10);
  assert.equal(profile.resources['hat-sen-dot-pha'], 0);
  assert.equal(profile.pills['tu-vi-dan'], 0);
});
test('Đan sư mở công thức, dùng đan có giới hạn vĩnh viễn', () => {
  const profile = newProfile();
  profile.stone = 5000;
  profile.resources['linh-thao'] = 100;
  profile.resources['yeu-dan'] = 30;
  brew(profile, 'cuong-the-dan');
  assert.equal(profile.pills['cuong-the-dan'], 0);
  for (let i = 0; i < 4; i++) brew(profile, 'tu-vi-dan');
  usePill(profile, 'tu-vi-dan');
  assert.equal(profile.cultivation, 80);
  for (let i = 0; i < 6; i++) {
    brew(profile, 'cuong-the-dan');
    usePill(profile, 'cuong-the-dan');
  }
  assert.equal(profile.permanentPills, 5);
  assert.equal(profile.pills['cuong-the-dan'], 1);
});
test('Trang bị đặc biệt cần bản vẽ, cường hóa có trần và không âm tài nguyên', () => {
  const profile = newProfile();
  profile.stone = 5000;
  profile.resources['thiet-khoang'] = 100;
  profile.resources['yeu-dan'] = 50;
  forge(profile, 'liet-duong-kiem');
  assert.equal(profile.equipment['liet-duong-kiem'], undefined);
  profile.blueprints.push('liet-duong-kiem');
  forge(profile, 'liet-duong-kiem');
  equip(profile, 'liet-duong-kiem');
  assert.equal(profile.equipped.weapon, 'liet-duong-kiem');
  for (let i = 0; i < 8; i++) upgrade(profile, 'liet-duong-kiem');
  assert.equal(profile.equipment['liet-duong-kiem'], 5);
  profile.stone = 0;
  const before = structuredClone(profile);
  upgrade(profile, 'vo-phuc');
  assert.deepEqual(profile, before);
});
test('Nội tại cả hai linh thú cộng dù không đồng hành; nuôi và tiến hóa', () => {
  const profile = newProfile();
  profile.stone = 3000;
  profile.resources['trung-linh-ho'] = 1;
  profile.resources['trung-thanh-dieu'] = 1;
  profile.resources['thuc-an-sung-vat'] = 30;
  profile.resources['tinh-thach-tien-hoa'] = 5;
  profile.resources['yeu-dan'] = 20;
  const base = permanentStats(profile);
  unlockPet(profile, 'linh-ho');
  unlockPet(profile, 'thanh-dieu');
  profile.activePet = null;
  assert.ok(permanentStats(profile).hp > base.hp);
  assert.ok(permanentStats(profile).damage > base.damage);
  feedPet(profile, 'linh-ho');
  feedPet(profile, 'linh-ho');
  evolvePet(profile, 'linh-ho');
  assert.equal(profile.pets['linh-ho'].evolved, true);
});
test('Thất bại nhận 30% số lượng; giữ vật phẩm theo từng lần RNG, thắng giữ đủ', () => {
  const raw = {
    stone: 101,
    cultivation: 101,
    resources: { 'linh-thao': 9 },
    equipment: ['vo-phuc', 'ngoc-gioi'],
    blueprints: ['liet-duong-kiem'],
  };
  const values = [0.1, 0.8, 0.2];
  const failed = settleLoot(raw, false, () => values.shift()!);
  assert.equal(failed.stone, 30);
  assert.equal(failed.cultivation, 30.299999999999997);
  assert.equal(failed.resources['linh-thao'], 2);
  assert.deepEqual(failed.equipment, ['vo-phuc']);
  assert.deepEqual(
    settleLoot(raw, true, () => 1),
    raw,
  );
  const profile = newProfile();
  applyResult(profile, {
    stageId: 'hac-phong-son',
    won: true,
    time: 620,
    kills: 500,
    level: 20,
    rewards: raw,
    raw,
    seed: 1,
    reason: '',
  });
  assert.equal(profile.wins, 1);
  assert.equal(profile.runs, 1);
  assert.equal(profile.stone, 306 + stage.firstClear.stone);
});
test('Thức tỉnh chỉ khi tấn công bậc 5 và hỗ trợ liên kết đã kích hoạt', () => {
  assert.ok(
    !eligibleCards(['cuong-quyen', 'cuong-the'], { 'cuong-quyen': 5 }).some(
      (c) => c.kind === 'awaken',
    ),
  );
  assert.ok(
    eligibleCards(['cuong-quyen', 'cuong-the'], { 'cuong-quyen': 5, 'cuong-the': 1 }).some(
      (c) => c.kind === 'awaken',
    ),
  );
  assert.ok(!eligibleCards(['cuong-the'], { 'cuong-the': 5 }).some((c) => c.skill === 'cuong-the'));
});
test('File lưu xác thực cấu trúc, từ chối số vô hạn/ô trang bị sai/skill lạ', () => {
  const profile = newProfile();
  assert.deepEqual(validateProfile(JSON.parse(JSON.stringify(profile))), profile);
  assert.throws(() => validateProfile({ ...profile, stone: Infinity }));
  assert.throws(() =>
    validateProfile({ ...profile, equipped: { ...profile.equipped, relic: 'vo-phuc' } }),
  );
  assert.throws(() => validateProfile({ ...profile, selectedSkills: ['unknown'] }));
});
