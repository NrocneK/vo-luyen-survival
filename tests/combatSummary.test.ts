import test from 'node:test';
import assert from 'node:assert/strict';
import { RunStatistics } from '../src/game/systems/RunStatistics.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import { newProfile, applyResult, breakthrough, validateProfile } from '../src/domain/profile.ts';
import { stages } from '../src/data/stages.ts';
import { worldProgress, justCompletedWorld } from '../src/data/campaign.ts';
import { damageSourceName, incomingSourceName } from '../src/data/combatReport.ts';
import type { EnemyState, Projectile } from '../src/shared/models';
import type { AugmentId } from '../src/shared/augments';
import type { StageZone } from '../src/shared/stageMechanics';

const still = { x: 0, y: 0 };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
function target(id = 1, x = 1, type = 'hac-lang', hp = 10000): EnemyState {
  return {
    id,
    x,
    y: 0,
    type,
    hp,
    maxHp: hp,
    radius: 0.2,
    speed: 0,
    damage: 30,
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
function fixture(skill = 'cuong-quyen', rank = 2, chosen: AugmentId[] = [], stageIndex = 0) {
  const profile = newProfile();
  profile.realm = 46;
  profile.selectedSkills = ['duong-viem-chuong', 'viem-hoan', 'loi-lien'];
  if (skill === 'nguyen-khi-tram') profile.equipped.weapon = 'thiet-kiem';
  const run = new RunEngine(profile, [], 72, {
    ...stages[stageIndex],
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  run.skills = { [skill]: rank };
  run.stats.damage = 100;
  run.stats.crit = run.stats.regen = run.stats.armor = 0;
  run.augments = [...chosen];
  return run;
}
function advance(run: RunEngine, seconds: number) {
  for (let left = seconds; left > 1e-7; left -= 1 / 120) run.tick(Math.min(left, 1 / 120), still);
}
function suppressPrimary(run: RunEngine) {
  run.playerAttack = 1;
  run.playerAttackElapsed = 1;
  run.playerAttackDuration = 10000;
  Reflect.set(run, 'playerImpacted', true);
}
function shot(overrides: Partial<Projectile> = {}): Projectile {
  return {
    id: 9000,
    x: 0,
    y: 0,
    velocity: { x: 300, y: 0 },
    damage: 100,
    radius: 0.1,
    life: Infinity,
    enemy: false,
    effect: 'qi-punch',
    pierce: 0,
    hits: [],
    skillId: 'cuong-quyen',
    rank: 2,
    ...overrides,
  };
}

test('Sổ sát thương chỉ tính HP thực mất, tách trước/sau thức tỉnh, snapshot độc lập và bất biến', () => {
  const log = new RunStatistics();
  log.dealt({ id: 'cuong-quyen', rank: 2 }, 100, 40);
  log.dealt({ id: 'cuong-quyen', rank: 5 }, 60, 10000);
  log.dealt({ id: 'cuong-quyen', rank: 6 }, 100, 30);
  log.dealt({ id: 'pet-thanh-dieu', rank: 6 }, 10, 100);
  const report = log.snapshot(0);
  assert.equal(report.damageDealt, 140);
  assert.equal(report.sources.length, 3);
  assert.deepEqual(report.sources[0], {
    id: 'cuong-quyen',
    rank: 5,
    awakened: false,
    damage: 100,
    kills: 1,
  });
  assert.equal(report.sources[2].awakened, false);
  assert.ok(
    Object.isFrozen(report) &&
      Object.isFrozen(report.sources) &&
      Object.isFrozen(report.sources[0]),
  );
  log.dealt({ id: 'cuong-quyen', rank: 6 }, 1, 1);
  assert.equal(report.damageDealt, 140);
  assert.equal(log.snapshot(0).damageDealt, 141);
});

test('Đòn boss cuối được ghi trước kết quả, quá sát thương test/chí mạng không thổi phồng số', () => {
  const run = fixture();
  run.setDamageMultiplier(100);
  run.stats.crit = 1;
  suppressPrimary(run);
  run.enemies = [target(1, 1, run.stage.bossId, 75)];
  run.projectiles = [shot()];
  advance(run, 0.1);
  assert.equal(run.result?.outcome, 'victory');
  assert.equal(run.result?.combat?.damageDealt, 75);
  assert.equal(run.result?.combat?.sources[0].kills, 1);
  assert.equal(run.result?.kills, 1);
});

test('Mỗi kỹ năng thật ghi đủ sát thương và đúng tên thức tỉnh, kể cả hỏa lan/lôi chuỗi', () => {
  for (const skill of [
    'cuong-quyen',
    'nguyen-khi-tram',
    'duong-viem-chuong',
    'viem-hoan',
    'loi-lien',
  ]) {
    const run = fixture(skill, 6);
    if (!['cuong-quyen', 'nguyen-khi-tram'].includes(skill)) suppressPrimary(run);
    run.enemies = [target(1, 1), target(2, 1.5), target(3, 2)];
    advance(run, 2);
    const report = run.statistics.snapshot(run.time);
    const lost = run.enemies.reduce((sum, e) => sum + e.maxHp - e.hp, 0);
    assert.ok(lost > 0, skill);
    close(report.damageDealt, lost);
    assert.equal(report.sources.length, 1, skill);
    assert.equal(report.sources[0].id, skill);
    assert.equal(report.sources[0].awakened, true);
    assert.ok(!damageSourceName(report.sources[0], run.profile).includes('khác'));
  }
});

test('Dư kình, hai chiều Hồi Phong, Lưu Hỏa và Tam Điệp đều gộp đúng kỹ năng gốc', () => {
  const cases: [string, AugmentId, number][] = [
    ['cuong-quyen', 'quyen-lien-kich', 1.2],
    ['nguyen-khi-tram', 'kiem-hoi-phong', 4],
    ['duong-viem-chuong', 'chuong-luu-hoa', 4.5],
    ['loi-lien', 'loi-tap-kich', 2],
  ];
  for (const [skill, branch, seconds] of cases) {
    const run = fixture(skill, 2, [branch]);
    if (['duong-viem-chuong', 'loi-lien'].includes(skill)) suppressPrimary(run);
    run.enemies = [target(1, 2), target(2, 2.5)];
    advance(run, seconds);
    const report = run.statistics.snapshot(run.time);
    close(
      report.damageDealt,
      run.enemies.reduce((sum, e) => sum + e.maxHp - e.hp, 0),
    );
    assert.ok(report.damageDealt > 0, branch);
    assert.deepEqual(
      report.sources.map((row) => row.id),
      [skill],
    );
  }
});

test('Thiêu đốt còn trên sân giữ bậc lúc xuất đòn, không bị gán sang thức tỉnh vừa nhận', () => {
  const run = fixture('duong-viem-chuong', 5, ['chuong-luu-hoa']);
  suppressPrimary(run);
  run.enemies = [target()];
  run.projectiles = [
    shot({ effect: 'fire-palm', skillId: 'duong-viem-chuong', rank: 5, burn: true }),
  ];
  advance(run, 0.1);
  assert.equal(run.combatZones[0].rank, 5);
  run.skills['duong-viem-chuong'] = 6;
  Reflect.set(run, 'fireCooldown', Infinity);
  const before = run.statistics.snapshot(run.time).damageDealt;
  advance(run, 0.6);
  const report = run.statistics.snapshot(run.time);
  assert.ok(report.damageDealt > before);
  assert.equal(report.sources.length, 1);
  assert.equal(report.sources[0].awakened, false);
});

test('Tam Điệp giữ bậc lúc xuất chiêu nếu lên thức tỉnh trong khi còn hai nhịp trễ', () => {
  const run = fixture('loi-lien', 2, ['loi-tap-kich']);
  suppressPrimary(run);
  run.enemies = [target()];
  advance(run, 1.51);
  const first = run.statistics.snapshot(run.time).damageDealt;
  assert.ok(first > 0);
  run.skills['loi-lien'] = 6;
  Reflect.set(run, 'chainCooldown', Infinity);
  advance(run, 0.34);
  const report = run.statistics.snapshot(run.time);
  close(report.damageDealt, first * 3);
  assert.equal(report.sources.length, 1);
  assert.equal(report.sources[0].rank, 2);
  assert.equal(report.sources[0].awakened, false);
});

test('Cả hai linh thú có mục sát thương riêng, linh thú tiến hóa không bị gọi là thức tỉnh kỹ năng', () => {
  for (const id of ['linh-ho', 'thanh-dieu']) {
    const run = fixture();
    suppressPrimary(run);
    run.profile.activePet = id;
    run.profile.pets[id] = { level: 3, evolved: true };
    run.petPosition = { x: 0.5, y: 0 };
    run.enemies = [target(1, 1)];
    advance(run, 2);
    const report = run.statistics.snapshot(run.time);
    assert.ok(report.damageDealt > 0, id);
    assert.equal(report.sources[0].id, `pet-${id}`);
    assert.equal(report.sources[0].awakened, false);
    assert.match(
      damageSourceName(report.sources[0], run.profile),
      id === 'linh-ho' ? /Ngọc Vĩ/ : /Phong Linh/,
    );
  }
});

test('Sát thương nhận ghi sau giáp/linh hộ, bỏ qua bất tử và giữ đúng đòn kết liễu', () => {
  const run = fixture();
  suppressPrimary(run);
  run.stats.armor = 10;
  run.hp = 30;
  run.mechanics.wardRemaining = 10;
  const bullet = shot({
    x: 0,
    enemy: true,
    velocity: still,
    damage: 36,
    incomingSource: {
      kind: 'enemy',
      enemyType: 'ma-tu',
      attack: 1,
      delivery: 'fan',
      effect: 'fire-palm',
    },
  });
  run.projectiles = [{ ...bullet }, { ...bullet, id: 9001 }];
  advance(run, 0.01);
  close(run.hp, 16);
  close(run.statistics.snapshot(run.time).damageTaken, 14);
  assert.equal(run.statistics.snapshot(run.time).recentHits.length, 1);
  advance(run, 0.7);
  run.projectiles = [{ ...bullet, damage: 9999 }];
  advance(run, 0.01);
  const report = run.result!.combat!;
  assert.equal(run.result!.outcome, 'defeat');
  close(report.damageTaken, 30);
  close(report.lethalHit!.damage, 16);
  assert.match(incomingSourceName(report.lethalHit!.source).name, /Ma tu/);
});

test('Nguồn đạn được giữ sau khi kẻ bắn bị dọn; số chiêu và loại loạt đạn không mất', () => {
  const run = fixture();
  suppressPrimary(run);
  const enemy = target(33, 3, 'ma-tu');
  run.enemies = [enemy];
  enemy.cooldown = 0;
  run.hp = 1;
  advance(run, 0.6);
  assert.ok(run.projectiles.some((p) => p.enemy && p.sourceEnemyId === 33));
  run.enemies = [];
  advance(run, 2);
  const source = run.result!.combat!.lethalHit!.source;
  assert.equal(source.kind, 'enemy');
  if (source.kind !== 'enemy') return;
  assert.equal(source.enemyType, 'ma-tu');
  assert.equal(source.attack, 1);
  assert.equal(source.delivery, 'fan');
  assert.match(incomingSourceName(source).detail, /hỏa/);
});

test('Đòn cận chiến thực ghi đúng kẻ địch và chiêu, không bị đạn phe ta đổi thành chiến thắng sau khi chết', () => {
  const run = fixture();
  suppressPrimary(run);
  run.hp = 1;
  const foe = target(3, 0.4);
  foe.cooldown = 0;
  const boss = target(4, 5, run.stage.bossId, 1);
  run.enemies = [foe, boss];
  advance(run, 0.4);
  run.projectiles = [shot({ x: 5, damage: 1000 })];
  advance(run, 0.04);
  assert.equal(run.result!.won, false);
  const source = run.result!.combat!.lethalHit!.source;
  assert.equal(source.kind, 'enemy');
  if (source.kind === 'enemy') assert.equal(source.delivery, 'melee');
  assert.equal(boss.dead, false);
});

test('Độc chướng/hỏa tuyến/ám vực thật truyền đúng nguồn hiểm họa vào tử trận', () => {
  for (const hazard of ['poison', 'fire', 'dark'] as const) {
    const run = fixture('cuong-quyen', 1, [], hazard === 'poison' ? 2 : hazard === 'fire' ? 3 : 5);
    suppressPrimary(run);
    run.hp = 1;
    const zone: StageZone = {
      id: 99,
      x: 0,
      y: 0,
      kind: hazard,
      radius: 3,
      elapsed: 1,
      warning: 0,
      duration: 20,
      velocity: still,
      direction: { x: 1, y: 0 },
      halfLength: 8,
      gapOffset: 6,
      gapHalfWidth: 1,
      hitIn: 0,
      triggered: false,
      charge: 0,
      charged: false,
    };
    run.mechanics.zones.push(zone);
    advance(run, 0.01);
    assert.equal(run.result?.outcome, 'defeat', hazard);
    assert.deepEqual(run.result!.combat!.lethalHit!.source, { kind: 'hazard', hazard });
    assert.match(incomingSourceName(run.result!.combat!.lethalHit!.source).detail, /địa hình/);
  }
});

test('Lịch sử nhận đòn giới hạn sáu bản ghi/sáu giây; rút lui không có nguyên nhân tử trận', () => {
  const log = new RunStatistics();
  for (let time = 0; time < 20; time++) log.received(time, 100, 99, { kind: 'unknown' });
  assert.equal(log.snapshot(19).recentHits.length, 6);
  assert.equal(log.snapshot(30).recentHits.length, 0);
  assert.equal(log.snapshot(30).damageTaken, 20);
  const run = fixture();
  run.abandon();
  assert.equal(run.result?.outcome, 'retreat');
  assert.equal(run.result?.combat?.lethalHit, null);
});

test('Pause/lên cấp/kết quả không cộng số ở x8; lượt mới sạch, không ghi thống kê vào Profile', () => {
  const run = fixture('viem-hoan', 6);
  suppressPrimary(run);
  run.enemies = [target()];
  advance(run, 0.2);
  const before = run.statistics.snapshot(run.time).damageDealt;
  for (const mode of ['paused', 'levelup'] as const) {
    run.mode = mode;
    advanceSimulation(run, 0.1, 8, still);
    close(run.statistics.snapshot(run.time).damageDealt, before);
  }
  run.mode = 'playing';
  advanceSimulation(run, 0.1, 8, still);
  assert.ok(run.statistics.snapshot(run.time).damageDealt > before);
  run.abandon();
  const report = run.result!.combat!;
  advanceSimulation(run, 0.1, 8, still);
  assert.equal(run.result!.combat, report);
  const profile = newProfile();
  applyResult(profile, run.result!);
  assert.ok(!JSON.stringify(profile).includes('damageDealt'));
  assert.deepEqual(validateProfile(profile).stageProgress, profile.stageProgress);
  assert.equal(fixture().statistics.snapshot(0).damageDealt, 0);
});

test('Kết chương cần đủ sáu màn và tầng 10, nhận biết cả thứ tự boss trước hoặc đột phá trước', () => {
  const profile = newProfile();
  profile.realm = 46;
  profile.stageProgress[stages[5].id] = { wins: 1, bestTime: 600, bestKills: 100 };
  assert.equal(worldProgress(profile).completed, false);
  for (const stage of stages.slice(0, 5))
    profile.stageProgress[stage.id] = { wins: 1, bestTime: 600, bestKills: 100 };
  const before = structuredClone(profile);
  before.stageProgress[stages[5].id].wins = 0;
  assert.equal(justCompletedWorld(before, profile), true);
  assert.equal(justCompletedWorld(profile, profile), false);
  const late = structuredClone(profile);
  late.realm = 45;
  late.cultivation = 11500;
  const lateBefore = structuredClone(late);
  breakthrough(late);
  assert.equal(late.realm, 46);
  assert.equal(justCompletedWorld(lateBefore, late), true);
  const restored = validateProfile(JSON.parse(JSON.stringify(late)));
  assert.equal(worldProgress(restored).completed, true);
  assert.equal(justCompletedWorld(late, restored), false);
});
