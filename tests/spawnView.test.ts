import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnBeyondView, outsideSpawnView, type SpawnView } from '../src/game/math/spawnView.ts';
import { project, unproject } from '../src/game/math/worldPhysics.ts';
import { RunEngine, seededRandom } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage, forestProjection } from '../src/data/stages.ts';

function cameraView(x: number, y: number, zoom: number): SpawnView {
  const center = project({ x, y }, forestProjection);
  const width = 1000 / zoom,
    height = 600 / zoom;
  return {
    padding: 1.5,
    corners: [
      { x: center.x - width / 2, y: center.y - height / 2 },
      { x: center.x + width / 2, y: center.y - height / 2 },
      { x: center.x + width / 2, y: center.y + height / 2 },
      { x: center.x - width / 2, y: center.y + height / 2 },
    ].map((point) => unproject(point, forestProjection)),
  };
}

test('Camera 0,5×–3× sinh quái ngoài tầm nhìn thật, ở giữa sân và sát bốn góc', () => {
  for (const zoom of [0.5, 0.75, 1, 1.5, 3])
    for (const player of [
      { x: 0, y: 0 },
      { x: -31.5, y: -31.5 },
      { x: -31.5, y: 31.5 },
      { x: 31.5, y: -31.5 },
      { x: 31.5, y: 31.5 },
    ]) {
      const view = cameraView(player.x, player.y, zoom);
      const random = seededRandom(401);
      for (let index = 0; index < 50; index++) {
        const point = spawnBeyondView(view, stage.bounds, player, 0.65, [], random)!;
        assert.ok(point);
        assert.equal(point.telegraphed, false, `Mép camera còn chỗ tại zoom ${zoom}`);
        assert.equal(outsideSpawnView(point, view, 0.65), true);
        assert.ok(point.x >= stage.bounds.minX + 0.65 && point.x <= stage.bounds.maxX - 0.65);
        assert.ok(point.y >= stage.bounds.minY + 0.65 && point.y <= stage.bounds.maxY - 0.65);
        assert.ok(Math.hypot(point.x - player.x, point.y - player.y) > 4.5);
      }
    }
});

test('Camera bao trọn bản đồ chỉ sinh tại biên có báo trước, không bật quái giữa sân', () => {
  const view = {
    corners: [
      { x: -100, y: -100 },
      { x: 100, y: -100 },
      { x: 100, y: 100 },
      { x: -100, y: 100 },
    ],
  };
  const run = new RunEngine(newProfile(), [], 200);
  run.setSpawnView(view);
  for (let frame = 0; frame < 7; frame++) run.tick(0.1, { x: 0, y: 0 });
  assert.ok(run.enemies.length);
  for (const enemy of run.enemies) {
    assert.ok(enemy.spawnGrace! > 0);
    assert.equal(enemy.spawnTime, 0.85);
    assert.ok(
      Math.abs(enemy.x) >= 32 - enemy.radius - 1e-7 ||
        Math.abs(enemy.y) >= 32 - enemy.radius - 1e-7,
    );
    assert.equal(enemy.attack, 0);
  }
  assert.ok(run.visuals.some((event) => event.kind === 'warning'));
});

test('Quái thường, tinh anh và boss cùng nhận vùng camera mới sau khi đổi zoom', () => {
  const definition = {
    ...stage,
    duration: 1.5,
    elites: [{ at: 1, id: 'hac-lang-tinh-anh' }],
    eliteTimes: [1],
  };
  const run = new RunEngine(newProfile(), [], 200, definition);
  run.setSpawnView(cameraView(0, 0, 3));
  for (let frame = 0; frame < 7; frame++) run.tick(0.1, { x: 0, y: 0 });
  assert.ok(run.enemies.length);
  const expanded = cameraView(0, 0, 0.5);
  run.setSpawnView(expanded);
  for (let frame = 0; frame < 10; frame++) run.tick(0.1, { x: 0, y: 0 });
  const arrivals = run.enemies.filter(
    (enemy) => enemy.type === 'hac-lang-tinh-anh' || enemy.type === stage.bossId,
  );
  assert.equal(arrivals.length, 2);
  // Đã đi vào tối đa 0,8 giây sau khi sinh, vẫn chưa lọt vào mép hình nhờ khoảng đệm.
  for (const enemy of arrivals)
    assert.equal(outsideSpawnView(enemy, { ...expanded, padding: 0.4 }, 0), true);
});

test('Chọn điểm sinh tránh vật cản, đảo thứ tự bốn góc vẫn nhận đúng vùng ngoài', () => {
  const view = cameraView(0, 0, 1);
  const reverse = { ...view, corners: [...view.corners].reverse() };
  const obstacles = [{ x: 0, y: 15, radius: 7 }];
  const random = seededRandom(408);
  for (let index = 0; index < 100; index++) {
    const point = spawnBeyondView(reverse, stage.bounds, { x: 0, y: 0 }, 0.4, obstacles, random)!;
    assert.ok(Math.hypot(point.x, point.y - 15) > 7.4);
    assert.equal(outsideSpawnView(point, view, 0.4), true);
  }
});

test('Camera chưa có kích thước hợp lệ không làm mất lượt sinh quái', () => {
  const run = new RunEngine(newProfile(), [], 200);
  run.setSpawnView({ corners: Array.from({ length: 4 }, () => ({ x: 0, y: 0 })) });
  for (let frame = 0; frame < 7; frame++) run.tick(0.1, { x: 0, y: 0 });
  assert.ok(run.enemies.length > 0);
  assert.ok(run.enemies.every((enemy) => Math.hypot(enemy.x, enemy.y) < 10));
});
