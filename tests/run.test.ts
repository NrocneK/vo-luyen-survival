import test from 'node:test';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';

test('Tạm dừng/lên cấp khóa cả thời gian, quái, đạn; chọn thẻ hợp lệ rồi mới chạy', () => {
  const run = new RunEngine(newProfile(), [], 7);
  run.tick(0.1, { x: 1, y: 0 });
  run.pause();
  const paused = JSON.stringify(run.view());
  run.tick(10, { x: 1, y: 0 });
  assert.equal(JSON.stringify(run.view()), paused);
  run.resume();
  run.xp = 100;
  run.tick(0.1, { x: 0, y: 0 });
  assert.equal(run.mode, 'levelup');
  assert.equal(run.choices.length, 3);
  const time = run.time;
  run.tick(10, { x: 1, y: 0 });
  assert.equal(run.time, time);
  assert.equal(run.choose('invalid'), false);
  assert.equal(run.choose(run.choices[0].id), true);
  assert.ok(run.mode === 'levelup' || run.mode === 'playing');
});
test('Đan hồi phục và lướt có hồi chiêu, không dùng đan khi đầy máu', () => {
  const run = new RunEngine(newProfile(), [], 1);
  assert.equal(run.potion(), false);
  run.hp = 30;
  assert.equal(run.potion(), true);
  assert.equal(run.pills, 1);
  assert.equal(run.potion(), false);
  assert.equal(run.dash(), true);
  assert.equal(run.dash(), false);
});
test('Các nâng cấp trong màn không làm đổi profile; lượt mới trở về bậc 1', () => {
  const profile = newProfile(),
    before = structuredClone(profile),
    run = new RunEngine(profile, [], 3);
  run.xp = 12;
  run.tick(0.1, { x: 0, y: 0 });
  run.choose(run.choices[0].id);
  assert.deepEqual(profile, before);
  assert.deepEqual(new RunEngine(profile, [], 3).skills, { 'cuong-quyen': 1 });
});
test('Đứng yên bị quái hạ thật; rút lui/chết chỉ chốt phần thưởng một lần', () => {
  const run = new RunEngine(newProfile(), [], 14);
  for (let i = 0; i < 10000 && !run.result; i++) {
    if (run.mode === 'levelup') run.choose(run.choices[0].id);
    run.tick(0.1, { x: 0, y: 0 });
  }
  assert.equal(run.result?.won, false);
  assert.ok(run.kills > 0);
  assert.ok(run.result!.rewards.cultivation > 0);
  const result = structuredClone(run.result);
  run.abandon();
  assert.deepEqual(run.result, result);
});
