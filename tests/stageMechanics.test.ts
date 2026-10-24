import test from 'node:test';
import assert from 'node:assert/strict';
import { StageMechanics } from '../src/game/systems/StageMechanics.ts';
import type { MechanicContext, MechanicEvent } from '../src/game/systems/StageMechanics.ts';
import { stageMechanics, mechanicRules as rules } from '../src/data/stageMechanics.ts';
import { stages } from '../src/data/stages.ts';
import { RunEngine, seededRandom } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { insideStageZone, fireSegments } from '../src/game/math/stageZones.ts';
import type { EnemyState, Projectile } from '../src/shared/models';
import type { StageZone } from '../src/shared/stageMechanics';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import { outsideSpawnView } from '../src/game/math/spawnView.ts';
import { cameraFootprint } from '../src/game/math/cameraFootprint.ts';
import { projectionForStage } from '../src/data/stages.ts';

const still = { x: 0, y: 0 };
function setup(index: number, position = { ...still }) {
  const selected = stages[index];
  const mechanic = new StageMechanics(
    selected.id,
    selected.duration,
    selected.bounds,
    seededRandom(17),
  );
  const context: MechanicContext = {
    time: 0,
    position,
    radius: selected.playerRadius,
    enemies: [],
    obstacles: [],
  };
  const advance = (seconds: number, follow?: (zone: StageZone) => void) => {
    const events: MechanicEvent[] = [];
    for (let remaining = seconds; remaining > 1e-7; remaining -= 0.05) {
      const dt = Math.min(0.05, remaining);
      if (follow && mechanic.zones[0]) follow(mechanic.zones[0]);
      context.time += dt;
      events.push(...mechanic.tick(dt, context));
    }
    return events;
  };
  return { mechanic, context, advance };
}
function quiet(index: number) {
  return { ...stages[index], maxEnemies: 0, eliteTimes: [], elites: [] };
}
function unit(id: number, x: number, y = 0): EnemyState {
  return {
    id,
    type: 'hac-lang',
    x,
    y,
    hp: 100000,
    maxHp: 100000,
    radius: 0.3,
    speed: 1,
    damage: 0,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0.8,
    impactAt: 0.4,
    impacted: false,
    cooldown: 10000,
    target: { ...still },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}
function shot(enemy: EnemyState, id: number, hostile = false): Projectile {
  return {
    id,
    x: enemy.x,
    y: enemy.y,
    velocity: { ...still },
    damage: 100,
    radius: 0.1,
    life: hostile ? 3 : Infinity,
    enemy: hostile,
    effect: 'qi-punch',
    pierce: 0,
    hits: [],
  };
}

test('Sáu màn có sáu cơ chế riêng, có thời gian chuẩn bị và mô tả trước khi vào ải', () => {
  assert.equal(new Set(stages.map((stage) => stageMechanics[stage.id].kind)).size, 6);
  for (const stage of stages) {
    const def = stageMechanics[stage.id];
    assert.ok(def.start >= 20 && def.start < stage.duration);
    assert.ok(def.description.length > 50);
    if (['poison', 'fire', 'siege'].includes(def.kind)) assert.ok(def.warning >= 2);
  }
});

test('Thú triều báo trước rồi tăng tốc thực tế 25%, kết thúc trả tốc độ gốc', () => {
  const normal = new RunEngine(newProfile(), [], 9, quiet(0)),
    fast = new RunEngine(newProfile(), [], 9, quiet(0));
  for (const run of [normal, fast]) {
    run.stats.damage = 0;
    run.enemies = [unit(500, 5)];
  }
  normal.time = 10;
  fast.time = stageMechanics[stages[0].id].start - 0.01;
  fast.tick(0.02, still);
  assert.equal(fast.mechanics.phase, 'warning');
  assert.equal(fast.mechanics.enemySpeed, 1);
  fast.time = 38.1;
  const a = normal.enemies[0].x,
    b = fast.enemies[0].x;
  for (let step = 0; step < 10; step++) {
    normal.tick(0.1, still);
    fast.tick(0.1, still);
  }
  assert.ok(Math.abs((b - fast.enemies[0].x) / (a - normal.enemies[0].x) - rules.huntSpeed) < 1e-6);
  fast.time = 48.1;
  fast.tick(0.01, still);
  assert.equal(fast.mechanics.enemySpeed, 1);
});

test('Linh trận đòi hỏi đứng đủ ba giây, rời vòng làm giảm tiến độ, Linh hộ có hạn', () => {
  const { mechanic, context, advance } = setup(1);
  advance(24.05);
  const rune = mechanic.zones[0];
  assert.ok(rune && Math.hypot(rune.x, rune.y) <= 3.3);
  context.position = { x: rune.x, y: rune.y };
  advance(1);
  assert.ok(Math.abs(rune.charge - 1) < 1e-5);
  context.position = { x: 20, y: 20 };
  advance(1);
  assert.ok(Math.abs(rune.charge - 0.5) < 1e-5);
  context.position = { x: rune.x, y: rune.y };
  advance(2.5);
  assert.ok(mechanic.wardRemaining > 9.9);
  assert.equal(mechanic.view()?.phase, 'counter');
  advance(10.1);
  assert.equal(mechanic.wardRemaining, 0);
});

test('Linh hộ nhận từ trận giảm đúng sát thương, không thay đổi chỉ số hoặc profile vĩnh viễn', () => {
  const profile = newProfile(),
    before = structuredClone(profile);
  const run = new RunEngine(profile, [], 2, quiet(1));
  run.stats.regen = 0;
  run.stats.armor = 0;
  run.stats.hp = run.hp = 1000;
  run.time = 23.99;
  run.tick(0.02, still);
  const rune = run.mechanics.zones[0];
  run.position = { x: rune.x, y: rune.y };
  for (let i = 0; i < 31; i++) run.tick(0.1, still);
  assert.ok(run.mechanics.wardRemaining > 9);
  run.projectiles.push(shot(unit(900, run.position.x, run.position.y), 800, true));
  run.tick(0.01, still);
  assert.ok(Math.abs(run.hp - 930) < 1e-6);
  assert.deepEqual(profile, before);
  assert.equal(run.stats.armor, 0);
});

test('Độc chướng không gây hại khi còn báo trước; mây trôi và ra khỏi vùng thì an toàn', () => {
  const { mechanic, context, advance } = setup(2);
  const pre = advance(30.1);
  assert.ok(!pre.some((event) => event.type === 'damage'));
  const cloud = mechanic.zones[0],
    initial = { x: cloud.x, y: cloud.y };
  context.position = { ...initial };
  assert.ok(!advance(2).some((event) => event.type === 'damage'));
  const impact = advance(1, (zone) => {
    context.position = { x: zone.x, y: zone.y };
  });
  assert.ok(impact.some((event) => event.type === 'damage'));
  assert.ok(Math.hypot(cloud.x - initial.x, cloud.y - initial.y) > 0.2);
  context.position = { x: 25, y: 25 };
  assert.ok(!advance(1).some((event) => event.type === 'damage'));
  assert.equal(insideStageZone(cloud, initial, 0.21), true);
});

test('Khe hỏa triều khớp hình học đầu phẳng, đủ chỗ đứng và hoạt động ở mọi góc bản đồ', () => {
  for (const position of [
    still,
    { x: 31.5, y: 31.5 },
    { x: -31.5, y: -31.5 },
    { x: 31.5, y: -31.5 },
    { x: -31.5, y: 31.5 },
  ]) {
    const { mechanic, advance } = setup(3, { ...position });
    advance(32.05);
    const wall = mechanic.zones[0];
    assert.equal(fireSegments(wall).length, 2);
    const gap = {
      x: wall.x + wall.direction.x * wall.gapOffset,
      y: wall.y + wall.direction.y * wall.gapOffset,
    };
    assert.equal(insideStageZone(wall, gap, 0.21), false);
    const fire = {
      x: wall.x + wall.direction.x * (wall.gapOffset + wall.gapHalfWidth + 0.5),
      y: wall.y + wall.direction.y * (wall.gapOffset + wall.gapHalfWidth + 0.5),
    };
    assert.equal(insideStageZone(wall, fire, 0.21), true);
    const futureGap = {
      x: position.x + wall.direction.x * wall.gapOffset,
      y: position.y + wall.direction.y * wall.gapOffset,
    };
    assert.ok(futureGap.x >= -32 && futureGap.x <= 32 && futureGap.y >= -32 && futureGap.y <= 32);
  }
});

test('Hỏa triều báo trước đủ ba giây, dịch chuyển sau kích hoạt và không gây hại trong khe', () => {
  const { mechanic, context, advance } = setup(3);
  advance(32.05);
  const wall = mechanic.zones[0],
    initial = { x: wall.x, y: wall.y };
  context.position = { x: wall.x + wall.direction.x * 7, y: wall.y + wall.direction.y * 7 };
  assert.ok(!advance(2.8).some((event) => event.type === 'damage'));
  const hits = advance(1, (zone) => {
    context.position = { x: zone.x + zone.direction.x * 7, y: zone.y + zone.direction.y * 7 };
  });
  assert.ok(hits.some((event) => event.type === 'damage'));
  assert.ok(Math.hypot(wall.x - initial.x, wall.y - initial.y) > 0.5);
  assert.ok(
    !advance(1, (zone) => {
      context.position = {
        x: zone.x + zone.direction.x * zone.gapOffset,
        y: zone.y + zone.direction.y * zone.gapOffset,
      };
    }).some((event) => event.type === 'damage'),
  );
});

function squadRun(fullView = false) {
  const run = new RunEngine(newProfile(), [], 33, { ...stages[4], eliteTimes: [], elites: [] });
  run.stats.damage = 0;
  run.invulnerability = 999;
  if (fullView)
    run.setSpawnView({
      corners: [
        { x: -100, y: -100 },
        { x: 100, y: -100 },
        { x: 100, y: 100 },
        { x: -100, y: 100 },
      ],
    });
  run.time = 41.99;
  for (let step = 0; step < 32; step++) run.tick(0.1, still);
  return run;
}
test('Tổ đội sinh cùng một cánh, có đủ ba vai trò; phủ hết map thì báo trước tại biên', () => {
  for (const full of [false, true]) {
    const run = squadRun(full),
      leader = run.enemies.find((enemy) => enemy.commander)!;
    assert.ok(leader);
    const squad = run.enemies.filter((enemy) => enemy.squadId === leader.id);
    assert.equal(squad.length, 5);
    assert.equal(new Set(squad.map((enemy) => enemy.type)).size, 3);
    assert.ok(squad.every((enemy) => Math.hypot(enemy.x - leader.x, enemy.y - leader.y) < 3));
    if (full)
      for (const enemy of squad) {
        assert.ok(enemy.spawnGrace! > 0);
        assert.ok(
          Math.min(
            Math.abs(Math.abs(enemy.x) - 32 + enemy.radius),
            Math.abs(Math.abs(enemy.y) - 32 + enemy.radius),
          ) < 0.001,
        );
        assert.equal(
          outsideSpawnView(enemy, {
            corners: [
              { x: -100, y: -100 },
              { x: 100, y: -100 },
              { x: 100, y: 100 },
              { x: -100, y: 100 },
            ],
          }),
          false,
        );
      }
    assert.ok(run.enemies.length <= stages[4].maxEnemies + 3);
  }
});

test('Đội trưởng che chở đúng 35%; chết hoặc ra khỏi vòng thì đồng đội mất giảm sát thương', () => {
  const run = squadRun(),
    leader = run.enemies.find((enemy) => enemy.commander)!;
  const member = run.enemies.find((enemy) => enemy.squadId === leader.id && !enemy.commander)!;
  run.stats.crit = 0;
  for (const enemy of run.enemies) {
    enemy.speed = 0;
    enemy.x = 25;
    enemy.y = 25;
    enemy.cooldown = 999;
  }
  Object.assign(leader, { x: 3, y: 0 });
  Object.assign(member, { x: 2, y: 0 });
  const initial = member.hp;
  run.projectiles.push(shot(member, 8000));
  run.tick(0.01, still);
  assert.ok(Math.abs(member.hp - (initial - 65)) < 1e-6);
  member.x = 10;
  assert.equal(run.squadProtected(member), false);
  member.x = 2;
  leader.dead = true;
  const after = member.hp;
  run.projectiles.push(shot(member, 8001));
  run.tick(0.01, still);
  assert.ok(Math.abs(member.hp - (after - 100)) < 1e-6);
  assert.equal(run.mechanics.view()?.phase, 'counter');
});

test('Tổ đội vẫn tập trung một cánh ở camera 0,5 dù phần ngoài hình chỉ còn các mép hẹp', () => {
  const projection = projectionForStage(stages[4]);
  for (const [width, height] of [
    [1366, 768],
    [900, 900],
  ]) {
    for (let seed = 1; seed <= 8; seed++) {
      const run = new RunEngine(newProfile(), [], seed, {
        ...stages[4],
        eliteTimes: [],
        elites: [],
      });
      run.stats.damage = 0;
      run.invulnerability = 999;
      run.setSpawnView({
        corners: cameraFootprint(
          {
            scrollX: projection.origin.x - width / 2,
            scrollY: projection.origin.y - height / 2,
            width,
            height,
            zoom: 0.5,
          },
          projection,
        ),
        padding: 0.85,
      });
      run.time = 41.99;
      for (let step = 0; step < 32; step++) run.tick(0.1, still);
      const leader = run.enemies.find((enemy) => enemy.commander)!;
      assert.ok(leader);
      const squad = run.enemies.filter((enemy) => enemy.squadId === leader.id);
      assert.equal(squad.length, 5);
      assert.equal(new Set(squad.map((enemy) => `${enemy.x},${enemy.y}`)).size, 5);
      assert.ok(
        squad.every((enemy) => Math.hypot(enemy.x - leader.x, enemy.y - leader.y) < 3),
        `Tổ đội bị tách cánh ở seed ${seed}, ${width}×${height}`,
      );
    }
  }
});

test('Thông báo chuẩn bị hết đúng lúc hỏa triều hoạt động, tránh cảnh báo cũ đè lên pha mới', () => {
  const run = new RunEngine(newProfile(), [], 7, quiet(3));
  run.time = 31.99;
  run.tick(0.02, still);
  assert.equal(run.mechanics.phase, 'warning');
  assert.match(run.view().notice, /sắp quét/);
  for (let step = 0; step < 32; step++) run.tick(0.1, still);
  assert.equal(run.mechanics.phase, 'active');
  assert.equal(run.view().notice, '');
});

test('Hạo Kiếp luân phiên xung kích, hắc ấn khóa vị trí cũ, phản công tăng sát thương 30%', () => {
  const { mechanic, context, advance } = setup(5);
  advance(51.1);
  assert.equal(mechanic.enemySpeed, 1.15);
  advance(14);
  assert.ok(mechanic.zones.some((zone) => zone.kind === 'dark'));
  const stamp = mechanic.zones[0],
    locked = { x: stamp.x, y: stamp.y };
  context.position = { x: 10, y: 10 };
  assert.ok(!advance(2.6).some((event) => event.type === 'damage'));
  assert.deepEqual({ x: stamp.x, y: stamp.y }, locked);
  advance(12);
  assert.equal(mechanic.phase, 'counter');
  assert.equal(mechanic.enemyVulnerability, 1.3);
  assert.equal(mechanic.zones.length, 0);
  const run = new RunEngine(newProfile(), [], 6, quiet(5));
  run.stats.damage = run.stats.crit = 0;
  run.time = 79.1;
  const enemy = unit(700, 3);
  enemy.speed = 0;
  run.enemies = [enemy];
  run.projectiles.push(shot(enemy, 999));
  run.tick(0.01, still);
  assert.ok(Math.abs(enemy.hp - 99870) < 1e-6);
});

test('Lên cấp/tạm dừng giữ nguyên cơ chế; x8 đi đúng thời gian; boss và rút lui dọn hết zone/buff', () => {
  const run = new RunEngine(newProfile(), [], 5, quiet(2));
  run.time = 29.99;
  run.tick(0.02, still);
  const saved = structuredClone(run.mechanics.zones);
  run.pause();
  advanceSimulation(run, 0.1, 8, still);
  assert.deepEqual(run.mechanics.zones, saved);
  run.resume();
  run.xp = run.nextXp;
  run.tick(0.01, still);
  assert.equal(run.mode, 'levelup');
  const leveled = structuredClone(run.mechanics.zones);
  advanceSimulation(run, 0.1, 8, still);
  assert.deepEqual(run.mechanics.zones, leveled);
  run.choose(run.choices[0].id);
  run.invulnerability = 999;
  const time = run.time;
  for (let frame = 0; frame < 10; frame++) advanceSimulation(run, 0.1, 8, still);
  assert.ok(Math.abs(run.time - time - 8) < 1e-6);
  run.time = stages[2].duration - 0.01;
  run.tick(0.02, still);
  assert.equal(run.mechanics.zones.length, 0);
  assert.equal(run.view().mechanic, null);
  assert.equal(run.mechanics.enemySpeed, 1);
  run.abandon();
  assert.equal(run.mechanics.wardRemaining, 0);
  assert.equal(run.result?.won, false);
});
