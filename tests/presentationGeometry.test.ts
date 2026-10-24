import test from 'node:test';
import assert from 'node:assert/strict';
import { lightningPath } from '../src/game/math/skillGeometry.ts';
import { cameraFootprint } from '../src/game/math/cameraFootprint.ts';
import { project } from '../src/game/math/worldPhysics.ts';
import { outsideSpawnView } from '../src/game/math/spawnView.ts';
import { forestProjection } from '../src/data/stages.ts';

test('Tia sét giữ điểm phát/điểm trúng sau khi đổi hướng, rung và vẽ nhiều nhánh', () => {
  for (const end of [
    { x: 240, y: 30 },
    { x: -80, y: 160 },
    { x: 30, y: -140 },
  ]) {
    const start = { x: 30, y: 30 };
    for (let phase = 0; phase < 15; phase++) {
      const path = lightningPath(start, end, 45, phase);
      assert.deepEqual(path[0], start);
      assert.deepEqual(path.at(-1), end);
      assert.ok(path.length > 2);
      assert.ok(path.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));
    }
  }
  assert.deepEqual(lightningPath({ x: 1, y: 1 }, { x: 1, y: 1 }, 0, 0), [
    { x: 1, y: 1 },
    { x: 1, y: 1 },
  ]);
});

test('Vùng sinh cập nhật ngay theo zoom/resize, bao hết vùng nhìn cùng phần đầu actor', () => {
  for (const zoom of [0.5, 0.75, 1, 1.5, 3]) {
    for (const [width, height] of [
      [1366, 768],
      [900, 900],
      [390, 844],
    ]) {
      const camera = { scrollX: 900, scrollY: 500, width, height, zoom };
      const corners = cameraFootprint(camera, forestProjection);
      const view = { corners, padding: 0.85 };
      const center = { x: camera.scrollX + width / 2, y: camera.scrollY + height / 2 };
      const projected = corners.map((point) => project(point, forestProjection));
      const spanX = projected[1].x - projected[0].x;
      const spanY = projected[2].y - projected[1].y;
      assert.ok(Math.abs(spanX - width / zoom - 128) < 1e-6);
      assert.ok(Math.abs(spanY - height / zoom - 128) < 1e-6);
      assert.ok(Math.abs((projected[0].x + projected[2].x) / 2 - center.x) < 1e-6);
      assert.equal(
        outsideSpawnView(
          { x: 0, y: 0 },
          {
            corners: cameraFootprint(
              {
                ...camera,
                scrollX: forestProjection.origin.x - width / 2,
                scrollY: forestProjection.origin.y - height / 2,
              },
              forestProjection,
            ),
          },
        ),
        false,
      );
      assert.ok(!outsideSpawnView(corners[0], view));
    }
  }
});
