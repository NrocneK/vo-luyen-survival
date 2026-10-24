import type { Point } from '../../shared/types';
import { palmRestOutline, inHand } from './vfxGeometry.ts';
export interface TechniqueArea extends Point {
  shape: 'cone' | 'disc' | 'beam' | 'dragon' | 'palm';
  angle: number;
  radius: number;
  length: number;
  width: number;
  spread: number;
}
export function segmentDistance(point: Point, from: Point, to: Point): number {
  const x = to.x - from.x,
    y = to.y - from.y,
    den = x * x + y * y;
  const t = den
    ? Math.max(0, Math.min(1, ((point.x - from.x) * x + (point.y - from.y) * y) / den))
    : 0;
  return Math.hypot(point.x - from.x - t * x, point.y - from.y - t * y);
}
export function techniqueHit(area: TechniqueArea, point: Point, radius = 0): boolean {
  if (area.shape === 'palm') {
    const dx = point.x - area.x,
      dy = point.y - area.y;
    return (
      area.radius > 0 &&
      inHand(
        (dx + dy) / (Math.SQRT2 * area.radius),
        (dx - dy) / (Math.SQRT2 * area.radius),
        radius / area.radius,
      )
    );
  }
  if (area.shape === 'disc')
    return Math.hypot(point.x - area.x, point.y - area.y) <= area.radius + radius;
  if (area.shape === 'cone') {
    const d = Math.hypot(point.x - area.x, point.y - area.y);
    if (d <= radius) return true;
    const delta = Math.atan2(
      Math.sin(Math.atan2(point.y - area.y, point.x - area.x) - area.angle),
      Math.cos(Math.atan2(point.y - area.y, point.x - area.x) - area.angle),
    );
    return (
      d <= area.length + radius &&
      Math.abs(delta) <= area.spread / 2 + Math.asin(Math.min(1, radius / d))
    );
  }
  if (area.shape === 'beam') {
    const dx = point.x - area.x,
      dy = point.y - area.y;
    const along = dx * Math.cos(area.angle) + dy * Math.sin(area.angle),
      across = -dx * Math.sin(area.angle) + dy * Math.cos(area.angle);
    return (
      Math.hypot(
        Math.max(0, -along, along - area.length),
        Math.max(0, Math.abs(across) - area.width / 2),
      ) <= radius
    );
  }
  return (
    segmentDistance(point, area, {
      x: area.x + Math.cos(area.angle) * area.length,
      y: area.y + Math.sin(area.angle) * area.length,
    }) <=
    area.width / 2 + radius
  );
}
export function techniqueOutline(area: TechniqueArea): Point[] {
  if (area.shape === 'palm')
    return palmRestOutline.map(([u, v]) => ({
      x: area.x + ((u + v) * area.radius) / Math.SQRT2,
      y: area.y + ((u - v) * area.radius) / Math.SQRT2,
    }));
  if (area.shape === 'disc')
    return Array.from({ length: 49 }, (_, i) => ({
      x: area.x + Math.cos((i * Math.PI) / 24) * area.radius,
      y: area.y + Math.sin((i * Math.PI) / 24) * area.radius,
    }));
  if (area.shape === 'cone')
    return [
      { x: area.x, y: area.y },
      ...Array.from({ length: 25 }, (_, i) => ({
        x: area.x + Math.cos(area.angle - area.spread / 2 + (area.spread * i) / 24) * area.length,
        y: area.y + Math.sin(area.angle - area.spread / 2 + (area.spread * i) / 24) * area.length,
      })),
      { x: area.x, y: area.y },
    ];
  const normal = {
    x: (-Math.sin(area.angle) * area.width) / 2,
    y: (Math.cos(area.angle) * area.width) / 2,
  };
  const end = {
    x: area.x + Math.cos(area.angle) * area.length,
    y: area.y + Math.sin(area.angle) * area.length,
  };
  if (area.shape === 'dragon')
    return [
      ...Array.from({ length: 17 }, (_, i) => {
        const a = area.angle - Math.PI / 2 + (i * Math.PI) / 16;
        return {
          x: end.x + (Math.cos(a) * area.width) / 2,
          y: end.y + (Math.sin(a) * area.width) / 2,
        };
      }),
      ...Array.from({ length: 17 }, (_, i) => {
        const a = area.angle + Math.PI / 2 + (i * Math.PI) / 16;
        return {
          x: area.x + (Math.cos(a) * area.width) / 2,
          y: area.y + (Math.sin(a) * area.width) / 2,
        };
      }),
    ];
  return [
    { x: area.x + normal.x, y: area.y + normal.y },
    { x: end.x + normal.x, y: end.y + normal.y },
    { x: end.x - normal.x, y: end.y - normal.y },
    { x: area.x - normal.x, y: area.y - normal.y },
    { x: area.x + normal.x, y: area.y + normal.y },
  ];
}
