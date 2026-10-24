import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { worldTwoIconFile, worldTwoIconIds } from '../src/data/worldTwoIcons.ts';
import { worldTwoEquipment } from '../src/data/worldTwoEquipment.ts';
import { worldTwoSkillDefs, worldTwoAugments } from '../src/data/worldTwoSkills.ts';
import { awakenings } from '../src/data/awakenings.ts';

test('Mười sáu trang bị và mười bốn biểu tượng môn/nhánh/thức tỉnh có ảnh riêng, không ánh xạ ảnh Trung Đô', () => {
  assert.equal(worldTwoIconIds.equipment.length, 16);
  assert.equal(worldTwoIconIds.skills.length, 14);
  for (const item of Object.values(worldTwoEquipment)) {
    assert.equal(item.icon, item.id);
    assert.ok(worldTwoIconFile(item.icon!, 'equipment'));
  }
  for (const def of [...Object.values(worldTwoSkillDefs), ...Object.values(worldTwoAugments)]) {
    assert.equal(def.icon, def.id);
    assert.ok(worldTwoIconFile(def.icon, 'skills'));
  }
  for (const id of ['diet-hon-kim-quang', 'gia-thien-thu', 'kim-long-hien-hoa'] as const) {
    const def = awakenings[id];
    assert.ok(worldTwoIconFile(def.icon, 'skills'));
    assert.notEqual(def.icon, worldTwoSkillDefs[id].icon);
  }
  assert.equal(worldTwoIconFile('dong-quyen-sao', 'equipment'), undefined);
  assert.equal(worldTwoIconFile('cuong-quyen', 'skills'), undefined);
});
test('Bộ icon phát hành đủ 30 PNG có alpha, kích thước 256, hash riêng và có mặt trong bản đồng bộ', () => {
  const manifest = JSON.parse(readFileSync('public/assets/v7/icon-manifest.json', 'utf8'));
  assert.equal(manifest.status, 'validated');
  assert.equal(manifest.assets.length, 30);
  const hashes = new Set<string>();
  for (const entry of manifest.assets) {
    const source = readFileSync('public/' + entry.file),
      runtime = readFileSync('public/game/' + entry.file);
    assert.equal(source.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(source.readUInt32BE(16), 256);
    assert.equal(source.readUInt32BE(20), 256);
    assert.equal(source[25], 6);
    assert.equal(createHash('sha256').update(source).digest('hex'), entry.sha256);
    assert.deepEqual(runtime, source);
    assert.ok(!hashes.has(entry.sha256));
    hashes.add(entry.sha256);
    assert.equal(worldTwoIconFile(entry.id, entry.category), entry.file);
  }
});
