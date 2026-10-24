import type { Cost, Stats } from '../shared/models';

export const worldTwoCultivation = [
  35000, 40000, 45000, 50000, 60000, 65000, 70000, 80000, 90000, 105000, 120000, 135000, 150000,
  170000,
];
export const worldTwoTier = (index: number) => (index < 3 ? 0 : index < 7 ? 1 : index < 11 ? 2 : 3);
export function worldTwoReward(index: number) {
  const tier = worldTwoTier(index);
  return {
    cultivation: worldTwoCultivation[index],
    stone: [4000, 5500, 7500, 10000][tier],
    resources: {
      'linh-tai-thong-huyen': [12, 16, 22, 30][tier],
      'thiet-khoang': [60, 80, 105, 140][tier],
      'da-thu': [45, 60, 80, 105][tier],
      'linh-thao': [50, 65, 85, 110][tier],
      'yeu-dan': [24, 32, 42, 56][tier],
      'thuc-an-sung-vat': [8, 10, 14, 18][tier],
    },
    equipment: [] as string[],
    blueprints: [] as string[],
  };
}
export const worldTwoPetPassive = (id: string, level: number): Partial<Stats> =>
  id === 'linh-ho'
    ? { hp: 25 + (level - 5) * 10, pickup: 1 + (level - 5) * 0.1 }
    : { damage: 5 + (level - 5) * 2, crit: 0.05 + (level - 5) * 0.005 };
export const petAttackPower = (level: number) =>
  level <= 5 ? 0.35 + level * 0.12 : 0.95 + (level - 5) * 0.09;
export const petRealmCap = (realm: number) => Math.min(10, 5 + Math.max(0, realm - 46));
export function petFeedCost(level: number): Cost {
  if (level < 5) return { stone: 20 * level, resources: { 'thuc-an-sung-vat': level + 1 } };
  const i = Math.min(4, level - 5);
  return {
    stone: [600, 900, 1300, 1800, 2400][i],
    resources: {
      'thuc-an-sung-vat': [8, 10, 12, 15, 18][i],
      'linh-tai-thong-huyen': [3, 5, 7, 10, 14][i],
    },
  };
}
export function worldTwoUpgradeCost(level: number, saint: boolean): Cost {
  const step = level + 1;
  return {
    stone: saint ? 300 + 300 * step : 100 + 150 * step,
    resources: {
      'thiet-khoang': saint ? 6 + step * 6 : 2 + step * 4,
      'linh-tai-thong-huyen': saint ? step + 1 : step,
    },
  };
}
