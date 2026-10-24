import {
  newProfile,
  applyResult,
  validateProfile,
  breakthrough,
  brew,
  usePill,
  forge,
  equip,
  upgrade,
  unlockPet,
  feedPet,
  evolvePet,
  cleanLoadout,
} from '../src/domain/profile.ts';
import { WORLD_ONE_REALM_CAP } from '../src/data/realms.ts';
import { stages } from '../src/data/stages.ts';
import { stageUnlocked, worldProgress } from '../src/data/campaign.ts';
import { mapObstacles } from '../src/data/mapCollisions.ts';
import { playFullRun } from './playtest.ts';
import type { Profile } from '../src/shared/models';

// Điều khiển QA dùng luật thật và tài nguyên đã kiếm; không cộng máu, tiền hay tu vi thử nghiệm.
function prepare(profile: Profile, targetRealm: number): void {
  for (let i = 0; i < 2; i++) {
    if (profile.pills['tu-vi-dan'] < 2) brew(profile, 'tu-vi-dan');
  }
  for (let i = 0; i < 50 && profile.realm < targetRealm; i++) {
    const before = profile.realm;
    breakthrough(profile);
    if (before === profile.realm) {
      // Đan dư hỗ trợ mốc thiếu một ít tu vi, hai viên cuối giữ để đột phá.
      if (profile.pills['tu-vi-dan'] > 2) usePill(profile, 'tu-vi-dan');
      else break;
    }
  }
  for (const id of [
    'ngoc-gioi',
    'ngoc-lien-bi-bao',
    'huyen-giap',
    'liet-duong-kiem',
    'huyen-thiet-quyen-sao',
    'chan-duong-kiem',
    'than-thuc-ngoc',
    'truyen-thua-bi-bao',
  ]) {
    forge(profile, id);
    if (id in profile.equipment) equip(profile, id);
  }
  // Cường hóa dần để chừa tài nguyên cho các hệ thống khác.
  for (const id of Object.values(profile.equipped)) if (id) upgrade(profile, id);
  for (const id of ['linh-ho', 'thanh-dieu']) {
    unlockPet(profile, id);
    if (profile.pets[id]) {
      feedPet(profile, id);
      evolvePet(profile, id);
    }
  }
  while (profile.pills['hoi-nguyen-dan'] < 3) {
    const previous = profile.pills['hoi-nguyen-dan'];
    brew(profile, 'hoi-nguyen-dan');
    if (previous === profile.pills['hoi-nguyen-dan']) break;
  }
  // Bộ sáu ô giữ hỗ trợ thức tỉnh và thêm hai đòn diện rộng ở các chặng sau.
  profile.selectedSkills = ['cuong-the', 'tu-khi', 'duong-viem-chuong', 'viem-hoan', 'loi-lien'];
  cleanLoadout(profile);
}

export function playWorldOne(seed = 87) {
  let profile = newProfile(1000);
  const reports: {
    stageId: string;
    realm: number;
    won: boolean;
    time: number;
    kills: number;
    level: number;
    bossAttacks: number[];
    peakEnemies: number;
    cultivation: number;
  }[] = [];
  for (let index = 0; index < stages.length; index++) {
    const selected = stages[index];
    let attempts = 0;
    while (!profile.stageProgress[selected.id]?.wins) {
      if (++attempts > 8) throw new Error(`Không thể tiến triển sau 8 lượt ở ${selected.id}.`);
      prepare(profile, selected.requiredRealm);
      const playable = stageUnlocked(profile, selected.id)
        ? selected
        : stages[Math.max(0, index - 1)];
      const usedRealm = profile.realm;
      const { run, bossAttacks, peakEnemies } = playFullRun(
        profile,
        mapObstacles(playable),
        seed + reports.length * 13,
        playable,
      );
      if (!run.result) throw new Error(`Mô phỏng không kết thúc: ${playable.id}.`);
      profile.pills['hoi-nguyen-dan'] -= Math.min(3, profile.pills['hoi-nguyen-dan']) - run.pills;
      applyResult(profile, run.result);
      reports.push({
        stageId: playable.id,
        realm: usedRealm,
        won: run.result.won,
        time: run.time,
        kills: run.kills,
        level: run.level,
        bossAttacks,
        peakEnemies,
        cultivation: run.result.rewards.cultivation,
      });
      // Roundtrip sau mỗi lượt để các mốc mở khóa không phụ thuộc dữ liệu tạm trong bộ nhớ.
      profile = validateProfile(JSON.parse(JSON.stringify(profile)));
    }
  }
  prepare(profile, WORLD_ONE_REALM_CAP);
  if (profile.realm !== WORLD_ONE_REALM_CAP || !worldProgress(profile).completed)
    throw new Error(
      `Chưa hoàn thành thế giới: realm=${profile.realm}, tu vi=${profile.cultivation}.`,
    );
  return { profile, reports };
}
