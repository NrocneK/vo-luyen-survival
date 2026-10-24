export const timeScales = [1, 2, 4, 6, 8] as const;
export const damageMultipliers = [1, 10, 50, 100] as const;

export interface TestSettings {
  enabled: boolean;
  unlimitedResources: boolean;
  damageMultiplier: (typeof damageMultipliers)[number];
  timeScale: (typeof timeScales)[number];
}

export const defaultTestSettings: Readonly<TestSettings> = Object.freeze({
  enabled: false,
  unlimitedResources: false,
  damageMultiplier: 1,
  timeScale: 1,
});

// Hệ số chỉ thuộc phiên test; không đưa vào Profile hay file tiến trình.
export function normalizeTestSettings(input: Partial<TestSettings>): TestSettings {
  return {
    enabled: input.enabled === true,
    unlimitedResources: input.unlimitedResources === true,
    damageMultiplier: damageMultipliers.includes(
      input.damageMultiplier as TestSettings['damageMultiplier'],
    )
      ? input.damageMultiplier!
      : 1,
    timeScale: timeScales.includes(input.timeScale as TestSettings['timeScale'])
      ? input.timeScale!
      : 1,
  };
}
