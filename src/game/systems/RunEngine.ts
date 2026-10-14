import { stage } from '../../data/stages.ts';
import { enemies as definitions } from '../../data/enemies.ts';
import { eligibleCards, statCards } from '../../data/skills.ts';
import { permanentStats, startingSkill, settleLoot } from '../../domain/profile.ts';
import { pets } from '../../data/pets.ts';
import { moveWithCollisions, facingFromVelocity } from '../math/worldPhysics.ts';
import type { Point, CircleObstacle, Direction } from '../../shared/types';
import type {
  Profile,
  Stats,
  EnemyState,
  Drop,
  Projectile,
  VisualEvent,
  Loot,
  Card,
  RunResult,
  RunView,
  Resource,
} from '../../shared/models';

export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const direction = (a: Point, b: Point): Point => {
  const d = Math.max(0.0001, distance(a, b));
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
};

/** Toàn bộ chiến đấu chạy độc lập với renderer để kiểm thử một lượt 10 phút có thể tái lập. */
export class RunEngine {
  mode: 'playing' | 'paused' | 'levelup' | 'result' = 'playing';
  readonly seed: number;
  readonly random: () => number;
  position: Point = { x: 0, y: 0 };
  facing: Direction = 'S';
  movement: Point = { x: 0, y: 0 };
  time = 0;
  hp: number;
  stats: Stats;
  bonus: Stats = { hp: 0, damage: 0, speed: 0, armor: 0, crit: 0, pickup: 0, regen: 0, haste: 0 };
  xp = 0;
  level = 1;
  kills = 0;
  distance = 0;
  skills: Record<string, number>;
  choices: Card[] = [];
  enemies: EnemyState[] = [];
  drops: Drop[] = [];
  projectiles: Projectile[] = [];
  visuals: VisualEvent[] = [];
  sounds: string[] = [];
  loot: Loot = { stone: 0, cultivation: 0, resources: {}, equipment: [], blueprints: [] };
  result: RunResult | null = null;
  notice = 'Sống sót 10 phút rồi tiêu diệt Lang Vương.';
  noticeUntil = 8;
  playerAttack = 0;
  playerAttackElapsed = 0;
  playerAttackDuration = 0.58;
  playerAttackFacing: Direction = 'S';
  petPosition: Point = { x: -0.8, y: 0.8 };
  petFacing: Direction = 'S';
  petAttack = 0;
  petAttackElapsed = 0;
  pills: number;
  potionCooldown = 0;
  dashCooldown = 0;
  dashTime = 0;
  invulnerability = 0;
  private attackCooldown = 0;
  private attackTarget: Point = { x: 1, y: 0 };
  private playerImpacted = false;
  private fireCooldown = 1;
  private petCooldown = 1;
  private spawnCooldown = 0.6;
  private sequence = 0;
  private combo = 0;
  private petCombo = 0;
  private elitesSpawned = 0;
  private bossSpawned = false;
  private lastInput: Point = { x: 0.707, y: -0.707 };
  private difficulty = 1;
  readonly profile: Profile;
  readonly obstacles: CircleObstacle[];
  constructor(
    profile: Profile,
    obstacles: CircleObstacle[],
    seed = Math.floor(Math.random() * 0xffffffff),
  ) {
    this.profile = profile;
    this.obstacles = obstacles;
    this.seed = seed;
    this.random = seededRandom(seed);
    this.stats = permanentStats(profile);
    this.hp = this.stats.hp;
    this.skills = { [startingSkill(profile)]: 1 };
    this.pills = Math.min(3, profile.pills['hoi-nguyen-dan']);
  }
  get nextXp(): number {
    return 8 + this.level * 4;
  }
  private currentStats(): Stats {
    const stats = { ...this.stats };
    for (const key of Object.keys(stats) as (keyof Stats)[]) stats[key] += this.bonus[key];
    stats.hp += (this.skills['cuong-the'] ?? 0) * 12;
    stats.armor += this.skills['cuong-the'] ?? 0;
    stats.haste += (this.skills['tu-khi'] ?? 0) * 0.08;
    stats.pickup += (this.skills['tu-khi'] ?? 0) * 0.25;
    return stats;
  }
  view(): RunView {
    const boss = this.enemies.find((enemy) => enemy.type === 'hac-phong-lang-vuong' && !enemy.dead);
    return {
      time: this.time,
      hp: this.hp,
      maxHp: this.currentStats().hp,
      xp: this.xp,
      nextXp: this.nextXp,
      level: this.level,
      kills: this.kills,
      enemies: this.enemies.filter((e) => !e.dead).length,
      skills: { ...this.skills },
      pills: this.pills,
      potionCooldown: this.potionCooldown,
      dashCooldown: this.dashCooldown,
      boss: boss ? { hp: boss.hp, maxHp: boss.maxHp, name: definitions[boss.type].name } : null,
      notice: this.time < this.noticeUntil ? this.notice : '',
      seed: this.seed,
    };
  }
  private say(text: string, duration = 5): void {
    this.notice = text;
    this.noticeUntil = this.time + duration;
  }
  pause(): void {
    if (this.mode === 'playing') this.mode = 'paused';
  }
  resume(): void {
    if (this.mode === 'paused') this.mode = 'playing';
  }
  choose(id: string): boolean {
    if (this.mode !== 'levelup') return false;
    const card = this.choices.find((card) => card.id === id);
    if (!card) return false;
    const oldHp = this.currentStats().hp;
    if (card.skill)
      this.skills[card.skill] = card.kind === 'awaken' ? 6 : (this.skills[card.skill] ?? 0) + 1;
    if (card.stat)
      this.bonus[card.stat] += statCards.find((stat) => stat.stat === card.stat)!.amount;
    this.hp = Math.min(
      this.currentStats().hp,
      this.hp + Math.max(0, this.currentStats().hp - oldHp),
    );
    this.choices = [];
    this.mode = 'playing';
    this.checkLevel();
    this.sounds.push('level');
    return true;
  }
  private checkLevel(): void {
    if (this.mode !== 'playing' || this.xp < this.nextXp) return;
    this.xp -= this.nextXp;
    this.level++;
    const pool = eligibleCards(
      [startingSkill(this.profile), ...this.profile.selectedSkills],
      this.skills,
    );
    // Các thẻ kỹ năng có trọng số cao hơn thẻ chỉ số; thẻ thức tỉnh luôn được ưu tiên khi hợp lệ.
    const weighted = pool.map((card) => ({
      card,
      weight: this.random() * (card.kind === 'stat' ? 1 : 2.8) + (card.kind === 'awaken' ? 8 : 0),
    }));
    this.choices = weighted
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((entry) => entry.card);
    this.mode = 'levelup';
    this.sounds.push('level');
    this.effect(this.position, 'level-up', 1.2);
  }
  potion(): boolean {
    if (
      this.mode !== 'playing' ||
      this.pills < 1 ||
      this.potionCooldown > 0 ||
      this.hp >= this.currentStats().hp
    )
      return false;
    this.pills--;
    this.potionCooldown = 20;
    this.hp = Math.min(this.currentStats().hp, this.hp + this.currentStats().hp * 0.45);
    this.effect(this.position, 'healing', 1);
    this.sounds.push('level');
    return true;
  }
  dash(): boolean {
    if (this.mode !== 'playing' || this.dashCooldown > 0) return false;
    this.dashTime = 0.24;
    this.dashCooldown = 4.5;
    this.invulnerability = 0.4;
    return true;
  }
  tick(dt: number, input: Point): void {
    if (this.mode !== 'playing' || dt <= 0) return;
    // Không bỏ qua va chạm khi frame chậm: chia theo bước mô phỏng cố định tối đa 1/30 giây.
    let remaining = Math.min(dt, 0.15);
    while (remaining > 1e-7 && this.mode === 'playing') {
      const step = Math.min(1 / 30, remaining);
      this.step(step, input);
      remaining -= step;
    }
  }
  private step(dt: number, input: Point): void {
    this.time += dt;
    const stats = this.currentStats();
    this.hp = Math.min(stats.hp, this.hp + stats.regen * dt);
    this.invulnerability = Math.max(0, this.invulnerability - dt);
    this.potionCooldown = Math.max(0, this.potionCooldown - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (Math.hypot(input.x, input.y) > 0) this.lastInput = input;
    const movement = this.dashTime > 0 ? this.lastInput : input;
    const speed = stats.speed * (this.dashTime > 0 ? 3.6 : 1);
    this.dashTime = Math.max(0, this.dashTime - dt);
    const old = this.position;
    this.position = moveWithCollisions(
      old,
      { x: movement.x * speed, y: movement.y * speed },
      dt,
      this.obstacles,
      stage.bounds,
      stage.playerRadius,
    );
    this.movement = { x: this.position.x - old.x, y: this.position.y - old.y };
    this.distance += distance(old, this.position);
    if (distance(old, this.position) > 1e-6)
      this.facing = facingFromVelocity(this.movement, this.facing);
    this.difficulty = 1 + (this.time / 600) * 0.7;
    this.spawn(dt);
    this.updatePlayerAttack(dt, stats);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePet(dt, stats);
    this.collect(dt, stats);
    for (const effect of this.visuals) effect.life -= dt;
    this.visuals = this.visuals.filter((effect) => effect.life > 0);
    if (this.hp <= 0 && this.mode === 'playing')
      this.finish(false, 'Sinh lực cạn kiệt. Tu vi và chiến lợi phẩm nhận 30%.');
    if (this.mode === 'playing') this.checkLevel();
  }
  private spawn(dt: number): void {
    this.spawnCooldown -= dt;
    const normalLimit = this.bossSpawned ? 24 : stage.maxEnemies;
    if (
      this.spawnCooldown <= 0 &&
      this.enemies.filter((enemy) => !enemy.dead).length < normalLimit
    ) {
      const count = Math.min(
        1 + Math.floor(this.time / 150),
        normalLimit - this.enemies.filter((enemy) => !enemy.dead).length,
      );
      for (let index = 0; index < count; index++)
        this.spawnEnemy(
          this.time > 55 && this.random() < 0.24
            ? 'doc-thiem'
            : this.time > 25 && this.random() < 0.28
              ? 'thiet-nha-tru'
              : 'hac-lang',
        );
      this.spawnCooldown = Math.max(0.55, 2.4 - this.time / 330);
    }
    if (
      this.elitesSpawned < stage.eliteTimes.length &&
      this.time >= stage.eliteTimes[this.elitesSpawned]
    ) {
      const id = this.elitesSpawned++ === 0 ? 'hac-lang-tinh-anh' : 'thiet-nha-tru-tinh-anh';
      this.spawnEnemy(id);
      this.say(`${definitions[id].name} xuất hiện!`, 7);
      this.sounds.push('hurt');
    }
    if (!this.bossSpawned && this.time >= stage.duration) {
      this.bossSpawned = true;
      this.spawnEnemy('hac-phong-lang-vuong');
      this.say('Lang Vương giáng lâm — tiêu diệt boss để hoàn thành màn!', 9);
      this.sounds.push('hurt');
    }
  }
  private spawnEnemy(type: string): void {
    const definition = definitions[type];
    let point: Point = { x: 8, y: 8 };
    for (let attempts = 0; attempts < 40; attempts++) {
      const angle = this.random() * Math.PI * 2,
        range = 7 + this.random() * 2;
      point = {
        x: Math.max(-9.3, Math.min(9.3, this.position.x + Math.cos(angle) * range)),
        y: Math.max(-9.3, Math.min(9.3, this.position.y + Math.sin(angle) * range)),
      };
      if (
        distance(point, this.position) > 4.5 &&
        this.obstacles.every((o) => distance(point, o) > o.radius + definition.radius)
      )
        break;
    }
    const scale = definition.elite ? 1 : this.difficulty;
    this.enemies.push({
      ...point,
      id: ++this.sequence,
      type,
      hp: definition.hp * scale,
      maxHp: definition.hp * scale,
      radius: definition.radius,
      speed: definition.speed,
      damage: definition.damage * scale,
      facing: 'S',
      combo: 0,
      attack: 0,
      attackTime: 0,
      attackDuration: 0,
      impactAt: 0,
      impacted: false,
      cooldown: 0.4 + this.random(),
      target: { ...this.position },
      dead: false,
      deathTime: 0,
      hitTime: 0,
    });
    if (definition.elite) this.effect(point, 'boss-warning', 1.4);
  }
  private nearest(point: Point, range: number): EnemyState | undefined {
    let nearest: EnemyState | undefined;
    let closest = range;
    for (const enemy of this.enemies)
      if (!enemy.dead) {
        const d = distance(point, enemy);
        if (d < closest) {
          closest = d;
          nearest = enemy;
        }
      }
    return nearest;
  }
  private updatePlayerAttack(dt: number, stats: Stats): void {
    this.attackCooldown -= dt;
    this.fireCooldown -= dt;
    if (this.playerAttack) {
      this.playerAttackElapsed += dt;
      if (!this.playerImpacted && this.playerAttackElapsed >= this.playerAttackDuration * 0.5) {
        this.playerImpacted = true;
        const id = startingSkill(this.profile),
          rank = this.skills[id];
        const isSword = id === 'nguyen-khi-tram',
          awakened = rank === 6;
        this.cast(
          this.position,
          this.attackTarget,
          stats.damage * (1 + (rank - 1) * 0.32) * (awakened ? 1.75 : 1),
          awakened
            ? isSword
              ? 'sword-storm'
              : 'dragon-fist'
            : isSword
              ? 'sword-slash'
              : 'qi-punch',
          false,
          awakened ? 4 : isSword ? 2 : 1,
          awakened ? 3 : rank >= 3 ? 2 : 1,
          6.5,
          0.24 + rank * 0.04,
        );
      }
      if (this.playerAttackElapsed >= this.playerAttackDuration) this.playerAttack = 0;
    }
    const target = this.nearest(this.position, 7);
    if (!this.playerAttack && this.attackCooldown <= 0 && target) {
      this.playerAttack = (this.combo++ % 3) + 1;
      this.playerAttackElapsed = 0;
      this.playerImpacted = false;
      this.attackTarget = { ...target };
      this.playerAttackFacing = facingFromVelocity(direction(this.position, target));
      this.attackCooldown = Math.max(0.3, 0.82 / (1 + stats.haste));
      this.playerAttackDuration = Math.min(0.58, this.attackCooldown * 0.9);
    }
    const fireRank = this.skills['duong-viem-chuong'] ?? 0;
    if (fireRank && target && this.fireCooldown <= 0) {
      this.cast(
        this.position,
        target,
        stats.damage * (1.4 + fireRank * 0.3),
        'fire-palm',
        false,
        0,
        1 + Math.floor(fireRank / 3),
        5,
        0.4,
      );
      this.fireCooldown = 3 / (1 + stats.haste);
    }
  }
  private cast(
    from: Point,
    to: Point,
    damage: number,
    effect: string,
    enemy: boolean,
    pierce = 0,
    count = 1,
    speed = 4.5,
    radius = 0.2,
  ): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    for (let index = 0; index < count; index++) {
      const spread = (index - (count - 1) / 2) * 0.19;
      this.projectiles.push({
        ...from,
        id: ++this.sequence,
        velocity: { x: Math.cos(angle + spread) * speed, y: Math.sin(angle + spread) * speed },
        damage,
        radius,
        life: enemy ? 3 : 1.5,
        enemy,
        effect,
        pierce,
        hits: [],
      });
    }
  }
  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (enemy.dead) {
        enemy.deathTime += dt;
        continue;
      }
      enemy.hitTime = Math.max(0, enemy.hitTime - dt);
      enemy.cooldown -= dt;
      const definition = definitions[enemy.type],
        d = distance(enemy, this.position);
      if (enemy.attack) {
        enemy.attackTime += dt;
        if (!enemy.impacted && enemy.attackTime >= enemy.impactAt) {
          enemy.impacted = true;
          this.enemyImpact(enemy);
        }
        if (enemy.attackTime >= enemy.attackDuration) {
          enemy.attack = 0;
          enemy.cooldown =
            definition.behavior === 'boss'
              ? enemy.hp < enemy.maxHp * 0.5
                ? 0.65
                : 1.1
              : 0.95 + this.random() * 0.7;
        }
      } else {
        const ranged = definition.behavior === 'ranged';
        const attackRange = ranged
          ? 6
          : definition.behavior === 'boss'
            ? 5.5
            : definition.behavior === 'charge'
              ? 4.5
              : 0.8 + enemy.radius;
        if (d <= attackRange && enemy.cooldown <= 0) this.beginEnemyAttack(enemy);
        else if (d > (ranged ? 4 : 0.55)) {
          let velocity = direction(enemy, this.position);
          // Tách đàn quái tại chỗ để chúng không dồn vào cùng một điểm.
          for (const other of this.enemies)
            if (
              other !== enemy &&
              !other.dead &&
              Math.abs(other.x - enemy.x) < 0.8 &&
              Math.abs(other.y - enemy.y) < 0.8
            ) {
              const gap = distance(other, enemy),
                minimum = other.radius + enemy.radius;
              if (gap > 0.001 && gap < minimum) {
                const away = direction(other, enemy);
                velocity = { x: velocity.x + away.x * 0.45, y: velocity.y + away.y * 0.45 };
              }
            }
          const moved = moveWithCollisions(
            enemy,
            { x: velocity.x * enemy.speed, y: velocity.y * enemy.speed },
            dt,
            this.obstacles,
            stage.bounds,
            enemy.radius,
          );
          enemy.facing = facingFromVelocity(
            { x: moved.x - enemy.x, y: moved.y - enemy.y },
            enemy.facing,
          );
          enemy.x = moved.x;
          enemy.y = moved.y;
        }
      }
    }
    this.enemies = this.enemies.filter((enemy) => !enemy.dead || enemy.deathTime < 1.1);
  }
  private beginEnemyAttack(enemy: EnemyState): void {
    const definition = definitions[enemy.type];
    const combo = (enemy.combo++ % (definition.behavior === 'boss' ? 4 : 3)) + 1;
    enemy.attack =
      definition.behavior === 'ranged' && distance(enemy, this.position) > 2 ? 1 : combo;
    enemy.attackTime = 0;
    enemy.impacted = false;
    enemy.target = { ...this.position };
    enemy.facing = facingFromVelocity(direction(enemy, enemy.target));
    enemy.attackDuration =
      definition.behavior === 'boss'
        ? 1.35
        : definition.behavior === 'charge' && enemy.attack === 3
          ? 1.0
          : 0.8;
    const impactFrame =
      (definition.behavior === 'boss' && enemy.attack === 3) ||
      (definition.behavior === 'ranged' && enemy.attack === 2)
        ? 9
        : 7;
    enemy.impactAt = (enemy.attackDuration * impactFrame) / 14;
    const radius =
      definition.behavior === 'boss'
        ? enemy.attack === 4
          ? 3.4
          : enemy.attack === 3
            ? 1.7
            : 2
        : definition.behavior === 'charge'
          ? 1.1
          : 0.9;
    if (definition.elite || definition.behavior === 'charge')
      this.warning(enemy.attack === 4 ? enemy : enemy.target, radius, enemy.impactAt);
  }
  private enemyImpact(enemy: EnemyState): void {
    const definition = definitions[enemy.type];
    if (definition.behavior === 'ranged' && enemy.attack === 1) {
      this.cast(enemy, enemy.target, enemy.damage, 'poison-bolt', true);
      return;
    }
    if (
      (definition.behavior === 'charge' || definition.behavior === 'boss') &&
      enemy.attack === 3
    ) {
      const target = moveWithCollisions(
        enemy,
        { x: enemy.target.x - enemy.x, y: enemy.target.y - enemy.y },
        0.85,
        this.obstacles,
        stage.bounds,
        enemy.radius,
      );
      enemy.x = target.x;
      enemy.y = target.y;
    }
    const radius =
      definition.behavior === 'boss' ? (enemy.attack === 4 ? 3.4 : 2) : enemy.radius + 0.85;
    if (distance(enemy, this.position) < radius) this.hurt(enemy.damage);
    if (definition.elite)
      this.effect(enemy, enemy.attack === 4 ? 'boss-warning' : 'hit-spark', radius);
    if (definition.behavior === 'boss' && enemy.attack === 4) {
      for (let index = 0; index < 8; index++)
        this.cast(
          enemy,
          {
            x: enemy.x + Math.cos((index * Math.PI) / 4),
            y: enemy.y + Math.sin((index * Math.PI) / 4),
          },
          enemy.damage * 0.55,
          'poison-bolt',
          true,
          0,
          1,
          2.8,
        );
    }
  }
  private updateProjectiles(dt: number): void {
    for (const bullet of this.projectiles) {
      bullet.x += bullet.velocity.x * dt;
      bullet.y += bullet.velocity.y * dt;
      bullet.life -= dt;
      if (bullet.enemy) {
        if (distance(bullet, this.position) < bullet.radius + stage.playerRadius) {
          this.hurt(bullet.damage);
          bullet.life = 0;
        }
      } else {
        for (const enemy of this.enemies)
          if (
            !enemy.dead &&
            !bullet.hits.includes(enemy.id) &&
            distance(bullet, enemy) < bullet.radius + enemy.radius
          ) {
            this.damageEnemy(enemy, bullet.damage);
            bullet.hits.push(enemy.id);
            bullet.pierce--;
            if (bullet.effect === 'fire-palm') {
              for (const other of this.enemies)
                if (
                  other !== enemy &&
                  !other.dead &&
                  distance(other, enemy) < 1.2 + (this.skills['duong-viem-chuong'] ?? 0) * 0.12
                )
                  this.damageEnemy(other, bullet.damage * 0.65);
              this.effect(enemy, 'fire-palm', 1.8);
            }
            if (bullet.pierce < 0) {
              bullet.life = 0;
              break;
            }
          }
      }
    }
    this.projectiles = this.projectiles.filter((bullet) => bullet.life > 0);
  }
  private damageEnemy(enemy: EnemyState, damage: number): void {
    if (enemy.dead) return;
    const critical = this.random() < this.currentStats().crit;
    const amount = damage * (critical ? 2 : 1);
    enemy.hp -= amount;
    enemy.hitTime = 0.1;
    this.number(enemy, Math.round(amount), critical ? 'critical' : 'damage');
    this.sounds.push('hit');
    if (enemy.hp <= 0) this.kill(enemy);
  }
  private hurt(damage: number): void {
    if (this.invulnerability > 0 || this.mode !== 'playing') return;
    const amount = Math.max(1, damage - this.currentStats().armor * 1.6);
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerability = 0.6;
    this.number(this.position, Math.round(amount), 'hurt');
    this.sounds.push('hurt');
  }
  private kill(enemy: EnemyState): void {
    enemy.dead = true;
    enemy.deathTime = 0;
    enemy.attack = 0;
    this.kills++;
    const definition = definitions[enemy.type];
    this.drops.push({
      x: enemy.x,
      y: enemy.y,
      id: ++this.sequence,
      kind: 'xp',
      value: definition.xp,
    });
    this.loot.cultivation += definition.elite ? 30 : 0.6;
    if (this.random() < 0.3)
      this.drops.push({
        x: enemy.x + 0.2,
        y: enemy.y,
        id: ++this.sequence,
        kind: 'stone',
        value: 2,
      });
    if (this.random() < 0.18) {
      const resource: Resource =
        definition.behavior === 'ranged'
          ? 'linh-thao'
          : definition.behavior === 'charge'
            ? 'thiet-khoang'
            : 'da-thu';
      this.drops.push({
        x: enemy.x - 0.2,
        y: enemy.y,
        id: ++this.sequence,
        kind: resource,
        value: 1,
      });
    }
    if (this.random() < 0.045)
      this.drops.push({
        x: enemy.x,
        y: enemy.y - 0.25,
        id: ++this.sequence,
        kind: 'heal',
        value: 18,
      });
    if (definition.elite) {
      this.loot.stone += 50;
      this.addResource('yeu-dan', 3);
      this.addResource('thuc-an-sung-vat', 3);
      this.addResource('tinh-thach-tien-hoa', 1);
      if (enemy.type === 'hac-lang-tinh-anh') {
        this.addResource('trung-linh-ho', 1);
        this.loot.blueprints.push('ngoc-lien-bi-bao');
      }
      if (enemy.type === 'thiet-nha-tru-tinh-anh') {
        this.loot.blueprints.push('liet-duong-kiem');
        this.loot.equipment.push('ngoc-gioi');
      }
      this.say(`Đã hạ ${definition.name}! Chiến lợi phẩm chờ tổng kết.`);
    }
    if (enemy.type === 'hac-phong-lang-vuong') {
      this.addResource('hat-sen-dot-pha', 1);
      this.addResource('trung-thanh-dieu', 1);
      this.addResource('tinh-thach-tien-hoa', 2);
      this.loot.blueprints.push('liet-duong-kiem', 'ngoc-lien-bi-bao');
      this.finish(true, 'Lang Vương đã bị đánh bại. Hắc Phong Sơn yên bình trở lại.');
    }
  }
  private collect(dt: number, stats: Stats): void {
    for (const drop of this.drops) {
      const d = distance(drop, this.position);
      if (d < stats.pickup) {
        const towards = direction(drop, this.position);
        drop.x += towards.x * Math.min(d, (4 + (stats.pickup - d) * 4) * dt);
        drop.y += towards.y * Math.min(d, (4 + (stats.pickup - d) * 4) * dt);
      }
      if (distance(drop, this.position) < 0.28) {
        if (drop.kind === 'xp') this.xp += drop.value;
        else if (drop.kind === 'heal') {
          this.hp = Math.min(stats.hp, this.hp + drop.value);
          this.effect(this.position, 'healing', 0.8);
        } else if (drop.kind === 'stone') this.loot.stone += drop.value;
        else this.addResource(drop.kind, drop.value);
        drop.value = 0;
      }
    }
    this.drops = this.drops.filter((drop) => drop.value > 0);
    // Cap trên mặt đất nhưng không xóa XP: ghép các hạt gần nhau giữ nguyên tổng giá trị.
    if (this.drops.length > 250) {
      const xp = this.drops.filter((drop) => drop.kind === 'xp');
      const first = xp[0];
      if (first) {
        for (const drop of xp.slice(1, 50)) {
          first.value += drop.value;
          drop.value = 0;
        }
        this.drops = this.drops.filter((drop) => drop.value > 0);
      }
    }
  }
  private updatePet(dt: number, stats: Stats): void {
    const id = this.profile.activePet,
      pet = id ? this.profile.pets[id] : null;
    if (!id || !pet) return;
    const target = this.nearest(this.position, 5),
      aim = target ?? { x: this.position.x - 0.8, y: this.position.y + 0.8 };
    const towards = direction(this.petPosition, aim);
    const speed = distance(this.petPosition, this.position) > 3 ? 4 : 2.8;
    if (
      !this.petAttack &&
      distance(this.petPosition, aim) > (id === 'thanh-dieu' && target ? 2.8 : 0.5)
    ) {
      this.petPosition = moveWithCollisions(
        this.petPosition,
        { x: towards.x * speed, y: towards.y * speed },
        dt,
        id === 'thanh-dieu' ? [] : this.obstacles,
        stage.bounds,
        0.2,
      );
      this.petFacing = facingFromVelocity(towards, this.petFacing);
    }
    this.petCooldown -= dt;
    if (
      !this.petAttack &&
      target &&
      this.petCooldown <= 0 &&
      distance(this.petPosition, target) < (id === 'thanh-dieu' ? 5 : 1.4)
    ) {
      this.petAttack = (this.petCombo++ % 3) + 1;
      this.petAttackElapsed = 0;
      this.petCooldown = 1.4;
      this.petFacing = facingFromVelocity(direction(this.petPosition, target));
    }
    if (this.petAttack) {
      const before = this.petAttackElapsed;
      this.petAttackElapsed += dt;
      if (before < 0.29 && this.petAttackElapsed >= 0.29 && target) {
        const damage = stats.damage * (0.35 + pet.level * 0.12) * (pet.evolved ? 1.7 : 1);
        if (id === 'thanh-dieu')
          this.cast(this.petPosition, target, damage, 'wind-feather', false, 1);
        else if (distance(this.petPosition, target) < 1.7) {
          this.damageEnemy(target, damage);
          this.effect(target, pet.evolved ? 'spirit-bolt' : 'hit-spark', 0.8);
        }
      }
      if (this.petAttackElapsed >= 0.58) this.petAttack = 0;
    }
  }
  private addResource(id: Resource, amount: number): void {
    this.loot.resources[id] = (this.loot.resources[id] ?? 0) + amount;
  }
  private effect(point: Point, effect: string, radius: number): void {
    this.visuals.push({
      ...point,
      id: ++this.sequence,
      kind: 'effect',
      effect,
      life: 0.4,
      total: 0.4,
      radius,
    });
  }
  private number(point: Point, value: number, effect: string): void {
    if (this.visuals.filter((v) => v.kind === 'number').length < 35)
      this.visuals.push({
        ...point,
        id: ++this.sequence,
        kind: 'number',
        effect,
        value,
        life: 0.6,
        total: 0.6,
        radius: 0,
      });
  }
  private warning(point: Point, radius: number, life: number): void {
    this.visuals.push({
      ...point,
      id: ++this.sequence,
      kind: 'warning',
      effect: 'warning',
      radius,
      life,
      total: life,
    });
  }
  abandon(): void {
    if (this.mode !== 'result')
      this.finish(false, 'Đã rút lui khỏi màn. Nhận 30% tu vi và tài nguyên.');
  }
  private finish(won: boolean, reason: string): void {
    if (this.result) return;
    this.loot.cultivation += won ? 500 : 500 * Math.min(1, this.time / stage.duration);
    this.loot.stone += won ? 150 : 100 * Math.min(1, this.time / stage.duration);
    this.loot.blueprints = [...new Set(this.loot.blueprints)];
    this.loot.equipment = [...new Set(this.loot.equipment)];
    const raw = structuredClone(this.loot);
    this.result = {
      won,
      reason,
      time: this.time,
      kills: this.kills,
      level: this.level,
      raw,
      rewards: settleLoot(raw, won, this.random),
      seed: this.seed,
    };
    this.mode = 'result';
    this.sounds.push(won ? 'win' : 'hurt');
  }
  petActor(): string | null {
    const id = this.profile.activePet;
    return id && this.profile.pets[id]
      ? this.profile.pets[id].evolved
        ? pets[id].evolvedActor
        : pets[id].actor
      : null;
  }
}
