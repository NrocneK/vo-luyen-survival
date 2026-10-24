import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { startingSkill } from '../src/domain/profile.ts';
import type { Profile } from '../src/shared/models';
import type { Point, CircleObstacle } from '../src/shared/types';
import { stage } from '../src/data/stages.ts';
import type { StageDef } from '../src/data/stages.ts';
import { enemies } from '../src/data/enemies.ts';

export function playFullRun(
  profile: Profile,
  obstacles: CircleObstacle[],
  seed: number,
  selected: StageDef = stage,
) {
  const run = new RunEngine(profile, obstacles, seed, selected);
  let stalled = 0,
    last = { ...run.position },
    peakEnemies = 0;
  const bossAttacks = new Set<number>(),
    elitesSeen = new Set<string>();
  for (let i = 0; i < 16000 && !run.result; i++) {
    if (run.mode === 'levelup') {
      const priority = (id: string) =>
        id.startsWith('awaken')
          ? 100
          : id === `skill:${startingSkill(profile)}`
            ? 90
            : id === 'skill:cuong-the'
              ? 75
              : id.startsWith('skill:')
                ? 70
                : id === 'stat:damage'
                  ? 60
                  : id === 'stat:regen'
                    ? 50
                    : id === 'stat:armor'
                      ? 45
                      : 10;
      run.choose([...run.choices].sort((a, b) => priority(b.id) - priority(a.id))[0].id);
    }
    if (run.hp < run.view().maxHp * 0.4) run.potion();
    const alive = run.enemies.filter((enemy) => !enemy.dead);
    peakEnemies = Math.max(peakEnemies, alive.length);
    for (const enemy of alive) {
      if (enemies[enemy.type].elite && enemies[enemy.type].behavior !== 'boss')
        elitesSeen.add(enemy.type);
      if (enemy.type === selected.bossId && enemy.attack) bossAttacks.add(enemy.attack);
    }
    let target: Point = { x: Math.sin(run.time * 0.07) * 5, y: Math.cos(run.time * 0.07) * 5 };
    const near = alive.filter(
      (enemy) => Math.hypot(enemy.x - run.position.x, enemy.y - run.position.y) < 1.3,
    );
    const loot = [...run.drops].sort(
      (a, b) =>
        Math.hypot(a.x - run.position.x, a.y - run.position.y) -
        Math.hypot(b.x - run.position.x, b.y - run.position.y),
    )[0];
    if (loot && near.length < 2) target = loot;
    if (near.length) {
      const mean = {
        x: near.reduce((sum, enemy) => sum + enemy.x, 0) / near.length,
        y: near.reduce((sum, enemy) => sum + enemy.y, 0) / near.length,
      };
      target = {
        x: run.position.x + (run.position.x - mean.x) * 2,
        y: run.position.y + (run.position.y - mean.y) * 2,
      };
    }
    let dx = target.x - run.position.x,
      dy = target.y - run.position.y;
    if (stalled > 10) {
      dx = Math.sin(run.time);
      dy = Math.cos(run.time);
    }
    const length = Math.hypot(dx, dy) || 1;
    if (near.length > 2) run.dash();
    run.tick(0.1, { x: dx / length, y: dy / length });
    stalled =
      Math.hypot(run.position.x - last.x, run.position.y - last.y) < 0.005 ? stalled + 1 : 0;
    last = { ...run.position };
  }
  return { run, peakEnemies, bossAttacks: [...bossAttacks].sort(), elitesSeen: [...elitesSeen] };
}
