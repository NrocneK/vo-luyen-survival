import test from 'node:test';
import assert from 'node:assert/strict';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { advanceSimulation } from '../src/game/systems/advanceSimulation.ts';
import { newProfile } from '../src/domain/profile.ts';
import { stage } from '../src/data/stages.ts';
import { eligibleCards } from '../src/data/skills.ts';
import { augments, augmentRules, eligibleAugments } from '../src/data/augments.ts';
import type { AugmentId } from '../src/shared/augments';
import type { EnemyState } from '../src/shared/models';

const still = { x: 0, y: 0 };
function enemy(id: number, x: number, y = 0, type = 'hac-lang'): EnemyState {
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
function fixture(augment?: AugmentId, skill = 'cuong-quyen', seed = 72) {
  const profile = newProfile();
  profile.realm = 46;
  profile.selectedSkills = ['duong-viem-chuong', 'viem-hoan', 'loi-lien', 'cuong-the'];
  if (skill === 'nguyen-khi-tram') profile.equipped.weapon = 'thiet-kiem';
  const run = new RunEngine(profile, [], seed, {
    ...stage,
    id: 'qa-builds',
    duration: 10000,
    maxEnemies: 0,
    elites: [],
    eliteTimes: [],
  });
  run.stats.crit = 0;
  run.stats.damage = 100;
  run.skills[skill] = 2;
  if (augment) run.augments.push(augment);
  return run;
}
function advance(run: RunEngine, seconds: number) {
  for (let left = seconds; left > 1e-8; left -= 1 / 120) run.tick(Math.min(left, 1 / 120), still);
}
function suppressPrimary(run: RunEngine) {
  run.playerAttack = 1;
  run.playerAttackDuration = 10000;
}
function releasePrimary(run: RunEngine) {
  for (let i = 0; i < 100 && !run.projectiles.length; i++) run.tick(1 / 120, still);
  assert.ok(run.projectiles.length);
  run.playerAttackDuration = 10000;
}
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('Mười sáu biến chiêu cần kỹ năng bậc 2; chọn một nhánh loại cả cặp, vẫn giữ sau thức tỉnh', () => {
  assert.equal(Object.keys(augments).length, 16);
  for (const def of Object.values(augments)) {
    assert.equal(eligibleAugments([def.skill], { [def.skill]: 1 }, []).length, 0);
    assert.equal(eligibleAugments([], { [def.skill]: 2 }, []).length, 0);
    assert.equal(eligibleAugments([def.skill], { [def.skill]: 2 }, []).length, 2);
    assert.equal(eligibleAugments([def.skill], { [def.skill]: 6 }, [def.id]).length, 0);
  }
  const cards = eligibleCards(['cuong-quyen', 'cuong-quyen'], { 'cuong-quyen': 2 });
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
});

test('Chọn biến chiêu từ bộ thẻ thật không tăng bậc, không ghi profile và không lặp nhánh', () => {
  let chosen = false;
  for (let seed = 1; seed < 60 && !chosen; seed++) {
    const run = fixture(undefined, 'cuong-quyen', seed),
      before = structuredClone(run.profile);
    run.xp = run.nextXp;
    run.tick(0.01, still);
    const card = run.choices.find((card) => card.augment);
    if (!card) continue;
    assert.equal(run.choose('augment:khong-ton-tai'), false);
    assert.equal(run.choose(card.id), true);
    assert.equal(run.skills['cuong-quyen'], 2);
    assert.deepEqual(run.augments, [card.augment]);
    assert.deepEqual(run.profile, before);
    assert.equal(run.choose(card.id), false);
    run.xp = run.nextXp;
    run.tick(0.01, still);
    assert.ok(
      run.choices.every((card) => !card.augment || augments[card.augment].skill !== 'cuong-quyen'),
    );
    assert.deepEqual(new RunEngine(run.profile, [], seed).augments, []);
    chosen = true;
  }
  assert.ok(chosen);
});

test('Đổi ba thẻ đúng một lần cả run, đứng yên tại levelup, không tiêu XP/tiền hay đổi RNG chiến đấu', () => {
  const run = fixture(),
    control = fixture(),
    before = structuredClone(run.profile);
  assert.equal(run.reroll(), false);
  for (const sim of [run, control]) {
    sim.xp = sim.nextXp + 3;
    sim.tick(0.01, still);
  }
  const previous = run.choices.map((card) => card.id),
    time = run.time,
    xp = run.xp,
    hp = run.hp;
  assert.equal(run.reroll(), true);
  assert.equal(run.choices.length, 3);
  assert.ok(run.choices.every((card) => !previous.includes(card.id)));
  assert.equal(run.mode, 'levelup');
  assert.equal(run.time, time);
  assert.equal(run.xp, xp);
  assert.equal(run.hp, hp);
  assert.deepEqual(run.profile, before);
  assert.equal(run.random(), control.random());
  assert.equal(run.rerollsRemaining, 0);
  const cards = structuredClone(run.choices);
  assert.equal(run.reroll(), false);
  assert.deepEqual(run.choices, cards);
  assert.equal(run.choose(previous[0]), false);
  run.choose(cards[0].id);
  run.xp = run.nextXp;
  run.tick(0.01, still);
  assert.equal(run.reroll(), false);
  assert.equal(new RunEngine(run.profile, [], 72).rerollsRemaining, 1);
  run.abandon();
  assert.equal(run.reroll(), false);
});

test('Thẻ và lần đổi tái lập theo seed; các seed khác có bộ lựa chọn khác', () => {
  const draws = new Set<string>();
  for (let seed = 1; seed <= 20; seed++) {
    const a = fixture(undefined, 'cuong-quyen', seed),
      b = fixture(undefined, 'cuong-quyen', seed);
    for (const run of [a, b]) {
      run.xp = run.nextXp;
      run.tick(0.01, still);
    }
    assert.deepEqual(a.choices, b.choices);
    draws.add(a.choices.map((card) => card.id).join(','));
    a.reroll();
    b.reroll();
    assert.deepEqual(a.choices, b.choices);
  }
  assert.ok(draws.size > 5);
});

test('Liên Hoàn Kình phát dư kình chậm 0,18 giây, 55% damage; queue dừng khi pause/levelup', () => {
  const run = fixture('quyen-lien-kich');
  run.enemies = [enemy(1, 6)];
  releasePrimary(run);
  const main = run.projectiles[0];
  advance(run, 0.1);
  assert.equal(run.projectiles.length, 1);
  run.pause();
  advance(run, 1);
  assert.equal(run.projectiles.length, 1);
  run.resume();
  run.xp = run.nextXp;
  run.tick(0.01, still);
  const time = run.time;
  advanceSimulation(run, 0.1, 8, still);
  assert.equal(run.time, time);
  run.choose(run.choices.find((card) => card.kind === 'stat')?.id ?? run.choices[0].id);
  advance(run, 0.09);
  const echo = run.projectiles.find((bullet) => bullet.id !== main.id)!;
  assert.ok(echo);
  close(echo.damage, main.damage * augmentRules.echoDamage);
});

test('Băng Sơn gộp một luồng, thêm xuyên và đẩy quái; tinh anh/boss không bị đẩy', () => {
  const run = fixture('quyen-bang-son');
  run.skills['cuong-quyen'] = 3;
  run.enemies = [enemy(1, 2), enemy(2, 4, 0, stage.elites[0].id), enemy(3, 6, 0, stage.bossId)];
  releasePrimary(run);
  assert.equal(run.projectiles.length, 1);
  assert.equal(run.projectiles[0].pierce, 4);
  close(run.projectiles[0].damage, 100 * 1.64 * 2 * 1.45);
  advance(run, 1);
  close(run.enemies[0].x, 2.9);
  close(run.enemies[1].x, 4);
  close(run.enemies[2].x, 6);
});

test('Hồi Phong trúng một lần mỗi chiều, quay về theo nhân vật và dọn đạn', () => {
  const run = fixture('kiem-hoi-phong', 'nguyen-khi-tram');
  run.enemies = [enemy(1, 1.5), enemy(2, 3.2)];
  releasePrimary(run);
  advance(run, 2.4);
  for (const target of run.enemies) close(target.hp, 10000 - 100 * 1.32 * 0.85 * 2);
  assert.equal(run.projectiles.length, 0);
  const open = fixture('kiem-hoi-phong', 'nguyen-khi-tram');
  open.enemies = [enemy(1, 6)];
  releasePrimary(open);
  open.enemies = [];
  advance(open, 1.1);
  assert.equal(open.projectiles[0].returning, true);
  assert.ok(open.projectiles[0].returnTravel! <= augmentRules.returnDistance + 1e-7);
  open.position = { x: 1, y: 2 };
  advance(open, 1.2);
  assert.equal(open.projectiles.length, 0);
});

test('Hồi Phong bậc 2 xuyên cả đàn ở hai chiều, không quay đầu khi trúng hoặc lặp damage trong cùng chiều', () => {
  const run = fixture('kiem-hoi-phong', 'nguyen-khi-tram');
  run.enemies = Array.from({ length: 8 }, (_, index) => enemy(index + 1, 0.8 + index * 0.8));
  releasePrimary(run);
  advance(run, 0.35);
  assert.ok(run.enemies.filter((target) => target.hp < 10000).length >= 3);
  assert.equal(run.projectiles[0].returning, undefined);
  assert.equal(run.projectiles[0].pierce, Infinity);
  advance(run, 2.1);
  for (const target of run.enemies) close(target.hp, 10000 - 100 * 1.32 * 0.85 * 2);
  assert.equal(run.projectiles.length, 0);
});

test('Hồi Phong tới đúng biên thì quay đầu thay vì bị dọn mất hoặc đi ra ngoài sân', () => {
  const run = fixture('kiem-hoi-phong', 'nguyen-khi-tram');
  run.position = { x: run.stage.bounds.maxX - 0.5, y: 0 };
  run.enemies = [enemy(1, run.stage.bounds.maxX - 0.2)];
  releasePrimary(run);
  for (let i = 0; i < 30 && !run.projectiles[0]?.returning; i++) run.tick(1 / 120, still);
  assert.equal(run.projectiles[0]?.returning, true);
  assert.ok(run.projectiles[0].x <= run.stage.bounds.maxX);
  assert.ok(run.projectiles[0].velocity.x < 0);
  advance(run, 0.3);
  assert.equal(run.projectiles.length, 0);
});

test('Tán Ảnh và Tam Hoa phát thêm hai đường với góc quạt và hệ số damage riêng', () => {
  const sword = fixture('kiem-tan-anh', 'nguyen-khi-tram');
  sword.enemies = [enemy(1, 6)];
  releasePrimary(sword);
  assert.equal(sword.projectiles.length, 3);
  close(sword.projectiles[1].damage, 100 * 1.32 * 0.7);
  close(Math.atan2(sword.projectiles[0].velocity.y, sword.projectiles[0].velocity.x), -0.3);
  const fire = fixture('chuong-tam-hoa', 'duong-viem-chuong');
  suppressPrimary(fire);
  fire.enemies = [enemy(1, 6)];
  advance(fire, 1.01);
  assert.equal(fire.projectiles.length, 3);
  for (const bullet of fire.projectiles) close(bullet.damage, 100 * 2 * 0.65);
});

test('Lưu Hỏa chỉ tạo vùng ở lần nổ đầu; sáu nhịp đốt đúng vùng, ngừng khi pause và hết sau 3 giây', () => {
  const run = fixture('chuong-luu-hoa', 'duong-viem-chuong');
  suppressPrimary(run);
  run.enemies = [enemy(1, 2)];
  advance(run, 1.4);
  assert.equal(run.combatZones.length, 1);
  const zone = run.combatZones[0];
  run.skills['duong-viem-chuong'] = 0;
  run.projectiles = [];
  run.enemies = [enemy(10, zone.x, zone.y), enemy(11, zone.x + 4, zone.y)];
  const remaining = zone.remaining;
  run.pause();
  advance(run, 1);
  close(zone.remaining, remaining);
  run.resume();
  advance(run, 3.1);
  close(run.enemies[0].hp, 10000 - 6 * 200 * 0.2);
  close(run.enemies[1].hp, 10000);
  assert.equal(run.combatZones.length, 0);
});

test('Quảng Vực tăng riêng phạm vi; Liệt Diễm tăng riêng DPS, không còn vòng đánh lặp ở vị trí cũ', () => {
  const wide = fixture('hoan-quang-vuc', 'viem-hoan');
  suppressPrimary(wide);
  wide.enemies = [enemy(1, 3.3), enemy(2, 4.5)];
  advance(wide, 1);
  close(wide.flameRadius(), 2.2 * 1.6);
  close(wide.enemies[0].hp, 10000 - (100 * 1.4) / 2.4);
  close(wide.enemies[1].hp, 10000);
  close(wide.visuals.find((event) => event.kind === 'ring')!.radius, wide.flameRadius());
  const intense = fixture('hoan-liet-diem', 'viem-hoan');
  suppressPrimary(intense);
  intense.enemies = [enemy(1, 1), enemy(2, 3.3)];
  advance(intense, 1);
  close(intense.flameRadius(), 2.2);
  close(intense.enemies[0].hp, 10000 - ((100 * 1.4) / 2.4) * 1.6);
  close(intense.enemies[1].hp, 10000);
  assert.equal(intense.visuals.find((event) => event.kind === 'ring')!.intense, true);
  const before = intense.enemies[0].hp;
  intense.position = { x: 10, y: 10 };
  advance(intense, 0.5);
  close(intense.enemies[0].hp, before);
  assert.ok(
    intense.visuals.filter((event) => event.kind === 'ring').every((event) => event.followPlayer),
  );
});

test('Song Liên chia hai chuỗi không trùng địch; Tam Điệp đánh đúng một mục tiêu và dừng khi mục tiêu chết', () => {
  const fork = fixture('loi-song-lien', 'loi-lien');
  suppressPrimary(fork);
  fork.enemies = Array.from({ length: 8 }, (_, i) => enemy(i + 1, 1 + i * 0.6));
  advance(fork, 1.51);
  assert.equal(fork.enemies.filter((target) => target.hp < 10000).length, 8);
  for (const target of fork.enemies) close(target.hp, 10000 - 160 * 0.7);
  assert.equal(fork.visuals.filter((event) => event.kind === 'lightning').length, 2);
  const focus = fixture('loi-tap-kich', 'loi-lien');
  suppressPrimary(focus);
  focus.enemies = [enemy(1, 1), enemy(2, 3)];
  advance(focus, 1.84);
  close(focus.enemies[0].hp, 10000 - 160 * 0.55 * 3);
  close(focus.enemies[1].hp, 10000);
  const dying = fixture('loi-tap-kich', 'loi-lien');
  suppressPrimary(dying);
  dying.enemies = [enemy(1, 1), enemy(2, 3)];
  dying.enemies[0].hp = 1;
  advance(dying, 1.84);
  assert.equal(dying.enemies[0].dead, true);
  close(dying.enemies[1].hp, 10000);
});

test('Kết thúc lượt dọn đạn quay về, vùng đốt và đòn trễ, không gây sát thương thêm ở x8', () => {
  const run = fixture('loi-tap-kich', 'loi-lien');
  suppressPrimary(run);
  run.enemies = [enemy(1, 1)];
  advance(run, 1.51);
  run.combatZones.push({ id: 500, x: 1, y: 0, radius: 2, remaining: 3, tickIn: 0.1, damage: 20 });
  run.abandon();
  const hp = run.enemies[0].hp;
  assert.equal(run.combatZones.length, 0);
  assert.equal(run.projectiles.length, 0);
  advanceSimulation(run, 0.1, 8, still);
  close(run.enemies[0].hp, hp);
});

test('Pool nhỏ chỉ lặp số thẻ tối thiểu và vẫn có đủ ba lựa chọn khác ID', () => {
  const run = fixture();
  run.profile.selectedSkills = [];
  run.skills['cuong-quyen'] = 6;
  run.augments = ['quyen-bang-son'];
  run.bonus.crit = 1;
  run.bonus.haste = 3;
  run.bonus.speed = 5;
  run.xp = run.nextXp;
  run.tick(0.01, still);
  const previous = run.choices.map((card) => card.id);
  run.reroll();
  assert.equal(run.choices.length, 3);
  assert.equal(new Set(run.choices.map((card) => card.id)).size, 3);
  assert.equal(run.choices.filter((card) => previous.includes(card.id)).length, 1);
});

test('Cả mười nhánh cho cùng sát thương và trạng thái khi mô phỏng x1 hoặc x8', () => {
  for (const def of Object.values(augments)) {
    const normal = fixture(def.id, def.skill),
      fast = fixture(def.id, def.skill);
    for (const run of [normal, fast]) {
      run.enemies = Array.from({ length: 8 }, (_, index) => enemy(index + 1, 1.5 + index * 0.7));
      if (!['cuong-quyen', 'nguyen-khi-tram'].includes(def.skill)) suppressPrimary(run);
    }
    for (let i = 0; i < 80; i++) advanceSimulation(normal, 0.1, 1, still);
    for (let i = 0; i < 10; i++) advanceSimulation(fast, 0.1, 8, still);
    close(normal.time, fast.time);
    for (let index = 0; index < normal.enemies.length; index++) {
      close(normal.enemies[index].hp, fast.enemies[index].hp);
      close(normal.enemies[index].x, fast.enemies[index].x);
    }
    assert.equal(normal.projectiles.length, fast.projectiles.length, def.id);
    assert.equal(normal.combatZones.length, fast.combatZones.length, def.id);
  }
});
