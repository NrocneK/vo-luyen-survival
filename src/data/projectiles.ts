import type { Point, WorldBounds } from '../shared/types';

/** Số mục tiêu bổ sung sau mục tiêu đầu; bậc thức tỉnh xuyên suốt đường bay. */
export function pierceForRank(rank: number): number {
  const normalized = Math.max(1, Math.min(6, Math.floor(Number.isFinite(rank) ? rank : 1)));
  return normalized === 6 ? Infinity : normalized - 1;
}

export const projectileRules = {
  enemyLifetime: 3,
  boundsMargin: 2,
  fireSplashDamage: 0.65,
  fireSplashRadius: (rank: number) => 1.2 + rank * 0.12,
} as const;

/** Thời điểm đầu đoạn bay chạm hình tròn; quét cả đoạn tránh bỏ qua quái khi tăng tốc. */
export function sweptCircleHit(
  from: Point,
  to: Point,
  target: Point,
  radius: number,
): number | null {
  const dx = to.x - from.x,
    dy = to.y - from.y,
    ox = from.x - target.x,
    oy = from.y - target.y;
  const c = ox * ox + oy * oy - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a < 1e-12) return null;
  const b = ox * dx + oy * dy;
  const discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / a;
  return t >= 0 && t <= 1 ? t : null;
}

export function projectileOutsideBounds(point: Point, bounds: WorldBounds): boolean {
  const margin = projectileRules.boundsMargin;
  return (
    point.x < bounds.minX - margin ||
    point.x > bounds.maxX + margin ||
    point.y < bounds.minY - margin ||
    point.y > bounds.maxY + margin
  );
}

/** Khoảng cách còn lại theo hướng bay đến biên thật; kiếm hồi không biến mất ở mép sân. */
export function distanceToBoundary(point: Point, velocity: Point, bounds: WorldBounds): number {
  const length = Math.hypot(velocity.x, velocity.y);
  if (length < 1e-10) return Infinity;
  const x = velocity.x / length,
    y = velocity.y / length;
  return Math.max(
    0,
    Math.min(
      x > 1e-10 ? (bounds.maxX - point.x) / x : x < -1e-10 ? (bounds.minX - point.x) / x : Infinity,
      y > 1e-10 ? (bounds.maxY - point.y) / y : y < -1e-10 ? (bounds.minY - point.y) / y : Infinity,
    ),
  );
}
