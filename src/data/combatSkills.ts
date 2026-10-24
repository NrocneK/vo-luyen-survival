import type { AugmentId } from '../shared/augments';
import { augmentRules } from './augments.ts';
import { pierceForRank, projectileRules } from './projectiles.ts';

export type PrimarySkillId = 'cuong-quyen' | 'nguyen-khi-tram';

// Thông số chiến đấu chung cho engine, thẻ mô tả và phép đo cân bằng. Bậc 1–5 giữ nền hiện có.
export const awakeningBalance = {
  coreSpread: 0.095,
  fanOuterSpread: 0.6,
  fists: { power: 3.3, count: 3, speed: 6.5, radius: 0.54 },
  sword: { power: 3.1, count: 3, speed: 8, radius: 0.5 },
  palm: {
    power: 4.2,
    count: 3,
    speed: 6,
    radius: 0.55,
    cooldown: 2.4,
    splashRadius: 2.4,
    splashDamage: 0.8,
  },
  lightning: { power: 3.9, hits: 10, initialRange: 10, jumpRange: 5, cooldown: 2.4 },
} as const;

export function projectileSpread(index: number, count: number, rank?: number, augment?: AugmentId) {
  const fan = augment === 'kiem-tan-anh' || augment === 'chuong-tam-hoa';
  if ((rank ?? 0) >= 6 && fan && count === 5)
    return [
      -awakeningBalance.fanOuterSpread,
      -awakeningBalance.coreSpread,
      0,
      awakeningBalance.coreSpread,
      awakeningBalance.fanOuterSpread,
    ][index];
  // Luồng thứ ba thêm giữa hai luồng cũ, giữ độ chụm để thức tỉnh không yếu đi ở tầm xa.
  return (
    (index - (count - 1) / 2) *
    ((rank ?? 0) >= 6 ? awakeningBalance.coreSpread : fan ? augmentRules.fanSpread : 0.19)
  );
}

export function primaryAttack(id: PrimarySkillId, rank: number, chosen: AugmentId[] = []) {
  const awakened = rank >= 6;
  const sword = id === 'nguyen-khi-tram';
  const base = sword ? awakeningBalance.sword : awakeningBalance.fists;
  const baseCount = awakened ? base.count : rank >= 3 ? 2 : 1;
  const heavy = !sword && chosen.includes('quyen-bang-son');
  const fan = sword && chosen.includes('kiem-tan-anh');
  const returning = sword && chosen.includes('kiem-hoi-phong');
  return {
    power:
      (awakened ? base.power : 1 + (rank - 1) * 0.32) *
      (heavy
        ? baseCount * augmentRules.heavyDamage
        : fan
          ? augmentRules.swordFanDamage
          : returning
            ? augmentRules.returnDamage
            : 1),
    count: heavy ? 1 : baseCount + (fan ? augmentRules.fanExtra : 0),
    speed: awakened ? base.speed : 6.5,
    radius: (awakened ? base.radius : 0.24 + rank * 0.04) * (heavy ? 1.35 : 1),
    pierce: returning ? Infinity : pierceForRank(rank) + (heavy ? augmentRules.heavyPierce : 0),
    cooldown: 0.82 * (heavy ? augmentRules.heavyCooldown : 1),
    effect: awakened ? (sword ? 'sword-storm' : 'dragon-fist') : sword ? 'sword-slash' : 'qi-punch',
    augment: heavy
      ? 'quyen-bang-son'
      : returning
        ? 'kiem-hoi-phong'
        : fan
          ? 'kiem-tan-anh'
          : undefined,
  } as const;
}

export function firePalmAttack(rank: number, chosen: AugmentId[] = []) {
  const awakened = rank >= 6,
    base = awakeningBalance.palm;
  const fan = chosen.includes('chuong-tam-hoa');
  return {
    power: (awakened ? base.power : 1.4 + rank * 0.3) * (fan ? augmentRules.fireFanDamage : 1),
    count: (awakened ? base.count : 1 + Math.floor(rank / 3)) + (fan ? augmentRules.fanExtra : 0),
    speed: awakened ? base.speed : 5,
    radius: awakened ? base.radius : 0.4,
    pierce: pierceForRank(rank),
    cooldown: awakened ? base.cooldown : 3,
    splashRadius: awakened ? base.splashRadius : projectileRules.fireSplashRadius(rank),
    splashDamage: awakened ? base.splashDamage : projectileRules.fireSplashDamage,
    augment: fan
      ? 'chuong-tam-hoa'
      : chosen.includes('chuong-luu-hoa')
        ? 'chuong-luu-hoa'
        : undefined,
  } as const;
}

export function lightningAttack(rank: number, chosen: AugmentId[] = []) {
  const awakened = rank >= 6,
    base = awakeningBalance.lightning;
  return {
    power: awakened ? base.power : 1.1 + rank * 0.25,
    hits: awakened ? base.hits : 2 + rank,
    initialRange: awakened ? base.initialRange : 7,
    jumpRange: awakened ? base.jumpRange : 4,
    cooldown: awakened ? base.cooldown : 3.2,
    focused: chosen.includes('loi-tap-kich'),
    branches: chosen.includes('loi-song-lien') ? 2 : 1,
  } as const;
}
