import test from 'node:test';
import assert from 'node:assert/strict';
import { AdvancedSkills, type AdvancedContext } from '../src/game/systems/AdvancedSkills.ts';
import {
  techniqueHit,
  techniqueOutline,
  type TechniqueArea,
} from '../src/game/math/techniqueGeometry.ts';
import { RunEngine } from '../src/game/systems/RunEngine.ts';
import { newProfile } from '../src/domain/profile.ts';
import { worldTwoStages } from '../src/data/worldTwoStages.ts';
import { stages } from '../src/data/stages.ts';
import type { EnemyState, Stats, RunResult, Projectile } from '../src/shared/models';
import type { AugmentId } from '../src/shared/augments';

function enemy(id = 1, x = 2, y = 0, type = 'hac-lang', hp = 100000): EnemyState {
  return {
    id,
    x,
    y,
    type,
    hp,
    maxHp: hp,
    radius: 0.2,
    speed: 0,
    damage: 20,
    facing: 'W',
    combo: 0,
    attack: 0,
    attackTime: 0,
    attackDuration: 0.8,
    impactAt: 0.4,
    impacted: false,
    cooldown: 1000,
    target: { x: 0, y: 0 },
    dead: false,
    deathTime: 0,
    hitTime: 0,
  };
}
function fixture(id: string, rank = 1, augments: AugmentId[] = []) {
  const system = new AdvancedSkills();
  let stats: Stats = {
    hp: 100,
    damage: 100,
    armor: 0,
    speed: 3,
    crit: 0,
    haste: 0,
    pickup: 2,
    regen: 0,
  };
  const hits: {
    id: string;
    rank: number;
    damage: number;
    ignore: boolean;
    enemy: number;
    time: number;
  }[] = [];
  const context: AdvancedContext = {
    time: 0,
    position: { x: 0, y: 0 },
    ranks: { [id]: rank },
    augments,
    enemies: [enemy()],
    bossId: 'never',
    active: () => true,
    stats: () => stats,
    random: () => 1,
    push: () => {},
    hit: (target, damage, source, tier, _crit, ignore) => {
      target.hp -= damage;
      hits.push({
        id: source,
        rank: tier,
        damage,
        ignore: !!ignore,
        enemy: target.id,
        time: context.time,
      });
      return damage;
    },
  };
  const step = (seconds: number, scale = 1) => {
    for (let left = seconds; left > 1e-8; left -= 0.01) {
      const dt = Math.min(0.01, left);
      context.time += dt;
      system.tick(dt, context, scale);
    }
  };
  return {
    system,
    context,
    hits,
    step,
    setDamage: (damage: number) => {
      stats = { ...stats, damage };
    },
  };
}
test('Hình học luồng thẳng, đường rồng, chưởng và nón có biên tương ứng với hình vẽ', () => {
  const area: TechniqueArea = {
    x: 0,
    y: 0,
    shape: 'beam',
    angle: 0,
    length: 8,
    width: 2,
    radius: 0,
    spread: Math.PI / 2,
  };
  assert.ok(techniqueHit(area, { x: 4, y: 1 }));
  assert.equal(techniqueHit(area, { x: -0.5, y: 0 }), false);
  assert.ok(techniqueHit({ ...area, shape: 'dragon' }, { x: -0.5, y: 0 }));
  assert.equal(techniqueHit({ ...area, shape: 'dragon' }, { x: -1.1, y: 0 }), false);
  assert.ok(techniqueOutline({ ...area, shape: 'dragon' }).length > 30);
  assert.equal(techniqueHit({ ...area, shape: 'cone' }, { x: 2, y: 3 }), false);
  assert.ok(techniqueHit({ ...area, shape: 'disc', radius: 3 }, { x: 0, y: 3.1 }, 0.2));
});
test('Kim Quang giữ công/bậc khi tụ lực; ấn giảm nửa trên boss, không cộng dồn', () => {
  const f = fixture('diet-hon-kim-quang', 5);
  f.system.tick(0, f.context);
  f.setDamage(900);
  f.context.ranks['diet-hon-kim-quang'] = 1;
  f.step(0.21);
  assert.equal(f.hits[0].damage, 290);
  assert.equal(f.hits[0].rank, 5);
  assert.equal(f.system.multiplier(f.context.enemies[0], 'cuong-quyen'), 1.18);
  assert.equal(f.system.multiplier(f.context.enemies[0], 'hazard'), 1);
  const b = fixture('diet-hon-kim-quang', 5);
  b.context.enemies[0].type = worldTwoStages[0].bossId;
  b.step(0.22);
  assert.equal(b.system.multiplier(b.context.enemies[0], 'pet-linh-ho'), 1.09);
});
test('Thức tỉnh Kim Quang hẹn nổ 2 giây; gia hạn ấn không dời kíp nổ và nổ không tự hưởng ấn', () => {
  const f = fixture('diet-hon-kim-quang', 6);
  f.context.stats = () => ({
    hp: 100,
    damage: 100,
    armor: 0,
    speed: 3,
    crit: 0,
    haste: 100,
    pickup: 2,
    regen: 0,
  });
  f.step(2.3);
  const nova = f.hits.filter((hit) => hit.ignore);
  assert.equal(nova.length, 1);
  assert.equal(nova[0].damage, 200);
  assert.equal(nova[0].rank, 6);
  assert.ok(f.hits.filter((hit) => !hit.ignore).length >= 2);
  f.step(3.2);
  assert.equal(f.hits.filter((hit) => hit.ignore).length, 2);
});
test('Điệp Chưởng giữ hai nhịp, thức tỉnh chỉ thêm một chấn ba, không đọc lại công lúc rơi', () => {
  const f = fixture('gia-thien-thu', 6, ['thu-diep-chuong']);
  f.system.tick(0, f.context);
  f.setDamage(500);
  f.step(1.4);
  assert.deepEqual(
    f.hits.map((h) => h.damage),
    [520, 520, 300],
  );
  assert.ok(f.hits.every((h) => h.rank === 6));
});
test('Du Long sinh tại nhân vật, bay quanh người, thân rồng va chạm và giữ công/bậc lúc gọi', () => {
  const f = fixture('kim-long-hien-hoa', 1, ['long-du']);
  f.system.tick(0, f.context);
  f.step(0.35);
  const dragon = f.system.zones[0].dragon!;
  assert.deepEqual(dragon.position, f.context.position);
  f.setDamage(900);
  f.context.ranks['kim-long-hien-hoa'] = 6;
  let maxY = 0;
  for (let i = 0; i < 20; i++) {
    f.step(0.1);
    maxY = Math.max(maxY, Math.abs(dragon.position.y));
  }
  assert.ok(f.hits.length > 0);
  assert.ok(f.hits.every((h) => h.damage === 240 && h.rank === 1));
  assert.ok(maxY > 0.3);
  assert.ok(dragon.trail.length > 2);
  for (let i = 1; i < f.hits.length; i++) assert.ok(f.hits[i].time - f.hits[i - 1].time >= 0.99);
});
test('Long Tức bảy nhịp tổng 1,4 lần, gom số theo thời gian thực, chặn đường rồng ở biên sân', () => {
  const f = fixture('kim-long-hien-hoa', 1, ['long-tuc']);
  let feedback = 0;
  f.context.feedback = () => feedback++;
  f.context.bounds = { minX: -4, maxX: 4, minY: -4, maxY: 4 };
  f.step(1.8);
  assert.equal(f.hits.length, 7);
  assert.equal(
    f.hits.reduce((sum, h) => sum + h.damage, 0),
    840,
  );
  assert.ok(feedback >= 2 && feedback < 7);
  const b = fixture('kim-long-hien-hoa', 1, ['long-tuc']);
  b.context.bounds = { minX: -4, maxX: 4, minY: -4, maxY: 4 };
  b.step(0.4);
  assert.equal(b.system.zones[0].area.length, 4);
});
test('Kim Quang là tia xuyên tầm xa, Tán Quang không nhân ba sát thương ở chỗ giao tia', () => {
  const f = fixture('diet-hon-kim-quang', 1);
  f.context.enemies = [enemy(1, 10), enemy(2, 10, 4)];
  f.step(0.22);
  assert.deepEqual(
    f.hits.map((h) => h.enemy),
    [1],
  );
  assert.ok(f.system.visuals.some((v) => !v.warning && v.shape === 'beam' && v.length === 12));
  const b = fixture('diet-hon-kim-quang', 1, ['quang-pha-hon']);
  b.context.enemies = [enemy(1, 15)];
  b.step(0.22);
  assert.equal(b.hits.length, 1);
  const wide = fixture('diet-hon-kim-quang', 1, ['quang-tan']);
  wide.context.enemies = [enemy(1, 0.2)];
  wide.step(0.22);
  assert.equal(wide.hits.length, 1);
  assert.equal(wide.hits[0].damage, 120);
});
test('Chưởng tụ trên không trước khi trúng và lưu dấu bàn tay, không còn vòng tròn sát thương', () => {
  const f = fixture('gia-thien-thu');
  f.step(0.6);
  assert.equal(f.hits.length, 0);
  assert.equal(f.system.visuals[0].shape, 'palm');
  f.step(0.22);
  assert.equal(f.hits.length, 1);
  assert.ok(f.system.visuals.some((v) => !v.warning && v.shape === 'palm' && v.remaining > 2));
  const palm: TechniqueArea = {
    x: 0,
    y: 0,
    angle: 0,
    shape: 'palm',
    radius: 2,
    length: 0,
    width: 0,
    spread: 0,
  };
  assert.ok(techniqueHit(palm, { x: 0, y: 0 }));
  assert.equal(techniqueHit(palm, { x: -0.5, y: 1.63 }), false);
  assert.ok(techniqueOutline(palm).length > 50);
});
test('Du Long theo người di chuyển, giữ trong sân, hết hạn và dọn sạch; RNG bay không tiêu RNG chiến đấu', () => {
  const f = fixture('kim-long-hien-hoa', 1, ['long-du']);
  f.context.bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
  f.context.random = () => {
    throw new Error('Không được lấy RNG chiến đấu cho đường bay');
  };
  f.step(0.4);
  const z = f.system.zones[0];
  for (let i = 0; i < 45; i++) {
    f.context.position = { x: i * 0.08, y: Math.sin(i * 0.1) };
    f.step(0.1);
    assert.ok(
      Math.hypot(
        z.dragon!.position.x - f.context.position.x,
        z.dragon!.position.y - f.context.position.y,
      ) < 9,
    );
    assert.ok(z.dragon!.position.x <= 9.25 && z.dragon!.position.x >= -9.25);
  }
  f.context.enemies = [];
  f.step(2);
  assert.equal(f.system.zones.length, 0);
  f.system.clear();
  assert.equal(f.system.visuals.length, 0);
});
test('Nhập Ma dùng chu kỳ 12 giây, giữ hết pha hiện tại khi tăng bậc, dọn sạch khi kết thúc', () => {
  const f = fixture('nhap-ma', 1);
  f.step(0.01);
  assert.ok(f.system.maActive(f.context.time));
  assert.equal(f.system.maBonus(f.context.time, 1), 0.2);
  f.context.ranks['nhap-ma'] = 5;
  f.step(3.1);
  assert.equal(f.system.maActive(f.context.time), false);
  f.step(9);
  assert.ok(f.system.maActive(f.context.time));
  f.system.clear();
  assert.equal(f.system.marks.size, 0);
  assert.equal(f.system.zones.length, 0);
});
test('Phong Lôi có hai lượt lướt, nạp tuần tự và không tiêu lượt khi tạm dừng', () => {
  const run = new RunEngine(newProfile(), [], 3, {
    ...stages[0],
    maxEnemies: 0,
    duration: 10000,
    eliteTimes: [],
    elites: [],
  });
  run.skills['phong-loi-vu-duc'] = 5;
  run.tick(0.01, { x: 0, y: 0 });
  assert.equal(run.dashCharges, 2);
  assert.equal(run.dash(), true);
  for (let i = 0; i < 3; i++) run.tick(0.1, { x: 0, y: 0 });
  assert.equal(run.dash(), true);
  assert.equal(run.dashCharges, 0);
  run.pause();
  const cooldown = run.dashCooldown;
  run.tick(10, { x: 0, y: 0 });
  assert.equal(run.dashCooldown, cooldown);
  run.resume();
  for (let i = 0; i < 500; i++) run.tick(0.01, { x: 0, y: 0 });
  assert.ok(run.dashCharges >= 1);
  assert.ok(run.dashCharges <= 2);
});

type CombatAccess = {
  damageEnemy: (
    enemy: EnemyState,
    damage: number,
    feedback: boolean,
    crit: boolean,
    origin: { id: string; rank: number },
  ) => number;
};
function journeyProfile() {
  const p = newProfile();
  p.realm = 52;
  p.relicUnlocked = true;
  for (const stage of stages) p.stageProgress[stage.id] = { wins: 1, bestTime: 10, bestKills: 1 };
  return p;
}
for (const stage of worldTwoStages)
  test(`Hoàn thành mục tiêu và các pha boss thật: ${stage.name}`, () => {
    const run = new RunEngine(journeyProfile(), [], 12, {
      ...stage,
      maxEnemies: 0,
      eliteTimes: [],
      elites: [],
    });
    const combat = run as unknown as CombatAccess;
    for (let i = 0; i < 6000 && !run.result; i++) {
      while (run.mode === 'levelup') run.choose(run.choices[0].id);
      run.invulnerability = 10;
      const mission = run.mission!;
      if (mission.protected) mission.protected.hp = mission.protected.maxHp;
      const node = mission.nodes.find((n) => !n.completed);
      run.position = node
        ? { x: node.x, y: node.y }
        : mission.protected
          ? { x: mission.protected.x, y: mission.protected.y }
          : { x: 0, y: 0 };
      run.tick(0.1, { x: 0, y: 0 });
      run.interact();
      for (const target of [...run.enemies])
        if (!target.dead && run.mode === 'playing')
          combat.damageEnemy(target, 1e8, false, false, { id: 'cuong-quyen', rank: 5 });
    }
    assert.ok(
      run.result?.won,
      `${stage.id} bị kẹt: ${JSON.stringify(run.mission?.view(run.position))}`,
    );
    assert.equal(run.mission?.completed, true);
    assert.ok(run.result!.combat!.damageDealt > 0);
    if (stage.mission?.kind === 'final') {
      assert.equal(run.mission!.phase, 3);
      assert.equal(run.mission!.bloodStoneUsed, true);
    }
    if (stage.mission?.kind === 'escort') assert.ok(run.result!.reason.includes('thoát'));
  });
test('Mục tiêu bị phá là mission-failed, còn sống vẫn nhận đúng 30% theo chặng, không vật liệu cố định', () => {
  const stage = worldTwoStages[9],
    run = new RunEngine(journeyProfile(), [], 14, stage);
  run.tick(0.01, { x: 0, y: 0 });
  run.mission!.checkpoint = 1;
  run.loot.stone = 7;
  run.mission!.damageProtected(1e8, { x: 0, y: 0 }, 2, 1);
  assert.equal(run.result?.outcome, 'mission-failed');
  assert.ok(run.hp > 0);
  assert.equal(run.result?.won, false);
  assert.equal(run.result!.rewards.stone, Math.floor((6 * 7 + stage.rewards.stone) / 20));
  assert.equal(run.result!.rewards.cultivation, stage.rewards.cultivation * 0.25 * 0.3);
  assert.deepEqual(run.result!.rewards.resources, {});
});
test('Thủ lĩnh Cốt tộc không thể bị bỏ pha dù đòn cực lớn; phải dùng đạo cụ tại tâm trận', () => {
  const stage = worldTwoStages[13],
    run = new RunEngine(journeyProfile(), [], 4, { ...stage, maxEnemies: 0 });
  run.invulnerability = 100;
  run.tick(0.1, { x: 0, y: 0 });
  const boss = run.enemies.find((e) => e.type === stage.bossId)!;
  const damage = (run as unknown as CombatAccess).damageEnemy.bind(run);
  damage(boss, 1e9, false, false, { id: 'cuong-quyen', rank: 5 });
  assert.ok(boss.hp >= boss.maxHp * 0.67);
  run.tick(0.1, { x: 0, y: 0 });
  assert.equal(run.mission!.phase, 2);
  damage(boss, 1e9, false, false, { id: 'cuong-quyen', rank: 5 });
  run.tick(0.1, { x: 0, y: 0 });
  assert.equal(run.result, null);
  assert.equal(run.mission!.phase, 2);
  run.position = { x: 10, y: 10 };
  assert.equal(run.interact(), false);
  run.position = { x: 0, y: 0 };
  assert.equal(run.interact(), true);
  damage(boss, 1e9, false, false, { id: 'cuong-quyen', rank: 5 });
  run.tick(0.1, { x: 0, y: 0 });
  assert.equal(run.mission!.phase, 3);
  damage(boss, 1e9, false, false, { id: 'cuong-quyen', rank: 5 });
  assert.equal((run.result as RunResult | null)?.won, true);
});
test('Sa Thành giữ đấu tay đôi cả pha hai: không triệu hồi quân hoặc sinh bẫy sân', () => {
  const stage = worldTwoStages[7],
    run = new RunEngine(journeyProfile(), [], 5, stage);
  run.tick(0.1, { x: 0, y: 0 });
  const boss = run.enemies.find((e) => e.type === stage.bossId)!;
  boss.hp = boss.maxHp * 0.49;
  run.invulnerability = 100;
  for (let i = 0; i < 300; i++) {
    run.tick(0.1, { x: 0, y: 0 });
    if (run.mode === 'levelup') run.choose(run.choices[0].id);
  }
  assert.equal(run.mission!.phase, 2);
  assert.equal(run.mission!.hazards.length, 0);
  assert.ok(run.enemies.every((e) => e.type === stage.bossId));
});
test('Đạn chạm mục tiêu đầu tiên trên đường: nhân vật che được tâm trận, đạn không xuyên qua mục tiêu bảo vệ', () => {
  const stage = { ...worldTwoStages[9], maxEnemies: 0, eliteTimes: [], elites: [] };
  const run = new RunEngine(journeyProfile(), [], 11, stage);
  run.tick(0.01, { x: 0, y: 0 });
  run.enemies = [];
  run.position = { x: -1, y: 0 };
  run.invulnerability = 0;
  run.stats.regen = 0;
  const unit = run.mission!.protected!,
    hp = run.hp,
    coreHp = unit.hp;
  const shot = (x: number, velocity: number): Projectile => ({
    id: 99999,
    x,
    y: 0,
    velocity: { x: velocity, y: 0 },
    damage: 100,
    radius: 0.05,
    life: 2,
    enemy: true,
    effect: 'spirit-bolt',
    pierce: 0,
    hits: [],
    incomingSource: { kind: 'unknown' },
  });
  run.projectiles = [shot(-2, 90)];
  run.tick(1 / 30, { x: 0, y: 0 });
  assert.ok(run.hp < hp);
  assert.equal(unit.hp, coreHp);
  const playerHp = run.hp;
  run.invulnerability = 0;
  run.projectiles = [shot(2, -90)];
  run.tick(1 / 30, { x: 0, y: 0 });
  assert.equal(run.hp, playerHp);
  assert.equal(unit.hp, coreHp - 100);
});
