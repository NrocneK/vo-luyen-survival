import test from 'node:test';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import { cameraSettings, clampZoom } from '../src/data/camera.ts';
import { stage } from '../src/data/stages.ts';

test('Tăng tốc x4/x6/x8 đưa đồng hồ chiến đấu tiến đúng tỉ lệ, không bị clamp dt của engine', () => {
  for (const scale of [1, 2, 4, 6, 8]) {
    const run = new RunEngine(newProfile(), [], 712);
    for (let frame = 0; frame < 30; frame++) advanceSimulation(run, 1 / 60, scale, { x: 0, y: 0 });
    assert.ok(Math.abs(run.time - 0.5 * scale) < 1e-6, `Sai thời gian ở x${scale}: ${run.time}`);
  }
});

test('Tăng tốc dừng ngay khi hiện thẻ; tạm dừng và kết quả không làm thời gian trôi', () => {
  const run = new RunEngine(newProfile(), [], 712);
  run.xp = run.nextXp;
  advanceSimulation(run, 0.1, 8, { x: 1, y: 0 });
  assert.equal(run.mode, 'levelup');
  assert.ok(run.time <= 1 / 30 + 1e-8);
  const time = run.time,
    position = { ...run.position };
  advanceSimulation(run, 0.1, 8, { x: 1, y: 0 });
  assert.equal(run.time, time);
  assert.deepEqual(run.position, position);
  run.choose(run.choices[0].id);
  run.pause();
  advanceSimulation(run, 0.1, 6, { x: 1, y: 0 });
  assert.equal(run.time, time);
  run.abandon();
  advanceSimulation(run, 0.1, 8, { x: 1, y: 0 });
  assert.equal(run.time, time);
});

test('Camera mở tới 0,5× và dùng cùng cấu hình khởi đầu cho màn; giá trị lạ được chặn', () => {
  assert.equal(cameraSettings.minZoom, 0.5);
  assert.equal(stage.cameraZoom, cameraSettings.defaultZoom);
  assert.equal(clampZoom(-2), 0.5);
  assert.equal(clampZoom(0.75), 0.75);
  assert.equal(clampZoom(10), cameraSettings.maxZoom);
  assert.equal(clampZoom(NaN), cameraSettings.defaultZoom);
});
