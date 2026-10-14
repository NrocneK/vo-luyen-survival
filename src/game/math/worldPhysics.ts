import type { CircleObstacle, Direction, Point, WorldBounds } from '../../shared/types';

export interface Projection {
  origin: Point;
  pixelsPerUnit: number;
}
const SQRT_TWO = Math.sqrt(2);
const SQRT_SIX = Math.sqrt(6);
export function project(point: Point, projection: Projection): Point {
  return {
    x: projection.origin.x + ((point.x + point.y) * projection.pixelsPerUnit) / SQRT_TWO,
    y: projection.origin.y + ((point.x - point.y) * projection.pixelsPerUnit) / SQRT_SIX,
  };
}
export function unproject(point: Point, projection: Projection): Point {
  const sum = ((point.x - projection.origin.x) * SQRT_TWO) / projection.pixelsPerUnit;
  const difference = ((point.y - projection.origin.y) * SQRT_SIX) / projection.pixelsPerUnit;
  return { x: (sum + difference) / 2, y: (sum - difference) / 2 };
}

export function inputToWorld(horizontal: number, vertical: number): Point {
  // Bàn phím theo hướng màn hình. Chuẩn hóa trong mặt đất để đi chéo không nhanh hơn.
  const x = horizontal + vertical;
  const y = horizontal - vertical;
  const length = Math.hypot(x, y);
  return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
export function facingFromVelocity(velocity: Point, fallback: Direction = 'S'): Direction {
  if (Math.hypot(velocity.x, velocity.y) < 1e-6) return fallback;
  const angle = ((Math.atan2(velocity.x, -velocity.y) * 180) / Math.PI + 360) % 360;
  const directions: Direction[] = ['SW', 'S', 'SE', 'E', 'NE', 'N', 'NW', 'W'];
  return directions[Math.round(angle / 45) % 8];
}
export function walkTimeScale(distance: number, elapsedSeconds: number, baseSpeed: number): number {
  return elapsedSeconds > 0 ? distance / elapsedSeconds / baseSpeed : 1;
}
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function moveWithCollisions(
  start: Point,
  velocity: Point,
  seconds: number,
  obstacles: readonly CircleObstacle[],
  bounds: WorldBounds,
  radius: number,
): Point {
  const distance = Math.hypot(velocity.x, velocity.y) * Math.max(0, seconds);
  const steps = Math.max(1, Math.ceil(distance / (radius * 0.35)));
  const dx = (velocity.x * Math.max(0, seconds)) / steps;
  const dy = (velocity.y * Math.max(0, seconds)) / steps;
  const point = { ...start };
  const clear = (candidate: Point) =>
    obstacles.every(
      (obstacle) =>
        Math.hypot(candidate.x - obstacle.x, candidate.y - obstacle.y) >=
        radius + obstacle.radius - 1e-8,
    );
  for (let index = 0; index < steps; index++) {
    // Tách hai trục cho phép trượt dọc vật cản; chia bước để không xuyên qua đá khi fps thấp.
    const x = clamp(point.x + dx, bounds.minX + radius, bounds.maxX - radius);
    if (clear({ x, y: point.y })) point.x = x;
    const y = clamp(point.y + dy, bounds.minY + radius, bounds.maxY - radius);
    if (clear({ x: point.x, y })) point.y = y;
  }
  return point;
}
