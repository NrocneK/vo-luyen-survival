import type { Profile } from '../shared/models';
import { realms, WORLD_ONE_REALM_CAP } from './realms.ts';
import { stages, allStages, stageById } from './stages.ts';

export function stageLockReason(profile: Profile, id: string): string {
  const stage = allStages.find((entry) => entry.id === id);
  if (!stage) return 'Màn lịch luyện không tồn tại.';
  if (stage.chapter === 2 && !worldProgress(profile, 1).completed)
    return 'Hoàn thành sáu màn Trung Đô và đạt Thần Du đỉnh phong tầng 10.';
  if (stage.id === 'dai-chien-cot-toc' && !profile.stageProgress['giai-phong-co-ma']?.wins)
    return 'Cần hoàn thành Giải phong Cổ Ma để nhận Huyết Tinh Thạch.';
  if (stage.prerequisite && !profile.stageProgress[stage.prerequisite]?.wins) {
    const previous = allStages.find((entry) => entry.id === stage.prerequisite);
    return `Cần vượt ${previous?.name ?? stage.prerequisite}.`;
  }
  if (profile.realm < stage.requiredRealm) return `Cần đạt ${realms[stage.requiredRealm].name}.`;
  return '';
}

export function stageUnlocked(profile: Profile, id: string): boolean {
  return stageLockReason(profile, id) === '';
}

export function availableStages(profile: Profile) {
  return allStages.filter((stage) => stageUnlocked(profile, stage.id));
}

export function worldProgress(profile: Profile, world: 1 | 2 = 1) {
  const selected = allStages.filter((stage) => (stage.chapter ?? 1) === world);
  const cleared = selected.filter(
    (stage) => (profile.stageProgress[stage.id]?.wins ?? 0) > 0,
  ).length;
  const finalStage = selected[selected.length - 1];
  const completed =
    cleared === selected.length &&
    (profile.stageProgress[finalStage.id]?.wins ?? 0) > 0 &&
    profile.realm >= (world === 1 ? WORLD_ONE_REALM_CAP : 52);
  return { world, cleared, total: selected.length, completed, nextWorldUnlocked: completed };
}

/** Hai điều kiện có thể hoàn tất theo bất kỳ thứ tự nào: hạ boss hoặc đột phá sau cùng. */
export function justCompletedWorld(before: Profile, after: Profile): boolean {
  return newlyCompletedWorld(before, after) !== 0;
}
export function newlyCompletedWorld(before: Profile, after: Profile): 0 | 1 | 2 {
  for (const world of [1, 2] as const)
    if (!worldProgress(before, world).completed && worldProgress(after, world).completed)
      return world;
  return 0;
}
export const currentWorld = (profile: Profile): 1 | 2 =>
  stageById(profile.selectedStageId).chapter ?? 1;
export function hubName(profile: Profile, world = currentWorld(profile)): string {
  return world === 1
    ? 'Lăng Tiêu Các'
    : profile.stageProgress['phe-hon-trung']?.wins
      ? 'Cửu Thiên Thánh Địa'
      : 'Lăng Tiêu Tông';
}

/** Chặng cao nhất đã thắng, dùng cho linh khí idle và mục tiêu hành trình. */
export function clearedMilestone(profile: Profile): number {
  return stages.reduce(
    (highest, stage, index) =>
      (profile.stageProgress[stage.id]?.wins ?? 0) > 0 ? index + 1 : highest,
    0,
  );
}
