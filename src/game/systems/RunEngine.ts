import { stage } from '../../data/stages.ts';
import { AdvancedSkills, type AdvancedContext } from './AdvancedSkills.ts';
import { petAttackPower } from '../../data/worldTwoEconomy.ts';
import { worldTwoTier } from '../../data/worldTwoEconomy.ts';
import { WorldTwoMission, type MissionContext } from './WorldTwoMission.ts';
import type { StageDef } from '../../data/stages.ts';
import { enemies as definitions } from '../../data/enemies.ts';
import { eligibleCards, statCards } from '../../data/skills.ts';
import { permanentStats, startingSkill, settleLoot } from '../../domain/profile.ts';
import { pets } from '../../data/pets.ts';
import {
  flameRingRadius,
  flameRingDamagePerSecond,
  flameAuraRules,
  skillEffectTiming,
} from '../../data/skillEffects.ts';
import {
  pierceForRank,
  projectileRules,
  projectileOutsideBounds,
  sweptCircleHit,
  distanceToBoundary,
} from '../../data/projectiles.ts';
import { moveWithCollisions, facingFromVelocity } from '../math/worldPhysics.ts';
import {
  spawnBeyondView,
  validSpawnView,
  outsideSpawnView,
  type SpawnView,
} from '../math/spawnView.ts';
import { StageMechanics } from './StageMechanics.ts';
import { mechanicRules } from '../../data/stageMechanics.ts';
import { augments, augmentRules } from '../../data/augments.ts';
import {
  primaryAttack,
  firePalmAttack,
  lightningAttack,
  projectileSpread,
} from '../../data/combatSkills.ts';
import { canAwaken } from '../../data/awakenings.ts';
import { Opportunities, type OpportunityEvent } from './Opportunities.ts';
import { opportunityRules, opportunityStages } from '../../data/opportunities.ts';
import type { OpportunityState } from '../../shared/opportunities';
import type { AugmentId } from '../../shared/augments';
import type { DamageOrigin, IncomingSource } from '../../shared/combatSummary';
import { RunStatistics } from './RunStatistics.ts';
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
  CombatZone,
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

interface EnemyAttackPlan {
  center: Point;
  radius: number;
  chargeTo?: Point;
  projectiles?: 'fan' | 'ring';
  effect: string;
  summon?: boolean;
}

interface PlayerShot {
  from: Point;
  to: Point;
  damage: number;
  effect: string;
  pierce: number;
  count: number;
  speed: number;
  radius: number;
  skillId: string;
  rank: number;
  augment?: AugmentId;
}
type PendingAttack =
  | { kind: 'shot'; delay: number; shot: PlayerShot }
  | { kind: 'strike'; delay: number; targetId: number; damage: number; rank: number };

interface FlameContact {
  damage: number;
  feedbackIn: number;
  criticalIn: number;
  critical: boolean;
  hadCritical: boolean;
}

/** Toàn bộ chiến đấu chạy độc lập với renderer để kiểm thử một lượt 10 phút có thể tái lập. */
export class RunEngine {
  mode: 'playing' | 'paused' | 'levelup' | 'result' = 'playing';
  readonly seed: number;
  readonly random: () => number;
  private readonly techniqueRandom: () => number;
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
  augments: AugmentId[] = [];
  rerollsRemaining = 1;
  combatZones: CombatZone[] = [];
  private pendingAttacks: PendingAttack[] = [];
  private readonly cardRandom: () => number;
  enemies: EnemyState[] = [];
  drops: Drop[] = [];
  projectiles: Projectile[] = [];
  visuals: VisualEvent[] = [];
  sounds: string[] = [];
  loot: Loot = { stone: 0, cultivation: 0, resources: {}, equipment: [], blueprints: [] };
  result: RunResult | null = null;
  readonly statistics = new RunStatistics();
  readonly advanced = new AdvancedSkills();
  dashCharges = 1;
  private wingRank = 0;
  private dashRecharge = 4.5;
  private queuedDash = false;
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
  private flameWaveIn = 0;
  private flameContacts = new Map<number, FlameContact>();
  private chainCooldown = 1.5;
  private attackPlans = new Map<number, EnemyAttackPlan>();
  private spawnCooldown = 0.6;
  private sequence = 0;
  private combo = 0;
  private petCombo = 0;
  private elitesSpawned = 0;
  private bossSpawned = false;
  private lastInput: Point = { x: 0.707, y: -0.707 };
  private difficulty = 1;
  private testDamageMultiplier = 1;
  private presentationTimeScale = 1;
  private spawnView: SpawnView | null = null;
  readonly profile: Profile;
  readonly obstacles: CircleObstacle[];
  readonly stage: StageDef;
  readonly mechanics: StageMechanics;
  readonly opportunities: Opportunities;
  readonly mission: WorldTwoMission | null;
  constructor(
    profile: Profile,
    obstacles: CircleObstacle[],
    seed = Math.floor(Math.random() * 0xffffffff),
    stageDef: StageDef = stage,
  ) {
    this.profile = profile;
    this.obstacles = obstacles;
    this.seed = seed;
    this.random = seededRandom(seed);
    this.techniqueRandom = seededRandom(seed ^ 0x6d2b79f5);
    // Đổi thẻ không tiêu thụ luồng RNG của chiến đấu, sinh quái hoặc chiến lợi phẩm.
    this.cardRandom = seededRandom(seed ^ 0x3b82c6a1);
    this.stage = stageDef;
    this.mission = stageDef.mission ? new WorldTwoMission(stageDef) : null;
    // Luồng ngẫu nhiên riêng để môi trường không làm đổi thứ tự thẻ và chiến lợi phẩm.
    this.mechanics = new StageMechanics(
      stageDef.id,
      stageDef.duration,
      stageDef.bounds,
      seededRandom(seed ^ 0x51a9b37d),
    );
    this.notice = stageDef.objective;
    this.opportunities = new Opportunities(stageDef, obstacles, seededRandom(seed ^ 0x26ea4c91));
    this.stats = permanentStats(profile);
    this.hp = this.stats.hp;
    this.skills = { [startingSkill(profile)]: 1 };
    this.pills = Math.min(3, profile.pills['hoi-nguyen-dan']);
  }
  get nextXp(): number {
    return 8 + this.level * 4;
  }
  get damageMultiplier(): number {
    return this.testDamageMultiplier;
  }
  setDamageMultiplier(value: number): void {
    // Hỗ trợ kiểm thử trong lượt; không ghi đè chỉ số hay dữ liệu nhân vật vĩnh viễn.
    this.testDamageMultiplier = Number.isFinite(value) ? Math.max(1, Math.min(100, value)) : 1;
  }
  setSpawnView(view: SpawnView | null): void {
    // Camera là dữ liệu đầu vào của renderer, không thay phép chiếu hay tọa độ chiến đấu.
    this.spawnView =
      view && validSpawnView(view)
        ? {
            corners: view.corners.map((point) => ({ ...point })),
            padding: Number.isFinite(view.padding) ? Math.max(0, view.padding!) : 1.1,
          }
        : null;
  }
  setPresentationTimeScale(value: number): void {
    // Tăng tốc lượt không làm tia sét/vòng lửa biến mất trước khi trình duyệt kịp vẽ.
    this.presentationTimeScale = Number.isFinite(value) ? Math.max(1, Math.min(16, value)) : 1;
  }
  private currentStats(): Stats {
    const stats = { ...this.stats };
    for (const key of Object.keys(stats) as (keyof Stats)[]) stats[key] += this.bonus[key];
    stats.hp += (this.skills['cuong-the'] ?? 0) * 12;
    stats.armor += this.skills['cuong-the'] ?? 0;
    stats.haste += (this.skills['tu-khi'] ?? 0) * 0.08;
    stats.pickup += (this.skills['tu-khi'] ?? 0) * 0.25;
    stats.damage += (this.skills['hoa-linh'] ?? 0) * 5;
    stats.regen += (this.skills['hoa-linh'] ?? 0) * 0.08;
    stats.crit = Math.min(0.8, stats.crit + (this.skills['loi-tam'] ?? 0) * 0.03);
    stats.haste = Math.min(2.5, stats.haste + (this.skills['loi-tam'] ?? 0) * 0.04);
    stats.speed = Math.min(4.8, stats.speed + (this.skills['khinh-than'] ?? 0) * 0.13);
    stats.damage *= 1 + this.advanced.maBonus(this.time, this.skills['nhap-ma'] ?? 0);
    return stats;
  }
  view(): RunView {
    const boss = this.enemies.find((enemy) => enemy.type === this.stage.bossId && !enemy.dead);
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
      dashCharges: this.dashCharges,
      dashMaxCharges: this.skills['phong-loi-vu-duc'] ? 2 : 1,
      burst: this.advanced.maView(this.time, this.skills['nhap-ma'] ?? 0),
      boss: boss ? { hp: boss.hp, maxHp: boss.maxHp, name: definitions[boss.type].name } : null,
      notice: this.time < this.noticeUntil ? this.notice : '',
      seed: this.seed,
      mechanic: this.mechanics.view(),
      augments: [...this.augments],
      rerollsRemaining: this.rerollsRemaining,
      opportunity: this.opportunities.view({
        time: this.time,
        position: this.position,
        enemies: this.enemies,
      }),
      opportunitiesCompleted: this.opportunities.completed,
      mission: this.mission?.view(this.position) ?? null,
    };
  }
  private say(text: string, duration = 5): void {
    this.notice = text;
    this.noticeUntil = this.time + duration;
  }
  pause(): void {
    this.queuedDash = false;
    if (this.mode === 'playing') this.mode = 'paused';
  }
  resume(): void {
    if (this.mode === 'paused') this.mode = 'playing';
  }
  choose(id: string): boolean {
    if (this.mode !== 'levelup') return false;
    const card = this.choices.find((card) => card.id === id);
    if (!card) return false;
    if (card.kind === 'awaken' && (!card.skill || !canAwaken(card.skill, this.skills)))
      return false;
    const oldHp = this.currentStats().hp;
    if (card.augment) {
      const def = augments[card.augment];
      if (
        !def ||
        (this.skills[def.skill] ?? 0) < def.minRank ||
        this.augments.some((id) => augments[id].skill === def.skill)
      )
        return false;
      this.augments.push(card.augment);
      this.say(`Đã lĩnh ngộ ${def.name}`, 4);
    } else if (card.skill)
      this.skills[card.skill] = card.kind === 'awaken' ? 6 : (this.skills[card.skill] ?? 0) + 1;
    if (card.kind === 'awaken') this.say(card.name.replace('Thức tỉnh ·', 'Đã thức tỉnh'), 5);
    if (card.stat) this.bonus[card.stat] += this.statCardAmount(card.stat);
    this.hp = Math.min(
      this.currentStats().hp,
      this.hp + Math.max(0, this.currentStats().hp - oldHp),
    );
    this.choices = [];
    this.mode = 'playing';
    this.checkLevel();
    this.sounds.push(card.kind === 'awaken' ? 'awaken' : 'level');
    return true;
  }
  private statCardAmount(stat: keyof Stats): number {
    const base = statCards.find((card) => card.stat === stat)!.amount;
    const amount =
      base *
      (['damage', 'hp', 'armor', 'regen'].includes(stat) ? 1 + this.stage.stageIndex * 0.6 : 1);
    const cap = stat === 'crit' ? 0.8 : stat === 'haste' ? 2.5 : stat === 'speed' ? 4.8 : Infinity;
    return Math.max(0, Math.min(amount, cap - this.currentStats()[stat]));
  }
  private statCardDescription(stat: keyof Stats): string {
    const amount = this.statCardAmount(stat);
    const value = (number: number) => number.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    if (stat === 'damage') return `+${value(amount)} công kích trong lượt.`;
    if (stat === 'hp') return `+${value(amount)} máu tối đa, hồi ${value(amount)} máu.`;
    if (stat === 'armor') return `+${value(amount)} giáp trong lượt.`;
    if (stat === 'regen') return `+${value(amount)} hồi máu mỗi giây.`;
    if (stat === 'haste') return `+${value(amount * 100)}% tốc đánh trong lượt.`;
    if (stat === 'crit') return `+${value(amount * 100)}% chí mạng (sát thương gấp đôi).`;
    if (stat === 'speed') return `+${value(amount)} tốc độ di chuyển.`;
    return `+${value(amount)} phạm vi hút XP.`;
  }
  private checkLevel(): void {
    if (this.mode !== 'playing' || this.xp < this.nextXp) return;
    this.xp -= this.nextXp;
    this.level++;
    this.choices = this.drawCards();
    this.queuedDash = false;
    this.mode = 'levelup';
    this.sounds.push('level');
    this.effect(this.position, 'level-up', 1.2);
  }
  private drawCards(excluded: string[] = []): Card[] {
    const pool = eligibleCards(
      [startingSkill(this.profile), ...this.profile.selectedSkills],
      this.skills,
      this.augments,
    )
      .filter((card) => !card.stat || this.statCardAmount(card.stat) > 1e-7)
      .map((card) =>
        card.stat ? { ...card, description: this.statCardDescription(card.stat) } : card,
      );
    // Các thẻ kỹ năng có trọng số cao hơn thẻ chỉ số; thẻ thức tỉnh luôn được ưu tiên khi hợp lệ.
    const weighted = pool.map((card) => ({
      card,
      weight:
        this.cardRandom() * (card.kind === 'stat' ? 1 : 2.8) + (card.kind === 'awaken' ? 8 : 0),
    }));
    const sorted = weighted.sort((a, b) => b.weight - a.weight).map((entry) => entry.card);
    // Ưu tiên ba lựa chọn mới; nếu pool nhỏ thì chỉ lặp lại số thẻ tối thiểu cần thiết.
    return [
      ...sorted.filter((card) => !excluded.includes(card.id)),
      ...sorted.filter((card) => excluded.includes(card.id)),
    ].slice(0, 3);
  }
  reroll(): boolean {
    if (this.mode !== 'levelup' || this.rerollsRemaining < 1) return false;
    const previous = this.choices.map((card) => card.id);
    const next = this.drawCards(previous);
    if (!next.some((card) => !previous.includes(card.id))) return false;
    this.choices = next;
    this.rerollsRemaining--;
    this.sounds.push('level');
    return true;
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
    this.hp = Math.min(
      this.currentStats().hp,
      this.hp + this.currentStats().hp * (this.profile.realm >= 47 ? 0.6 : 0.45),
    );
    this.effect(this.position, 'healing', 1);
    this.sounds.push('level');
    return true;
  }
  dash(): boolean {
    if (this.mode !== 'playing') return false;
    this.syncDash();
    if (this.dashCharges <= 0) return false;
    if (this.dashTime > 0 && this.wingRank) {
      this.queuedDash = true;
      return true;
    }
    if (!this.wingRank && this.dashCooldown > 0) return false;
    this.dashCharges--;
    this.dashTime = 0.24;
    if (this.dashCooldown <= 0) this.dashCooldown = this.dashRecharge;
    const invulnerability = 0.4 + (this.skills['khinh-than'] ?? 0) * 0.05;
    this.invulnerability = this.wingRank
      ? Math.max(this.invulnerability, invulnerability)
      : invulnerability;
    return true;
  }
  private syncDash(): void {
    const rank = this.skills['phong-loi-vu-duc'] ?? 0;
    if (!rank && this.dashCooldown <= 0) this.dashCharges = 1;
    const recharge = rank
      ? Math.max(2, (4.5 - rank * 0.3) * (1 - (this.skills['khinh-than'] ?? 0) * 0.05))
      : 4.5 * (1 - (this.skills['khinh-than'] ?? 0) * 0.05);
    if (rank && !this.wingRank) this.dashCharges = Math.min(2, this.dashCharges + 1);
    if (rank && this.dashCooldown > 0 && recharge !== this.dashRecharge)
      this.dashCooldown *= recharge / this.dashRecharge;
    this.wingRank = rank;
    this.dashRecharge = recharge;
  }
  private updateDash(dt: number): void {
    this.syncDash();
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
      if (this.dashCooldown <= 0) {
        this.dashCharges = Math.min(this.wingRank ? 2 : 1, this.dashCharges + 1);
        this.dashCooldown =
          this.dashCharges < (this.wingRank ? 2 : 1) ? this.dashRecharge + this.dashCooldown : 0;
      }
    }
    if (this.queuedDash && this.dashTime <= 0) {
      this.queuedDash = false;
      this.dash();
    }
  }
  private advancedContext(): AdvancedContext {
    return {
      time: this.time,
      position: this.position,
      ranks: this.skills,
      augments: this.augments,
      enemies: this.enemies,
      bossId: this.stage.bossId,
      active: () => this.mode === 'playing',
      stats: () => this.currentStats(),
      random: this.random,
      motionRandom: this.techniqueRandom,
      bounds: this.stage.bounds,
      sound: (id) => this.sounds.push(id),
      hit: (enemy, damage, id, rank, critical, ignoreMark, quiet) => {
        const hp = enemy.hp;
        return Math.min(
          hp,
          this.damageEnemy(enemy, damage, !quiet, critical, { id, rank }, ignoreMark),
        );
      },
      feedback: (enemy, damage, critical) => {
        if (damage > 0) {
          this.number(enemy, Math.max(1, Math.round(damage)), critical ? 'critical' : 'damage');
          enemy.hitTime = 0.07;
        }
      },
      push: (enemy, from, amount) => {
        const aim = direction(from, enemy);
        const point = moveWithCollisions(
          enemy,
          { x: aim.x * amount, y: aim.y * amount },
          1,
          this.obstacles,
          this.stage.bounds,
          enemy.radius,
        );
        enemy.x = point.x;
        enemy.y = point.y;
      },
    };
  }
  interact(): boolean {
    if (this.mode !== 'playing') return false;
    if (this.mission?.interact(this.position)) return true;
    const events = this.opportunities.interact({
      time: this.time,
      position: this.position,
      enemies: this.enemies,
    });
    if (!events.length) return false;
    this.handleOpportunities(events);
    if (this.mode === 'playing') this.checkLevel();
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
    this.updateDash(dt);
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
      this.stage.bounds,
      this.stage.playerRadius,
    );
    this.movement = { x: this.position.x - old.x, y: this.position.y - old.y };
    this.distance += distance(old, this.position);
    if (distance(old, this.position) > 1e-6)
      this.facing = facingFromVelocity(this.movement, this.facing);
    this.difficulty = this.stage.mission
      ? this.stage.enemyScale
      : this.stage.enemyScale * (1 + (this.time / this.stage.duration) * 0.7);
    this.updateMission(dt);
    if (this.mode !== 'playing') return;
    this.updateMechanics(dt, stats);
    if (this.hp <= 0) {
      this.finish(false, 'Sinh lực cạn kiệt. Tu vi và chiến lợi phẩm nhận 30%.');
      return;
    }
    this.handleOpportunities(
      this.bossSpawned
        ? this.opportunities.clear()
        : this.opportunities.tick(dt, {
            time: this.time,
            position: this.position,
            enemies: this.enemies,
            progress: this.mission
              ? this.mission.objectiveProgress * this.stage.duration
              : undefined,
          }),
    );
    this.spawn(dt);
    this.advanced.tick(dt, this.advancedContext(), this.presentationTimeScale);
    if (this.mode !== 'playing') return;
    stats.damage = this.currentStats().damage;
    this.updatePendingAttacks(dt);
    this.updateCombatZones(dt);
    if (this.mode !== 'playing') return;
    this.updateFlameAura(dt, stats);
    if (this.mode !== 'playing') return;
    this.updatePlayerAttack(dt, stats);
    if (this.mode !== 'playing') return;
    this.updateEnemies(dt);
    if (this.hp <= 0) {
      this.finish(false, 'Sinh lực cạn kiệt. Tu vi và chiến lợi phẩm nhận 30%.');
      return;
    }
    this.updateProjectiles(dt);
    if (this.mode === 'playing') {
      this.updatePet(dt, stats);
      if (this.mode === 'playing') this.collect(dt, stats);
    }
    for (const effect of this.visuals)
      effect.life -= effect.kind === 'warning' ? dt : dt / this.presentationTimeScale;
    this.visuals = this.visuals.filter((effect) => effect.life > 0);
    if (this.hp <= 0 && this.mode === 'playing')
      this.finish(false, 'Sinh lực cạn kiệt. Tu vi và chiến lợi phẩm nhận 30%.');
    if (this.mode === 'playing') this.checkLevel();
  }
  private missionContext(): MissionContext {
    return {
      time: this.time,
      position: this.position,
      enemies: this.enemies,
      active: () => this.mode === 'playing',
      spawn: (type, point) => this.spawnEnemy(type, undefined, point),
      say: (text) => this.say(text, 7),
      hurt: (damage, source) => this.hurt(damage, source),
      heal: (fraction) => {
        this.hp = Math.min(this.currentStats().hp, this.hp + this.currentStats().hp * fraction);
      },
      fail: () =>
        this.finish(
          false,
          `${this.mission?.protected?.name ?? 'Mục tiêu'} không được bảo vệ. Thất bại nhiệm vụ.`,
          'mission-failed',
        ),
    };
  }
  private updateMission(dt: number): void {
    if (!this.mission) return;
    this.mission.tick(dt, this.missionContext());
    if (this.mode === 'playing' && this.mission.completed)
      this.finish(true, this.mission.victoryMessage());
  }
  private spawn(dt: number): void {
    this.spawnCooldown -= dt;
    const reserve =
      (this.mechanics.definition?.kind === 'squad' ? mechanicRules.squadEnemies.length : 0) +
      (this.opportunities.schedule.length ? opportunityRules.reserve : 0) +
      (this.mission ? 8 : 0);
    const normalLimit = this.bossSpawned
      ? Math.min(24, this.stage.maxEnemies)
      : Math.max(0, this.stage.maxEnemies - reserve);
    if (
      this.spawnCooldown <= 0 &&
      this.enemies.filter((enemy) => !enemy.dead).length < normalLimit
    ) {
      const count = Math.min(
        1 + Math.floor(this.time / 150) + Math.floor(this.stage.stageIndex / 2),
        normalLimit - this.enemies.filter((enemy) => !enemy.dead).length,
      );
      const wave = [...this.stage.spawnWaves].reverse().find((wave) => this.time >= wave.from)!;
      const totalWeight = Object.values(wave.weights).reduce((sum, value) => sum + value, 0);
      for (let index = 0; index < count; index++) {
        let roll = this.random() * totalWeight;
        for (const [id, weight] of Object.entries(wave.weights)) {
          roll -= weight;
          if (roll <= 0) {
            this.spawnEnemy(id);
            break;
          }
        }
      }
      this.spawnCooldown = Math.max(0.55, 2.4 - this.time / 330);
    }
    if (
      this.elitesSpawned < this.stage.eliteTimes.length &&
      this.time >= this.stage.eliteTimes[this.elitesSpawned]
    ) {
      const id = this.stage.elites[this.elitesSpawned++].id;
      this.spawnEnemy(id);
      this.say(`${definitions[id].name} xuất hiện!`, 7);
      this.sounds.push('boss-roar');
    }
    if (
      !this.bossSpawned &&
      (this.mission ? this.mission.bossReady : this.time >= this.stage.duration)
    ) {
      this.bossSpawned = true;
      this.spawnEnemy(this.stage.bossId, undefined, this.mission ? { x: 0, y: -8 } : undefined);
      this.handleOpportunities(this.opportunities.clear());
      this.say(
        this.mission
          ? `${definitions[this.stage.bossId].name} xuất hiện — ${this.stage.objective}`
          : `${definitions[this.stage.bossId].name} xuất hiện — tiêu diệt boss để hoàn thành màn!`,
        9,
      );
      this.sounds.push('boss-roar');
    }
  }
  private spawnEnemy(type: string, near?: EnemyState, fixedPoint?: Point): EnemyState | null {
    const definition = definitions[type];
    let point: Point = { x: 8, y: 8 };
    let telegraphed = false;
    if (this.spawnView && !fixedPoint) {
      const placement = spawnBeyondView(
        this.spawnView,
        this.stage.bounds,
        this.position,
        definition.radius,
        this.obstacles,
        this.random,
      );
      if (!placement) return null;
      point = { x: placement.x, y: placement.y };
      telegraphed = placement.telegraphed;
    }
    // Mô phỏng không có renderer giữ vành mặc định, giúp cân bằng headless tái lập.
    for (let attempts = 0; !this.spawnView && !fixedPoint && attempts < 40; attempts++) {
      const angle = this.random() * Math.PI * 2,
        range = 7 + this.random() * 2;
      point = {
        x: Math.max(
          this.stage.bounds.minX + definition.radius,
          Math.min(
            this.stage.bounds.maxX - definition.radius,
            this.position.x + Math.cos(angle) * range,
          ),
        ),
        y: Math.max(
          this.stage.bounds.minY + definition.radius,
          Math.min(
            this.stage.bounds.maxY - definition.radius,
            this.position.y + Math.sin(angle) * range,
          ),
        ),
      };
      if (
        distance(point, this.position) > 4.5 &&
        this.obstacles.every((o) => distance(point, o) > o.radius + definition.radius)
      )
        break;
    }
    if (fixedPoint) {
      point = { ...fixedPoint };
      telegraphed = true;
    }
    if (near) {
      let clustered = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        const pointNear = {
          x: near.x + (this.random() - 0.5) * 2.6,
          y: near.y + (this.random() - 0.5) * 2.6,
        };
        if (near.spawnGrace) {
          const bounds = this.stage.bounds;
          if (near.x <= bounds.minX + near.radius + 0.01)
            pointNear.x = bounds.minX + definition.radius;
          else if (near.x >= bounds.maxX - near.radius - 0.01)
            pointNear.x = bounds.maxX - definition.radius;
          else if (near.y <= bounds.minY + near.radius + 0.01)
            pointNear.y = bounds.minY + definition.radius;
          else pointNear.y = bounds.maxY - definition.radius;
        }
        if (
          pointNear.x < this.stage.bounds.minX + definition.radius ||
          pointNear.x > this.stage.bounds.maxX - definition.radius ||
          pointNear.y < this.stage.bounds.minY + definition.radius ||
          pointNear.y > this.stage.bounds.maxY - definition.radius ||
          distance(pointNear, this.position) <= 4.5 ||
          this.obstacles.some(
            (obstacle) => distance(pointNear, obstacle) <= obstacle.radius + definition.radius,
          )
        )
          continue;
        const hidden =
          !this.spawnView || outsideSpawnView(pointNear, this.spawnView, definition.radius);
        if (!hidden && !near.spawnGrace) continue;
        point = pointNear;
        telegraphed = !hidden;
        clustered = true;
        break;
      }
      if (!clustered) {
        // Mép ngoài camera 0,5× có thể rất hẹp: dùng chỗ của đội trưởng rồi để AI tách đàn,
        // tránh chọn một mép ngẫu nhiên khác làm tổ đội bị chia sang hai cánh bản đồ.
        const inward = direction(near, this.position),
          offset = 0.006 * (1 + (this.sequence % 5));
        const fallback = { x: near.x + inward.x * offset, y: near.y + inward.y * offset };
        if (near.spawnGrace) {
          const bounds = this.stage.bounds;
          if (near.x <= bounds.minX + near.radius + 0.01)
            fallback.x = bounds.minX + definition.radius;
          else if (near.x >= bounds.maxX - near.radius - 0.01)
            fallback.x = bounds.maxX - definition.radius;
          else if (near.y <= bounds.minY + near.radius + 0.01)
            fallback.y = bounds.minY + definition.radius;
          else fallback.y = bounds.maxY - definition.radius;
        }
        const hidden =
          !this.spawnView || outsideSpawnView(fallback, this.spawnView, definition.radius);
        if (
          (!hidden && !near.spawnGrace) ||
          fallback.x < this.stage.bounds.minX + definition.radius ||
          fallback.x > this.stage.bounds.maxX - definition.radius ||
          fallback.y < this.stage.bounds.minY + definition.radius ||
          fallback.y > this.stage.bounds.maxY - definition.radius ||
          this.obstacles.some(
            (obstacle) => distance(fallback, obstacle) <= obstacle.radius + definition.radius,
          )
        )
          return null;
        point = fallback;
        telegraphed = !hidden;
      }
    }
    const scale = definition.elite ? this.stage.enemyScale : this.difficulty;
    const enemy: EnemyState = {
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
      spawnGrace: telegraphed ? 0.85 : 0,
      spawnTime: telegraphed ? 0.85 : 0,
    };
    this.enemies.push(enemy);
    if (telegraphed) this.warning(point, Math.max(0.85, definition.radius * 1.8), 0.85);
    else if (definition.elite) this.effect(point, 'boss-warning', 1.4);
    return enemy;
  }
  private updateMechanics(dt: number, stats: Stats): void {
    const events = this.mechanics.tick(dt, {
      time: this.time,
      position: this.position,
      radius: this.stage.playerRadius,
      enemies: this.enemies,
      obstacles: this.obstacles,
    });
    for (const event of events) {
      if (event.type === 'damage')
        this.hurt(stats.hp * event.fraction, { kind: 'hazard', hazard: event.hazard });
      else if (event.type === 'squad') this.spawnSquad();
      else {
        this.say(event.text, event.duration ?? 4);
        this.sounds.push(event.sound);
      }
    }
  }
  private handleOpportunities(events: OpportunityEvent[]): void {
    for (const event of events) {
      if (event.type === 'cleanup') {
        // Rút hộ vệ không tạo thêm kill/drop; xóa cả đạn đang bay để không có đòn vô chủ.
        const ids = new Set([
          ...event.guards,
          ...this.enemies.filter((e) => e.opportunityId === event.id).map((e) => e.id),
        ]);
        for (const id of ids) this.attackPlans.delete(id);
        this.enemies = this.enemies.filter((e) => !ids.has(e.id));
        this.projectiles = this.projectiles.filter(
          (p) => !p.enemy || !ids.has(p.sourceEnemyId ?? -1),
        );
        this.visuals = this.visuals.filter((v) => v.opportunityId !== event.id);
      } else if (event.type === 'spawn') {
        const ids = this.spawnOpportunityGuards(event.encounter);
        this.opportunities.registerGuards(ids, this.time);
        if (ids.length) {
          this.say('Đã nhận cơ duyên · hộ vệ đang hiện hình', 3);
          this.sounds.push('boss-roar');
        }
      } else if (event.type === 'cue') {
        this.say(event.text, 4);
        this.sounds.push(event.sound);
      } else {
        const { loot, xp, heal } = event.reward;
        this.loot.stone += loot.stone;
        this.loot.cultivation += loot.cultivation;
        for (const [id, amount] of Object.entries(loot.resources))
          this.addResource(id as Resource, amount);
        this.loot.equipment.push(...loot.equipment);
        this.loot.blueprints.push(...loot.blueprints);
        this.xp += xp;
        this.hp = Math.min(this.currentStats().hp, this.hp + this.currentStats().hp * heal);
        this.effect(this.position, heal ? 'healing' : 'level-up', 1);
        this.say(`Đã nhận ${event.name} · chiến lợi phẩm tạm giữ đến cuối lượt`, 5);
        this.sounds.push('win');
      }
    }
  }
  private spawnOpportunityGuards(encounter: OpportunityState): number[] {
    const table = opportunityStages[this.stage.id],
      elite = encounter.kind === 'elite';
    const type = elite ? table.elite : table.guard,
      def = definitions[type];
    const count = elite ? 1 : opportunityRules.guardCount;
    if (this.enemies.filter((e) => !e.dead).length + count > this.stage.maxEnemies) return [];
    const angle = Math.atan2(encounter.y - this.position.y, encounter.x - this.position.x);
    const points = Array.from({ length: count }, (_, i) => ({
      x: encounter.x + Math.cos(angle + (i - (count - 1) / 2) * 0.8) * 2.6,
      y: encounter.y + Math.sin(angle + (i - (count - 1) / 2) * 0.8) * 2.6,
    }));
    const b = this.stage.bounds;
    if (
      points.some(
        (p) =>
          p.x < b.minX + def.radius ||
          p.x > b.maxX - def.radius ||
          p.y < b.minY + def.radius ||
          p.y > b.maxY - def.radius ||
          distance(p, this.position) < 1.5 ||
          this.obstacles.some((o) => distance(o, p) < o.radius + def.radius),
      )
    )
      return [];
    return points.map((point) => {
      const scale = this.stage.enemyScale * (elite ? 1.15 : 1);
      const enemy: EnemyState = {
        ...point,
        id: ++this.sequence,
        type,
        hp: def.hp * scale,
        maxHp: def.hp * scale,
        radius: def.radius,
        speed: def.speed,
        damage: def.damage * scale,
        facing: 'S',
        combo: 0,
        attack: 0,
        attackTime: 0,
        attackDuration: 0,
        impactAt: 0,
        impacted: false,
        cooldown: 0.8,
        target: { ...this.position },
        dead: false,
        deathTime: 0,
        hitTime: 0,
        spawnGrace: opportunityRules.telegraph,
        spawnTime: opportunityRules.telegraph,
        opportunityId: encounter.id,
      };
      this.enemies.push(enemy);
      this.warning(
        point,
        Math.max(0.85, def.radius * 1.8),
        opportunityRules.telegraph,
        encounter.id,
      );
      return enemy.id;
    });
  }
  private spawnSquad(): void {
    const available = Math.max(
      0,
      this.stage.maxEnemies - this.enemies.filter((enemy) => !enemy.dead).length,
    );
    if (available < mechanicRules.squadEnemies.length) {
      this.mechanics.registerSquad(null, this.time);
      return;
    }
    const leader = this.spawnEnemy(mechanicRules.squadEnemies[0]);
    if (!leader) {
      this.mechanics.registerSquad(null, this.time);
      return;
    }
    leader.commander = true;
    leader.squadId = leader.id;
    leader.hp *= mechanicRules.squadLeaderHealth;
    leader.maxHp = leader.hp;
    for (const type of mechanicRules.squadEnemies.slice(1)) {
      const member = this.spawnEnemy(type, leader);
      if (member) member.squadId = leader.id;
    }
    this.mechanics.registerSquad(leader, this.time);
  }
  squadProtected(enemy: EnemyState): boolean {
    if (!enemy.squadId || enemy.commander || this.mechanics.phase === 'boss') return false;
    const leader = this.enemies.find(
      (unit) => unit.id === enemy.squadId && unit.commander && !unit.dead,
    );
    return !!leader && distance(enemy, leader) <= mechanicRules.squadRadius;
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
    this.chainCooldown -= dt;
    if (this.playerAttack) {
      this.playerAttackElapsed += dt;
      if (!this.playerImpacted && this.playerAttackElapsed >= this.playerAttackDuration * 0.5) {
        this.playerImpacted = true;
        const id = startingSkill(this.profile),
          rank = this.skills[id];
        const isSword = id === 'nguyen-khi-tram';
        const attack = primaryAttack(
          isSword ? 'nguyen-khi-tram' : 'cuong-quyen',
          rank,
          this.augments,
        );
        const shot: PlayerShot = {
          from: { ...this.position },
          to: { ...this.attackTarget },
          damage: stats.damage * attack.power,
          effect: attack.effect,
          pierce: attack.pierce,
          count: attack.count,
          speed: attack.speed,
          radius: attack.radius,
          skillId: id,
          rank,
          augment: attack.augment,
        };
        this.fireShot(shot);
        if (this.augments.includes('quyen-lien-kich'))
          this.pendingAttacks.push({
            kind: 'shot',
            delay: augmentRules.echoDelay,
            shot: { ...shot, damage: shot.damage * augmentRules.echoDamage },
          });
        this.sounds.push(isSword ? 'attack-sword' : 'attack-fist');
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
      const attack = primaryAttack(
        startingSkill(this.profile) === 'nguyen-khi-tram' ? 'nguyen-khi-tram' : 'cuong-quyen',
        this.skills[startingSkill(this.profile)] ?? 1,
        this.augments,
      );
      this.attackCooldown = Math.max(0.3, 0.82 / (1 + stats.haste)) * (attack.cooldown / 0.82);
      this.playerAttackDuration = Math.min(0.58, this.attackCooldown * 0.9);
    }
    const fireRank = this.skills['duong-viem-chuong'] ?? 0;
    if (fireRank && target && this.fireCooldown <= 0) {
      const attack = firePalmAttack(fireRank, this.augments);
      this.fireShot({
        from: { ...this.position },
        to: { ...target },
        damage: stats.damage * attack.power,
        effect: 'fire-palm',
        pierce: attack.pierce,
        count: attack.count,
        speed: attack.speed,
        radius: attack.radius,
        skillId: 'duong-viem-chuong',
        rank: fireRank,
        augment: attack.augment,
      });
      this.sounds.push('cast-fire');
      this.fireCooldown = attack.cooldown / (1 + stats.haste);
    }
    if (this.mode !== 'playing') return;
    const chainRank = this.skills['loi-lien'] ?? 0;
    const chain = lightningAttack(chainRank, this.augments);
    const chainTarget = chainRank ? this.nearest(this.position, chain.initialRange) : null;
    if (chainRank && chainTarget && this.chainCooldown <= 0) {
      const damage = stats.damage * chain.power;
      if (chain.focused) {
        this.emitStrike(chainTarget, damage * augmentRules.focusedDamage, chainRank);
        if (this.mode === 'playing')
          for (let hit = 1; hit < augmentRules.focusedHits; hit++)
            this.pendingAttacks.push({
              kind: 'strike',
              delay: hit * augmentRules.focusedDelay,
              targetId: chainTarget.id,
              damage: damage * augmentRules.focusedDamage,
              rank: chainRank,
            });
        this.chainCooldown = chain.cooldown / (1 + stats.haste);
        return;
      }
      const struck = new Set<number>();
      const forked = chain.branches === 2;
      for (let branch = 0; branch < chain.branches; branch++) {
        let origin: Point = this.position;
        const points: Point[] = [{ ...this.position }];
        for (let bounce = 0; bounce < chain.hits; bounce++) {
          const next = this.enemies
            .filter(
              (enemy) =>
                !enemy.dead &&
                !struck.has(enemy.id) &&
                distance(origin, enemy) < (bounce ? chain.jumpRange : chain.initialRange),
            )
            .sort((a, b) => distance(origin, a) - distance(origin, b))[0];
          if (!next) break;
          struck.add(next.id);
          points.push({ x: next.x, y: next.y });
          this.damageEnemy(next, damage * (forked ? augmentRules.forkDamage : 1), true, undefined, {
            id: 'loi-lien',
            rank: chainRank,
          });
          origin = next;
          if (this.mode !== 'playing') break;
        }
        if (points.length > 1)
          this.visuals.push({
            ...this.position,
            id: ++this.sequence,
            kind: 'lightning',
            effect: 'chain-lightning',
            points,
            radius: chainRank >= 6 ? 0.22 : 0.14,
            awakened: chainRank >= 6,
            life: skillEffectTiming.chainLightning,
            total: skillEffectTiming.chainLightning,
          });
        if (points.length > 1) {
          this.chainCooldown = chain.cooldown / (1 + stats.haste);
          this.sounds.push('cast-chain-lightning');
        }
        if (this.mode !== 'playing') break;
      }
    }
  }
  flameRadius(): number {
    return (
      flameRingRadius(this.skills['viem-hoan'] ?? 0) *
      (this.augments.includes('hoan-quang-vuc') ? augmentRules.wideRadius : 1)
    );
  }
  flameDps(): number {
    const stats = this.currentStats();
    return (
      stats.damage *
      flameRingDamagePerSecond(this.skills['viem-hoan'] ?? 0) *
      (1 + stats.haste) *
      (this.augments.includes('hoan-liet-diem') ? augmentRules.ringDamage : 1)
    );
  }
  private updateFlameAura(dt: number, stats: Stats): void {
    const rank = this.skills['viem-hoan'] ?? 0;
    if (!rank) {
      this.flameContacts.clear();
      this.flameWaveIn = 0;
      return;
    }
    const radius = this.flameRadius();
    // Sóng nhiệt là tín hiệu hình ảnh theo thời gian thực; DPS luôn theo thời gian mô phỏng.
    this.flameWaveIn -= dt / this.presentationTimeScale;
    if (this.flameWaveIn <= 1e-7) {
      this.flameWaveIn += flameAuraRules.wavePeriod;
      this.visuals.push({
        ...this.position,
        id: ++this.sequence,
        kind: 'ring',
        effect: 'heat-wave',
        radius,
        life: skillEffectTiming.flameRing,
        total: skillEffectTiming.flameRing,
        awakened: rank >= 6,
        followPlayer: true,
        intense: this.augments.includes('hoan-liet-diem'),
      });
      this.sounds.push('cast-flame-ring');
    }
    const contacts = new Set<number>();
    const dps = this.flameDps();
    for (const enemy of this.enemies) {
      if (enemy.dead || distance(enemy, this.position) > radius + enemy.radius) continue;
      contacts.add(enemy.id);
      let contact = this.flameContacts.get(enemy.id);
      if (!contact) {
        contact = {
          damage: 0,
          feedbackIn: flameAuraRules.feedbackPeriod,
          criticalIn: flameAuraRules.criticalPeriod,
          critical: this.random() < stats.crit,
          hadCritical: false,
        };
        this.flameContacts.set(enemy.id, contact);
      }
      // Chia tại mốc chí mạng để FPS khác nhau không đổi số lần gieo hay lượng DPS trong một mốc.
      let left = dt;
      while (left > 1e-8 && !enemy.dead && this.mode === 'playing') {
        if (contact.criticalIn <= 1e-8) {
          contact.critical = this.random() < stats.crit;
          contact.criticalIn = flameAuraRules.criticalPeriod;
        }
        const step = Math.min(left, contact.criticalIn);
        contact.damage += this.damageEnemy(enemy, dps * step, false, contact.critical, {
          id: 'viem-hoan',
          rank,
        });
        contact.hadCritical ||= contact.critical;
        contact.criticalIn -= step;
        left -= step;
      }
      contact.feedbackIn -= dt / this.presentationTimeScale;
      if (contact.feedbackIn <= 1e-7 || enemy.dead) {
        this.flameFeedback(enemy, contact);
        contact.feedbackIn += flameAuraRules.feedbackPeriod;
      }
      if (this.mode !== 'playing') break;
    }
    for (const [id, contact] of this.flameContacts) {
      if (contacts.has(id)) continue;
      const enemy = this.enemies.find((enemy) => enemy.id === id);
      if (enemy) this.flameFeedback(enemy, contact);
      this.flameContacts.delete(id);
    }
  }
  private flameFeedback(enemy: EnemyState, contact: FlameContact): void {
    if (contact.damage <= 1e-8) return;
    this.number(
      enemy,
      Math.max(1, Math.round(contact.damage)),
      contact.hadCritical ? 'critical' : 'damage',
    );
    enemy.hitTime = 0.07;
    contact.damage = 0;
    contact.hadCritical = false;
  }
  private fireShot(shot: PlayerShot): void {
    this.cast(
      shot.from,
      shot.to,
      shot.damage,
      shot.effect,
      false,
      shot.pierce,
      shot.count,
      shot.speed,
      shot.radius,
      shot.skillId,
      shot.rank,
      shot.augment,
    );
  }
  private emitStrike(enemy: EnemyState, damage: number, rank: number): void {
    if (enemy.dead) return;
    this.visuals.push({
      ...this.position,
      id: ++this.sequence,
      kind: 'lightning',
      effect: 'chain-lightning',
      points: [{ ...this.position }, { x: enemy.x, y: enemy.y }],
      radius: 0.16,
      life: skillEffectTiming.chainLightning,
      total: skillEffectTiming.chainLightning,
      awakened: rank >= 6,
    });
    this.damageEnemy(enemy, damage, true, undefined, {
      id: 'loi-lien',
      rank,
    });
    this.sounds.push('cast-chain-lightning');
  }
  private updatePendingAttacks(dt: number): void {
    for (const attack of this.pendingAttacks) attack.delay -= dt;
    const ready = this.pendingAttacks.filter((attack) => attack.delay <= 1e-7);
    this.pendingAttacks = this.pendingAttacks.filter((attack) => attack.delay > 1e-7);
    for (const attack of ready) {
      if (this.mode !== 'playing') break;
      if (attack.kind === 'shot') {
        this.fireShot(attack.shot);
        this.sounds.push('attack-fist');
      } else {
        const enemy = this.enemies.find((enemy) => enemy.id === attack.targetId && !enemy.dead);
        if (enemy) this.emitStrike(enemy, attack.damage, attack.rank);
      }
    }
  }
  private updateCombatZones(dt: number): void {
    for (const zone of this.combatZones) {
      zone.tickIn -= Math.min(dt, zone.remaining);
      zone.remaining = Math.max(0, zone.remaining - dt);
      if (zone.tickIn <= 1e-7) {
        zone.tickIn += augmentRules.burnInterval;
        for (const enemy of this.enemies)
          if (!enemy.dead && distance(enemy, zone) <= zone.radius + enemy.radius)
            this.damageEnemy(enemy, zone.damage, true, undefined, {
              id: zone.skillId ?? 'duong-viem-chuong',
              rank: zone.rank,
            });
      }
      if (this.mode !== 'playing') break;
    }
    this.combatZones = this.combatZones.filter((zone) => zone.remaining > 1e-7);
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
    skillId?: string,
    rank?: number,
    augment?: AugmentId,
    sourceRank?: number,
  ): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    for (let index = 0; index < count; index++) {
      // Thức tỉnh giữ ba luồng chính; hai luồng quạt thêm ở ngoài, không đẩy luồng chính lệch đích.
      const spread = projectileSpread(index, count, rank, augment);
      this.projectiles.push({
        ...from,
        id: ++this.sequence,
        velocity: { x: Math.cos(angle + spread) * speed, y: Math.sin(angle + spread) * speed },
        damage,
        radius,
        life: enemy ? projectileRules.enemyLifetime : Infinity,
        enemy,
        effect,
        pierce: augment === 'kiem-hoi-phong' ? Infinity : pierce,
        hits: [],
        skillId,
        rank,
        sourceEnemyId: enemy ? (from as EnemyState).id : undefined,
        sourceRank: sourceRank ?? rank,
        // Sao chép nguồn lúc xuất đòn: đạn vẫn có thể trúng sau khi kẻ bắn đã chết.
        incomingSource: enemy ? this.enemySource(from as EnemyState, true) : undefined,
        knockback: augment === 'quyen-bang-son' ? augmentRules.knockback : undefined,
        burn: augment === 'chuong-luu-hoa',
        returnTravel: augment === 'kiem-hoi-phong' ? 0 : undefined,
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
      if ((enemy.spawnGrace ?? 0) > 0) {
        enemy.spawnGrace = Math.max(0, enemy.spawnGrace! - dt);
        continue;
      }
      enemy.cooldown -= dt;
      const definition = definitions[enemy.type],
        targetPoint = this.mission?.targetFor(enemy, this.position) ?? this.position,
        d = distance(enemy, targetPoint);
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
          let velocity = direction(enemy, targetPoint);
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
            {
              x: velocity.x * enemy.speed * this.mechanics.enemySpeed * this.advanced.slow(enemy),
              y: velocity.y * enemy.speed * this.mechanics.enemySpeed * this.advanced.slow(enemy),
            },
            dt,
            this.obstacles,
            this.stage.bounds,
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
    enemy.target = { ...(this.mission?.targetFor(enemy, this.position) ?? this.position) };
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
    const plan: EnemyAttackPlan = {
      center: { x: enemy.x, y: enemy.y },
      radius:
        definition.behavior === 'boss'
          ? enemy.attack === 4
            ? 3.4
            : enemy.attack === 2
              ? 2.4
              : 2
          : enemy.radius + 0.85,
      effect: 'hit-spark',
    };
    const pattern =
      definition.behavior === 'boss' && this.mission
        ? this.mission.bossPattern(definition.pattern ?? 'sword')
        : definition.pattern;
    if (definition.behavior === 'ranged' && enemy.attack === 1) {
      plan.radius = 0;
      plan.projectiles = 'fan';
      plan.effect = definition.projectileEffect ?? 'poison-bolt';
    }
    const isCharge =
      enemy.attack === 3 &&
      (definition.behavior === 'charge' ||
        (definition.behavior === 'boss' && pattern !== 'poison'));
    if (isCharge) {
      const towards = direction(enemy, enemy.target);
      const travel = Math.min(distance(enemy, enemy.target), pattern === 'boar' ? 6 : 5);
      plan.chargeTo = moveWithCollisions(
        enemy,
        { x: towards.x * travel, y: towards.y * travel },
        1,
        this.obstacles,
        this.stage.bounds,
        enemy.radius,
      );
      plan.center = { ...plan.chargeTo };
    }
    if (definition.behavior === 'boss' && pattern && pattern !== 'wolf') {
      if (enemy.attack === 1) {
        if (pattern !== 'boar') {
          plan.radius = 0;
          plan.projectiles = 'fan';
        } else plan.radius = 2.2;
      } else if (enemy.attack === 2 && pattern !== 'sword') {
        plan.center = { ...enemy.target };
        plan.radius = pattern === 'poison' ? 1.9 : 2.3;
      } else if (enemy.attack === 3 && pattern === 'poison') {
        plan.radius = 0;
        plan.projectiles = 'ring';
      } else if (enemy.attack === 4) {
        plan.projectiles = 'ring';
        plan.summon = pattern === 'abyss' || pattern === 'poison';
      }
      plan.effect =
        pattern === 'sword'
          ? 'sword-slash'
          : pattern === 'fire'
            ? 'fire-palm'
            : pattern === 'abyss'
              ? 'spirit-bolt'
              : 'poison-bolt';
    }
    if (definition.behavior === 'boss' && pattern === 'wolf' && enemy.attack === 4) {
      plan.projectiles = 'ring';
      plan.effect = 'poison-bolt';
    }
    if (definition.behavior === 'boss' && enemy.attack === 4 && definition.summons?.length)
      plan.summon = true;
    if (this.stage.mission?.kind === 'duel') plan.summon = false;
    if (this.mission && [4, 10].includes(this.stage.stageIndex)) plan.effect = 'wind-feather';
    this.attackPlans.set(enemy.id, plan);
    // Tâm/radius đã khóa khi tụ lực và chính dữ liệu này được dùng ở thời điểm sát thương.
    if (plan.radius > 0 && (definition.elite || definition.behavior === 'charge'))
      this.warning(plan.center, plan.radius, enemy.impactAt);
  }
  private enemyImpact(enemy: EnemyState): void {
    const definition = definitions[enemy.type];
    const plan = this.attackPlans.get(enemy.id);
    if (!plan) return;
    const humanoid =
      definition.actor.includes('trung-do') ||
      definition.actor.includes('ma-') ||
      definition.actor.includes('nu-tu');
    this.sounds.push(
      !humanoid
        ? 'attack-monster'
        : plan.effect === 'fire-palm'
          ? 'cast-fire'
          : plan.effect === 'spirit-bolt'
            ? 'cast-lightning'
            : definition.behavior === 'ranged'
              ? 'enemy-arrow'
              : definition.behavior === 'melee'
                ? 'attack-fist'
                : 'enemy-blade',
    );
    if (plan.chargeTo) {
      enemy.x = plan.chargeTo.x;
      enemy.y = plan.chargeTo.y;
    }
    if (plan.radius > 0) {
      this.mission?.damageProtected(enemy.damage, plan.center, plan.radius, this.time);
      if (this.mode !== 'playing') return;
      if (distance(plan.center, this.position) < plan.radius)
        this.hurt(enemy.damage, this.enemySource(enemy, false));
      if (definition.elite)
        this.effect(
          plan.center,
          plan.effect === 'poison-bolt' ? 'hit-spark' : plan.effect,
          plan.radius,
        );
    }
    if (plan.projectiles === 'fan') {
      const count =
        definition.behavior === 'boss'
          ? definition.pattern === 'fire'
            ? 5
            : 3
          : definition.elite
            ? 3
            : 1;
      this.cast(
        enemy,
        enemy.target,
        enemy.damage * (definition.behavior === 'boss' ? 0.65 : 1),
        plan.effect,
        true,
        0,
        count,
        definition.pattern === 'sword' ? 4 : 3,
      );
    }
    if (plan.projectiles === 'ring') {
      const count =
        definition.pattern === 'poison'
          ? 12
          : definition.pattern === 'abyss' && enemy.hp < enemy.maxHp * 0.5
            ? 16
            : 8;
      for (let index = 0; index < count; index++)
        this.cast(
          enemy,
          {
            x: enemy.x + Math.cos((index * Math.PI * 2) / count),
            y: enemy.y + Math.sin((index * Math.PI * 2) / count),
          },
          enemy.damage * 0.55,
          plan.effect,
          true,
          0,
          1,
          definition.pattern === 'fire' ? 3.4 : 2.8,
        );
    }
    if (plan.summon && this.enemies.filter((unit) => !unit.dead).length < 35) {
      const summons = definition.summons?.length
        ? definition.summons
        : definition.pattern === 'poison'
          ? ['doc-thiem']
          : ['hac-lang', 'thiet-nha-tru'];
      for (let index = 0; index < 2; index++)
        this.spawnEnemy(
          summons[Math.min(summons.length - 1, Math.floor(this.random() * summons.length))],
        );
      this.say(`${definition.name} triệu tập viện binh!`, 3);
    }
    this.attackPlans.delete(enemy.id);
  }
  private updateProjectiles(dt: number): void {
    for (const bullet of this.projectiles) {
      if (this.mode !== 'playing') break;
      if (bullet.life <= 0) continue;
      const before = { x: bullet.x, y: bullet.y };
      const speed = Math.hypot(bullet.velocity.x, bullet.velocity.y);
      const boundary =
        bullet.returnTravel !== undefined && !bullet.returning
          ? distanceToBoundary(bullet, bullet.velocity, this.stage.bounds)
          : Infinity;
      if (bullet.returning) {
        const aim = direction(bullet, this.position);
        bullet.velocity = { x: aim.x * speed, y: aim.y * speed };
      }
      const travel = Math.min(
        speed * dt,
        boundary,
        bullet.returning
          ? distance(bullet, this.position)
          : bullet.returnTravel !== undefined
            ? Math.max(0, augmentRules.returnDistance - bullet.returnTravel)
            : Infinity,
      );
      bullet.x += speed ? (bullet.velocity.x * travel) / speed : 0;
      bullet.y += speed ? (bullet.velocity.y * travel) / speed : 0;
      if (bullet.returnTravel !== undefined && !bullet.returning) bullet.returnTravel += travel;
      // Đạn phe ta bay tới khi chạm đủ mục tiêu hoặc ra ngoài bản đồ; chỉ đạn địch hết hạn.
      if (bullet.enemy) bullet.life -= dt;
      if (bullet.enemy) {
        const protectedUnit = this.mission?.protected;
        const playerAt = sweptCircleHit(
          before,
          bullet,
          this.position,
          bullet.radius + this.stage.playerRadius,
        );
        const protectedAt = protectedUnit
          ? sweptCircleHit(before, bullet, protectedUnit, bullet.radius + 0.4)
          : null;
        if (
          protectedUnit &&
          protectedAt !== null &&
          (playerAt === null || protectedAt < playerAt)
        ) {
          this.mission!.damageProtected(bullet.damage, protectedUnit, 0, this.time);
          bullet.life = 0;
          if (this.mode !== 'playing') return;
          continue;
        }
        if (playerAt !== null) {
          this.hurt(bullet.damage, bullet.incomingSource);
          bullet.life = 0;
          if (this.hp <= 0) {
            this.finish(false, 'Sinh lực cạn kiệt. Tu vi và chiến lợi phẩm nhận 30%.');
            return;
          }
        }
      } else {
        const contacts = this.enemies
          .filter((enemy) => !enemy.dead && !bullet.hits.includes(enemy.id))
          .map((enemy) => ({
            enemy,
            at: sweptCircleHit(before, bullet, enemy, bullet.radius + enemy.radius),
          }))
          .filter((hit): hit is { enemy: EnemyState; at: number } => hit.at !== null)
          .sort((a, b) => a.at - b.at || a.enemy.id - b.enemy.id);
        // Xử lý theo vị trí va chạm trên đường bay, không phụ thuộc thứ tự mảng quái.
        for (const { enemy, at } of contacts) {
          if (enemy.dead || bullet.hits.includes(enemy.id)) continue;
          bullet.hits.push(enemy.id);
          const firstPalmHit = bullet.effect === 'fire-palm' && !bullet.exploded;
          const palm = firstPalmHit ? firePalmAttack(bullet.rank ?? 1) : null;
          if (palm) {
            bullet.exploded = true;
            // Phát kim diễm trước damage để đòn kết liễu boss vẫn có vụ nổ thức tỉnh.
            if ((bullet.rank ?? 1) >= 6)
              this.visuals.push({
                x: enemy.x,
                y: enemy.y,
                id: ++this.sequence,
                kind: 'fireburst',
                effect: 'solar-burst',
                radius: palm.splashRadius,
                life: 0.8,
                total: 0.8,
                awakened: true,
              });
            else this.effect(enemy, 'fire-palm', palm.splashRadius);
          }
          this.damageEnemy(enemy, bullet.damage, true, undefined, {
            id: bullet.skillId ?? 'other',
            rank: bullet.sourceRank ?? bullet.rank,
          });
          if (this.mode !== 'playing') return;
          if (
            bullet.knockback &&
            !enemy.dead &&
            !definitions[enemy.type].elite &&
            definitions[enemy.type].behavior !== 'boss'
          ) {
            const push = direction(before, enemy);
            const moved = moveWithCollisions(
              enemy,
              { x: push.x * bullet.knockback, y: push.y * bullet.knockback },
              1,
              this.obstacles,
              this.stage.bounds,
              enemy.radius,
            );
            enemy.x = moved.x;
            enemy.y = moved.y;
          }
          if (palm) {
            const splashRadius = palm.splashRadius;
            if (bullet.burn) {
              this.combatZones.push({
                x: enemy.x,
                y: enemy.y,
                id: ++this.sequence,
                radius: splashRadius,
                remaining: augmentRules.burnDuration,
                tickIn: augmentRules.burnInterval,
                damage: bullet.damage * augmentRules.burnDamage,
                skillId: bullet.skillId,
                rank: bullet.sourceRank ?? bullet.rank,
              });
              if (this.combatZones.length > augmentRules.maxBurns) this.combatZones.shift();
            }
            // Một đạn chỉ nổ một lần; mục tiêu trúng lan cũng không nhận lại từ chính đạn đó.
            // Trúng lan không tiêu hao lượt xuyên: lượt xuyên chỉ tính va chạm trực tiếp.
            for (const other of this.enemies) {
              if (
                !other.dead &&
                !bullet.hits.includes(other.id) &&
                distance(other, enemy) < splashRadius
              ) {
                bullet.hits.push(other.id);
                this.damageEnemy(other, bullet.damage * palm.splashDamage, true, undefined, {
                  id: bullet.skillId ?? 'other',
                  rank: bullet.sourceRank ?? bullet.rank,
                });
                if (this.mode !== 'playing') return;
              }
            }
          }
          bullet.pierce--;
          if (bullet.pierce < 0) {
            // Vẽ đạn tại điểm va chạm thay vì vượt sang phía sau mục tiêu ở frame tốc độ cao.
            bullet.x = before.x + (bullet.x - before.x) * at;
            bullet.y = before.y + (bullet.y - before.y) * at;
            bullet.life = 0;
            break;
          }
        }
      }
      if (
        !bullet.returning &&
        bullet.returnTravel !== undefined &&
        (bullet.returnTravel >= augmentRules.returnDistance - 1e-7 || boundary <= travel + 1e-7)
      )
        this.turnProjectile(bullet);
      else if (bullet.returning && distance(bullet, this.position) <= this.stage.playerRadius)
        bullet.life = 0;
      if (projectileOutsideBounds(bullet, this.stage.bounds)) bullet.life = 0;
    }
    this.projectiles = this.projectiles.filter((bullet) => bullet.life > 0);
  }
  private turnProjectile(bullet: Projectile): void {
    // Mỗi chiều có sổ trúng riêng; không cho một chiều gây sát thương lặp khi giao nhau nhiều frame.
    bullet.returning = true;
    bullet.hits = [];
    bullet.pierce = Infinity;
    const speed = Math.hypot(bullet.velocity.x, bullet.velocity.y);
    const aim = direction(bullet, this.position);
    bullet.velocity = { x: aim.x * speed, y: aim.y * speed };
  }
  private damageEnemy(
    enemy: EnemyState,
    damage: number,
    feedback = true,
    criticalOverride?: boolean,
    origin: DamageOrigin = { id: 'other' },
    ignoreMark = false,
  ): number {
    if (enemy.dead || this.mode !== 'playing') return 0;
    const critical = criticalOverride ?? this.random() < this.currentStats().crit;
    let amount =
      damage *
      this.testDamageMultiplier *
      (critical ? 2 : 1) *
      this.advanced.multiplier(enemy, origin.id, ignoreMark) *
      (enemy.type === this.stage.bossId ? (this.mission?.vulnerability(this.time) ?? 1) : 1) *
      this.mechanics.enemyVulnerability *
      (this.squadProtected(enemy) ? 1 - mechanicRules.squadReduction : 1);
    amount = this.mission?.damageLimit(enemy, amount) ?? amount;
    if (amount <= 0) return 0;
    // Ghi trước kill() để đòn kết liễu boss có mặt trong bản tổng kết bất biến.
    this.statistics.dealt(origin, enemy.hp, amount);
    enemy.hp -= amount;
    if (feedback) {
      enemy.hitTime = 0.1;
      this.number(enemy, Math.round(amount), critical ? 'critical' : 'damage');
      this.sounds.push('hit');
    }
    if (enemy.hp <= 0) this.kill(enemy);
    return amount;
  }
  private enemySource(enemy: EnemyState, projectile: boolean): IncomingSource {
    const plan = this.attackPlans.get(enemy.id);
    return {
      kind: 'enemy',
      enemyType: enemy.type,
      attack: enemy.attack,
      delivery: projectile ? (plan?.projectiles ?? 'fan') : plan?.chargeTo ? 'charge' : 'melee',
      effect: plan?.effect ?? definitions[enemy.type]?.projectileEffect ?? '',
    };
  }
  private hurt(damage: number, source: IncomingSource = { kind: 'unknown' }): void {
    if (this.invulnerability > 0 || this.mode !== 'playing' || this.hp <= 0) return;
    const amount =
      Math.max(1, damage - this.currentStats().armor * 1.6) *
      (this.mechanics.wardRemaining > 0 ? 1 - mechanicRules.wardReduction : 1);
    const reduced =
      amount * (1 - this.advanced.maReduction(this.time, this.skills['nhap-ma'] ?? 0));
    const before = this.hp;
    this.hp = Math.max(0, this.hp - reduced);
    if (
      this.mission &&
      this.stage.mission?.kind === 'capture' &&
      source.kind === 'enemy' &&
      source.enemyType === this.stage.bossId
    ) {
      const boss = this.enemies.find((e) => e.type === this.stage.bossId && !e.dead);
      if (boss) {
        const aim = direction(boss, this.position);
        this.position = moveWithCollisions(
          this.position,
          { x: aim.x * 0.8, y: aim.y * 0.8 },
          1,
          this.obstacles,
          this.stage.bounds,
          this.stage.playerRadius,
        );
      }
    }
    this.statistics.received(this.time, before, this.hp, source);
    this.invulnerability = 0.6;
    this.number(this.position, Math.round(reduced), 'hurt');
    this.sounds.push('hurt');
  }
  private kill(enemy: EnemyState): void {
    enemy.dead = true;
    enemy.deathTime = 0;
    enemy.attack = 0;
    this.attackPlans.delete(enemy.id);
    this.kills++;
    const definition = definitions[enemy.type];
    this.drops.push({
      x: enemy.x,
      y: enemy.y,
      id: ++this.sequence,
      kind: 'xp',
      value: definition.xp,
    });
    // Hộ vệ cơ duyên cho XP; phần thưởng riêng chỉ nhận bằng tương tác, không nhân đôi loot tinh anh.
    if (enemy.opportunityId !== undefined) return;
    if (this.stage.chapter === 2) {
      this.worldTwoKill(enemy);
      return;
    }
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
    if (enemy.type === this.stage.bossId) {
      this.finish(true, `${definition.name} đã bị đánh bại. Hoàn thành ${this.stage.name}!`);
    }
  }
  private worldTwoKill(enemy: EnemyState): void {
    if (this.mission?.isNode(enemy.id)) return;
    if (enemy.type === this.stage.bossId) {
      if (this.mission?.bossDefeated()) this.finish(true, this.mission.victoryMessage());
      return;
    }
    const definition = definitions[enemy.type],
      tier = worldTwoTier(this.stage.stageIndex);
    if (definition.elite) {
      this.loot.cultivation += [300, 450, 600, 800][tier];
      this.loot.stone += [150, 220, 300, 400][tier];
      this.addResource('yeu-dan', [3, 4, 5, 6][tier]);
      this.addResource('linh-tai-thong-huyen', [1, 1, 2, 3][tier]);
    } else {
      this.loot.cultivation += [6, 9, 12, 16][tier];
      if (this.random() < 0.3)
        this.drops.push({
          ...enemy,
          id: ++this.sequence,
          kind: 'stone',
          value: [6, 8, 10, 12][tier],
        });
      if (this.random() < 0.18)
        this.drops.push({
          ...enemy,
          id: ++this.sequence,
          kind:
            definition.behavior === 'ranged'
              ? 'linh-thao'
              : definition.behavior === 'charge'
                ? 'thiet-khoang'
                : 'da-thu',
          value: [1, 2, 2, 3][tier],
        });
    }
    if (this.random() < 0.045)
      this.drops.push({
        ...enemy,
        id: ++this.sequence,
        kind: 'heal',
        value: this.currentStats().hp * 0.04,
      });
  }
  private collect(dt: number, stats: Stats): void {
    let collected = false;
    for (const drop of this.drops) {
      const d = distance(drop, this.position);
      if (d < stats.pickup) {
        const towards = direction(drop, this.position);
        drop.x += towards.x * Math.min(d, (4 + (stats.pickup - d) * 4) * dt);
        drop.y += towards.y * Math.min(d, (4 + (stats.pickup - d) * 4) * dt);
      }
      if (distance(drop, this.position) < 0.28) {
        collected = true;
        if (drop.kind === 'xp') this.xp += drop.value;
        else if (drop.kind === 'heal') {
          this.hp = Math.min(stats.hp, this.hp + drop.value);
          this.effect(this.position, 'healing', 0.8);
        } else if (drop.kind === 'stone') this.loot.stone += drop.value;
        else this.addResource(drop.kind, drop.value);
        drop.value = 0;
      }
    }
    if (collected) this.sounds.push('pickup');
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
        this.stage.bounds,
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
        const damage = stats.damage * petAttackPower(pet.level) * (pet.evolved ? 1.7 : 1);
        if (id === 'thanh-dieu') {
          const rank = Math.max(1, Math.min(6, pet.evolved ? 6 : pet.level));
          this.cast(
            this.petPosition,
            target,
            damage,
            'wind-feather',
            false,
            pierceForRank(rank),
            1,
            4.5,
            0.2,
            'pet-thanh-dieu',
            rank,
            undefined,
            pet.level,
          );
          this.sounds.push('cast-lightning');
        } else if (distance(this.petPosition, target) < 1.7) {
          this.damageEnemy(target, damage, true, undefined, { id: `pet-${id}`, rank: pet.level });
          this.effect(target, pet.evolved ? 'spirit-bolt' : 'hit-spark', 0.8);
          this.sounds.push('attack-fist');
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
  private warning(point: Point, radius: number, life: number, opportunityId?: number): void {
    this.visuals.push({
      ...point,
      id: ++this.sequence,
      kind: 'warning',
      effect: 'warning',
      radius,
      life,
      total: life,
      opportunityId,
    });
  }
  abandon(): void {
    if (this.mode !== 'result')
      this.finish(false, 'Đã rút lui khỏi màn. Nhận 30% tu vi và tài nguyên.', 'retreat');
  }
  private finish(
    won: boolean,
    reason: string,
    outcome: 'victory' | 'defeat' | 'retreat' | 'mission-failed' = won ? 'victory' : 'defeat',
  ): void {
    if (this.result) return;
    const lossStone = this.loot.stone;
    if (won) {
      // Kết liễu boss tự thu tài nguyên còn trên sân; XP và hồi máu không phải thưởng vĩnh viễn.
      for (const drop of this.drops) {
        if (drop.kind === 'stone') this.loot.stone += drop.value;
        else if (drop.kind !== 'xp' && drop.kind !== 'heal')
          this.addResource(drop.kind, drop.value);
      }
      this.drops = this.drops.filter((drop) => drop.kind === 'xp' || drop.kind === 'heal');
      this.loot.cultivation += this.stage.rewards.cultivation;
      this.loot.stone += this.stage.rewards.stone;
      for (const [id, amount] of Object.entries(this.stage.rewards.resources))
        this.addResource(id as Resource, amount);
      this.loot.equipment.push(...this.stage.rewards.equipment);
      this.loot.blueprints.push(...this.stage.rewards.blueprints);
    } else {
      const progress = this.mission
        ? this.mission.checkpoint / 4
        : Math.min(1, this.time / this.stage.duration);
      this.loot.cultivation += this.stage.rewards.cultivation * progress;
      this.loot.stone += this.stage.rewards.stone * (2 / 3) * progress;
    }
    this.loot.blueprints = [...new Set(this.loot.blueprints)];
    this.loot.equipment = [...new Set(this.loot.equipment)];
    const raw = structuredClone(this.loot);
    const rewards = settleLoot(raw, won, this.random);
    if (!won && this.mission)
      rewards.stone = Math.floor(
        (6 * lossStone + this.stage.rewards.stone * this.mission.checkpoint) / 20,
      );
    this.result = {
      stageId: this.stage.id,
      won,
      reason,
      outcome,
      combat: this.statistics.snapshot(this.time),
      time: this.time,
      kills: this.kills,
      level: this.level,
      raw,
      rewards,
      seed: this.seed,
      opportunities: {
        completed: this.opportunities.completed,
        missed:
          this.opportunities.missed +
          (this.opportunities.active &&
          !['completed', 'expired'].includes(this.opportunities.active.phase)
            ? 1
            : 0),
      },
    };
    this.mode = 'result';
    this.handleOpportunities(this.opportunities.clear());
    this.mechanics.clear();
    this.projectiles = [];
    this.advanced.clear(true);
    this.mission?.clear();
    this.queuedDash = false;
    this.pendingAttacks = [];
    this.combatZones = [];
    this.flameContacts.clear();
    this.attackPlans.clear();
    this.sounds.push(won ? 'win' : 'lose');
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
