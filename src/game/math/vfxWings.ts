import type { Point } from '../../shared/types';
import {
  add3,
  sub3,
  mul3,
  norm3,
  cross3,
  lerp3,
  v3,
  ribbon,
  mesh3,
  type Vec3,
  type VfxMesh,
} from './vfxGeometry.ts';

export interface WingPose {
  root: Vec3;
  elbow: Vec3;
  wrist: Vec3;
  tip: Vec3;
  sign: number;
}

function wingSpace(root: Vec3, forward: Point, time: number, dash: boolean, sign: number) {
  const f = norm3(v3(forward.x, forward.y, 0)),
    s = v3(-f.y, f.x, 0);
  return (x: number, u: number, z: number, lag = 0): Vec3 => {
    const beat = dash
      ? Math.sin(time * 11 - lag) * 0.48 + 0.24
      : Math.sin(time * 3.5 - lag) * 0.22 + 0.06;
    return add3(
      root,
      add3(
        mul3(f, x),
        add3(
          mul3(s, sign * (u * Math.cos(beat) - z * Math.sin(beat))),
          v3(0, 0, z * Math.cos(beat) + u * Math.sin(beat)),
        ),
      ),
    );
  };
}
export function wingPose(root: Vec3, forward: Point, time: number, dash: boolean): WingPose[] {
  return [-1, 1].map((sign) => {
    const at = wingSpace(root, forward, time, dash, sign);
    return {
      root: at(-0.03, 0.09, 0),
      elbow: at(-0.12, 0.85, 0.46),
      wrist: at(-0.24, 1.62, 0.86),
      tip: at(-0.08, 2.7, 1.04),
      sign,
    };
  });
}
function plume(
  m: VfxMesh,
  base: Vec3,
  tip: Vec3,
  width: number,
  color: number,
  time: number,
  lag: number,
) {
  const direction = sub3(tip, base),
    axis = norm3(cross3(direction, v3(0, 0, 1)));
  const path = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return add3(
      lerp3(base, tip, t),
      v3(
        Math.sin(time * 4 - lag - t * 2.8) * 0.12 * t * t,
        Math.cos(time * 3.7 - lag - t * 3) * 0.09 * t * t,
        Math.sin(t * Math.PI) * 0.16 + Math.sin(time * 4.2 - lag - t * 3) * 0.16 * t * t,
      ),
    );
  });
  ribbon(m, path, width * 1.25, color, 0.36, axis);
  ribbon(m, path, width * 0.68, color, 0.58, axis);
  m.strokes.push(
    { points: path, width: width * 1.5, color, alpha: 0.22, soft: true, taper: true },
    { points: path, width: width * 0.65, color: 0xe9ffff, alpha: 0.04, soft: true, taper: true },
    { points: path, width: 0.01, color: 0xd5fcff, alpha: 0.035 },
  );
  const end = path.at(-1)!;
  const wisp = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return add3(
      end,
      add3(
        mul3(norm3(direction), t * 0.48),
        v3(
          Math.sin(time * 5 - lag - t * 5) * t * 0.13,
          Math.cos(time * 4 - lag - t * 4) * t * 0.1,
          t * 0.05,
        ),
      ),
    );
  });
  m.strokes.push({ points: wisp, width: 0.045, color, alpha: 0.1, soft: true, taper: true });
}
/** Cánh phượng linh lực: đường vai cong, lớp lông phủ và lông bay xòe theo thứ tự, không có nan nối chéo. */
export function buildWings(root: Vec3, forward: Point, time: number, dash: boolean): VfxMesh {
  const m = mesh3();
  for (const sign of [-1, 1]) {
    const at = wingSpace(root, forward, time, dash, sign),
      color = sign < 0 ? 0x58cde5 : 0x829bec;
    // Màng khí liên tục có biên mềm, giữ dáng cánh ngay cả giữa các lớp lông đang tan.
    const sheet = Array.from({ length: 19 }, (_, i) =>
      Array.from({ length: 7 }, (_, j) => {
        const u = i / 18,
          v = j / 6,
          span = 0.09 + 3.36 * u,
          top = Math.sin(u * Math.PI * 0.75) * 0.98,
          bottom = 0.7 * u - 0.98 * Math.sin(u * Math.PI),
          x = -0.03 - 0.18 * Math.sin(Math.PI * u) - v * 0.6 * Math.sin(Math.PI * u),
          z =
            top +
            (bottom - top) * v +
            0.05 *
              Math.sin(time * 4 - u * 8 - v * 3) *
              Math.sin(Math.PI * u) *
              Math.sin(Math.PI * v);
        return at(x, span, z, u * 0.25 + v * 0.16);
      }),
    );
    for (let i = 0; i < 18; i++)
      for (let j = 0; j < 6; j++) {
        const a = sheet[i][j],
          b = sheet[i + 1][j],
          c = sheet[i + 1][j + 1],
          d = sheet[i][j + 1],
          n = norm3(cross3(sub3(b, a), sub3(d, a))),
          alpha =
            0.9 *
            Math.pow(Math.sin((Math.PI * (j + 0.5)) / 6), 0.6) *
            Math.sin((Math.PI * (i + 0.5)) / 18);
        m.faces.push(
          { a, b, c, normal: n, color, alpha },
          { a, b: c, c: d, normal: n, color, alpha },
          { a: c, b, c: a, normal: mul3(n, -1), color, alpha },
          { a: d, b: c, c: a, normal: mul3(n, -1), color, alpha },
        );
      }
    const upper = [
      at(-0.03, 0.09, 0),
      at(-0.12, 0.85, 0.46),
      at(-0.24, 1.62, 0.86),
      at(-0.08, 2.7, 1.04),
    ];
    const lower = [
      at(-0.03, 0.09, 0),
      at(-0.38, 0.7, -0.35),
      at(-0.68, 1.38, -0.25),
      at(-0.08, 2.7, 1.04),
    ];
    // Lớp phủ mềm nối vai với lông lớn; nhiều dải cong mảnh thay cho một tấm phẳng đặc.
    for (let j = 0; j < 6; j++) {
      const t = (j + 0.4) / 6;
      const path = upper.map((p, i) => lerp3(p, lower[i], t));
      ribbon(m, path, 0.13, color, 0.36, v3(0, 0, 1));
    }
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const base = at(-0.08 - 0.16 * t, 2.7 - 1.08 * t, 1.04 - 0.18 * t);
      const tip = at(
        -0.12 - 0.95 * t,
        3.55 - 1.58 * t,
        0.9 - 1.85 * Math.pow(t, 1.5),
        0.18 + t * 0.34,
      );
      plume(m, base, tip, 0.19 + 0.055 * Math.sin(t * Math.PI), color, time, i * 0.25);
    }
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const base = at(-0.05 - 0.17 * t, 0.28 + 1.16 * t, 0.08 + 0.66 * t);
      const tip = at(
        -0.28 - 0.55 * t,
        0.35 + 1.28 * t,
        -0.25 - 0.65 * Math.sin(t * Math.PI),
        0.12 + t * 0.3,
      );
      plume(m, base, tip, 0.16 + 0.035 * t, color, time, 1.2 + i * 0.3);
    }
    m.strokes.push({ points: upper, width: 0.09, color, alpha: 0.2, soft: true });
    if (sign > 0) {
      const bolt = Array.from({ length: 12 }, (_, j) => {
        const u = j / 11,
          jitter = Math.sin(Math.floor(time * 9) * 2 + j * 13) * 0.07 * Math.sin(Math.PI * u);
        return at(-0.15 + jitter, 0.15 + 2.5 * u, 0.12 + 0.88 * u + jitter);
      });
      m.strokes.push({
        points: bolt,
        width: 0.023,
        color: 0xe7e9ff,
        alpha: dash ? 0.7 : 0.18 + 0.1 * Math.sin(time * 13),
      });
      const phase = (time * 2.9) % 1,
        pulse =
          0.18 +
          0.82 *
            Math.max(
              Math.exp(-((phase - 0.08) ** 2) / 0.006),
              0.7 * Math.exp(-((phase - 0.3) ** 2) / 0.008),
            );
      for (let k = 0; k < 3; k++) {
        const bolt = Array.from({ length: 17 }, (_, j) => {
          const u = j / 16,
            jitter =
              Math.sin(Math.floor(time * 9) * 8.1 + j * 12.7 + k * 17) *
              0.11 *
              Math.sin(u * Math.PI);
          return at(
            -0.13 - 0.48 * u + jitter,
            0.13 + u * (2.85 - k * 0.38),
            0.18 + 0.68 * u - k * 0.27 + jitter,
          );
        });
        m.strokes.push(
          { points: bolt, width: 0.018, color: 0xf3f3ff, alpha: pulse * (dash ? 1 : 0.75) },
          {
            points: bolt,
            width: 0.12,
            color: 0x718bff,
            alpha: pulse * 0.36,
            soft: true,
            taper: true,
          },
        );
      }
      // Hồ quang bò ra ngoài mép lông để sắc lam không chìm vào lõi cánh trắng.
      const corona = Array.from({ length: 21 }, (_, j) => {
        const u = j / 20,
          jitter = Math.sin(Math.floor(time * 11) * 7.3 + j * 17.1) * 0.14;
        return at(
          -0.2 - 0.45 * u + jitter * 0.3,
          2.3 + 1.35 * u + jitter,
          0.98 - 0.75 * u + jitter,
        );
      });
      m.strokes.push(
        {
          points: corona,
          width: 0.17,
          color: 0x526dff,
          alpha: pulse * 0.5,
          soft: true,
          taper: true,
        },
        { points: corona, width: 0.028, color: 0xa3c5ff, alpha: pulse * 0.95 },
      );
      for (const branch of [5, 10, 15]) {
        const start = corona[branch],
          end = add3(start, v3(-0.25, 0.25 * sign, -0.28));
        m.strokes.push({
          points: [
            start,
            lerp3(start, end, 0.4),
            add3(lerp3(start, end, 0.7), v3(0.08, -0.1, 0.07)),
            end,
          ],
          width: 0.022,
          color: 0x8fafff,
          alpha: pulse * 0.7,
        });
      }
    } else {
      // Gió cuộn ra đầu cánh, nhiều vòng có pha trễ; không dùng cùng hình sét của bên lôi.
      for (let k = 0; k < 3; k++) {
        const path = Array.from({ length: 31 }, (_, j) => {
          const u = j / 30,
            angle = u * 8 - time * 4.8 + k * 2.1,
            r = 0.22 + 0.22 * Math.sin(u * Math.PI);
          return at(
            -0.15 - 0.4 * u + Math.sin(angle) * r,
            0.22 + 3.0 * u + Math.cos(angle) * r,
            0.3 + 0.64 * Math.sin(u * Math.PI * 0.75) + Math.cos(angle) * r,
          );
        });
        m.strokes.push(
          {
            points: path,
            width: 0.07,
            color: 0x79e8ee,
            alpha: dash ? 0.32 : 0.2,
            soft: true,
            taper: true,
          },
          { points: path, width: 0.015, color: 0xcaffff, alpha: dash ? 0.42 : 0.17 },
        );
      }
    }
  }
  return m;
}
