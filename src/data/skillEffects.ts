/** Bán kính mặt đất dùng chung cho sát thương và renderer, tránh hiệu ứng lệch vùng trúng. */
export function flameRingRadius(rank: number): number {
  if (rank <= 0) return 0;
  return [0, 1.8, 2.2, 2.6, 3, 3.4, 4.2][Math.min(6, Math.floor(rank))];
}

/** Giữ DPS cơ bản tương đương nhịp đánh cũ; sát thương được tích phân liên tục theo dt. */
export function flameRingDamagePerSecond(rank: number): number {
  if (rank <= 0) return 0;
  return ((0.9 + rank * 0.25) * (rank >= 6 ? 1.6 : 1)) / (rank >= 6 ? 1.7 : 2.4);
}

export const flameAuraRules = {
  wavePeriod: 1.2,
  feedbackPeriod: 0.35,
  criticalPeriod: 0.4,
} as const;

export const skillEffectTiming = {
  flameRing: 1.2,
  chainLightning: 0.55,
} as const;
