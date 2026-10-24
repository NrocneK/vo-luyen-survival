import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { enemies } from '../src/data/enemies.ts';
import { stages } from '../src/data/stages.ts';
import { newProfile } from '../src/domain/profile.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import type { EnemyState } from '../src/shared/models';

const still = { x: 0, y: 0 };
const humanoid = (actor: string) => actor.includes('trung-do');

test('Đoạt Đích và Hạo Kiếp dùng đủ cận chiến, xung kích, pháp tu; tinh anh/boss/viện binh đều hình người', () => {
  for (const selected of stages.slice(4)) {
    const normalIds = new Set(selected.spawnWaves.flatMap((wave) => Object.keys(wave.weights)));
    assert.deepEqual(
      new Set([...normalIds].map((id) => enemies[id].behavior)),
      new Set(['melee', 'charge', 'ranged']),
    );
    assert.ok(new Set([...normalIds].map((id) => enemies[id].actor)).size >= 3);
    const ids = [
      ...normalIds,
      ...selected.elites.map((elite) => elite.id),
      selected.bossId,
      ...enemies[selected.bossId].summons!,
    ];
    for (const id of ids) {
      assert.ok(enemies[id], `Thiếu dữ liệu ${id}`);
      assert.ok(humanoid(enemies[id].actor), `${selected.id}: ${id} còn dùng tạo hình thú`);
    }
    for (const wave of selected.spawnWaves)
      assert.ok(Object.values(wave.weights).every((weight) => weight > 0));
  }
  assert.notEqual(enemies['kiem-tran-ho-ve'].actor, 'duong-khai-kiem');
  assert.notEqual(enemies['kiem-tran-ho-ve'].actor, enemies['hac-trieu-thong-linh'].actor);
});

function unit(type: string): EnemyState {
  const definition = enemies[type];
  return {
    id: 501,
    type,
    x: 3,
    y: 0,
    hp: 1e9,
    maxHp: 1e9,
    damage: 0,
    speed: 0,
    radius: definition.radius,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0,
    impactAt: 0,
    impacted: false,
    cooldown: 0,
    target: { ...still },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}

test('Pháp tu bắn đúng pháp thuật theo phe; thống lĩnh triệu hồi quân Hắc Triều thay thú', () => {
  for (const id of ['phap-tu-trung-do', 'ma-tu', 'ta-tu-doc-coc', 'diem-linh']) {
    const selected = { ...stages[4], duration: 10000, maxEnemies: 0, eliteTimes: [], elites: [] };
    const run = new RunEngine(newProfile(), [], 73, selected);
    run.enemies = [unit(id)];
    run.invulnerability = 99;
    for (let step = 0; step < 90 && !run.projectiles.some((shot) => shot.enemy); step++)
      run.tick(1 / 60, still);
    const projectile = run.projectiles.find((shot) => shot.enemy);
    assert.ok(projectile, `${id}: không xuất chiêu`);
    assert.equal(projectile.effect, enemies[id].projectileEffect);
  }
  const selected = { ...stages[5], duration: 10000, maxEnemies: 0, eliteTimes: [], elites: [] };
  const run = new RunEngine(newProfile(), [], 19, selected);
  // Cô lập đòn triệu hồi; không lẫn quân tiếp viện thường của giai đoạn boss trong cùng phép đo.
  const boss = { ...unit(selected.bossId), combo: 3, x: 2, y: 0 };
  run.enemies = [boss];
  run.invulnerability = 99;
  for (let step = 0; step < 120 && run.enemies.length < 3; step++) run.tick(1 / 60, still);
  const summons = run.enemies.filter((enemy) => enemy.id !== boss.id);
  assert.equal(summons.length, 2);
  assert.ok(summons.every((enemy) => enemies[selected.bossId].summons!.includes(enemy.type)));
});

test('Sáu actor hình người có atlas riêng đủ tám hướng và ba clip đòn, hash khớp nguồn runtime', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../public/assets/v5/enemy-manifest.json', import.meta.url), 'utf8'),
  );
  assert.equal(manifest.status, 'validated');
  assert.equal(manifest.actors.length, 6);
  const atlasHashes = new Set<string>();
  for (const actor of manifest.actors) {
    const atlas = readFileSync(new URL(`../public/${actor.atlas}`, import.meta.url));
    const metadata = readFileSync(new URL(`../public/${actor.atlasData}`, import.meta.url));
    assert.equal(createHash('sha256').update(atlas).digest('hex'), actor.sha256);
    assert.equal(createHash('sha256').update(metadata).digest('hex'), actor.atlasDataSha256);
    atlasHashes.add(actor.sha256);
    const frames = JSON.parse(metadata.toString()).frames;
    assert.equal(Object.keys(frames).length, 544);
    for (const direction of ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']) {
      assert.equal(actor.animations[`walk-${direction}`].frames.length, 12);
      for (let attack = 1; attack <= 3; attack++)
        assert.equal(actor.animations[`attack-${attack}-${direction}`].frames.length, 14);
      for (const state of ['idle', 'death']) assert.ok(actor.animations[`${state}-${direction}`]);
    }
    assert.ok(actor.origin[1] > 0.5 && actor.origin[1] < 0.9);
    assert.ok(actor.camera.orthoScale > 0);
  }
  assert.equal(atlasHashes.size, 6);
});
