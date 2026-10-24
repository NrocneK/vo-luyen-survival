import type { Point, GameMode } from '../../shared/types';
import { timeScales } from '../../data/testing.ts';

interface Simulation {
  mode: GameMode;
  tick(dt: number, input: Point): void;
}

/** Tăng tốc bằng nhiều bước nhỏ; thẻ/tạm dừng/thắng thua chặn ngay các bước còn lại. */
export function advanceSimulation(
  simulation: Simulation,
  wallSeconds: number,
  timeScale: number,
  input: Point,
): number {
  if (!Number.isFinite(wallSeconds) || wallSeconds <= 0) return 0;
  const scale = (timeScales as readonly number[]).includes(timeScale) ? timeScale : 1;
  let remaining = Math.min(wallSeconds, 0.1) * scale;
  let advanced = 0;
  while (remaining > 1e-8 && simulation.mode === 'playing') {
    const step = Math.min(1 / 30, remaining);
    simulation.tick(step, input);
    advanced += step;
    remaining -= step;
  }
  return advanced;
}
