import { cameraNormal, dot3, type Face3 } from './vfxGeometry.ts';

/** Vỏ linh lực tự phát sáng: xuyên nền ở giữa, sáng hơn ở rìa; không có bóng kim loại. */
export function spiritSurface(face: Face3, time: number): { color: number; alpha: number } {
  const facing = Math.max(0, Math.min(1, dot3(face.normal, cameraNormal)));
  const rim = Math.pow(1 - facing, 1.6);
  const x = (face.a.x + face.b.x + face.c.x) / 3,
    y = (face.a.y + face.b.y + face.c.y) / 3,
    z = (face.a.z + face.b.z + face.c.z) / 3;
  const flow =
    0.66 +
    0.2 * Math.sin(x * 3.1 + y * 2.3 + z * 4.2 - time * 7) +
    0.14 * Math.sin(x * 5 - y * 3 + z * 2 - time * 4);
  const lift = 0.3 + rim * 0.22;
  const r = (face.color >> 16) & 255,
    g = (face.color >> 8) & 255,
    b = face.color & 255;
  return {
    color: ((r + (255 - r) * lift) << 16) | ((g + (250 - g) * lift) << 8) | (b + (235 - b) * lift),
    alpha: Math.min(0.48, face.alpha * (0.16 + rim * 0.38) * Math.max(0.32, flow)),
  };
}
