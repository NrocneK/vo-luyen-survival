import Phaser from 'phaser';
import type { VisualEvent } from '../../shared/models';
import type { Point } from '../../shared/types';
import { project, type Projection } from '../math/worldPhysics';
import { lightningPath } from '../math/skillGeometry';

/** Vẽ trực tiếp theo tọa độ thế giới để vòng lửa khớp vùng gây sát thương isometric. */
export function drawFlameRing(
  graphics: Phaser.GameObjects.Graphics,
  point: Point,
  radius: number,
  projection: Projection,
  phase: number,
  strength: number,
  awakened: boolean,
  reduced: boolean,
  zoom: number,
  intense = false,
): void {
  const center = project(point, projection),
    rx = radius * projection.pixelsPerUnit,
    ry = rx / Math.sqrt(3),
    gold = awakened ? 0xffed9c : intense ? 0xffd878 : 0xffbd51,
    orange = intense ? 0xff3a16 : awakened ? 0xff793b : 0xf55c24,
    width = Math.max(1.5, 1.4 / zoom);
  graphics
    .lineStyle(width * 7, orange, strength * 0.09)
    .strokeEllipse(center.x, center.y, rx * 2, ry * 2)
    .lineStyle(width * 3.3, orange, strength * 0.36)
    .strokeEllipse(center.x, center.y, rx * 2, ry * 2)
    .lineStyle(width, gold, strength * 0.88)
    .strokeEllipse(center.x, center.y, rx * 2, ry * 2);
  const count = reduced ? 10 : awakened ? 30 : 22;
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2 + phase * 0.28;
    const base = { x: center.x + Math.cos(angle) * rx, y: center.y + Math.sin(angle) * ry };
    const flare = 5 + (0.5 + 0.5 * Math.sin(phase * 8 + index * 2.3)) * (awakened ? 16 : 12);
    graphics
      .fillStyle(orange, strength * 0.65)
      .fillTriangle(
        base.x - 3,
        base.y,
        base.x + 4,
        base.y,
        base.x + Math.sin(index + phase) * 4,
        base.y - flare,
      )
      .fillStyle(gold, strength * 0.8)
      .fillEllipse(base.x, base.y - flare * 0.2, 3, flare * 0.5);
  }
}

/** Mặt sóng đi từ tâm đến đúng biên; đây là tín hiệu của vùng đốt đang hoạt động liên tục. */
export function drawHeatWave(
  graphics: Phaser.GameObjects.Graphics,
  point: Point,
  radius: number,
  projection: Projection,
  progress: number,
  awakened: boolean,
  intense: boolean,
  reduced: boolean,
  zoom: number,
): void {
  const phase = Math.max(0, Math.min(1, progress));
  const center = project(point, projection),
    rx = radius * projection.pixelsPerUnit;
  const width = Math.max(1.4, 1.2 / zoom);
  const orange = intense ? 0xff4d1c : 0xff9b49,
    gold = awakened ? 0xffefb3 : intense ? 0xffd77a : 0xffdc93;
  const strength = Math.min(1, (1 - phase) * 5),
    wave = Math.max(1, rx * phase);
  graphics
    .fillStyle(orange, 0.035 * strength)
    .fillEllipse(center.x, center.y, wave * 2, (wave * 2) / Math.sqrt(3));
  for (let trail = 2; trail >= 0; trail--) {
    const r = Math.max(0, phase - trail * 0.055) * rx;
    if (r <= 0) continue;
    const alpha = strength * (trail ? 0.18 / trail : 0.75);
    graphics
      .lineStyle(width * (trail ? 1.2 : 7), orange, alpha * 0.13)
      .strokeEllipse(center.x, center.y, r * 2, (r * 2) / Math.sqrt(3));
    graphics
      .lineStyle(width * (trail ? 0.8 : 2), gold, alpha)
      .strokeEllipse(center.x, center.y, r * 2, (r * 2) / Math.sqrt(3));
  }
  if (!reduced)
    for (let index = 0; index < 12; index++) {
      const angle = (index * Math.PI) / 6 + 0.12 * Math.sin(phase * Math.PI);
      const from = Math.max(0, phase - 0.09) * rx;
      graphics
        .lineStyle(width, gold, strength * 0.32)
        .lineBetween(
          center.x + Math.cos(angle) * from,
          center.y + (Math.sin(angle) * from) / Math.sqrt(3),
          center.x + Math.cos(angle) * wave,
          center.y + (Math.sin(angle) * wave) / Math.sqrt(3),
        );
    }
}

/** Kim diễm vàng và cánh lửa dùng bán kính vụ nổ thật, không phải một ảnh đấm phóng to. */
export function drawSolarBurst(
  graphics: Phaser.GameObjects.Graphics,
  point: Point,
  radius: number,
  projection: Projection,
  progress: number,
  reduced: boolean,
  zoom: number,
): void {
  const p = project(point, projection),
    phase = Math.max(0, Math.min(1, progress));
  const rx = radius * projection.pixelsPerUnit,
    ry = rx / Math.sqrt(3),
    alpha = Math.min(1, (1 - phase) * 2.5),
    width = Math.max(1.5, 1.3 / zoom);
  graphics.fillStyle(0xff953c, alpha * 0.1).fillEllipse(p.x, p.y, rx * 2, ry * 2);
  const wave = 0.35 + phase * 0.65;
  graphics
    .lineStyle(width * 5, 0xff9d3b, alpha * 0.18)
    .strokeEllipse(p.x, p.y, rx * 2 * wave, ry * 2 * wave);
  graphics
    .lineStyle(width * 1.3, 0xffedaa, alpha * 0.95)
    .strokeEllipse(p.x, p.y, rx * 2 * wave, ry * 2 * wave);
  const count = reduced ? 6 : 12;
  for (let index = 0; index < count; index++) {
    const a = (index * Math.PI * 2) / count,
      x = p.x + Math.cos(a) * rx * wave * 0.75,
      y = p.y + Math.sin(a) * ry * wave * 0.75;
    const height = (12 + 13 * (1 - phase)) * (0.7 + 0.3 * Math.sin(index * 1.7 + phase * 4));
    graphics
      .fillStyle(0xffaa35, alpha * 0.65)
      .fillTriangle(x - 5, y, x + 5, y, x + Math.sin(a) * 6, y - height);
    graphics.fillStyle(0xfff1b0, alpha * 0.8).fillEllipse(x, y - height * 0.22, 4, height * 0.55);
  }
}

export function drawChainLightning(
  graphics: Phaser.GameObjects.Graphics,
  effect: VisualEvent,
  projection: Projection,
  reduced: boolean,
  zoom: number,
): void {
  const phase = Math.max(0, 1 - effect.life / effect.total),
    alpha = Math.min(1, effect.life / 0.16),
    points = (effect.points ?? []).map((point) => {
      const p = project(point, projection);
      return { x: p.x, y: p.y - 23 };
    }),
    color = effect.awakened ? 0xd5b0ff : 0x72caff,
    width = Math.max(1.5, 1.2 / zoom);
  // Từng nhánh dùng đúng danh sách địch bị đánh, không nối đến mục tiêu ngoài chuỗi.
  for (let index = 1; index < points.length; index++) {
    const path = lightningPath(
      points[index - 1],
      points[index],
      effect.id + index,
      Math.floor(phase * 15),
    );
    graphics
      .lineStyle(width * 8, color, alpha * 0.1)
      .strokePoints(path)
      .lineStyle(width * 3, color, alpha * 0.7)
      .strokePoints(path)
      .lineStyle(width, 0xf4fcff, alpha)
      .strokePoints(path);
    const end = points[index];
    graphics.fillStyle(color, alpha * 0.15).fillCircle(end.x, end.y, effect.awakened ? 17 : 11);
    graphics.fillStyle(0xf3faff, alpha * 0.9).fillCircle(end.x, end.y, 2.5);
    if (!reduced) {
      graphics.lineStyle(width, color, alpha * 0.7);
      for (let ray = 0; ray < 5; ray++) {
        const angle = ray * Math.PI * 0.4 + phase * 2;
        graphics.lineBetween(
          end.x,
          end.y,
          end.x + Math.cos(angle) * 14,
          end.y + Math.sin(angle) * 14,
        );
      }
    }
  }
}
