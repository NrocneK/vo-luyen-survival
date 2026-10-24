import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stages,
  stage,
  layoutForStage,
  projectionForStage,
  trailsForStage,
} from '../src/data/stages.ts';
import type { StageDef } from '../src/data/stages.ts';
import { enemies } from '../src/data/enemies.ts';
import { eligibleCards } from '../src/data/skills.ts';
import { newProfile } from '../src/domain/profile.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import type { EnemyState } from '../src/shared/models';

const still = { x: 0, y: 0 };
function quietStage(selected: StageDef = stage): StageDef {
  return { ...selected, duration: 10000, maxEnemies: 0, eliteTimes: [], elites: [] };
}
function target(id: number, x: number, y: number): EnemyState {
  return {
    id,
    x,
    y,
    type: 'hac-lang',
    hp: 10000,
    maxHp: 10000,
    radius: 0.32,
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
function bossRun(selected: StageDef, attack: number) {
  const selectedQuiet = { ...quietStage(selected), duration: 0.01 };
  const profile = newProfile();
  profile.realm = selected.requiredRealm;
  const run = new RunEngine(profile, [], 314, selectedQuiet);
  run.tick(0.02, still);
  const boss = run.enemies.find((unit) => unit.type === selected.bossId)!;
  boss.x = 0;
  boss.y = 0;
  boss.combo = attack - 1;
  boss.cooldown = 0;
  run.position = { x: 2, y: 0 };
  run.projectiles = [];
  run.visuals = [];
  run.hp = run.view().maxHp * 0.75;
  run.tick(1 / 60, still);
  assert.equal(boss.attack, attack);
  return { run, boss };
}
function impact(run: RunEngine, boss: EnemyState) {
  for (let i = 0; i < 120 && !boss.impacted; i++) run.tick(1 / 60, still);
  assert.equal(boss.impacted, true);
}

test('Sáu màn có cổng, boss, làn quái và phép chiếu nhất quán; giữ sân giữa thoáng', () => {
  assert.equal(stages.length, 6);
  assert.deepEqual(
    stages.map((item) => item.requiredRealm),
    [0, 10, 19, 28, 37, 43],
  );
  for (const [index, selected] of stages.entries()) {
    assert.equal(selected.prerequisite, index ? stages[index - 1].id : null);
    assert.ok(enemies[selected.bossId]);
    assert.equal(enemies[selected.bossId].behavior, 'boss');
    assert.equal(selected.elites.length, 2);
    assert.deepEqual(
      selected.eliteTimes,
      selected.elites.map((elite) => elite.at),
    );
    for (const wave of selected.spawnWaves)
      for (const id of Object.keys(wave.weights)) assert.ok(enemies[id]);
    const layout = layoutForStage(selected),
      projection = projectionForStage(selected);
    assert.equal(layout.worldBounds, selected.bounds);
    assert.equal(projection.pixelsPerUnit, layout.pixelsPerWorldUnit);
    assert.ok(layout.props.filter((prop) => prop.collision).length <= 2);
    assert.ok(
      layout.props.filter((prop) => prop.collision).every((prop) => Math.hypot(...prop.world) > 20),
    );
    assert.ok(trailsForStage(selected).length >= 2);
  }
});

test('Mỗi boss thực hiện đủ bốn đòn với cơ chế riêng; lao tới đúng tâm vùng cảnh báo', () => {
  const signatures = new Set<string>();
  for (const selected of stages) {
    const parts: string[] = [];
    for (let attack = 1; attack <= 4; attack++) {
      const { run, boss } = bossRun(selected, attack);
      run.invulnerability = 99;
      const warning = run.visuals.find((effect) => effect.kind === 'warning');
      impact(run, boss);
      const bullets = run.projectiles.filter((bullet) => bullet.enemy);
      parts.push(
        `${warning ? `${warning.x.toFixed(1)},${warning.y.toFixed(1)},${warning.radius}` : 'projectile'}:${bullets.length}:${run.enemies.length}`,
      );
      if (attack === 3 && enemies[selected.bossId].pattern !== 'poison') {
        assert.ok(warning);
        assert.ok(Math.hypot(boss.x - warning.x, boss.y - warning.y) < 1e-8);
      }
      if (!warning) assert.ok(bullets.length > 0);
    }
    signatures.add(parts.join('|'));
  }
  assert.equal(signatures.size, 6);
});

test('Ra khỏi vòng đỏ tránh được sát thương; đòn tại vị trí mục tiêu không chạy theo người chơi', () => {
  for (const [selected, attack] of [
    [stages[0], 1],
    [stages[1], 2],
    [stages[2], 2],
    [stages[3], 2],
  ] as const) {
    const { run, boss } = bossRun(selected, attack);
    const warning = run.visuals.find((effect) => effect.kind === 'warning')!;
    const center = { x: warning.x, y: warning.y };
    run.position = { x: center.x + warning.radius + 0.05, y: center.y };
    const hp = run.hp;
    impact(run, boss);
    assert.ok(run.hp >= hp, `${selected.id}: ngoài cảnh báo vẫn bị trừ máu`);
    const inside = bossRun(selected, attack);
    const zone = inside.run.visuals.find((effect) => effect.kind === 'warning')!;
    inside.run.position = { x: zone.x, y: zone.y };
    const before = inside.run.hp;
    impact(inside.run, inside.boss);
    assert.ok(inside.run.hp < before, `${selected.id}: trong cảnh báo không bị sát thương`);
  }
});

test('Viêm Hoàn đánh nhiều mục tiêu gần, Lôi Liên truyền qua mục tiêu và thức tỉnh cần đúng hỗ trợ', () => {
  for (const skill of ['viem-hoan', 'loi-lien']) {
    const profile = newProfile();
    profile.realm = 37;
    const run = new RunEngine(profile, [], 71, quietStage());
    for (let i = 0; i < 25; i++) run.tick(0.1, still);
    run.enemies =
      skill === 'viem-hoan'
        ? [target(100, 1, 0), target(101, -1, 0), target(102, 9, 0)]
        : [target(100, 2, 0), target(101, 5, 0), target(102, 8, 0)];
    run.skills[skill] = 5;
    run.tick(0.1, still);
    assert.ok(run.enemies[0].hp < 10000);
    assert.ok(run.enemies[1].hp < 10000);
    assert.equal(run.enemies[2].hp < 10000, skill === 'loi-lien');
    const support = skill === 'viem-hoan' ? 'hoa-linh' : 'loi-tam';
    assert.equal(
      eligibleCards([skill, support], { [skill]: 5 }).some((card) => card.kind === 'awaken'),
      false,
    );
    assert.ok(
      eligibleCards([skill, support], { [skill]: 5, [support]: 1 }).some(
        (card) => card.id === `awaken:${skill}`,
      ),
    );
  }
});

test('Khinh Thân tăng tốc chạy, giảm hồi lướt; hỗ trợ mới thay đổi thuộc tính trong lượt', () => {
  const profile = newProfile();
  profile.realm = 37;
  const normal = new RunEngine(profile, [], 8, quietStage()),
    buffed = new RunEngine(profile, [], 8, quietStage());
  buffed.skills['khinh-than'] = 5;
  buffed.skills['hoa-linh'] = 5;
  buffed.skills['loi-tam'] = 5;
  for (let i = 0; i < 10; i++) {
    normal.tick(0.1, { x: 1, y: 0 });
    buffed.tick(0.1, { x: 1, y: 0 });
  }
  assert.ok(buffed.position.x > normal.position.x + 0.5);
  normal.dash();
  buffed.dash();
  assert.ok(buffed.dashCooldown < normal.dashCooldown);
  assert.ok(buffed.invulnerability > normal.invulnerability);
  assert.deepEqual(profile, normal.profile);
});

test('Thắng màn tự thu tài nguyên trên sân, nhận đúng thưởng màn và đóng kết quả một lần', () => {
  const selected = stages[3],
    { run, boss } = bossRun(selected, 1);
  run.drops.push(
    { id: 500, x: 30, y: 30, kind: 'stone', value: 27 },
    { id: 501, x: 30, y: 30, kind: 'linh-thao', value: 9 },
  );
  boss.hp = 0.01;
  run.position = { x: 1, y: 0 };
  run.skills['viem-hoan'] = 6;
  for (let i = 0; i < 40 && !run.result; i++) {
    run.invulnerability = 10;
    run.tick(0.1, still);
  }
  assert.equal(run.result?.won, true);
  assert.equal(run.result?.stageId, selected.id);
  assert.ok(run.result!.rewards.stone >= selected.rewards.stone + 27);
  assert.ok(run.result!.rewards.resources['linh-thao']! >= 9);
  assert.equal(run.result!.rewards.resources['hat-sen-dot-pha'], 1);
  const result = structuredClone(run.result);
  run.tick(1, still);
  run.abandon();
  assert.deepEqual(run.result, result);
});

test('Thẻ chỉ số cuối thế giới tăng đúng lượng mô tả và loại thẻ đã chạm trần', () => {
  for (const [stat, expected] of [
    ['damage', 12],
    ['hp', 60],
    ['armor', 4],
    ['regen', 1],
  ] as const) {
    let checked = false;
    for (let seed = 1; seed <= 50 && !checked; seed++) {
      const profile = newProfile();
      profile.realm = 43;
      profile.selectedSkills = [];
      const run = new RunEngine(profile, [], seed, quietStage(stages[5]));
      run.skills['cuong-quyen'] = 6;
      run.xp = run.nextXp;
      run.tick(0.01, still);
      const card = run.choices.find((card) => card.stat === stat);
      if (!card) continue;
      assert.ok(card.description.startsWith(`+${expected} `));
      assert.equal(run.choose(card.id), true);
      assert.equal(run.bonus[stat], expected);
      checked = true;
    }
    assert.ok(checked, `Không tìm thấy thẻ ${stat}`);
  }
  for (let seed = 1; seed <= 12; seed++) {
    const run = new RunEngine(newProfile(), [], seed, quietStage(stages[5]));
    run.bonus.crit = 1;
    run.bonus.haste = 3;
    run.bonus.speed = 4;
    run.xp = run.nextXp;
    run.tick(0.01, still);
    assert.ok(run.choices.every((card) => !['crit', 'haste', 'speed'].includes(card.stat ?? '')));
    assert.equal(run.choices.length, 3);
  }
});
