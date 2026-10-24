import {
  add3,
  sub3,
  mul3,
  norm3,
  cross3,
  v3,
  tube,
  ellipsoid,
  ribbon,
  mesh3,
  type Vec3,
  type VfxMesh,
} from './vfxGeometry.ts';

function basis(points: Vec3[], i: number) {
  const forward = norm3(
    sub3(points[Math.max(0, i - 1)], points[Math.min(points.length - 1, i + 1)]),
  );
  const side = norm3(cross3(v3(0, 0, 1), forward)),
    up = norm3(cross3(forward, side));
  return {
    forward,
    side,
    up,
    at: (x: number, y: number, z: number) =>
      add3(points[i], add3(add3(mul3(forward, x), mul3(side, y)), mul3(up, z))),
  };
}
/** Sọ, mõm và hàm là các khối riêng; râu/bờm nhận pha trễ, không quay cùng một ảnh. */
function dragonHead(m: VfxMesh, spine: Vec3[], time: number, alpha: number, scale: number) {
  const b = basis(spine, 0),
    at = (x: number, y: number, z: number) => b.at(x * scale, y * scale, z * scale),
    axes = [b.forward, b.side, b.up];
  const e = (x: number, y: number, z: number, rx: number, ry: number, rz: number, c: number) =>
    ellipsoid(m, at(x, y, z), v3(rx * scale, ry * scale, rz * scale), c, alpha, axes, 12, 6);
  e(0.12, 0, 0.06, 0.43, 0.28, 0.28, 0xc58d35);
  e(0.47, 0, -0.025, 0.37, 0.2, 0.13, 0xdfb85f);
  e(0.71, 0, 0.045, 0.13, 0.22, 0.12, 0xd3a54d);
  const jaw = 0.1 + 0.07 * (1 + Math.sin(time * 6));
  e(0.42, 0, -jaw, 0.4, 0.17, 0.075, 0xc8943c);
  e(0.58, 0, -jaw + 0.045, 0.2, 0.13, 0.025, 0x421819);
  for (const sign of [-1, 1]) {
    e(0.27, sign * 0.25, 0.17, 0.115, 0.048, 0.06, 0x78541f);
    e(0.32, sign * 0.278, 0.18, 0.056, 0.018, 0.035, 0x8dfaff);
    e(0.33, sign * 0.294, 0.18, 0.022, 0.009, 0.024, 0x102527);
    tube(
      m,
      [at(0.08, sign * 0.24, 0.19), at(0.27, sign * 0.31, 0.28), at(0.47, sign * 0.2, 0.21)],
      [0.065, 0.07, 0.022].map((r) => r * scale),
      0xa96f25,
      alpha,
      8,
    );
    tube(
      m,
      [at(-0.23, sign * 0.24, 0.18), at(-0.5, sign * 0.57, 0.28), at(-0.64, sign * 0.46, 0.47)],
      [0.11, 0.075, 0.001].map((r) => r * scale),
      0xe5ca83,
      alpha,
      8,
    );
    const horn = [
      at(-0.1, sign * 0.2, 0.25),
      at(-0.32, sign * 0.29, 0.59),
      at(-0.58, sign * 0.36, 0.9),
      at(-0.89, sign * 0.43, 1.04),
    ];
    tube(
      m,
      horn,
      [0.085, 0.06, 0.035, 0.002].map((r) => r * scale),
      0xf7e6b2,
      alpha,
      8,
    );
    tube(
      m,
      [horn[1], at(-0.53, sign * 0.49, 0.76), at(-0.68, sign * 0.59, 0.88)],
      [0.05, 0.025, 0.002].map((r) => r * scale),
      0xe2c47d,
      alpha,
      7,
    );
    tube(
      m,
      [at(0.36, sign * 0.23, -0.04), at(0.47, sign * 0.25, -0.19)],
      [0.025 * scale, 0.001],
      0xfff2ca,
      alpha,
      6,
    );
    tube(
      m,
      [at(0.65, sign * 0.18, -0.035), at(0.64, sign * 0.18, -0.17)],
      [0.019 * scale, 0.001],
      0xfff2ca,
      alpha,
      6,
    );
    // Râu đi theo luồng khí, đầu và cuối râu có pha khác nhau.
    for (let k = 0; k < 2; k++) {
      const path = Array.from({ length: 13 }, (_, j) => {
        const u = j / 12;
        return at(
          0.55 - u * 1.7,
          sign * (0.18 + 0.45 * Math.sin(u * 2.3) + 0.1 * Math.sin(time * 5 - u * 7) * u),
          -0.03 + 0.18 * Math.sin(u * 4 + time * 2) * u - k * 0.09,
        );
      });
      tube(
        m,
        path,
        path.map((_, j) => (0.018 * (1 - j / 12) + 0.002) * scale),
        0xf9e7af,
        alpha,
        5,
      );
      m.strokes.push({ points: path, width: 0.014 * scale, color: 0xadecf4, alpha: alpha * 0.6 });
    }
    for (let k = 0; k < 6; k++) {
      const path = Array.from({ length: 7 }, (_, j) => {
        const u = j / 6;
        return at(
          -0.16 - u * (0.65 + k * 0.07),
          sign * (0.2 + 0.07 * k + 0.12 * Math.sin(u * 3 + time * 5 - k) * u),
          0.2 + 0.11 * k + u * 0.18 * Math.sin(time * 4 - u * 6 + k),
        );
      });
      ribbon(m, path, 0.055 * scale, k % 2 ? 0xfff1be : 0xc6e7e9, alpha * 0.8, b.side);
    }
  }
  m.strokes.push({
    points: [at(0.55, -0.15, 0.15), at(0.68, 0, 0.2), at(0.55, 0.15, 0.15)],
    width: 0.03 * scale,
    color: 0xfff3b8,
    alpha,
  });
}
export function buildDragon(
  spine: Vec3[],
  time: number,
  width: number,
  alpha: number,
  awakened = false,
): VfxMesh {
  const m = mesh3(),
    count = spine.length;
  if (
    count < 2 ||
    Math.hypot(spine[0].x - spine[1].x, spine[0].y - spine[1].y, spine[0].z - spine[1].z) < 1e-5
  )
    return m;
  const radii = spine.map(
    (_, i) =>
      width * (0.1 + 0.024 * Math.sin((i / count) * Math.PI)) * Math.pow(1 - i / count, 0.74) +
      0.005,
  );
  tube(m, spine, radii, 0xe8ba55, alpha, 12, 0xf5e4af);
  for (let i = 3; i < count - 2; i += 2) {
    const b = basis(spine, i),
      r = radii[i];
    tube(
      m,
      [
        b.at(0, 0, r * 0.75),
        b.at(-0.12, 0, r + 0.17 * (1 - i / count)),
        b.at(-0.28, 0, r + 0.23 * (1 - i / count)),
      ],
      [0.045, 0.025, 0.001],
      0xf1daa0,
      alpha,
      6,
    );
    for (const sign of [-1, 1]) {
      const line = [
        b.at(0.045, sign * r * 0.86, r * 0.42),
        b.at(-0.04, sign * r * 0.99, r * 0.15),
        b.at(-0.1, sign * r * 0.85, -r * 0.2),
      ];
      m.strokes.push({ points: line, width: 0.012, color: 0x936624, alpha: alpha * 0.65 });
    }
  }
  // Bốn chân có chuỗi vai/hông → khuỷu → cổ chân → vuốt; pha trước/sau lệch nhau.
  for (const [u, phase] of [
    [0.2, 0],
    [0.64, Math.PI],
  ])
    for (const sign of [-1, 1]) {
      const i = Math.floor((count - 1) * u),
        b = basis(spine, i),
        beat = Math.sin(time * 5.4 + phase + sign * 0.6);
      const root = b.at(0, sign * radii[i] * 0.7, -0.04),
        elbow = b.at(0.12 + beat * 0.08, sign * 0.43, -0.22),
        paw = b.at((u < 0.4 ? 0.35 : -0.26) + beat * 0.16, sign * 0.57, -0.43 + beat * 0.08);
      tube(m, [root, elbow, paw], [0.065, 0.047, 0.03], 0xd8a245, alpha, 8, 0xf1dca1);
      for (let k = -1; k <= 1; k++) {
        const base = add3(paw, mul3(b.side, k * 0.065));
        const tip = add3(base, add3(mul3(b.forward, 0.22), mul3(b.up, -0.1)));
        tube(
          m,
          [base, add3(base, mul3(b.forward, 0.14)), tip],
          [0.024, 0.018, 0.001],
          0xffedba,
          alpha,
          5,
        );
      }
    }
  const headStart = m.faces.length;
  dragonHead(m, spine, time, alpha, 0.88);
  for (let i = headStart; i < m.faces.length; i++) m.faces[i].alpha *= 1.6;
  const tail = basis(spine, count - 2);
  for (let k = 0; k < 5; k++) {
    const path = Array.from({ length: 9 }, (_, j) => {
      const u = j / 8;
      return tail.at(
        -u * 0.75,
        (k - 2) * 0.07 * u + 0.11 * Math.sin(time * 5 - u * 6 + k) * u,
        0.04 + 0.2 * Math.sin(u * 3 + k) * u,
      );
    });
    ribbon(m, path, 0.035, 0xffefbd, alpha * 0.8, tail.side);
  }
  // Năng lượng theo đúng sống lưng, không phải một đường thẳng kéo cả con rồng.
  m.strokes.push({ points: spine, width: width * 0.45, color: 0x8fe8ff, alpha: alpha * 0.025 });
  for (let k = 0; k < 3; k++) {
    const path = spine
      .filter((_, i) => i % 2 === 0)
      .map((p, i) =>
        add3(
          p,
          v3(
            Math.sin(i * 0.7 - time * 5 + k) * 0.12,
            Math.cos(i * 0.7 - time * 5 + k) * 0.12,
            Math.sin(i * 0.8 - time * 5 + k) * 0.11,
          ),
        ),
      );
    m.strokes.push({
      points: path,
      width: awakened ? 0.045 : 0.025,
      color: k === 1 ? 0xffe6a3 : 0x8ce5f6,
      alpha: alpha * (awakened ? 0.7 : 0.38),
    });
  }
  // Luồng trắng vàng và xanh ngọc quấn dọc thân, để lộ nền giữa các mạch lực như video tham khảo.
  for (let k = 0; k < 3; k++) {
    const path = spine
      .filter((_, i) => i % 2 === 0)
      .map((_, j) => {
        const i = j * 2,
          u = i / (count - 1),
          b = basis(spine, i),
          angle = u * 5 - time * 2.6 + (k * Math.PI * 2) / 3,
          r =
            radii[i] * (1.1 + 0.3 * Math.sin(angle * 0.6)) +
            (k === 0 ? 0.4 * Math.sin(u * Math.PI) : 0.045);
        return b.at(-0.03, Math.sin(angle) * r, Math.cos(angle) * r);
      });
    m.strokes.push({
      points: path,
      width: k === 0 ? 0.045 : 0.02,
      color: k % 3 === 0 ? 0x43d8ff : 0xfff0c9,
      alpha: alpha * 0.24,
    });
    m.strokes.push({
      points: path,
      width: 0.13,
      color: k === 0 ? 0x43d8ff : 0xffe3a5,
      alpha: alpha * (k === 0 ? 0.22 : 0.12),
      soft: true,
    });
  }
  return m;
}

export { buildWings, wingPose, type WingPose } from './vfxWings.ts';

export { buildHand, handHeight } from './vfxHand.ts';
