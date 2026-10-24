import test from 'node:test';
import assert from 'node:assert/strict';
import {
  awakenings,
  awakeningFor,
  canAwaken,
  awakeningDescription,
} from '../src/data/awakenings.ts';
import { skills, eligibleCards } from '../src/data/skills.ts';
import { primaryAttack, firePalmAttack } from '../src/data/combatSkills.ts';
import { augments } from '../src/data/augments.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage } from '../src/data/stages.ts';
import type { EnemyState, Projectile } from '../src/shared/models';
import type { AugmentId } from '../src/shared/augments';

const still = { x: 0, y: 0 };
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
function target(id: number, x: number, y = 0, type = 'hac-lang'): EnemyState {
  return {
    id,
    x,
    y,
    type,
    hp: 10000,
    maxHp: 10000,
    radius: 0.2,
    speed: 0,
    damage: 0,
    facing: 'S',
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
function fixture(skill: string, rank = 5, chosen: AugmentId[] = []) {
  const profile = newProfile();
  profile.realm = 46;
  if (skill === 'nguyen-khi-tram') profile.equipped.weapon = 'thiet-kiem';
  profile.selectedSkills = ['duong-viem-chuong', 'hoa-linh', 'viem-hoan', 'loi-lien', 'loi-tam'];
  const run = new RunEngine(profile, [], 72, {
    ...stage,
    id: 'qa-awakenings',
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  run.skills[skill] = rank;
  run.stats.damage = 100;
  run.stats.crit = 0;
  run.augments = [...chosen];
  return run;
}
function advance(run: RunEngine, seconds: number) {
  for (let left = seconds; left > 1e-7; left -= 1 / 120) run.tick(Math.min(left, 1 / 120), still);
}
function suppressPrimary(run: RunEngine) {
  run.playerAttack = 1;
  run.playerAttackDuration = 10000;
}
function palmBullet(overrides: Partial<Projectile> = {}): Projectile {
  return {
    id: 9999,
    x: 0,
    y: 0,
    velocity: { x: 300, y: 0 },
    damage: 100,
    radius: 0.1,
    life: Infinity,
    enemy: false,
    effect: 'fire-palm',
    pierce: Infinity,
    hits: [],
    skillId: 'duong-viem-chuong',
    rank: 6,
    ...overrides,
  };
}

test('Đủ tám liên kết thật; hỗ trợ bậc 1 đủ, hỗ trợ dừng ở 5 và tấn công dừng ở 6', () => {
  assert.equal(Object.keys(awakenings).length, 8);
  assert.equal(Object.values(skills).filter((skill) => skill.kind === 'attack').length, 8);
  assert.equal(awakeningFor('toString'), undefined);
  for (const def of Object.values(awakenings)) {
    assert.equal(skills[def.skill].linked, def.support);
    assert.equal(skills[def.support].kind, 'support');
    for (const ranks of [
      { [def.skill]: 4, [def.support]: 5 },
      { [def.skill]: 5 },
      { [def.skill]: 5, [def.support]: 6 },
    ])
      assert.equal(canAwaken(def.skill, ranks), false);
    assert.equal(canAwaken(def.skill, { [def.skill]: 5, [def.support]: 1 }), true);
    assert.ok(
      eligibleCards([def.skill, def.support], { [def.skill]: 5, [def.support]: 1 }).some(
        (card) => card.id === `awaken:${def.skill}`,
      ),
    );
    assert.ok(
      !eligibleCards([def.skill, def.support], { [def.skill]: 6, [def.support]: 5 }).some(
        (card) => card.skill === def.skill || card.skill === def.support,
      ),
    );
  }
});

test('Một Hỏa Linh bậc 1 hỗ trợ được cả hai thức tỉnh hỏa, không bị tiêu hao khi chọn', () => {
  const run = fixture('duong-viem-chuong');
  run.skills['viem-hoan'] = 5;
  run.skills['hoa-linh'] = 1;
  for (const id of ['duong-viem-chuong', 'viem-hoan']) {
    run.xp = run.nextXp;
    run.tick(0.001, still);
    assert.ok(run.choices.some((card) => card.id === `awaken:${id}`));
    assert.equal(run.choose(`awaken:${id}`), true);
    assert.equal(run.skills[id], 6);
    assert.equal(run.skills['hoa-linh'], 1);
  }
});

test('Mỗi biến chiêu được giữ khi thức tỉnh bằng thẻ thật; profile và lượt mới không mang bậc 6', () => {
  for (const augment of Object.values(augments)) {
    const def = awakeningFor(augment.skill)!;
    const run = fixture(def.skill, 5, [augment.id]);
    const before = structuredClone(run.profile);
    run.skills[def.support] = 1;
    // Chuẩn bị đúng hỗ trợ trong bộ mang theo, kể cả hai kỹ năng vũ khí.
    run.profile.selectedSkills = [
      def.support,
      ...(def.skill.startsWith('cuong-') || def.skill === 'nguyen-khi-tram' ? [] : [def.skill]),
    ];
    const prepared = structuredClone(run.profile);
    run.xp = run.nextXp;
    run.tick(0.001, still);
    const card = run.choices.find((card) => card.id === `awaken:${def.skill}`)!;
    assert.ok(card);
    assert.ok(card.description.includes(augment.name));
    assert.equal(run.choose(card.id), true);
    assert.equal(run.skills[def.skill], 6);
    assert.deepEqual(run.augments, [augment.id]);
    assert.deepEqual(run.profile, prepared);
    assert.ok(run.notice.includes(def.name));
    assert.ok(run.sounds.includes('awaken'));
    const fresh = new RunEngine(before, [], 72);
    assert.ok(Object.values(fresh.skills).every((rank) => rank <= 1));
    assert.deepEqual(fresh.augments, []);
  }
});

test('Thẻ thức tỉnh hết điều kiện không chọn được; chọn rồi không thể lên bậc 7', () => {
  const run = fixture('duong-viem-chuong');
  run.skills['hoa-linh'] = 1;
  run.xp = run.nextXp;
  run.tick(0.001, still);
  run.skills['hoa-linh'] = 0;
  assert.equal(run.choose('awaken:duong-viem-chuong'), false);
  assert.equal(run.skills['duong-viem-chuong'], 5);
  run.skills['hoa-linh'] = 1;
  assert.equal(run.choose('awaken:duong-viem-chuong'), true);
  run.xp = run.nextXp;
  run.tick(0.001, still);
  assert.ok(!run.choices.some((card) => card.skill === 'duong-viem-chuong'));
});

test('Kim Ô phóng ba chưởng mạnh hơn, xuyên vô hạn; Tam Hoa và Lưu Hỏa vẫn hoạt động ở bậc 6', () => {
  for (const chosen of [[], ['chuong-tam-hoa'], ['chuong-luu-hoa']] as AugmentId[][]) {
    const run = fixture('duong-viem-chuong', 6, chosen);
    suppressPrimary(run);
    run.enemies = [target(1, 6)];
    advance(run, 1.01);
    const bullets = run.projectiles.filter((bullet) => bullet.skillId === 'duong-viem-chuong');
    assert.equal(bullets.length, chosen.includes('chuong-tam-hoa') ? 5 : 3);
    for (const bullet of bullets) {
      close(bullet.damage, 100 * 4.2 * (chosen.includes('chuong-tam-hoa') ? 0.65 : 1));
      assert.equal(bullet.pierce, Infinity);
      assert.equal(bullet.radius, 0.55);
      assert.equal(!!bullet.burn, chosen.includes('chuong-luu-hoa'));
    }
  }
});

test('Kim diễm nổ một lần, bán kính 2,4, damage lan 80%; địch đã trúng lan không nhận thêm trực tiếp', () => {
  const run = fixture('duong-viem-chuong', 6);
  suppressPrimary(run);
  run.position = { x: -15, y: 20 };
  run.enemies = [target(1, 3), target(2, 4, 0.5), target(3, 8), target(4, 8, 0.7)];
  run.projectiles = [palmBullet({ burn: true })];
  run.tick(1 / 30, still);
  assert.deepEqual(
    run.enemies.map((enemy) => enemy.hp),
    [9900, 9920, 9900, 10000],
  );
  const burst = run.visuals.filter((event) => event.kind === 'fireburst');
  assert.equal(burst.length, 1);
  assert.equal(burst[0].radius, 2.4);
  assert.equal(run.combatZones.length, 1);
  assert.equal(run.combatZones[0].radius, 2.4);
});

test('Kim diễm vẫn hiện khi đòn trực tiếp kết liễu boss; kết quả dọn mọi đạn/vùng đốt', () => {
  const run = fixture('duong-viem-chuong', 6);
  suppressPrimary(run);
  run.enemies = [target(1, 3, 0, stage.bossId)];
  run.enemies[0].hp = 1;
  run.projectiles = [palmBullet({ burn: true })];
  run.tick(1 / 30, still);
  assert.equal(run.result?.won, true);
  const burst = run.visuals.find((event) => event.kind === 'fireburst')!;
  assert.ok(burst);
  close(burst.life, burst.total - 1 / 30);
  assert.equal(run.projectiles.length, 0);
  assert.equal(run.combatZones.length, 0);
});

test('Băng Sơn giữ tổng damage của ba luồng thức tỉnh; Hồi Phong tiếp tục xuyên hai chiều', () => {
  const heavy = primaryAttack('cuong-quyen', 6, ['quyen-bang-son']);
  close(heavy.power, 3 * 3.3 * 1.45);
  assert.equal(heavy.count, 1);
  const run = fixture('nguyen-khi-tram', 6, ['kiem-hoi-phong']);
  run.enemies = [target(1, 3)];
  for (let i = 0; i < 100 && !run.projectiles.length; i++) run.tick(1 / 120, still);
  run.playerAttackDuration = 10000;
  advance(run, 2.5);
  close(run.enemies[0].hp, 10000 - 3 * 100 * 3.1 * 0.85 * 2);
});

test('Lôi thức tỉnh chọn địch ngoài tầm vũ khí, truyền tối đa mười mục tiêu cách 4,5 đơn vị', () => {
  const run = fixture('loi-lien', 6);
  suppressPrimary(run);
  const points = [
    [9, 0],
    [13.5, 0],
    [18, 0],
    [18, 4.5],
    [13.5, 4.5],
    [9, 4.5],
    [9, 9],
    [13.5, 9],
    [18, 9],
    [22.5, 9],
  ];
  run.enemies = points.map(([x, y], index) => target(index + 1, x, y));
  advance(run, 1.51);
  assert.equal(run.enemies.filter((enemy) => enemy.hp < 10000).length, 10);
  assert.equal(run.visuals.find((event) => event.kind === 'lightning')!.points!.length, 11);
});

test('Mô tả bậc 6 khớp nhánh, không còn hứa thêm đạn cho Viêm Hoàn hoặc chuỗi lan cho lôi tập trung', () => {
  const heavy = awakeningDescription('cuong-quyen', ['quyen-bang-son']);
  assert.ok(heavy.startsWith('1 luồng'));
  const ring = awakeningDescription('viem-hoan', ['hoan-quang-vuc']);
  assert.ok(ring.includes('6,72'));
  assert.ok(!ring.includes('thêm đạn'));
  const focused = awakeningDescription('loi-lien', ['loi-tap-kich']);
  assert.ok(focused.includes('Ba nhịp'));
  assert.ok(!focused.includes('mười mục tiêu'));
  assert.equal(firePalmAttack(6).splashRadius, 2.4);
});

test('Thức tỉnh giữ ba đường chính, không giảm damage gần/xa vì thêm đạn hoặc biến chiêu quạt', () => {
  for (const [skill, augment] of [
    ['cuong-quyen', null],
    ['nguyen-khi-tram', null],
    ['duong-viem-chuong', null],
    ['nguyen-khi-tram', 'kiem-tan-anh'],
    ['duong-viem-chuong', 'chuong-tam-hoa'],
  ] as const)
    for (const range of [3, 6]) {
      const damages = [5, 6].map((rank) => {
        const run = fixture(skill, rank, augment ? [augment] : []);
        run.enemies = [target(1, range, 0, stage.bossId)];
        if (skill === 'duong-viem-chuong') suppressPrimary(run);
        advance(run, 3);
        return 10000 - run.enemies[0].hp;
      });
      assert.ok(damages[1] > damages[0] * 1.5, `${skill}, ${range}: ${damages}`);
    }
});

test('Mười biến chiêu bậc 6 giữ cùng damage/trạng thái khi tăng tốc x8; pause chặn sát thương', () => {
  for (const def of Object.values(augments)) {
    const runs = [fixture(def.skill, 6, [def.id]), fixture(def.skill, 6, [def.id])];
    for (const run of runs) {
      run.enemies = Array.from({ length: 8 }, (_, i) => ({
        ...target(i + 1, 1.5 + i * 0.7, 0, stage.bossId),
        hp: 100000,
        maxHp: 100000,
      }));
      if (!['cuong-quyen', 'nguyen-khi-tram'].includes(def.skill)) suppressPrimary(run);
    }
    for (let i = 0; i < 80; i++) advanceSimulation(runs[0], 0.1, 1, still);
    for (let i = 0; i < 10; i++) advanceSimulation(runs[1], 0.1, 8, still);
    close(runs[0].time, runs[1].time);
    assert.deepEqual(
      runs[0].enemies.map((e) => e.hp),
      runs[1].enemies.map((e) => e.hp),
      def.id,
    );
    assert.equal(runs[0].projectiles.length, runs[1].projectiles.length, def.id);
    assert.equal(runs[0].combatZones.length, runs[1].combatZones.length, def.id);
    const before = runs[1].enemies.map((e) => e.hp);
    runs[1].pause();
    advanceSimulation(runs[1], 0.1, 8, still);
    assert.deepEqual(
      runs[1].enemies.map((e) => e.hp),
      before,
    );
  }
});

test('Song Liên thức tỉnh chạm 20 địch khác nhau; kim diễm dùng thời gian thực ở x8', () => {
  const chain = fixture('loi-lien', 6, ['loi-song-lien']);
  suppressPrimary(chain);
  chain.enemies = Array.from({ length: 20 }, (_, i) => target(i + 1, 1 + i * 0.3));
  advance(chain, 1.51);
  assert.equal(chain.enemies.filter((e) => e.hp < 10000).length, 20);
  const paths = chain.visuals.filter((e) => e.kind === 'lightning');
  assert.equal(paths.length, 2);
  assert.ok(paths.every((event) => event.points!.length === 11));
  for (const enemy of chain.enemies) close(enemy.hp, 10000 - 100 * 3.9 * 0.7);
  const palm = fixture('duong-viem-chuong', 6);
  suppressPrimary(palm);
  palm.setPresentationTimeScale(8);
  palm.enemies = [target(1, 3)];
  palm.projectiles = [palmBullet()];
  palm.tick(1 / 30, still);
  const burst = palm.visuals.find((event) => event.kind === 'fireburst')!;
  close(burst.total - burst.life, 1 / 30 / 8);
  palm.pause();
  const life = burst.life;
  palm.tick(1 / 30, still);
  close(burst.life, life);
});
