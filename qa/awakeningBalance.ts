import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage } from '../src/data/stages.ts';
import { awakenings } from '../src/data/awakenings.ts';
import { augments } from '../src/data/augments.ts';
import type { EnemyState } from '../src/shared/models';
import type { AugmentId } from '../src/shared/augments';

// Đo cùng công kích, không chí mạng/hỗ trợ/trang bị/linh thú; không thay phép đo chiến dịch mục 5.
const seconds = 24,
  hp = 1e9;
const patterns = {
  single: [{ x: 3, y: 0 }],
  far: [{ x: 6, y: 0 }],
  cluster: Array.from({ length: 12 }, (_, i) => ({
    x: 2 + (i % 4) * 0.7,
    y: (Math.floor(i / 4) - 1) * 0.7,
  })),
  spread: Array.from({ length: 10 }, (_, i) => ({
    x: Math.cos((i * Math.PI * 2) / 10) * (i % 2 ? 5 : 3),
    y: Math.sin((i * Math.PI * 2) / 10) * (i % 2 ? 5 : 3),
  })),
  swarm: Array.from({ length: 20 }, (_, i) => ({
    x: Math.cos((i * Math.PI * 2) / 10) * (i < 10 ? 3 : 5),
    y: Math.sin((i * Math.PI * 2) / 10) * (i < 10 ? 3 : 5),
  })),
};
const rows = [];
for (const skill of Object.keys(awakenings)) {
  const variants: (AugmentId | null)[] = [
    null,
    ...Object.values(augments)
      .filter((a) => a.skill === skill)
      .map((a) => a.id),
  ];
  for (const augment of variants)
    for (const [pattern, points] of Object.entries(patterns)) {
      const damage: number[] = [];
      for (const rank of [5, 6]) {
        const profile = newProfile();
        profile.activePet = null;
        profile.equipped.weapon = skill === 'nguyen-khi-tram' ? 'thiet-kiem' : 'dong-quyen-sao';
        const run = new RunEngine(profile, [], 72, {
          ...stage,
          id: 'qa-balance',
          maxEnemies: 0,
          duration: 10000,
          elites: [],
          eliteTimes: [],
        });
        run.skills = { [skill]: rank };
        run.stats.damage = 100;
        run.stats.crit = 0;
        run.stats.haste = 0;
        run.augments = augment ? [augment] : [];
        if (!['cuong-quyen', 'nguyen-khi-tram'].includes(skill)) {
          run.playerAttack = 1;
          run.playerAttackDuration = 10000;
        }
        run.enemies = points.map(
          (point, i): EnemyState => ({
            ...point,
            id: i + 1,
            type: stage.bossId,
            hp,
            maxHp: hp,
            radius: 0.2,
            speed: 0,
            damage: 0,
            facing: 'W',
            combo: 0,
            attack: 0,
            attackTime: 0,
            attackDuration: 0.8,
            impactAt: 0.4,
            impacted: false,
            cooldown: 10000,
            target: { x: 0, y: 0 },
            dead: false,
            deathTime: 0,
            hitTime: 0,
          }),
        );
        for (let i = 0; i < seconds * 120; i++) {
          run.tick(1 / 120, { x: 0, y: 0 });
          run.sounds = [];
        }
        damage.push(run.enemies.reduce((sum, enemy) => sum + hp - enemy.hp, 0));
      }
      rows.push({
        skill,
        augment: augment ?? 'base',
        pattern,
        rank5Dps: +(damage[0] / seconds).toFixed(2),
        rank6Dps: +(damage[1] / seconds).toFixed(2),
        ratio: damage[0] ? +(damage[1] / damage[0]).toFixed(3) : null,
      });
    }
}
const report = {
  seconds,
  damage: 100,
  crit: 0,
  haste: 0,
  seed: 72,
  patterns,
  note: 'Mục tiêu bất động, HP vô hạn thực tế, không hỗ trợ/pet/meta. Vòng lửa chỉ đánh nhóm ở bán kính thực. Đo vai trò kỹ năng; cân bằng hành trình thuộc mục 5.',
  rows,
};
for (const row of rows)
  assert.ok(row.ratio === null || row.ratio >= 1.5, `Thức tỉnh yếu đi: ${JSON.stringify(row)}`);
writeFileSync(
  new URL('./awakening-balance-report.json', import.meta.url),
  JSON.stringify(report, null, 2) + '\n',
);
console.table(rows);
