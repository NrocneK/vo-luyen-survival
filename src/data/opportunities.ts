import type { OpportunityKind, OpportunityReward } from '../shared/opportunities';
import type { StageDef } from './stages';
import { equipment, resourceNames } from './equipment.ts';
import type { Resource } from '../shared/models';
import { worldTwoStages } from './worldTwoStages.ts';
import { worldTwoTier } from './worldTwoEconomy.ts';

export const opportunityRules = {
  timings: [0.14, 0.34, 0.54, 0.74],
  jitter: 0.025,
  offerDuration: 70,
  combatDuration: 55,
  claimDuration: 30,
  resultDuration: 5,
  interactRadius: 1.5,
  trialRadius: 2.8,
  trialCharge: 12,
  trialDuration: 30,
  guardCount: 3,
  reserve: 3,
  telegraph: 1.2,
} as const;
export const opportunityDefinitions: Record<
  OpportunityKind,
  { name: string; hint: string; action: string; color: number }
> = {
  cache: {
    name: 'Di vật có hộ vệ',
    hint: 'Phá phong ấn, hạ ba hộ vệ rồi trở lại mở rương.',
    action: 'Phá phong ấn',
    color: 0xf0c978,
  },
  herb: {
    name: 'Linh dược ven đường',
    hint: 'Thu hái để nhận linh thảo và hồi 25% sinh lực tối đa ngay trong màn.',
    action: 'Thu hái linh dược',
    color: 0x8cddac,
  },
  elite: {
    name: 'Truy sát tinh anh',
    hint: 'Nhận khiêu chiến, hạ tinh anh trong 55 giây rồi trở lại nhận thưởng.',
    action: 'Nhận khiêu chiến',
    color: 0xeaa18a,
  },
  trial: {
    name: 'Thử thách tụ linh',
    hint: 'Giữ chân trong trận đủ 12 giây trước khi hết 30 giây. Rời trận làm tụ linh giảm dần.',
    action: 'Bắt đầu thử thách',
    color: 0xa4c8f4,
  },
};
export const opportunityStages: Record<
  string,
  { guard: string; elite: string; equipment: string[]; blueprints: string[] }
> = {
  'hac-phong-son': {
    guard: 'hac-lang',
    elite: 'hac-lang-tinh-anh',
    equipment: ['vo-phuc', 'ngoc-gioi', 'thiet-kiem'],
    blueprints: ['ngoc-lien-bi-bao'],
  },
  'truyen-thua-dong-thien': {
    guard: 'linh-tran-khoi-loi',
    elite: 'kiem-linh-tinh-anh',
    equipment: ['ngoc-gioi', 'vo-phuc'],
    blueprints: ['liet-duong-kiem'],
  },
  'cuu-am-son-coc': {
    guard: 'ta-tu-doc-coc',
    elite: 'doc-thiem-tinh-anh',
    equipment: ['huyen-giap', 'huyen-thiet-quyen-sao'],
    blueprints: ['ngoc-lien-bi-bao'],
  },
  'ly-dia': {
    guard: 'diem-linh',
    elite: 'thiet-nha-tru-tinh-anh',
    equipment: ['chan-duong-kiem', 'huyen-giap'],
    blueprints: ['liet-duong-kiem'],
  },
  'trung-do-doat-dich': {
    guard: 'ho-ve-trung-do',
    elite: 'kiem-khach-tinh-anh',
    equipment: ['than-thuc-ngoc', 'chan-duong-kiem'],
    blueprints: ['truyen-thua-bi-bao'],
  },
  'trung-do-hao-kiep': {
    guard: 'ma-ve',
    elite: 'ma-tu-tinh-anh',
    equipment: ['than-thuc-ngoc', 'huyen-giap'],
    blueprints: ['truyen-thua-bi-bao'],
  },
};
for (const stage of worldTwoStages)
  opportunityStages[stage.id] = {
    guard: `thong-huyen-vo-gia-${stage.stageIndex}`,
    elite: `thong-huyen-tinh-anh-${stage.stageIndex}`,
    equipment: [],
    blueprints: [],
  };
export function opportunityReward(
  kind: OpportunityKind,
  stage: StageDef,
  random: () => number,
): OpportunityReward {
  if (stage.chapter === 2) {
    const tier = worldTwoTier(stage.stageIndex),
      b = tier + 1;
    const resources: OpportunityReward['loot']['resources'] =
      kind === 'herb'
        ? { 'linh-thao': [10, 15, 20, 25][tier] }
        : kind === 'cache'
          ? { 'linh-tai-thong-huyen': 2 * b, 'thiet-khoang': 10 * b }
          : kind === 'elite'
            ? { 'linh-tai-thong-huyen': 3 * b, 'yeu-dan': 4 * b }
            : { 'linh-tai-thong-huyen': 2 * b };
    return {
      loot: {
        stone: Math.floor(
          stage.rewards.stone *
            (kind === 'herb' ? 0 : kind === 'cache' ? 0.08 : kind === 'elite' ? 0.12 : 0.05),
        ),
        cultivation: Math.floor(
          stage.rewards.cultivation *
            (kind === 'herb' ? 0.01 : kind === 'cache' ? 0.02 : kind === 'elite' ? 0.03 : 0.04),
        ),
        resources,
        equipment: [],
        blueprints: [],
      },
      xp: [16, 20, 24, 28][tier],
      heal: kind === 'herb' ? 0.25 : 0,
    };
  }
  const tier = stage.stageIndex + 1,
    factor = kind === 'herb' ? 0.5 : kind === 'elite' ? 1.3 : 1;
  const reward: OpportunityReward = {
    loot: {
      stone: Math.round((24 + tier * 8) * factor),
      cultivation: Math.round(stage.rewards.cultivation * 0.035 * factor),
      resources: {},
      equipment: [],
      blueprints: [],
    },
    xp: 8 + tier * 4,
    heal: kind === 'herb' ? 0.25 : 0,
  };
  reward.loot.resources[
    kind === 'herb' ? 'linh-thao' : kind === 'elite' ? 'yeu-dan' : 'thiet-khoang'
  ] = kind === 'herb' ? 5 + tier : 2 + Math.ceil(tier / 2);
  const table = opportunityStages[stage.id];
  if (kind === 'cache' && random() < 0.4)
    reward.loot.equipment.push(table.equipment[Math.floor(random() * table.equipment.length)]);
  if (kind === 'elite' && random() < 0.2)
    reward.loot.blueprints.push(table.blueprints[Math.floor(random() * table.blueprints.length)]);
  return reward;
}
export function opportunityRewardText(reward: OpportunityReward): string {
  return [
    `${reward.loot.stone} linh thạch`,
    `${reward.loot.cultivation} tu vi`,
    ...Object.entries(reward.loot.resources).map(
      ([id, amount]) => `${amount} ${resourceNames[id as Resource]}`,
    ),
    ...reward.loot.equipment.map((id) => equipment[id].name),
    ...reward.loot.blueprints.map((id) => `Bản vẽ ${equipment[id].name}`),
    `${reward.xp} XP`,
    ...(reward.heal ? ['hồi 25% máu'] : []),
  ].join(' · ');
}
