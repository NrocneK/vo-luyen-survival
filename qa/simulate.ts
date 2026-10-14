import { writeFileSync } from 'node:fs';
import { newProfile } from '../src/domain/profile.ts';
import { mapObstacles } from '../src/data/mapCollisions.ts';
import { playFullRun } from './playtest.ts';
const obstacles = mapObstacles(),
  reports = [];
for (const realm of [0, 3, 6])
  for (const seed of [12, 87, 2026]) {
    const profile = newProfile();
    profile.realm = realm;
    if (realm >= 3) profile.selectedSkills = ['cuong-the', 'duong-viem-chuong'];
    if (realm >= 6) {
      profile.equipped.weapon = 'thiet-kiem';
      profile.selectedSkills.push('tu-khi');
      profile.equipment['thiet-kiem'] = 3;
      profile.pets['linh-ho'] = { level: 3, evolved: false };
      profile.activePet = 'linh-ho';
    }
    const { run, peakEnemies, bossAttacks, elitesSeen } = playFullRun(profile, obstacles, seed);
    reports.push({
      realm,
      seed,
      won: run.result?.won ?? null,
      time: Math.round(run.time),
      kills: run.kills,
      level: run.level,
      hp: Math.round(run.hp),
      skills: run.skills,
      peakEnemies,
      bossAttacks,
      elitesSeen,
      rewards: run.result?.rewards,
    });
  }
writeFileSync('qa/balance-report.json', JSON.stringify(reports, null, 2));
console.log(
  JSON.stringify(
    reports.map(({ rewards: _rewards, ...report }) => report),
    null,
    2,
  ),
);
