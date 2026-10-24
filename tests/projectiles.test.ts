import test from 'node:test';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage } from '../src/data/stages.ts';
import { pierceForRank, projectileOutsideBounds, sweptCircleHit } from '../src/data/projectiles.ts';
import type { EnemyState, Projectile } from '../src/shared/models';

const still = { x: 0, y: 0 };
function runForTest() {
  const run = new RunEngine(newProfile(), [], 72, {
    ...stage,
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  run.position = { x: -15, y: 20 };
  run.stats.crit = 0;
  return run;
}
function target(id: number, x: number, y = 0): EnemyState {
  return {
    id,
    x,
    y,
    type: 'hac-lang',
    hp: 1000,
    maxHp: 1000,
    radius: 0.2,
    speed: 0,
    damage: 10,
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
function projectile(rank = 1, override: Partial<Projectile> = {}): Projectile {
  return {
    id: 9999,
    x: 0,
    y: 0,
    velocity: { x: 300, y: 0 },
    damage: 10,
    radius: 0.1,
    life: Infinity,
    enemy: false,
    effect: 'qi-punch',
    pierce: pierceForRank(rank),
    hits: [],
    rank,
    ...override,
  };
}

test('Bậc 1–5 trúng đúng 1–5 mục tiêu trực tiếp; bậc 6 xuyên không giới hạn', () => {
  for (let rank = 1; rank <= 6; rank++) {
    const run = runForTest();
    run.enemies = Array.from({ length: 8 }, (_, index) => target(index + 1, 2 + index * 2));
    const bullet = projectile(rank);
    run.projectiles = [bullet];
    run.tick(0.1, still);
    assert.equal(run.enemies.filter((enemy) => enemy.hp < 1000).length, rank === 6 ? 8 : rank);
    assert.equal(run.projectiles.length, rank === 6 ? 1 : 0);
    const hp = run.enemies.map((enemy) => enemy.hp);
    // Một mục tiêu không nhận lại damage khi vẫn giao nhau hoặc đường bay tiếp tục quét qua.
    bullet.velocity = { x: -300, y: 0 };
    run.tick(0.1, still);
    assert.deepEqual(
      run.enemies.map((enemy) => enemy.hp),
      hp,
    );
  }
});

test('Va chạm quét bắt được địch giữa hai frame và ưu tiên mục tiêu gần trước', () => {
  const run = runForTest();
  run.enemies = [target(30, 9), target(20, 6), target(10, 3)];
  run.projectiles = [projectile()];
  run.tick(1 / 30, still);
  assert.deepEqual(
    run.enemies.map((enemy) => enemy.hp),
    [1000, 1000, 990],
  );
  assert.equal(sweptCircleHit({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 3, y: 1 }, 0.2), null);
  assert.equal(sweptCircleHit(still, still, still, 0.2), 0);
});

test('Đạn phe ta tồn tại sau 1,5 giây, giữ đường bay và dọn khi ra khỏi ranh giới', () => {
  const run = runForTest();
  run.projectiles = [projectile(6, { velocity: { x: 4, y: 0 } })];
  for (let i = 0; i < 20; i++) run.tick(0.1, still);
  assert.equal(run.projectiles.length, 1);
  assert.ok(Math.abs(run.projectiles[0].x - 8) < 1e-8);
  assert.equal(run.projectiles[0].y, 0);
  assert.equal(run.projectiles[0].life, Infinity);
  for (let i = 0; i < 100 && run.projectiles.length; i++) run.tick(0.1, still);
  assert.equal(run.projectiles.length, 0);
  assert.equal(projectileOutsideBounds({ x: stage.bounds.maxX + 1, y: 0 }, stage.bounds), false);
  assert.equal(projectileOutsideBounds({ x: stage.bounds.maxX + 3, y: 0 }, stage.bounds), true);
  run.projectiles = [projectile(6)];
  run.abandon();
  assert.equal(run.projectiles.length, 0);
});

test('Đạn địch vẫn hết hạn sau ba giây và dùng va chạm quét với nhân vật', () => {
  const run = runForTest();
  run.projectiles = [projectile(1, { enemy: true, life: 3, velocity: { x: 1, y: 0 } })];
  for (let i = 0; i < 31; i++) run.tick(0.1, still);
  assert.equal(run.projectiles.length, 0);
  run.position = { x: 5, y: 0 };
  const hp = run.hp;
  run.projectiles = [projectile(1, { enemy: true, life: 3 })];
  run.tick(1 / 30, still);
  assert.ok(run.hp < hp);
  assert.equal(run.projectiles.length, 0);
});

test('Chưởng lửa chỉ nổ một lần, không trúng hai lần và trúng lan không tốn lượt xuyên', () => {
  const run = runForTest();
  run.enemies = [target(1, 3), target(2, 4, 0.5), target(3, 8), target(4, 8, 0.7)];
  const bullet = projectile(2, { effect: 'fire-palm', skillId: 'duong-viem-chuong' });
  run.projectiles = [bullet];
  run.tick(1 / 30, still);
  assert.equal(run.enemies[0].hp, 990);
  assert.equal(run.enemies[1].hp, 993.5);
  assert.equal(run.enemies[2].hp, 990);
  assert.equal(run.enemies[3].hp, 1000);
  assert.equal(
    run.visuals.filter((effect) => effect.kind === 'effect' && effect.effect === 'fire-palm')
      .length,
    1,
  );
  assert.equal(run.projectiles.length, 0);
});

test('Đạn thực tế của quyền/kiếm mang đúng bậc xuyên và âm thanh xuất đòn', () => {
  for (const sword of [false, true]) {
    for (let rank = 1; rank <= 6; rank++) {
      const profile = newProfile();
      if (sword) profile.equipped.weapon = 'thiet-kiem';
      const run = new RunEngine(profile, [], 72, {
        ...stage,
        duration: 10000,
        maxEnemies: 0,
        eliteTimes: [],
        elites: [],
      });
      const skillId = sword ? 'nguyen-khi-tram' : 'cuong-quyen';
      run.skills = { [skillId]: rank };
      run.enemies = [target(1, 6)];
      for (let i = 0; i < 4; i++) run.tick(0.1, still);
      assert.ok(run.projectiles.length > 0);
      assert.ok(
        run.projectiles.every(
          (bullet) =>
            bullet.rank === rank &&
            bullet.skillId === skillId &&
            bullet.pierce === pierceForRank(rank) &&
            bullet.life === Infinity,
        ),
      );
      assert.ok(run.sounds.includes(sword ? 'attack-sword' : 'attack-fist'));
    }
  }
});

test('Hệ số test nhân damage phe ta trước chí mạng, không đổi profile hay damage địch', () => {
  const run = runForTest();
  const before = structuredClone(run.profile);
  assert.equal(run.damageMultiplier, 1);
  run.setDamageMultiplier(10);
  run.enemies = [target(1, 3)];
  run.projectiles = [projectile()];
  run.tick(1 / 30, still);
  assert.equal(run.enemies[0].hp, 900);
  run.stats.crit = 1;
  run.enemies = [target(2, 3)];
  run.projectiles = [projectile()];
  run.tick(1 / 30, still);
  assert.equal(run.enemies[0].hp, 800);
  run.position = { x: 5, y: 0 };
  const hp = run.hp;
  run.projectiles = [projectile(1, { enemy: true, life: 3 })];
  run.tick(1 / 30, still);
  assert.equal(run.hp, hp - Math.max(1, 10 - run.stats.armor * 1.6));
  run.setDamageMultiplier(1000);
  assert.equal(run.damageMultiplier, 100);
  run.setDamageMultiplier(-5);
  assert.equal(run.damageMultiplier, 1);
  run.setDamageMultiplier(NaN);
  assert.equal(run.damageMultiplier, 1);
  assert.deepEqual(run.profile, before);
});

test('Linh thú nhận hệ số damage; linh vũ giữ đường bay và lượt xuyên theo bậc', () => {
  const damages: number[] = [];
  for (const multiplier of [1, 50]) {
    const profile = newProfile();
    profile.pets['linh-ho'] = { level: 1, evolved: false };
    profile.activePet = 'linh-ho';
    const before = structuredClone(profile);
    const run = new RunEngine(profile, [], 72, {
      ...stage,
      duration: 10000,
      maxEnemies: 0,
      elites: [],
      eliteTimes: [],
    });
    run.stats.crit = 0;
    run.petPosition = { x: 1, y: 0 };
    run.petAttack = 1;
    run.petAttackElapsed = 0.28;
    run.enemies = [target(1, 2)];
    run.setDamageMultiplier(multiplier);
    run.tick(1 / 30, still);
    damages.push(1000 - run.enemies[0].hp);
    assert.deepEqual(profile, before);
  }
  assert.ok(Math.abs(damages[1] - damages[0] * 50) < 1e-8);
  const run = runForTest();
  run.position = { x: 0, y: 0 };
  run.profile.pets['thanh-dieu'] = { level: 3, evolved: false };
  run.profile.activePet = 'thanh-dieu';
  run.petPosition = { x: 0, y: 0 };
  run.petAttack = 1;
  run.petAttackElapsed = 0.28;
  run.enemies = [target(1, 3)];
  run.tick(1 / 30, still);
  const feather = run.projectiles.find((bullet) => bullet.skillId === 'pet-thanh-dieu')!;
  assert.ok(feather);
  assert.equal(feather.life, Infinity);
  assert.equal(feather.rank, 3);
  assert.equal(feather.pierce, 2);
});

test('Các kỹ năng phụ và quái phát âm ở lúc xuất đòn', () => {
  const run = runForTest();
  for (let i = 0; i < 21; i++) run.tick(0.1, still);
  run.position = { x: 0, y: 0 };
  run.skills['duong-viem-chuong'] = 3;
  run.skills['viem-hoan'] = 3;
  run.skills['loi-lien'] = 3;
  run.enemies = [target(1, 1)];
  run.enemies[0].cooldown = 0;
  run.tick(1 / 30, still);
  assert.ok(run.sounds.includes('cast-fire'));
  assert.ok(run.sounds.includes('cast-chain-lightning'));
  const fire = run.projectiles.find((bullet) => bullet.skillId === 'duong-viem-chuong')!;
  assert.equal(fire.rank, 3);
  assert.equal(fire.pierce, 2);
  for (let i = 0; i < 15; i++) run.tick(1 / 30, still);
  assert.ok(run.sounds.includes('attack-monster'));
});
