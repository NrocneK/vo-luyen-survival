import type { CircleObstacle, Point, WorldBounds } from '../../shared/types';

export interface SpawnView {
  /** Bốn góc camera chuyển ngược về mặt đất, theo thứ tự quanh chu vi. */
  corners: Point[];
  /** Khoảng đệm theo đơn vị thế giới, cộng thêm bán kính từng actor. */
  padding?: number;
}

interface Edge {
  from: Point;
  to: Point;
  normal: Point;
  length: number;
}

function edgesFor(view: SpawnView): Edge[] {
  if (view.corners.length < 3) return [];
  let area = 0;
  for (let index = 0; index < view.corners.length; index++) {
    const a = view.corners[index],
      b = view.corners[(index + 1) % view.corners.length];
    if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return [];
    area += a.x * b.y - b.x * a.y;
  }
  if (Math.abs(area) < 1e-8) return [];
  return view.corners
    .map((from, index) => {
      const to = view.corners[(index + 1) % view.corners.length];
      const dx = to.x - from.x,
        dy = to.y - from.y;
      const length = Math.hypot(dx, dy);
      return {
        from,
        to,
        length,
        normal:
          area > 0 ? { x: dy / length, y: -dx / length } : { x: -dy / length, y: dx / length },
      };
    })
    .filter((edge) => edge.length > 1e-7);
}

export function validSpawnView(view: SpawnView): boolean {
  return edgesFor(view).length >= 3;
}

/** Có ít nhất một nửa mặt phẳng ngoài camera, xa mép đủ để cả actor chưa lộ ra. */
export function outsideSpawnView(point: Point, view: SpawnView, radius = 0): boolean {
  const margin = Math.max(0, view.padding ?? 1.1) + radius;
  return edgesFor(view).some(
    (edge) =>
      (point.x - edge.from.x) * edge.normal.x + (point.y - edge.from.y) * edge.normal.y >=
      margin - 1e-7,
  );
}

export interface SpawnPlacement extends Point {
  telegraphed: boolean;
}

/** Ưu tiên vành ngoài màn hình; chỉ dùng biên bản đồ có báo trước khi camera thấy toàn sân. */
export function spawnBeyondView(
  view: SpawnView,
  bounds: WorldBounds,
  player: Point,
  radius: number,
  obstacles: readonly CircleObstacle[],
  random: () => number,
): SpawnPlacement | null {
  const edges = edgesFor(view);
  if (!edges.length) return null;
  const clear = (point: Point) =>
    point.x >= bounds.minX + radius &&
    point.x <= bounds.maxX - radius &&
    point.y >= bounds.minY + radius &&
    point.y <= bounds.maxY - radius &&
    Math.hypot(point.x - player.x, point.y - player.y) > 4.5 &&
    obstacles.every(
      (obstacle) =>
        Math.hypot(point.x - obstacle.x, point.y - obstacle.y) > radius + obstacle.radius,
    );
  const totalLength = edges.reduce((sum, edge) => sum + edge.length, 0);
  const margin = Math.max(0, view.padding ?? 1.1) + radius;
  for (let attempt = 0; attempt < 100; attempt++) {
    let chosen = random() * totalLength;
    const edge =
      edges.find((candidate) => {
        chosen -= candidate.length;
        return chosen <= 0;
      }) ?? edges[0];
    const t = random();
    const offset = margin + 0.05 + random() * 1.5;
    const point = {
      x: edge.from.x + (edge.to.x - edge.from.x) * t + edge.normal.x * offset,
      y: edge.from.y + (edge.to.y - edge.from.y) * t + edge.normal.y * offset,
    };
    if (clear(point) && outsideSpawnView(point, view, radius))
      return { ...point, telegraphed: false };
  }
  // Camera gần góc có thể cắt mất phần lớn vành sinh. Quét biên theo pha ngẫu nhiên
  // trước khi kết luận không còn chỗ ngoài hình, tránh ép quái bật lên giữa sân.
  const candidates: Point[] = [];
  const phase = random();
  const left = bounds.minX + radius,
    right = bounds.maxX - radius;
  const top = bounds.minY + radius,
    bottom = bounds.maxY - radius;
  for (let index = 0; index < 128; index++) {
    const t = ((index / 128 + phase) % 1) * 4;
    const side = Math.floor(t),
      fraction = t - side;
    const point =
      side === 0
        ? { x: left + (right - left) * fraction, y: top }
        : side === 1
          ? { x: right, y: top + (bottom - top) * fraction }
          : side === 2
            ? { x: right - (right - left) * fraction, y: bottom }
            : { x: left, y: bottom - (bottom - top) * fraction };
    if (clear(point)) candidates.push(point);
  }
  const hidden = candidates.filter((point) => outsideSpawnView(point, view, radius));
  const pool = hidden.length ? hidden : candidates;
  if (!pool.length) return null;
  const point = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  return { ...point, telegraphed: !hidden.length };
}
