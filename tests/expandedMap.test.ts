import test from 'node:test';
import assert from 'node:assert/strict';
import { newProfile } from '../src/domain/profile.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { mapObstacles } from '../src/data/mapCollisions.ts';
import { stage, forestProjection, forestLayout } from '../src/data/stages.ts';
import { moveWithCollisions, project } from '../src/game/math/worldPhysics.ts';

test('Đi xa khỏi ranh giới map cũ theo tám hướng, không vướng vật cản ở trung tâm', () => {
  for (let direction = 0; direction < 8; direction++) {
    const angle = (direction * Math.PI) / 4;
    const end = moveWithCollisions(
      { x: 0, y: 0 },
      { x: Math.cos(angle) * 2.4, y: Math.sin(angle) * 2.4 },
      9,
      mapObstacles(),
      stage.bounds,
      stage.playerRadius,
    );
    assert.ok(Math.hypot(end.x, end.y) > 21.5);
  }
});

test('Quái sinh quanh nhân vật tại các vùng xa và sát mép, không bị kẹt ở đấu trường cũ', () => {
  for (const x of [-31.5, 26, 31.5])
    for (const y of [-31.5, -26, 31.5]) {
      const run = new RunEngine(newProfile(), mapObstacles(), 2026);
      run.position = { x, y };
      for (let frame = 0; frame < 10 && run.enemies.length === 0; frame++)
        run.tick(0.1, { x: 0, y: 0 });
      assert.ok(run.enemies.length > 0);
      for (const enemy of run.enemies) {
        const distance = Math.hypot(enemy.x - x, enemy.y - y);
        assert.ok(distance > 4.5 && distance <= 9.01, `Spawn ở xa hoặc quá gần: ${distance}`);
        assert.ok(
          enemy.x >= stage.bounds.minX + enemy.radius &&
            enemy.x <= stage.bounds.maxX - enemy.radius,
        );
        assert.ok(
          enemy.y >= stage.bounds.minY + enemy.radius &&
            enemy.y <= stage.bounds.maxY - enemy.radius,
        );
      }
    }
});

test('Bốn góc và điểm mốc của map mới nằm trong vùng camera với phép chiếu chung', () => {
  const points = stage.landmarks.map((area) => area.position);
  for (const x of [stage.bounds.minX, stage.bounds.maxX])
    for (const y of [stage.bounds.minY, stage.bounds.maxY]) points.push({ x, y });
  for (const point of points) {
    const screen = project(point, forestProjection);
    assert.ok(screen.x > 0 && screen.x < forestLayout.dimensions[0]);
    assert.ok(screen.y > 0 && screen.y < forestLayout.dimensions[1]);
  }
});
