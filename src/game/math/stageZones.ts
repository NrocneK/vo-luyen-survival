import type { Point } from '../../shared/types';
import type { StageZone } from '../../shared/stageMechanics';

/** Renderer và sát thương dùng cùng các đầu mút; khe lửa có chừa đủ bán kính chân người. */
export function fireSegments(zone: StageZone): [Point, Point][] {
  const intervals = [
    [-zone.halfLength, zone.gapOffset - zone.gapHalfWidth],
    [zone.gapOffset + zone.gapHalfWidth, zone.halfLength],
  ];
  return intervals
    .filter(([from, to]) => to > from)
    .map(([from, to]) => [
      { x: zone.x + zone.direction.x * from, y: zone.y + zone.direction.y * from },
      { x: zone.x + zone.direction.x * to, y: zone.y + zone.direction.y * to },
    ]);
}

export function segmentDistance(point: Point, from: Point, to: Point): number {
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const t = Math.max(
    0,
    Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(point.x - from.x - t * dx, point.y - from.y - t * dy);
}

export function insideStageZone(zone: StageZone, point: Point, radius = 0): boolean {
  if (zone.kind !== 'fire')
    return Math.hypot(point.x - zone.x, point.y - zone.y) < zone.radius + radius;
  // Dải lửa có đầu phẳng như hình vẽ. Không dùng capsule vì nắp tròn sẽ lấn vào khe xanh.
  const dx = point.x - zone.x,
    dy = point.y - zone.y;
  const along = dx * zone.direction.x + dy * zone.direction.y;
  const across = -dx * zone.direction.y + dy * zone.direction.x;
  return [
    [-zone.halfLength, zone.gapOffset - zone.gapHalfWidth],
    [zone.gapOffset + zone.gapHalfWidth, zone.halfLength],
  ].some(([from, to]) => {
    const x = Math.max(from - along, along - to, 0),
      y = Math.max(Math.abs(across) - zone.radius, 0);
    return to > from && Math.hypot(x, y) < radius + 1e-8;
  });
}
