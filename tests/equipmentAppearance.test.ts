import test from 'node:test';
import assert from 'node:assert/strict';
import { equipmentLook, equippedLooks, attackPosePhase } from '../src/data/equipmentAppearance.ts';
import { equipment } from '../src/data/equipment.ts';
import { newProfile } from '../src/domain/profile.ts';

test('mọi trang bị có ánh xạ ngoại quan đúng ID/ô, kể cả võ phục mặc trên cơ thể nền', () => {
  for (const item of Object.values(equipment)) {
    const look = equipmentLook(item.id, item.slot);
    assert.equal(look?.slot, item.slot, item.id);
    assert.equal(look?.id, item.id);
  }
  assert.equal(equipmentLook('khong-ton-tai', 'head'), null);
  assert.equal(equipmentLook('thanh-minh-quan', 'feet'), null);
});
test('phối đủ bảy món độc lập, bí bảo chỉ hiện khi đã mở ô', () => {
  const p = newProfile();
  p.equipped = {
    weapon: 'huyen-duong-thanh-kiem',
    head: 'thanh-minh-quan',
    body: 'thanh-nguyen-chien-y',
    hands: 'ho-mach-uyen',
    feet: 'ngu-phong-ngoa',
    jewel: 'ngoc-gioi',
    relic: 'ma-than-ho-an',
  };
  const before = JSON.stringify(p);
  assert.equal(equippedLooks(p).length, 6);
  assert.equal(JSON.stringify(p), before);
  p.relicUnlocked = true;
  const looks = equippedLooks(p);
  assert.equal(looks.length, 7);
  assert.equal(looks.find((l) => l.slot === 'head')?.tier, 1);
  assert.equal(looks.find((l) => l.slot === 'body')?.tier, 2);
  assert.equal(looks.find((l) => l.slot === 'body')?.clothTint, 0xf2e4bd);
  assert.equal(looks.find((l) => l.slot === 'jewel')?.tier, 0);
});
test('mốc sát thương nửa nhịp luôn trùng tư thế tiếp xúc của rig', () => {
  for (const contact of [0.23, 0.57, 0.79]) {
    assert.equal(attackPosePhase(0.5, contact), contact);
    assert.equal(attackPosePhase(0, contact), 0);
    let prior = -1;
    for (let i = 0; i <= 100; i++) {
      const p = attackPosePhase(i / 100, contact);
      assert.ok(p >= prior && p < 1);
      prior = p;
    }
    assert.ok(Math.abs(attackPosePhase(0.5 - 1e-8, contact) - contact) < 1e-7);
  }
});
