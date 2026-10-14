import { readFileSync, writeFileSync } from 'node:fs';
import { newProfile, applyResult, breakthrough } from '../src/domain/profile.ts';
const reports = JSON.parse(readFileSync('qa/balance-report.json', 'utf8'));
const win = reports.find(
  (report: { realm: number; seed: number; won: boolean }) =>
    report.realm === 0 && report.seed === 87 && report.won,
);
if (!win) throw new Error('Cần báo cáo có lượt thắng trước khi tạo fixture.');
const profile = newProfile();
for (let index = 0; index < 2; index++)
  applyResult(profile, {
    won: true,
    time: win.time,
    kills: win.kills,
    level: win.level,
    raw: win.rewards,
    rewards: win.rewards,
    reason: 'Fixture từ mô phỏng đã thắng',
    seed: 87,
  });
for (let index = 0; index < 3; index++) breakthrough(profile);
profile.settings.music = false;
writeFileSync('qa/fixture-progress.json', JSON.stringify({ game: 'vo-luyen', profile }, null, 2));
console.log({
  stone: profile.stone,
  realm: profile.realm,
  resources: profile.resources,
  blueprints: profile.blueprints,
});
