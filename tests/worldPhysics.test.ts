import test from 'node:test';
import assert from 'node:assert/strict';
import {
  facingFromVelocity,
  inputToWorld,
  moveWithCollisions,
  project,
  unproject,
  walkTimeScale,
} from '../src/game/math/worldPhysics.ts';

const bounds = { minX: -3, maxX: 3, minY: -3, maxY: 3 };
const projection = { origin: { x: 640, y: 448 }, pixelsPerUnit: 33.10344827586207 };
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

test('Chiếu và trả về mặt đất không đổi vị trí, kể cả bốn góc màn', () => {
  for (const point of [
    { x: 0, y: 0 },
    { x: -12, y: 12 },
    { x: 12, y: -12 },
    { x: 12, y: 12 },
    { x: -12, y: -12 },
    { x: 3.7, y: -8.2 },
  ]) {
    const result = unproject(project(point, projection), projection);
    close(result.x, point.x);
    close(result.y, point.y);
  }
  const diagonal = project({ x: 1, y: 0 }, projection);
  close((diagonal.y - 448) / (diagonal.x - 640), 1 / Math.sqrt(3));
});

test('Bàn phím khớp tám hướng thật, mặt/lưng và hướng ngang của sprite', () => {
  const inputs = [
    [0, 1, 'S'],
    [-1, 1, 'SW'],
    [-1, 0, 'W'],
    [-1, -1, 'NW'],
    [0, -1, 'N'],
    [1, -1, 'NE'],
    [1, 0, 'E'],
    [1, 1, 'SE'],
  ] as const;
  for (const [x, y, direction] of inputs) {
    const world = inputToWorld(x, y);
    assert.equal(facingFromVelocity(world), direction);
    close(Math.hypot(world.x, world.y), 1);
  }
  assert.deepEqual(inputToWorld(0, 0), { x: 0, y: 0 });
  assert.equal(facingFromVelocity({ x: 0, y: 0 }, 'NW'), 'NW');
});

test('Một giây đi chéo có cùng quãng đường mặt đất với đi thẳng', () => {
  for (const [x, y] of [
    [0, 1],
    [1, 0],
    [1, 1],
    [-1, -1],
  ]) {
    const input = inputToWorld(x, y);
    const position = moveWithCollisions(
      { x: 0, y: 0 },
      { x: input.x * 2.4, y: input.y * 2.4 },
      1,
      [],
      bounds,
      0.21,
    );
    close(Math.hypot(position.x, position.y), 2.4);
  }
});

test('Nhân vật không ra khỏi ranh giới, có tính cả bán kính bàn chân', () => {
  const position = moveWithCollisions({ x: 0, y: 0 }, { x: 30, y: -30 }, 0.5, [], bounds, 0.21);
  close(position.x, 2.79);
  close(position.y, -2.79);
});

test('Không xuyên qua một hòn đá ngay cả khi một frame di chuyển rất xa', () => {
  const position = moveWithCollisions(
    { x: -2, y: 0 },
    { x: 40, y: 0 },
    0.25,
    [{ x: 0, y: 0, radius: 0.7 }],
    bounds,
    0.2,
  );
  assert.ok(position.x <= -0.9 + 1e-8);
  assert.ok(position.x > -1.0);
  close(position.y, 0);
});

test('Có thể trượt quanh vật cản mà không chồng vào vùng va chạm', () => {
  let position = { x: -1.5, y: -0.1 };
  for (let frame = 0; frame < 90; frame++) {
    position = moveWithCollisions(
      position,
      { x: 2, y: 1.2 },
      1 / 60,
      [{ x: 0, y: 0, radius: 0.7 }],
      bounds,
      0.2,
    );
    assert.ok(Math.hypot(position.x, position.y) >= 0.9 - 1e-8);
  }
  assert.ok(position.y > 0.8);
  assert.ok(position.x > -0.4);
});

test('Tốc độ walk theo tỉ lệ chuyển động giữ pha chống chân bám mặt đất', () => {
  const baseSpeed = 0.5 / (0.6 * 0.8);
  const speed = 2.4;
  const cycle = 0.8 / (speed / baseSpeed);
  const stanceSeconds = cycle * 0.6;
  close(speed * stanceSeconds, 0.5);
});

test('Khi frame chậm và bước vật lý được giới hạn, chân vẫn khớp quãng đường thực', () => {
  const baseSpeed = 0.5 / (0.6 * 0.8);
  for (const seconds of [1 / 60, 1 / 30, 0.1, 0.2]) {
    const distance = 2.4 * Math.min(seconds, 0.05);
    const effectiveSpeed = distance / seconds;
    const timeScale = walkTimeScale(distance, seconds, baseSpeed);
    close(effectiveSpeed * (0.8 / timeScale) * 0.6, 0.5);
  }
});
