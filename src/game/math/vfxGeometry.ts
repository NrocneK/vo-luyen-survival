import type { Point } from '../../shared/types';

export interface Vec3 extends Point {
  z: number;
}
export interface Face3 {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  normal: Vec3;
  color: number;
  alpha: number;
  layer?: number;
}
export interface Stroke3 {
  points: Vec3[];
  width: number;
  color: number;
  alpha: number;
  soft?: boolean;
  taper?: boolean;
  layer?: number;
}
export interface VfxMesh {
  faces: Face3[];
  strokes: Stroke3[];
}
export const v3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });
export const add3 = (a: Vec3, b: Vec3): Vec3 => v3(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub3 = (a: Vec3, b: Vec3): Vec3 => v3(a.x - b.x, a.y - b.y, a.z - b.z);
export const mul3 = (a: Vec3, t: number): Vec3 => v3(a.x * t, a.y * t, a.z * t);
export const dot3 = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross3 = (a: Vec3, b: Vec3) =>
  v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
export const norm3 = (a: Vec3) => mul3(a, 1 / (Math.hypot(a.x, a.y, a.z) || 1));
export const lerp3 = (a: Vec3, b: Vec3, t: number) => add3(a, mul3(sub3(b, a), t));
export const mesh3 = (): VfxMesh => ({ faces: [], strokes: [] });
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth01 = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const noise = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export const cameraNormal = norm3(v3(1, -1, 1));
/** Phép chiếu cùng góc camera isometric của thế giới; z là độ cao thực. */
export function projectVfx(p: Vec3, unit: number, origin: Point): Point {
  return {
    x: origin.x + ((p.x + p.y) * unit) / Math.SQRT2,
    y: origin.y + ((p.x - p.y) * unit) / Math.sqrt(6) - p.z * unit * Math.sqrt(2 / 3),
  };
}
function face(
  m: VfxMesh,
  a: Vec3,
  b: Vec3,
  c: Vec3,
  color: number,
  alpha: number,
  normal?: Vec3,
  layer?: number,
) {
  m.faces.push({
    a,
    b,
    c,
    normal: normal ?? norm3(cross3(sub3(b, a), sub3(c, a))),
    color,
    alpha,
    layer,
  });
}
/** Ống có tiết diện xoay trong không gian; bán kính và pháp tuyến theo từng đốt. */
export function tube(
  m: VfxMesh,
  path: Vec3[],
  radii: number[],
  color: number,
  alpha = 1,
  sides = 10,
  belly?: number,
  layer?: number,
) {
  if (path.length < 2) return;
  const rings = path.map((p, i) => {
    const tangent = norm3(sub3(path[Math.min(path.length - 1, i + 1)], path[Math.max(0, i - 1)]));
    let side = norm3(cross3(v3(0, 0, 1), tangent));
    if (Math.hypot(side.x, side.y, side.z) < 0.1) side = v3(1, 0, 0);
    const up = norm3(cross3(tangent, side));
    return Array.from({ length: sides }, (_, j) => {
      const a = (j * Math.PI * 2) / sides,
        n = add3(mul3(side, Math.cos(a)), mul3(up, Math.sin(a)));
      return { point: add3(p, mul3(n, radii[i] ?? radii[0])), normal: n };
    });
  });
  for (let i = 1; i < path.length; i++)
    for (let j = 0; j < sides; j++) {
      const a = rings[i - 1][j],
        b = rings[i][j],
        c = rings[i][(j + 1) % sides],
        d = rings[i - 1][(j + 1) % sides];
      const normal = norm3(add3(a.normal, c.normal)),
        shade = belly && normal.z < -0.22 ? belly : color;
      face(m, a.point, b.point, c.point, shade, alpha, normal, layer);
      face(m, a.point, c.point, d.point, shade, alpha, normal, layer);
    }
}
const sphereGrids = new Map<string, Vec3[][]>();
/** Khối lồi, xoay theo ba trục local; dùng cho sọ, mõm, hàm, khớp và lòng bàn tay. */
export function ellipsoid(
  m: VfxMesh,
  center: Vec3,
  radii: Vec3,
  color: number,
  alpha = 1,
  axes = [v3(1, 0, 0), v3(0, 1, 0), v3(0, 0, 1)],
  segments = 12,
  rings = 7,
  layer?: number,
) {
  const key = `${segments}:${rings}`;
  let sphere = sphereGrids.get(key);
  if (!sphere) {
    sphere = Array.from({ length: rings + 1 }, (_, i) =>
      Array.from({ length: segments + 1 }, (_, j) => {
        const u = (j * Math.PI * 2) / segments,
          v = (i * Math.PI) / rings;
        return v3(Math.cos(u) * Math.sin(v), Math.sin(u) * Math.sin(v), Math.cos(v));
      }),
    );
    sphereGrids.set(key, sphere);
  }
  const at = (local: Vec3) => {
    const normal = norm3(
      add3(
        add3(mul3(axes[0], local.x / radii.x), mul3(axes[1], local.y / radii.y)),
        mul3(axes[2], local.z / radii.z),
      ),
    );
    return {
      p: add3(
        center,
        add3(
          add3(mul3(axes[0], local.x * radii.x), mul3(axes[1], local.y * radii.y)),
          mul3(axes[2], local.z * radii.z),
        ),
      ),
      n: normal,
    };
  };
  const grid = sphere.map((row) => row.map(at));
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < segments; j++) {
      const a = grid[i][j],
        b = grid[i][j + 1],
        c = grid[i + 1][j + 1],
        d = grid[i + 1][j];
      face(m, a.p, c.p, b.p, color, alpha, norm3(add3(a.n, c.n)), layer);
      face(m, a.p, d.p, c.p, color, alpha, norm3(add3(a.n, c.n)), layer);
    }
}
export function ribbon(
  m: VfxMesh,
  path: Vec3[],
  width: number,
  color: number,
  alpha: number,
  axis = v3(0, 0, 1),
  layer?: number,
) {
  for (let i = 1; i < path.length; i++) {
    const t0 = (i - 1) / (path.length - 1),
      t1 = i / (path.length - 1),
      w0 = Math.sin(Math.PI * t0) * width,
      w1 = Math.sin(Math.PI * t1) * width;
    const a = add3(path[i - 1], mul3(axis, w0)),
      b = sub3(path[i - 1], mul3(axis, w0)),
      c = sub3(path[i], mul3(axis, w1)),
      d = add3(path[i], mul3(axis, w1));
    const normal = norm3(cross3(sub3(b, a), sub3(c, a)));
    face(m, a, b, c, color, alpha, normal, layer);
    face(m, a, c, d, color, alpha, normal, layer);
    // Dải khí nhìn được cả hai mặt khi cuộn qua trước/sau camera.
    face(m, c, b, a, color, alpha, mul3(normal, -1), layer);
    face(m, d, c, a, color, alpha, mul3(normal, -1), layer);
  }
}

export interface DragonMotion {
  position: Point;
  heading: number;
  trail: Point[];
  bodyLength: number;
}
/** Sóng cơ truyền từ cổ tới đuôi; đường sống lưng này dùng cả cho hình vẽ lẫn va chạm. */
export function dragonSpine(dragon: DragonMotion, age: number, time: number, count = 42): Vec3[] {
  const trail = dragon.trail;
  let total = 0;
  const lengths = [0];
  for (let i = 1; i < trail.length; i++) {
    total += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
    lengths.push(total);
  }
  const length = Math.min(dragon.bodyLength, total),
    birth = smooth01(age / 0.4);
  return Array.from({ length: count }, (_, i) => {
    const u = i / (count - 1),
      distance = u * length;
    let j = 1;
    while (j < trail.length - 1 && lengths[j] < distance) j++;
    const a = trail[Math.max(0, j - 1)] ?? dragon.position,
      b = trail[j] ?? a;
    const t =
      (distance - (lengths[j - 1] ?? 0)) /
      Math.max(1e-6, (lengths[j] ?? 0) - (lengths[j - 1] ?? 0));
    const p0 = trail[Math.max(0, j - 2)] ?? a,
      p3 = trail[Math.min(trail.length - 1, j + 1)] ?? b,
      s = clamp01(t);
    const spline = (key: 'x' | 'y', derivative = false) => {
      const k0 = p0[key],
        k1 = a[key],
        k2 = b[key],
        k3 = p3[key],
        c0 = 2 * k1,
        c1 = -k0 + k2,
        c2 = 2 * k0 - 5 * k1 + 4 * k2 - k3,
        c3 = -k0 + 3 * k1 - 3 * k2 + k3;
      return derivative
        ? 0.5 * (c1 + 2 * c2 * s + 3 * c3 * s * s)
        : 0.5 * (c0 + c1 * s + c2 * s * s + c3 * s * s * s);
    };
    const p = { x: spline('x'), y: spline('y') };
    const dx = -spline('x', true),
      dy = -spline('y', true),
      d = Math.hypot(dx, dy);
    const side =
      d > 1e-5
        ? { x: -dy / d, y: dx / d }
        : { x: -Math.sin(dragon.heading), y: Math.cos(dragon.heading) };
    const envelope = Math.sin(Math.PI * u) * birth;
    const wave =
      (Math.sin(u * 7.5 - time * 4.2) * (0.28 + 0.15 * u) +
        0.045 * Math.sin(u * 16 - time * 6) * u) *
      envelope;
    return v3(
      p.x + side.x * wave,
      p.y + side.y * wave,
      (1.04 +
        0.33 * Math.cos(u * 7 - time * 3.7) +
        0.25 * Math.sin(time * 2.3 - u * 4) +
        0.34 * Math.exp(-u * 8)) *
        birth,
    );
  });
}

export interface HandBone {
  a: Point;
  b: Point;
  radius: number;
}
/** Mặt bàn tay ở tư thế chạm đất: lòng hướng xuống -z, ngón hướng ra xa camera. */
export const handBones: readonly HandBone[] = [
  { a: { x: -0.31, y: 0.03 }, b: { x: -0.34, y: -0.74 }, radius: 0.115 },
  { a: { x: -0.06, y: -0.02 }, b: { x: -0.07, y: -0.96 }, radius: 0.12 },
  { a: { x: 0.2, y: 0.02 }, b: { x: 0.24, y: -0.79 }, radius: 0.112 },
  { a: { x: 0.41, y: 0.17 }, b: { x: 0.52, y: -0.49 }, radius: 0.1 },
  { a: { x: -0.39, y: 0.42 }, b: { x: -0.76, y: -0.03 }, radius: 0.14 },
  { a: { x: 0, y: 0.56 }, b: { x: 0, y: 0.82 }, radius: 0.22 },
];
export function inHand(u: number, v: number, margin = 0): boolean {
  return handDistance(u, v) <= margin;
}
/** Trường khoảng cách hợp trơn: lòng, cổ tay và ngón hòa thành một bề mặt duy nhất. */
export function handDistance(u: number, v: number): number {
  const dx = Math.max(0, Math.abs(u) - 0.27),
    dy = Math.max(0, Math.abs(v - 0.33) - 0.18);
  let distance = Math.hypot(dx, dy) - 0.22;
  for (const { a, b, radius } of handBones) {
    const x = b.x - a.x,
      y = b.y - a.y,
      t = clamp01(((u - a.x) * x + (v - a.y) * y) / (x * x + y * y));
    const d = Math.hypot(u - a.x - t * x, v - a.y - t * y) - radius,
      h = Math.max(0.065 - Math.abs(distance - d), 0) / 0.065;
    distance = Math.min(distance, d) - h * h * 0.065 * 0.25;
  }
  return distance;
}
/** Theo biên trường khoảng cách, rồi chiếu về mặt trơn để bỏ bậc thang ô lưới. */
export function handOutline(): readonly (readonly [number, number])[] {
  const step = 0.025,
    min = -1.15,
    n = 96,
    edges = new Map<string, string[]>();
  const on = (x: number, y: number) => inHand(min + (x + 0.5) * step, min + (y + 0.5) * step);
  const key = (x: number, y: number) => `${x},${y}`;
  const edge = (a: string, b: string) => {
    const row = edges.get(a) ?? [];
    row.push(b);
    edges.set(a, row);
  };
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (on(x, y)) {
        if (!on(x, y - 1)) edge(key(x, y), key(x + 1, y));
        if (!on(x + 1, y)) edge(key(x + 1, y), key(x + 1, y + 1));
        if (!on(x, y + 1)) edge(key(x + 1, y + 1), key(x, y + 1));
        if (!on(x - 1, y)) edge(key(x, y + 1), key(x, y));
      }
  const loops: string[][] = [];
  while (edges.size) {
    const start = edges.keys().next().value!;
    let p = start;
    const ring: string[] = [];
    do {
      ring.push(p);
      const row = edges.get(p)!;
      const next = row.pop()!;
      if (!row.length) edges.delete(p);
      p = next;
    } while (p !== start && edges.has(p));
    loops.push(ring);
  }
  const loop = loops.sort((a, b) => b.length - a.length)[0] ?? [];
  const points = loop.map((k) => k.split(',').map(Number) as [number, number]);
  return points
    .filter((p, i) => {
      const a = points[(i + points.length - 1) % points.length],
        b = points[(i + 1) % points.length];
      return (p[0] - a[0]) * (b[1] - p[1]) !== (p[1] - a[1]) * (b[0] - p[0]);
    })
    .map(([x, y]) => {
      let u = min + x * step,
        v = min + y * step;
      for (let i = 0; i < 4; i++) {
        const d = handDistance(u, v),
          gx = (handDistance(u + 0.001, v) - handDistance(u - 0.001, v)) / 0.002,
          gy = (handDistance(u, v + 0.001) - handDistance(u, v - 0.001)) / 0.002,
          scale = d / Math.max(0.01, gx * gx + gy * gy);
        u -= gx * scale;
        v -= gy * scale;
      }
      return [u, v] as const;
    });
}
export const palmRestOutline = handOutline();
export const handToWorld = (p: Vec3, center: Point, radius: number): Vec3 =>
  v3(
    center.x + ((p.x + p.y) * radius) / Math.SQRT2,
    center.y + ((p.x - p.y) * radius) / Math.SQRT2,
    p.z * radius,
  );
