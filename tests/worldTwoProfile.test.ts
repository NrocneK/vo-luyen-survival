import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProfile,
  validateProfile,
  permanentStats,
  breakthrough,
  brew,
  usePill,
  maxBrew,
  pillCultivation,
  upgradeCost,
  feedPet,
  skillUnlocked,
} from '../src/domain/profile.ts';
import { stages, allStages } from '../src/data/stages.ts';
import { worldTwoStages } from '../src/data/worldTwoStages.ts';
import { worldProgress, stageUnlocked, justCompletedWorld } from '../src/data/campaign.ts';
import { realms, idlePerSecond } from '../src/data/realms.ts';
import { equipment } from '../src/data/equipment.ts';
const win = { wins: 1, bestTime: 30, bestKills: 10 };
function completedOne() {
  const p = newProfile(100);
  p.realm = 46;
  p.relicUnlocked = true;
  for (const stage of stages) p.stageProgress[stage.id] = { ...win };
  return p;
}

test('Giữ sáu màn Trung Đô, thêm đúng 14 màn và sáu mốc, khóa Phần 2 theo cả thắng và cảnh giới', () => {
  assert.equal(stages.length, 6);
  assert.equal(allStages.length, 20);
  assert.equal(worldTwoStages.length, 14);
  assert.equal(realms.length, 53);
  const p = completedOne();
  assert.ok(stageUnlocked(p, 'doc-ngao-minh'));
  p.realm = 45;
  assert.equal(stageUnlocked(p, 'doc-ngao-minh'), false);
  p.realm = 46;
  delete p.stageProgress['ly-dia'];
  assert.equal(stageUnlocked(p, 'doc-ngao-minh'), false);
});
test('Chuyển v2 sang v3 giữ tài sản, áo cũ vào thân, mở quyền bí bảo cũ và không tự cấp ô mới', () => {
  const old = JSON.parse(JSON.stringify(completedOne()));
  old.version = 2;
  old.cultivation = 1234567890.5;
  old.equipment['truyen-thua-bi-bao'] = 4;
  old.equipped.relic = 'truyen-thua-bi-bao';
  old.equipped.armor = old.equipped.body;
  delete old.equipped.body;
  delete old.resources['linh-tai-thong-huyen'];
  delete old.worldTwoPills;
  delete old.relicUnlocked;
  const p = validateProfile(old);
  assert.equal(p.version, 3);
  assert.equal(p.cultivation, old.cultivation);
  assert.equal(p.equipped.body, 'vo-phuc');
  assert.equal(p.equipped.head, null);
  assert.equal(p.equipped.hands, null);
  assert.equal(p.equipment['truyen-thua-bi-bao'], 4);
  assert.equal(p.relicUnlocked, true);
  assert.equal(p.worldTwoPills, 0);
  assert.deepEqual(validateProfile(JSON.parse(JSON.stringify(p))), p);
});
test('Sáu lần đột phá chỉ trừ đúng 1.725.000 tu vi và giữ dư qua lưu/tải; không bỏ cổng truyện', () => {
  let p = completedOne();
  p.cultivation = 3000000;
  assert.match(breakthrough(p), /Cần vượt/);
  assert.equal(p.realm, 46);
  for (const gate of [
    'co-ma',
    'ma-hoa',
    'duong-toc',
    'thanh-lang',
    'long-phuong-phu',
    'thong-huyen-tru',
  ]) {
    p.stageProgress[gate] = { ...win };
    assert.match(breakthrough(p), /thành công/);
    p = validateProfile(JSON.parse(JSON.stringify(p)));
  }
  assert.equal(p.realm, 52);
  assert.equal(p.cultivation, 1275000);
  assert.match(breakthrough(p), /đỉnh phong/);
});
test('Tu vi đan/ngoại tuyến đọc ba tầng mỗi đại cảnh giới, không lấy chỉ số 20 màn để nhân idle cũ', () => {
  const p = completedOne();
  assert.equal(pillCultivation(p), 1360);
  assert.equal(idlePerSecond(46, 99), 0.5);
  for (let i = 0; i < 6; i++) {
    p.realm = 47 + i;
    assert.equal(pillCultivation(p), [4000, 6000, 9000, 12000, 16000, 20000][i]);
    assert.equal(idlePerSecond(p.realm, 99), [1.5, 2.25, 3, 4, 5, 6][i]);
  }
});
test('Luyện 10/tối đa quyết toán một lần theo đủ chi phí, không luyện thiếu số lượng yêu cầu', () => {
  const p = newProfile();
  p.stone = 1000;
  p.resources['linh-thao'] = 33;
  assert.equal(maxBrew(p, 'tu-vi-dan'), 11);
  assert.match(brew(p, 'tu-vi-dan', 10), /10/);
  assert.equal(p.pills['tu-vi-dan'], 10);
  assert.equal(p.resources['linh-thao'], 3);
  assert.equal(p.stone, 750);
  assert.equal(p.alchemyXp, 10);
  const before = structuredClone(p);
  brew(p, 'tu-vi-dan', 5);
  assert.deepEqual(p, before);
  brew(p, 'tu-vi-dan', 'max');
  assert.equal(p.pills['tu-vi-dan'], 11);
  assert.equal(p.alchemyXp, 11);
});
test('Đan vĩnh viễn hoàn tất năm suất cũ rồi năm suất mới, không nhân lại chỉ số cũ', () => {
  const p = newProfile();
  p.realm = 47;
  p.permanentPills = 3;
  p.pills['cuong-the-dan'] = 9;
  const before = permanentStats(p);
  usePill(p, 'cuong-the-dan');
  usePill(p, 'cuong-the-dan');
  const foundation = permanentStats(p);
  assert.equal(p.permanentPills, 5);
  assert.ok(Math.abs(foundation.hp - before.hp - 16) < 1e-9);
  assert.ok(Math.abs(foundation.damage - before.damage - 2) < 1e-9);
  for (let i = 0; i < 5; i++) usePill(p, 'cuong-the-dan');
  const advanced = permanentStats(p);
  assert.equal(p.worldTwoPills, 5);
  assert.ok(Math.abs(advanced.hp - foundation.hp - 150) < 1e-9);
  assert.ok(Math.abs(advanced.damage - foundation.damage - 20) < 1e-9);
  const left = p.pills['cuong-the-dan'];
  usePill(p, 'cuong-the-dan');
  assert.equal(p.pills['cuong-the-dan'], left);
  assert.equal(validateProfile(p).worldTwoPills, 5);
});
test('Đồ mới đủ 16 món; bảy ô không nhân cường hóa và giá đồ cũ theo cảnh giới', () => {
  assert.equal(Object.keys(newProfile().equipped).length, 7);
  assert.equal(
    Object.values(equipment).filter((item) => (item.requiredRealm ?? 0) >= 47).length,
    16,
  );
  assert.deepEqual(upgradeCost(0, 'dong-quyen-sao'), {
    stone: 35,
    resources: { 'thiet-khoang': 3 },
  });
  assert.equal(upgradeCost(0, 'xich-duong-kiem').stone, 250);
  assert.equal(upgradeCost(4, 'thanh-chu-ngoc-an').stone, 1800);
});
test('Nuôi thú 5→6 theo cảnh giới, không tự tăng bậc; bậc 10 nội tại đúng bảng và một lần tiến hóa', () => {
  const p = newProfile();
  p.realm = 47;
  p.stone = 100000;
  p.resources['linh-tai-thong-huyen'] = 1000;
  p.resources['thuc-an-sung-vat'] = 1000;
  p.pets['linh-ho'] = { level: 5, evolved: true };
  feedPet(p, 'linh-ho');
  assert.equal(p.pets['linh-ho'].level, 6);
  assert.equal(p.stone, 99400);
  feedPet(p, 'linh-ho');
  assert.equal(p.pets['linh-ho'].level, 6);
  p.realm = 51;
  for (let i = 0; i < 4; i++) feedPet(p, 'linh-ho');
  assert.equal(p.pets['linh-ho'].level, 10);
  const a = permanentStats(p);
  delete p.pets['linh-ho'];
  const b = permanentStats(p);
  assert.ok(Math.abs(a.hp - b.hp - 150) < 1e-9);
  assert.ok(Math.abs(a.pickup - b.pickup - 3) < 1e-9);
});
test('Truyền thừa kỹ năng cần cả thắng mốc và cảnh giới, không chỉ đặt realm cao', () => {
  const p = completedOne();
  p.realm = 52;
  assert.equal(skillUnlocked(p, 'gia-thien-thu'), false);
  p.stageProgress['thanh-lang'] = { ...win };
  assert.equal(skillUnlocked(p, 'gia-thien-thu'), true);
  p.realm = 49;
  assert.equal(skillUnlocked(p, 'gia-thien-thu'), false);
});
test('Hoàn tất thế giới độc lập, nhận kết chương khi đạt trần sau trận hoặc thắng trận sau đạt trần', () => {
  const p = completedOne();
  for (const stage of worldTwoStages) p.stageProgress[stage.id] = { ...win };
  p.realm = 51;
  assert.equal(worldProgress(p, 1).completed, true);
  assert.equal(worldProgress(p, 2).completed, false);
  const after = structuredClone(p);
  after.realm = 52;
  assert.ok(justCompletedWorld(p, after));
  assert.equal(worldProgress(after, 2).completed, true);
  const previous = structuredClone(after);
  delete previous.stageProgress['dai-chien-cot-toc'];
  assert.ok(justCompletedWorld(previous, after));
});
test('Lưu/tải giữ bộ kỹ năng đã nhận truyền thừa; chỉ bỏ môn còn thiếu cổng truyện', () => {
  const p = completedOne();
  p.realm = 52;
  for (const stage of worldTwoStages) p.stageProgress[stage.id] = { ...win };
  p.selectedSkills = [
    'diet-hon-kim-quang',
    'gia-thien-thu',
    'kim-long-hien-hoa',
    'nhap-ma',
    'phong-loi-vu-duc',
  ];
  const restored = validateProfile(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(restored.selectedSkills, p.selectedSkills);
  delete p.stageProgress['long-phuong-phu'];
  const locked = validateProfile(JSON.parse(JSON.stringify(p)));
  assert.ok(!locked.selectedSkills.includes('kim-long-hien-hoa'));
  assert.ok(locked.selectedSkills.includes('gia-thien-thu'));
});
