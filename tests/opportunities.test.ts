import test from 'node:test';
import assert from 'node:assert/strict';
import { Opportunities } from '../src/game/systems/Opportunities.ts';
import { RunEngine, seededRandom } from '../src/game/systems/RunEngine.ts';
import { stages } from '../src/data/stages.ts';
import { enemies } from '../src/data/enemies.ts';
import { equipment } from '../src/data/equipment.ts';
import { opportunityRules as rules, opportunityStages } from '../src/data/opportunities.ts';
import { newProfile } from '../src/domain/profile.ts';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import type { OpportunityKind } from '../src/shared/opportunities';
import type { EnemyState, Projectile } from '../src/shared/models';

const still = { x: 0, y: 0 };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
function setup(kind: OpportunityKind, index = 0) {
  const stage = { ...stages[index], elites: [], eliteTimes: [] };
  for (let seed = 1; seed < 100; seed++) {
    const run = new RunEngine(newProfile(), [], seed, stage);
    if (run.opportunities.schedule[0].kind !== kind) continue;
    Reflect.set(run, 'spawnCooldown', Infinity);
    run.stats.damage = 0;
    run.stats.crit = 0;
    run.stats.regen = 0;
    run.stats.hp = run.hp = 100000;
    run.time = run.opportunities.schedule[0].at;
    run.tick(0.001, still);
    assert.equal(run.opportunities.active?.kind, kind);
    return run;
  }
  throw new Error('Không tìm được seed QA');
}
function travel(run: RunEngine) {
  const a = run.opportunities.active!;
  run.position = { x: a.x, y: a.y };
}
function choose(run: RunEngine) {
  while (run.mode === 'levelup')
    run.choose((run.choices.find((c) => c.kind === 'stat') ?? run.choices[0]).id);
}
function advance(run: RunEngine, seconds: number) {
  for (let left = seconds; left > 1e-7; left -= 0.025) {
    choose(run);
    run.tick(Math.min(left, 0.025), still);
  }
}
function killGuards(run: RunEngine) {
  for (const e of run.enemies.filter((e) => e.opportunityId !== undefined)) {
    e.speed = 0;
    e.spawnGrace = 0;
    run.projectiles.push({
      x: e.x,
      y: e.y,
      id: 90000 + e.id,
      velocity: still,
      damage: 1e9,
      radius: 1,
      life: Infinity,
      enemy: false,
      effect: 'qi-punch',
      pierce: 0,
      hits: [],
    } as Projectile);
  }
  advance(run, 0.1);
}

test('Sáu màn có bộ hộ vệ/tinh anh thật và phần thưởng hợp tiến trình, không đổi tên thú thành người', () => {
  for (const stage of stages) {
    const table = opportunityStages[stage.id];
    assert.ok(table);
    assert.equal(enemies[table.guard].elite, false);
    assert.equal(enemies[table.elite].elite, true);
    assert.notEqual(enemies[table.elite].behavior, 'boss');
    for (const id of [...table.equipment, ...table.blueprints]) assert.ok(equipment[id]);
    if (stage.stageIndex >= 4) assert.ok(['ho-ve-trung-do', 'ma-ve'].includes(table.guard));
  }
});
test('Bốn loại xuất hiện mỗi lượt, lịch/thứ tự/vị trí tái lập theo seed và đổi giữa các seed', () => {
  const snapshots = [];
  for (let seed = 1; seed <= 8; seed++) {
    const a = new Opportunities(stages[0], [], seededRandom(seed)),
      b = new Opportunities(stages[0], [], seededRandom(seed));
    assert.equal(new Set(a.schedule.map((e) => e.kind)).size, 4);
    assert.deepEqual(a.schedule, b.schedule);
    assert.ok(
      a.schedule.every(
        (e, i) =>
          e.at > 30 && e.at < stages[0].duration - 50 && (!i || e.at > a.schedule[i - 1].at),
      ),
    );
    const c = { time: a.schedule[0].at, position: still, enemies: [] };
    a.tick(0.01, c);
    b.tick(0.01, c);
    assert.deepEqual(a.active, b.active);
    snapshots.push(JSON.stringify(a.schedule));
  }
  assert.ok(new Set(snapshots).size > 4);
});
test('Bỏ qua cơ duyên không tiêu RNG chiến đấu/thẻ, không tự thưởng, không đổi Profile', () => {
  const run = setup('cache');
  const before = structuredClone(run.profile);
  const random = seededRandom(run.seed);
  close(run.random(), random());
  const raw = structuredClone(run.loot);
  advance(run, rules.offerDuration + 0.1);
  assert.equal(run.opportunities.active?.phase, 'expired');
  assert.equal(run.opportunities.missed, 1);
  assert.deepEqual(run.loot, raw);
  assert.deepEqual(run.profile, before);
});
test('Chỉ tương tác gần khi đang chơi; nhặt linh dược hồi thật, cộng XP/thưởng tạm giữ đúng một lần', () => {
  const run = setup('herb');
  const before = structuredClone(run.profile);
  assert.equal(run.interact(), false);
  travel(run);
  run.pause();
  assert.equal(run.interact(), false);
  run.resume();
  run.hp = 100;
  const reward = structuredClone(run.opportunities.active!.reward);
  assert.equal(run.interact(), true);
  close(run.hp, 25100);
  assert.equal(run.mode, 'levelup');
  assert.equal(run.loot.stone, reward.loot.stone);
  assert.equal(run.loot.resources['linh-thao'], 6);
  assert.equal(run.opportunities.completed, 1);
  assert.equal(run.interact(), false);
  choose(run);
  assert.equal(run.interact(), false);
  assert.deepEqual(run.profile, before);
});
test('Rương khóa tới khi hạ hết hộ vệ, không tự lấy thưởng; hộ vệ không sinh thêm loot tinh anh', () => {
  const run = setup('cache');
  travel(run);
  assert.equal(run.interact(), true);
  assert.equal(run.enemies.filter((e) => e.opportunityId !== undefined).length, 3);
  assert.ok(run.enemies.every((e) => e.spawnGrace === rules.telegraph));
  assert.equal(run.interact(), false);
  killGuards(run);
  assert.equal(run.opportunities.active!.phase, 'claimable');
  assert.equal(run.loot.stone, 0);
  assert.equal(run.loot.cultivation, 0);
  assert.equal(run.opportunities.completed, 0);
  assert.equal(run.interact(), true);
  assert.equal(run.opportunities.completed, 1);
  assert.ok(run.loot.stone > 0);
});
test('Tinh anh tùy chọn chỉ sinh sau chấp nhận, dùng đúng loại của từng màn và không nhân đôi thưởng', () => {
  for (let i = 0; i < 6; i++) {
    const run = setup('elite', i);
    assert.equal(run.enemies.length, 0);
    travel(run);
    run.interact();
    assert.equal(run.enemies.length, 1);
    assert.equal(run.enemies[0].type, opportunityStages[stages[i].id].elite);
    killGuards(run);
    assert.equal(run.loot.stone, 0);
    travel(run);
    assert.equal(run.interact(), true);
    assert.deepEqual(run.loot, run.opportunities.active!.reward.loot);
  }
});
test('Tụ linh cần giữ trận 12 giây; ra vòng giảm tiến độ, hạ hộ vệ không thay việc giữ trận', () => {
  const run = setup('trial');
  travel(run);
  run.interact();
  advance(run, 3);
  close(run.opportunities.active!.progress, 3);
  run.position = { x: 25, y: 25 };
  advance(run, 2);
  close(run.opportunities.active!.progress, 2);
  killGuards(run);
  assert.equal(run.opportunities.active!.phase, 'active');
  travel(run);
  advance(run, 10.1);
  assert.equal(run.opportunities.active!.phase, 'claimable');
  assert.equal(run.loot.stone, 0);
  assert.equal(run.interact(), true);
  assert.equal(run.opportunities.completed, 1);
});
test('Thất bại thử thách hoặc hết hạn nhận thưởng không cho quà và dọn hộ vệ/đạn/cảnh báo đúng chủ', () => {
  const run = setup('trial');
  travel(run);
  run.interact();
  const id = run.enemies[0].id;
  const bullet: Projectile = {
    x: 30,
    y: 30,
    id: 50000,
    velocity: still,
    damage: 1,
    radius: 0.1,
    life: Infinity,
    enemy: true,
    effect: 'poison-bolt',
    pierce: 0,
    hits: [],
    sourceEnemyId: id,
  };
  run.projectiles.push(bullet, { ...bullet, id: 50001, sourceEnemyId: 777777 });
  run.position = { x: 25, y: 25 };
  advance(run, 30.1);
  assert.equal(run.opportunities.active!.phase, 'expired');
  assert.equal(run.loot.stone, 0);
  assert.equal(run.enemies.filter((e) => e.opportunityId !== undefined).length, 0);
  assert.ok(!run.projectiles.some((p) => p.sourceEnemyId === id));
  assert.ok(run.projectiles.some((p) => p.sourceEnemyId === 777777));
  assert.ok(!run.visuals.some((v) => v.opportunityId !== undefined));
  const cache = setup('cache');
  travel(cache);
  cache.interact();
  killGuards(cache);
  advance(cache, 31);
  assert.equal(cache.opportunities.completed, 0);
  assert.equal(cache.loot.stone, 0);
});
test('Pause/chọn thẻ dừng đồng hồ; x1 và x8 giữ cùng thời gian tụ linh, damage và trạng thái', () => {
  const normal = setup('trial'),
    fast = setup('trial');
  for (const run of [normal, fast]) {
    travel(run);
    run.interact();
    run.enemies.forEach((e) => (e.damage = 0));
  }
  const t = fast.time;
  fast.pause();
  advanceSimulation(fast, 0.1, 8, still);
  close(fast.time, t);
  fast.resume();
  fast.xp = fast.nextXp;
  fast.tick(0.001, still);
  assert.equal(fast.mode, 'levelup');
  const frozen = fast.time;
  advanceSimulation(fast, 0.1, 8, still);
  close(fast.time, frozen);
  choose(fast);
  normal.tick(0.001, still);
  for (let i = 0; i < 80; i++) advanceSimulation(normal, 0.1, 1, still);
  for (let i = 0; i < 10; i++) advanceSimulation(fast, 0.1, 8, still);
  close(normal.time, fast.time);
  close(normal.opportunities.active!.progress, fast.opportunities.active!.progress);
});
test('Thưởng cơ duyên đi qua settleLoot 100%/30%, không sửa hồ sơ trước tổng kết; lượt mới không mang cơ duyên', () => {
  const run = setup('herb');
  const profile = structuredClone(run.profile);
  travel(run);
  run.interact();
  const material = run.loot.resources['linh-thao']!;
  run.abandon();
  assert.equal(run.result!.raw.resources['linh-thao'], material);
  assert.equal(run.result!.rewards.resources['linh-thao'], Math.floor(material * 0.3));
  assert.equal(run.result!.opportunities!.completed, 1);
  assert.equal(run.opportunities.active, null);
  assert.deepEqual(run.profile, profile);
  assert.equal(new RunEngine(profile, [], run.seed).opportunities.completed, 0);
});
test('Boss/kết thúc hủy mục tiêu chưa nhận, không đổi điều kiện thắng, không còn hộ vệ hoặc đòn trễ', () => {
  const run = setup('elite');
  travel(run);
  run.interact();
  run.time = run.stage.duration - 0.001;
  run.tick(0.01, still);
  assert.equal(run.opportunities.active, null);
  assert.ok(run.enemies.some((e) => e.type === run.stage.bossId));
  assert.ok(!run.enemies.some((e) => e.opportunityId !== undefined));
  assert.equal(run.result, null);
  run.abandon();
  assert.equal(run.result!.opportunities!.missed, 1);
  assert.equal(run.result!.won, false);
});
test('Điểm cơ duyên nằm trong sân, cách vật cản, không sinh khi không có chỗ; giới hạn quái không vượt', () => {
  const controller = new Opportunities(stages[0], [{ x: 0, y: 0, radius: 100 }], seededRandom(1));
  controller.tick(0.1, { time: 500, position: still, enemies: [] });
  assert.equal(controller.active, null);
  for (const position of [{ x: -31, y: -31 }, { x: 31, y: 31 }, still]) {
    const c = new Opportunities(stages[0], [], seededRandom(1));
    c.tick(0.01, { time: c.schedule[0].at, position, enemies: [] });
    const a = c.active!;
    assert.ok(a.x >= -28 && a.x <= 28 && a.y >= -28 && a.y <= 28);
    assert.ok(Math.hypot(a.x - position.x, a.y - position.y) >= 4);
  }
  const run = setup('cache');
  travel(run);
  run.enemies = Array.from(
    { length: run.stage.maxEnemies },
    (_, i) => ({ id: i + 500, dead: false }) as EnemyState,
  );
  run.interact();
  assert.equal(run.opportunities.active!.phase, 'offered');
  assert.equal(run.enemies.length, run.stage.maxEnemies);
});

test('Dọn cả đạn của hộ vệ đã mất khỏi danh sách actor; thưởng thắng giữ đủ vật liệu', () => {
  const run = setup('trial');
  travel(run);
  run.interact();
  const guard = run.enemies[0];
  run.enemies = run.enemies.filter((e) => e !== guard);
  run.projectiles.push({
    x: 30,
    y: 30,
    id: 99999,
    velocity: still,
    damage: 1,
    radius: 0.1,
    life: Infinity,
    enemy: true,
    effect: 'fire-palm',
    pierce: 0,
    hits: [],
    sourceEnemyId: guard.id,
  });
  run.position = { x: 25, y: 25 };
  advance(run, 31);
  assert.ok(!run.projectiles.some((p) => p.sourceEnemyId === guard.id));
  const herb = setup('herb');
  travel(herb);
  herb.interact();
  choose(herb);
  const amount = herb.loot.resources['linh-thao'];
  const boss = {
    ...guard,
    id: 7777,
    type: herb.stage.bossId,
    x: herb.position.x + 1,
    y: herb.position.y,
    hp: 1,
    maxHp: 1,
    opportunityId: undefined,
    dead: false,
    spawnGrace: 0,
    speed: 0,
    damage: 0,
  };
  herb.enemies = [boss];
  herb.projectiles.push({
    x: boss.x,
    y: boss.y,
    id: 99998,
    velocity: still,
    damage: 100,
    radius: 1,
    life: Infinity,
    enemy: false,
    effect: 'qi-punch',
    pierce: 0,
    hits: [],
  });
  herb.tick(0.01, still);
  assert.equal(herb.result?.won, true);
  assert.equal(herb.result!.rewards.resources['linh-thao'], amount);
});
