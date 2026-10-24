import type { Point } from '../../shared/types';
import {
  v3,
  add3,
  handDistance,
  handToWorld,
  handBones,
  norm3,
  mesh3,
  smooth01,
  clamp01,
  type Vec3,
  type VfxMesh,
} from './vfxGeometry.ts';

type SurfaceVertex = { p: Vec3; normal: Vec3 };
/** Một lưới mặt trơn duy nhất, cắt theo trường khoảng cách; không ghép cầu/ống thành ngón. */
function createSurface(): SurfaceVertex[][] {
  const faces: SurfaceVertex[][] = [],
    step = 0.045;
  const height = (x: number, y: number) => 0.025 + 0.15 * smooth01(-handDistance(x, y) / 0.19);
  const vertex = (x: number, y: number): SurfaceVertex => ({
    p: v3(x, y, height(x, y)),
    normal: norm3(
      v3(
        -(height(x + 0.002, y) - height(x - 0.002, y)) / 0.004,
        -(height(x, y + 0.002) - height(x, y - 0.002)) / 0.004,
        1,
      ),
    ),
  });
  const clip = (triangle: Vec3[]) => {
    const result: Vec3[] = [];
    for (let i = 0; i < triangle.length; i++) {
      const a = triangle[i],
        b = triangle[(i + 1) % triangle.length],
        da = handDistance(a.x, a.y),
        db = handDistance(b.x, b.y);
      if (da <= 0) result.push(a);
      if (da < 0 !== db < 0) {
        const t = da / (da - db);
        result.push(v3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 0));
      }
    }
    for (let i = 1; i < result.length - 1; i++)
      faces.push([result[0], result[i], result[i + 1]].map((p) => vertex(p.x, p.y)));
  };
  for (let x = -1.0; x < 0.8; x += step)
    for (let y = -1.15; y < 1.15; y += step) {
      const a = v3(x, y, 0),
        b = v3(x + step, y, 0),
        c = v3(x + step, y + step, 0),
        d = v3(x, y + step, 0);
      clip([a, b, c]);
      clip([a, c, d]);
    }
  return faces;
}
const surface = createSurface();
export function handHeight(phase: number): number {
  const drop = smooth01((phase - 0.58) / 0.42);
  return 4.6 * (1 - drop * drop);
}
export function buildHand(
  center: Point,
  radius: number,
  phase: number,
  time: number,
  warning: boolean,
  alpha: number,
): VfxMesh {
  const m = mesh3(),
    height = warning ? handHeight(phase) : 0.04,
    growth = warning ? 0.82 + 0.18 * smooth01(phase / 0.5) : 1,
    curl = warning ? 0.1 * (1 - smooth01(phase / 0.75)) : 0,
    layer = warning ? 10000 : undefined;
  const at = (p: Vec3) => {
    const finger = clamp01((-p.y - 0.02) / 0.95);
    const q = handToWorld(
      v3(p.x * growth, p.y * growth, p.z + curl * finger * finger),
      center,
      radius,
    );
    q.z += height;
    return q;
  };
  const normal = (n: Vec3) => v3((n.x + n.y) / Math.SQRT2, (n.x - n.y) / Math.SQRT2, n.z);
  for (const triangle of surface) {
    const [a, b, c] = triangle.map((v) => at(v.p)),
      ns = triangle.map((v) => normal(v.normal)),
      n = norm3(add3(add3(ns[0], ns[1]), ns[2]));
    m.faces.push({ a, b, c, normal: n, color: 0xffd895, alpha, layer });
  }
  // Luồng lực đi liên tục từ cổ tay qua lòng tới đầu ngón; chỉ sáng từng nhịp, không viền từng khớp.
  for (let k = 0; k < 5; k++) {
    const bone = handBones[k];
    const path = Array.from({ length: 23 }, (_, i) => {
      const t = i / 22,
        x = bone.b.x * t + Math.sin(t * Math.PI) * Math.sin(time * 3 - t * 5 + k) * 0.055,
        y = 0.83 + (bone.b.y - 0.83) * t;
      return at(v3(x, y, 0.14 + 0.018 * Math.sin(time * 5 - t * 8 + k)));
    });
    m.strokes.push({
      points: path,
      width: radius * 0.035,
      color: k % 2 ? 0xffe8b3 : 0xa9efff,
      alpha: alpha * 0.14,
      soft: true,
      taper: true,
      layer,
    });
  }
  return m;
}
