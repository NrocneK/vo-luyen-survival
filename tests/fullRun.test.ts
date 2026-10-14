import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newProfile, applyResult, validateProfile } from '../src/domain/profile.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { buildMapObstacles } from '../src/game/math/mapGeometry.ts';
import { playFullRun } from '../qa/playtest.ts';

test('Mô phỏng toàn lượt 10 phút: hai tinh anh, bốn đòn boss, thức tỉnh, thắng, lưu thưởng và đặt lại', () => {
  const manifest = JSON.parse(readFileSync('src/data/assets.generated.json', 'utf8'));
  const profile = newProfile(1000),
    obstacles = buildMapObstacles(manifest.sceneLayout);
  assert.ok(
    obstacles.every((obstacle) => Math.hypot(obstacle.x, obstacle.y) > obstacle.radius + 0.21),
  );
  const { run, bossAttacks, elitesSeen } = playFullRun(profile, obstacles, 87);
  assert.equal(run.result?.won, true);
  assert.ok(run.time >= 600);
  assert.deepEqual(bossAttacks, [1, 2, 3, 4]);
  assert.equal(elitesSeen.length, 2);
  assert.equal(run.skills['cuong-quyen'], 6);
  assert.equal(run.skills['cuong-the'], 5);
  assert.equal(run.result!.rewards.resources['hat-sen-dot-pha'], 1);
  assert.equal(run.result!.rewards.blueprints.length, 2);
  applyResult(profile, run.result!);
  const restored = validateProfile(JSON.parse(JSON.stringify(profile)));
  assert.equal(restored.wins, 1);
  assert.ok(restored.cultivation > 500);
  assert.equal(restored.resources['trung-linh-ho'], 1);
  assert.deepEqual(new RunEngine(restored, obstacles, 87).skills, { 'cuong-quyen': 1 });
});
