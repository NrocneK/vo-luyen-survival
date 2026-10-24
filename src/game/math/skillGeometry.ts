import type { Point } from '../../shared/types';

/** Tia giữ nguyên hai đầu trúng đích; nhiễu chỉ bẻ phần thân, không làm sai mục tiêu. */
export function lightningPath(start: Point, end: Point, seed: number, phase: number): Point[] {
  const dx = end.x - start.x,
    dy = end.y - start.y,
    length = Math.hypot(dx, dy);
  if (length < 0.001) return [{ ...start }, { ...end }];
  const count = Math.max(3, Math.ceil(length / 13));
  const points: Point[] = [{ ...start }];
  for (let index = 1; index < count; index++) {
    const t = index / count;
    const noise = Math.sin((index * 127.1 + seed * 311.7 + phase * 17.9) * 4.7);
    const offset = noise * Math.min(14, length * 0.12) * Math.sin(t * Math.PI);
    points.push({
      x: start.x + dx * t - (dy / length) * offset,
      y: start.y + dy * t + (dx / length) * offset,
    });
  }
  points.push({ ...end });
  return points;
}
