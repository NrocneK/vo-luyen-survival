import test from 'node:test';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage } from '../src/data/stages.ts';
import {
  flameRingRadius,
  flameRingDamagePerSecond,
  skillEffectTiming,
} from '../src/data/skillEffects.ts';
import type { EnemyState } from '../src/shared/models';

const still = { x: 0, y: 0 };
function target(id: number, x: number, y: number, type = 'hac-lang'): EnemyState {
  return {
    id,
    x,
    y,
    type,
    hp: 1000,
    maxHp: 1000,
    radius: 0.2,
    speed: 0,
    damage: 0,
    facing: 'S',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0,
    impactAt: 0,
    impacted: false,
    cooldown: 10000,
    target: { ...still },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}
function isolated() {
  const run = new RunEngine(newProfile(), [], 72, {
    ...stage,
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  run.stats.crit = 0;
  return run;
}
function advance(run: RunEngine, seconds: number) {
  for (let elapsed = 0; elapsed < seconds - 1e-7; elapsed += 1 / 30)
    run.tick(Math.min(1 / 30, seconds - elapsed), still);
}

test('Viêm Hoàn có bán kính hiển thị trùng vùng sát thương, kể cả bậc thức tỉnh', () => {
  for (const rank of [1, 3, 5, 6]) {
    const run = isolated();
    advance(run, 2.1);
    run.skills = { 'viem-hoan': rank };
    const radius = flameRingRadius(rank);
    run.enemies = [target(1, radius + 0.19, 0), target(2, radius + 0.21, 0)];
    run.tick(1 / 30, still);
    const ring = run.visuals.find((event) => event.kind === 'ring')!;
    assert.ok(ring);
    assert.equal(ring.effect, 'heat-wave');
    assert.equal(ring.radius, radius);
    assert.equal(ring.total, skillEffectTiming.flameRing);
    assert.equal(ring.awakened, rank === 6);
    assert.equal(ring.followPlayer, true);
    assert.ok(run.enemies[0].hp < 1000);
    assert.equal(run.enemies[1].hp, 1000);
    assert.ok(run.sounds.includes('cast-flame-ring'));
  }
});

test('Viêm Hoàn lớn dần đủ sáu bậc, đốt ngay và mất HP mỗi frame dù chưa tới sóng nhiệt kế tiếp', () => {
  const radii = Array.from({ length: 6 }, (_, index) => flameRingRadius(index + 1));
  for (let index = 1; index < radii.length; index++) assert.ok(radii[index] > radii[index - 1]);
  const run = isolated();
  run.skills = { 'viem-hoan': 2 };
  run.playerAttack = 1;
  run.playerAttackDuration = 10000;
  run.stats.damage = 100;
  run.enemies = [target(1, 1, 0), target(2, 5, 0)];
  for (let frame = 0; frame < 20; frame++) {
    const before = run.enemies[0].hp;
    run.tick(0.01, still);
    assert.ok(run.enemies[0].hp < before);
  }
  assert.ok(Math.abs(run.enemies[0].hp - (1000 - 100 * flameRingDamagePerSecond(2) * 0.2)) < 1e-7);
  assert.equal(run.enemies[1].hp, 1000);
  assert.equal(run.visuals.filter((event) => event.kind === 'ring').length, 1);
  run.enemies[0].x = 5;
  const hp = run.enemies[0].hp;
  advance(run, 0.2);
  assert.equal(run.enemies[0].hp, hp);
  run.enemies[0].x = 1;
  run.tick(0.01, still);
  assert.ok(run.enemies[0].hp < hp);
});

test('DPS Viêm Hoàn không lệ thuộc FPS, kể cả chí mạng, và dừng khi pause/chọn thẻ', () => {
  const results: number[] = [];
  for (const step of [1 / 30, 1 / 60, 1 / 120]) {
    const run = isolated();
    run.skills = { 'viem-hoan': 3 };
    run.stats.crit = 0.35;
    run.playerAttack = 1;
    run.playerAttackDuration = 10000;
    run.enemies = [target(1, 1, 0)];
    for (let left = 2.4; left > 1e-7; left -= step) run.tick(Math.min(left, step), still);
    results.push(run.enemies[0].hp);
    run.pause();
    const state = JSON.stringify(run.view()),
      hp = run.enemies[0].hp,
      wave = run.visuals.find((event) => event.kind === 'ring')!.life;
    run.tick(0.1, still);
    assert.equal(run.enemies[0].hp, hp);
    assert.equal(JSON.stringify(run.view()), state);
    assert.equal(run.visuals.find((event) => event.kind === 'ring')!.life, wave);
    run.resume();
    run.xp = run.nextXp;
    run.tick(0.01, still);
    const levelHp = run.enemies[0].hp;
    run.tick(0.1, still);
    assert.equal(run.enemies[0].hp, levelHp);
  }
  assert.ok(results.every((hp) => Math.abs(hp - results[0]) < 1e-7));
});

test('Viêm Hoàn tăng DPS theo tốc đánh; sóng nhiệt vẫn chạy đủ thời gian thực ở x8', () => {
  const run = isolated();
  run.skills = { 'viem-hoan': 2 };
  run.stats.haste = 0.5;
  run.playerAttack = 1;
  run.playerAttackDuration = 10000;
  run.enemies = [target(1, 1, 0)];
  run.setPresentationTimeScale(8);
  advance(run, 0.8);
  assert.ok(
    Math.abs(
      run.enemies[0].hp - (1000 - run.stats.damage * flameRingDamagePerSecond(2) * 1.5 * 0.8),
    ) < 1e-7,
  );
  assert.equal(run.visuals.filter((event) => event.kind === 'ring').length, 1);
  assert.ok(
    Math.abs(run.visuals.find((event) => event.kind === 'ring')!.life - (1.2 - 0.8 / 8)) < 1e-7,
  );
});

test('Lôi Liên nối đúng điểm phát và từng mục tiêu, không lặp hoặc nối quá tầm', () => {
  const run = isolated();
  advance(run, 1.6);
  run.skills = { 'loi-lien': 1 };
  run.enemies = [target(1, 2, 0), target(2, 4, 0), target(3, 7, 0), target(4, 15, 0)];
  run.tick(1 / 30, still);
  const bolt = run.visuals.find((event) => event.kind === 'lightning')!;
  assert.equal(bolt.effect, 'chain-lightning');
  assert.deepEqual(bolt.points, [still, { x: 2, y: 0 }, { x: 4, y: 0 }, { x: 7, y: 0 }]);
  assert.equal(bolt.total, skillEffectTiming.chainLightning);
  assert.equal(bolt.awakened, false);
  assert.ok(run.enemies.slice(0, 3).every((enemy) => enemy.hp < 1000));
  assert.equal(run.enemies[3].hp, 1000);
  assert.ok(run.sounds.includes('cast-chain-lightning'));
});

test('Lôi Liên thức tỉnh đánh mười mục tiêu và đường nối lưu tọa độ độc lập với enemy', () => {
  const run = isolated();
  advance(run, 1.6);
  run.skills = { 'loi-lien': 6 };
  run.enemies = Array.from({ length: 11 }, (_, index) => target(index + 1, 1 + index * 1.5, 0));
  run.tick(1 / 30, still);
  const bolt = run.visuals.find((event) => event.kind === 'lightning')!;
  assert.equal(bolt.points!.length, 11);
  assert.equal(bolt.awakened, true);
  assert.equal(run.enemies.filter((enemy) => enemy.hp < 1000).length, 10);
  run.enemies[0].x = 30;
  assert.equal(bolt.points![1].x, 1);
});

test('Hiệu ứng vẫn tồn tại khi damage x100 kết liễu boss và chốt kết quả', () => {
  for (const skill of ['viem-hoan', 'loi-lien']) {
    const run = isolated();
    advance(run, 2.1);
    run.skills = { [skill]: 6 };
    run.setDamageMultiplier(100);
    run.enemies = [target(1, 1, 0, stage.bossId)];
    run.enemies[0].hp = 1;
    run.tick(1 / 30, still);
    assert.equal(run.mode, 'result');
    assert.equal(run.result?.won, true);
    const effect = run.visuals.find(
      (event) => event.kind === (skill === 'viem-hoan' ? 'ring' : 'lightning'),
    )!;
    assert.ok(effect);
    assert.equal(effect.life, effect.total);
    assert.deepEqual(run.projectiles, []);
  }
});

test('Tốc độ x8 giữ vòng lửa/tia sét đủ thời gian thực; cảnh báo vẫn theo mô phỏng', () => {
  const run = isolated();
  run.setPresentationTimeScale(8);
  run.visuals = [
    {
      ...still,
      id: 1,
      kind: 'lightning',
      effect: 'chain-lightning',
      points: [still, { x: 1, y: 0 }],
      radius: 0.1,
      life: 0.55,
      total: 0.55,
    },
    { ...still, id: 2, kind: 'warning', effect: 'warning', radius: 2, life: 0.55, total: 0.55 },
  ];
  advance(run, 0.6);
  assert.equal(run.visuals.length, 1);
  assert.equal(run.visuals[0].kind, 'lightning');
  assert.ok(Math.abs(run.visuals[0].life - (0.55 - 0.6 / 8)) < 1e-8);
});
