import test from 'node:test';
import assert from 'node:assert/strict';
import { playWorldOne } from '../qa/campaignPlaytest.ts';
import { stages } from '../src/data/stages.ts';
import { worldProgress } from '../src/data/campaign.ts';
import { WORLD_ONE_REALM_CAP } from '../src/data/realms.ts';

test('Từ nhân vật mới đi hết sáu màn bằng thưởng thật, chế tạo, đột phá và lưu lại giữa các lượt', () => {
  const { profile, reports } = playWorldOne();
  assert.equal(profile.realm, WORLD_ONE_REALM_CAP);
  assert.equal(worldProgress(profile).completed, true);
  for (const selected of stages) {
    assert.ok(profile.stageProgress[selected.id]?.wins);
    const win = reports.find((report) => report.stageId === selected.id && report.won);
    assert.ok(win, `Thiếu lượt thắng ${selected.id}`);
    assert.ok(win.time >= selected.duration);
    assert.ok(win.peakEnemies <= selected.maxEnemies + 3);
  }
  assert.ok(profile.equipment['chan-duong-kiem'] !== undefined);
  assert.ok(profile.pets['linh-ho']);
  assert.ok(profile.runs >= stages.length);
});
