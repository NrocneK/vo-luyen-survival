import type { EnemyState, Stats } from '../../shared/models';
import type { Point, WorldBounds } from '../../shared/types';
import { distanceToBoundary } from '../../data/projectiles.ts';
import type { AugmentId } from '../../shared/augments';
import {
  advancedRules,
  worldTwoAttackIds,
  type WorldTwoAttackId,
} from '../../data/worldTwoSkills.ts';
import { enemies as definitions } from '../../data/enemies.ts';
import { skills } from '../../data/skills.ts';
import { techniqueHit, segmentDistance, type TechniqueArea } from '../math/techniqueGeometry.ts';
import { dragonSpine } from '../math/vfxGeometry.ts';

export interface AdvancedContext {
  time: number;
  position: Point;
  ranks: Record<string, number>;
  augments: AugmentId[];
  enemies: EnemyState[];
  bossId: string;
  active: () => boolean;
  stats: () => Stats;
  random: () => number;
  motionRandom?: () => number;
  bounds?: WorldBounds;
  hit: (
    enemy: EnemyState,
    damage: number,
    id: string,
    rank: number,
    critical?: boolean,
    ignoreMark?: boolean,
    quiet?: boolean,
  ) => number;
  feedback?: (enemy: EnemyState, damage: number, critical: boolean) => void;
  sound?: (id: string) => void;
  push: (enemy: EnemyState, from: Point, distance: number) => void;
}
export interface TechniqueVisual extends TechniqueArea {
  id: number;
  effect: 'soul' | 'palm' | 'dragon' | 'lightning';
  remaining: number;
  total: number;
  warning: boolean;
}
interface Mark {
  expires: number;
  strength: number;
  nova?: { due: number; damage: number };
}
interface ActiveZone {
  area: TechniqueArea;
  kind: 'slow' | 'beam' | 'dragon';
  end: number;
  started: number;
  next: number;
  tick: number;
  damage: number;
  rank: number;
  id: number;
  progress: number;
  hits: Set<number>;
  crit: Map<number, { window: number; value: boolean }>;
  dragon?: {
    position: Point;
    heading: number;
    goal: Point;
    turnAt: number;
    trail: Point[];
    contacts: Map<number, number>;
    radius: number;
    bodyLength: number;
  };
  feedback?: Map<number, { enemy: EnemyState; damage: number; critical: boolean }>;
  feedbackIn?: number;
}
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const areaAt = (p: Point, shape: TechniqueArea['shape'], angle = 0): TechniqueArea => ({
  ...p,
  shape,
  angle,
  radius: 0,
  length: 0,
  width: 0,
  spread: 0,
});

/** Trạng thái kỹ năng chỉ thuộc lượt. Đòn trễ giữ công/nhánh/bậc lúc xuất, không đọc lại khi trúng. */
export class AdvancedSkills {
  readonly marks = new Map<number, Mark>();
  readonly visuals: TechniqueVisual[] = [];
  readonly zones: ActiveZone[] = [];
  private pending: { due: number; run: (ctx: AdvancedContext) => void }[] = [];
  private ready: Partial<Record<WorldTwoAttackId, number>> = {};
  private sequence = 0;
  private maStarted = false;
  private maEnd = 0;
  private maAt = 0;
  private maNext = 0;
  private now = 0;
  private motionSeed = 0x519bc37;
  private motion(ctx: AdvancedContext): number {
    if (ctx.motionRandom) return ctx.motionRandom();
    this.motionSeed = (Math.imul(this.motionSeed, 1664525) + 1013904223) >>> 0;
    return this.motionSeed / 0x100000000;
  }
  maActive(time: number): boolean {
    return this.maStarted && time < this.maEnd;
  }
  maElapsed(time: number): number {
    return this.maActive(time) ? Math.max(0, time - this.maAt) : 0;
  }
  maBonus(time: number, rank: number): number {
    return rank && this.maActive(time) ? 0.15 + 0.05 * rank : 0;
  }
  maReduction(time: number, rank: number): number {
    return rank && this.maActive(time) ? 0.08 + 0.02 * rank : 0;
  }
  maView(time: number, rank: number) {
    return rank
      ? {
          active: this.maActive(time),
          remaining: Math.max(0, (this.maActive(time) ? this.maEnd : this.maNext) - time),
        }
      : null;
  }
  multiplier(enemy: EnemyState, source: string, ignore = false): number {
    if (ignore || (!(source in skills) && !source.startsWith('pet-'))) return 1;
    const mark = this.marks.get(enemy.id);
    return mark && mark.expires > this.now ? 1 + mark.strength : 1;
  }
  slow(enemy: EnemyState): number {
    if (
      !this.zones.some(
        (zone) => zone.kind === 'slow' && techniqueHit(zone.area, enemy, enemy.radius),
      )
    )
      return 1;
    return definitions[enemy.type].behavior === 'boss'
      ? 0.9
      : definitions[enemy.type].elite
        ? 0.8
        : 0.65;
  }
  private visual(
    area: TechniqueArea,
    effect: TechniqueVisual['effect'],
    life: number,
    warning = false,
  ): number {
    const id = ++this.sequence;
    this.visuals.push({ ...area, id, effect, remaining: life, total: life, warning });
    return id;
  }
  private schedule(due: number, run: (ctx: AdvancedContext) => void) {
    this.pending.push({ due, run });
  }
  private mark(
    ctx: AdvancedContext,
    enemy: EnemyState,
    rank: number,
    damage: number,
    factor: number,
    novaFactor: number,
  ) {
    if (enemy.dead || !ctx.active()) return;
    const strength =
      (0.08 + 0.02 * rank) * factor * (definitions[enemy.type].behavior === 'boss' ? 0.5 : 1);
    const current = this.marks.get(enemy.id);
    const mark: Mark = {
      expires: ctx.time + 3,
      strength: Math.max(current?.strength ?? 0, strength),
      nova: current?.nova,
    };
    if (rank === 6 && !mark.nova)
      mark.nova = { due: ctx.time + 2, damage: damage * 2 * novaFactor };
    this.marks.set(enemy.id, mark);
  }
  tick(dt: number, ctx: AdvancedContext, presentationScale = 1): void {
    this.now = ctx.time;
    for (let i = this.visuals.length - 1; i >= 0; i--) {
      const v = this.visuals[i];
      v.remaining -= v.warning ? dt : dt / presentationScale;
      if (v.remaining <= 0) this.visuals.splice(i, 1);
    }
    const ma = ctx.ranks['nhap-ma'] ?? 0;
    if (ma && (!this.maStarted || ctx.time >= this.maNext)) {
      this.maStarted = true;
      this.maAt = ctx.time;
      this.maEnd = ctx.time + 2.5 + 0.5 * ma;
      this.maNext = ctx.time + 12;
    }
    for (const [id, mark] of this.marks) {
      const enemy = ctx.enemies.find((e) => e.id === id && !e.dead);
      if (!enemy) {
        this.marks.delete(id);
        continue;
      }
      if (mark.nova && ctx.time >= mark.nova.due) {
        const damage = mark.nova.damage;
        mark.nova = undefined;
        this.visual({ ...areaAt(enemy, 'disc'), radius: 0.65 }, 'soul', 0.3);
        ctx.hit(enemy, damage, 'diet-hon-kim-quang', 6, false, true);
        if (!ctx.active()) return;
      }
      if (ctx.time >= mark.expires) this.marks.delete(id);
    }
    const due = this.pending.filter((job) => job.due <= ctx.time + 1e-8);
    this.pending = this.pending.filter((job) => job.due > ctx.time + 1e-8);
    for (const job of due) {
      job.run(ctx);
      if (!ctx.active()) return;
    }
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      if (z.kind === 'beam') {
        z.feedback ??= new Map();
        z.feedbackIn = (z.feedbackIn ?? 0.35) - dt / presentationScale;
        while (z.tick < 7 && ctx.time + 1e-8 >= z.next) {
          z.tick++;
          z.next = z.started + 0.2 * (z.tick + 1);
          for (const enemy of ctx.enemies) {
            if (enemy.dead || !techniqueHit(z.area, enemy, enemy.radius)) continue;
            const window = Math.floor((ctx.time - z.started) / 0.4);
            let roll = z.crit.get(enemy.id);
            if (!roll || roll.window !== window) {
              roll = { window, value: ctx.random() < ctx.stats().crit };
              z.crit.set(enemy.id, roll);
            }
            const dealt = ctx.hit(
              enemy,
              z.damage,
              'kim-long-hien-hoa',
              z.rank,
              roll.value,
              false,
              !!ctx.feedback,
            );
            if (ctx.feedback) {
              const item = z.feedback.get(enemy.id) ?? { enemy, damage: 0, critical: false };
              item.damage += dealt;
              item.critical ||= roll.value;
              z.feedback.set(enemy.id, item);
              if (enemy.dead || !ctx.active()) {
                ctx.feedback(enemy, item.damage, item.critical);
                z.feedback.delete(enemy.id);
              }
            }
            if (!ctx.active()) return;
          }
        }
        if (z.feedbackIn <= 0 || ctx.time >= z.end) {
          for (const item of z.feedback.values())
            if (item.damage > 0) ctx.feedback?.(item.enemy, item.damage, item.critical);
          z.feedback.clear();
          z.feedbackIn = 0.35;
        }
      } else if (z.kind === 'dragon') {
        // Chia bước để đường cong và va chạm không phụ thuộc tốc độ khung hình.
        const dragon = z.dragon!;
        const until = Math.min(ctx.time, z.end);
        const elapsed = Math.max(0, until - Math.max(ctx.time - dt, z.started));
        for (let left = elapsed; left > 1e-8; left -= 0.02) {
          const step = Math.min(0.02, left),
            now = until - left + step;
          const beforeSpine = dragonSpine(dragon, Math.max(0, now - step - z.started), now - step);
          if (
            now >= dragon.turnAt ||
            dist(dragon.position, {
              x: ctx.position.x + dragon.goal.x,
              y: ctx.position.y + dragon.goal.y,
            }) < 0.7
          ) {
            const a = this.motion(ctx) * Math.PI * 2,
              r = dragon.radius * (0.4 + 0.5 * this.motion(ctx));
            dragon.goal = { x: Math.cos(a) * r, y: Math.sin(a) * r };
            // Một số vòng lượn cắt qua địch gần người; không đuổi mục tiêu ra khỏi phạm vi bảo vệ.
            const nearby = ctx.enemies.filter(
              (e) => !e.dead && dist(e, ctx.position) < dragon.radius,
            );
            if (nearby.length && this.motion(ctx) < 0.55) {
              const e = nearby[Math.floor(this.motion(ctx) * nearby.length)];
              dragon.goal = { x: e.x - ctx.position.x, y: e.y - ctx.position.y };
            }
            dragon.turnAt = now + 0.8 + this.motion(ctx) * 0.6;
          }
          const goal =
            dist(dragon.position, ctx.position) > dragon.radius
              ? ctx.position
              : { x: ctx.position.x + dragon.goal.x, y: ctx.position.y + dragon.goal.y };
          const desired = Math.atan2(goal.y - dragon.position.y, goal.x - dragon.position.x);
          const delta = Math.atan2(
            Math.sin(desired - dragon.heading),
            Math.cos(desired - dragon.heading),
          );
          const turn = dist(dragon.position, ctx.position) > dragon.radius ? 3.3 : 2.3;
          dragon.heading += Math.max(-turn * step, Math.min(turn * step, delta));
          const before = { ...dragon.position };
          dragon.position.x += Math.cos(dragon.heading) * 8 * step;
          dragon.position.y += Math.sin(dragon.heading) * 8 * step;
          if (ctx.bounds) {
            dragon.position.x = Math.max(
              ctx.bounds.minX + z.area.width / 2,
              Math.min(ctx.bounds.maxX - z.area.width / 2, dragon.position.x),
            );
            dragon.position.y = Math.max(
              ctx.bounds.minY + z.area.width / 2,
              Math.min(ctx.bounds.maxY - z.area.width / 2, dragon.position.y),
            );
          }
          dragon.trail.unshift({ ...dragon.position });
          let length = 0,
            keep = 1;
          for (; keep < dragon.trail.length; keep++) {
            length += dist(dragon.trail[keep - 1], dragon.trail[keep]);
            if (length >= dragon.bodyLength) break;
          }
          dragon.trail.splice(keep + 1);
          const spine = dragonSpine(dragon, Math.max(0, now - z.started), now);
          const minX = Math.min(...spine.map((p) => p.x)),
            maxX = Math.max(...spine.map((p) => p.x)),
            minY = Math.min(...spine.map((p) => p.y)),
            maxY = Math.max(...spine.map((p) => p.y));
          for (const enemy of ctx.enemies) {
            if (enemy.dead || now < (dragon.contacts.get(enemy.id) ?? -Infinity)) continue;
            const radius = z.area.width / 2 + enemy.radius;
            if (
              enemy.x < minX - radius ||
              enemy.x > maxX + radius ||
              enemy.y < minY - radius ||
              enemy.y > maxY + radius
            )
              continue;
            const touched =
              segmentDistance(enemy, before, dragon.position) <= radius ||
              spine.some(
                (p, j) =>
                  (j > 0 && segmentDistance(enemy, spine[j - 1], p) <= radius) ||
                  segmentDistance(enemy, beforeSpine[j], p) <= radius,
              );
            if (!touched) continue;
            dragon.contacts.set(enemy.id, now + advancedRules['kim-long-hien-hoa'].contactInterval);
            this.visual(
              { ...areaAt(enemy, 'disc'), radius: z.area.width / 2 },
              z.rank === 6 ? 'lightning' : 'dragon',
              0.22,
            );
            ctx.hit(enemy, z.damage, 'kim-long-hien-hoa', z.rank);
            if (!ctx.active()) return;
          }
        }
      }
      if (ctx.time >= z.end + 1e-8) this.zones.splice(i, 1);
    }
    for (const id of worldTwoAttackIds) {
      const rank = ctx.ranks[id] ?? 0;
      if (!rank || ctx.time < (this.ready[id] ?? 0)) continue;
      const rule = advancedRules[id],
        i = Math.min(5, rank - 1);
      const focused = id === 'diet-hon-kim-quang' && ctx.augments.includes('quang-pha-hon');
      const range =
        id === 'gia-thien-thu'
          ? 7
          : id === 'kim-long-hien-hoa'
            ? advancedRules[id].length[i]
            : focused
              ? 16
              : 12;
      const targets = ctx.enemies.filter((e) => !e.dead && dist(e, ctx.position) <= range);
      targets.sort((a, b) =>
        focused
          ? Number(b.type === ctx.bossId) - Number(a.type === ctx.bossId) ||
            Number(definitions[b.type].elite) - Number(definitions[a.type].elite) ||
            dist(a, ctx.position) - dist(b, ctx.position)
          : dist(a, ctx.position) - dist(b, ctx.position),
      );
      const target = targets[0];
      if (!target) continue;
      ctx.sound?.(
        id === 'diet-hon-kim-quang'
          ? 'cast-lightning'
          : id === 'gia-thien-thu'
            ? 'attack-fist'
            : 'cast-fire',
      );
      this.ready[id] =
        ctx.time + Math.max(rule.minimum, rule.cooldown[i] / (1 + ctx.stats().haste));
      const angle = Math.atan2(target.y - ctx.position.y, target.x - ctx.position.x),
        power = ctx.stats().damage * rule.power[i];
      if (id === 'diet-hon-kim-quang') {
        const wide = ctx.augments.includes('quang-tan'),
          factor = focused ? 1.3 : wide ? 0.8 : 1;
        const areas = (wide ? [-0.3, 0, 0.3] : [0]).map((offset) => ({
          ...areaAt(ctx.position, 'beam', angle + offset),
          length: range,
          width: focused ? 0.7 : wide ? 1 : 1.2,
        }));
        if (ctx.bounds)
          for (const area of areas)
            area.length = Math.min(
              area.length,
              distanceToBoundary(
                area,
                { x: Math.cos(area.angle), y: Math.sin(area.angle) },
                ctx.bounds,
              ),
            );
        const markPower = focused ? 1.25 : wide ? 0.75 : 1,
          castDamage = ctx.stats().damage;
        for (const area of areas) this.visual(area, 'soul', rule.windup, true);
        this.schedule(ctx.time + rule.windup, (c) => {
          for (const area of areas) this.visual(area, 'soul', 0.52);
          for (const enemy of c.enemies)
            if (!enemy.dead && areas.some((area) => techniqueHit(area, enemy, enemy.radius))) {
              c.hit(enemy, power * factor, id, rank);
              this.mark(c, enemy, rank, castDamage, markPower, factor);
              if (!c.active()) return;
            }
        });
      } else if (id === 'gia-thien-thu') {
        const area = { ...areaAt(target, 'palm'), radius: advancedRules[id].radius[i] },
          echo = ctx.augments.includes('thu-diep-chuong'),
          slow = ctx.augments.includes('thu-tran-dia');
        const strikes = echo ? 2 : 1;
        const cPower = ctx.stats().damage;
        for (let n = 0; n < strikes; n++) {
          if (n === 0) this.visual(area, 'palm', rule.windup, true);
          else
            this.schedule(ctx.time + n * 0.3, () => this.visual(area, 'palm', rule.windup, true));
          this.schedule(ctx.time + rule.windup + n * 0.3, (c) => {
            this.visual(area, 'palm', 2.5);
            for (const enemy of c.enemies)
              if (!enemy.dead && techniqueHit(area, enemy, enemy.radius)) {
                c.hit(enemy, power * (echo ? 0.65 : slow ? 0.85 : 1), id, rank);
                if (!c.active()) return;
                if (n === strikes - 1 && !enemy.dead && !definitions[enemy.type].elite)
                  c.push(enemy, area, 0.8);
              }
            if (slow)
              this.zones.push({
                area,
                kind: 'slow',
                started: c.time,
                end: c.time + 2.5,
                next: 0,
                tick: 0,
                damage: 0,
                rank,
                id: ++this.sequence,
                progress: 0,
                hits: new Set(),
                crit: new Map(),
              });
          });
        }
        if (rank === 6)
          this.schedule(ctx.time + rule.windup + (strikes - 1) * 0.3 + 0.25, (c) => {
            const wave = { ...area, radius: 3 };
            this.visual(wave, 'palm', 1.6);
            for (const enemy of c.enemies)
              if (!enemy.dead && techniqueHit(wave, enemy, enemy.radius)) {
                c.hit(enemy, 3 * cPower, id, rank);
                if (!c.active()) return;
              }
          });
      } else {
        const breath = ctx.augments.includes('long-tuc'),
          long = ctx.augments.includes('long-du');
        const r = advancedRules[id];
        const area = {
          ...areaAt(ctx.position, breath ? 'beam' : 'dragon', angle),
          length: r.length[i] * (long ? 1.4 : 1),
          width: r.width[i] * (breath ? 0.75 : long ? 1.25 : 1),
        };
        if (ctx.bounds && breath)
          area.length = Math.min(
            area.length,
            Math.max(
              0,
              distanceToBoundary(area, { x: Math.cos(angle), y: Math.sin(angle) }, ctx.bounds),
            ),
          );
        this.visual(area, 'dragon', rule.windup, true);
        this.schedule(ctx.time + rule.windup, (c) => {
          this.zones.push({
            area,
            kind: breath ? 'beam' : 'dragon',
            started: c.time,
            end: c.time + (breath ? 1.4 : long ? r.roamDuration + 1.2 : r.roamDuration),
            next: c.time + 0.2,
            tick: 0,
            damage:
              power *
              (breath ? (rank === 6 ? 0.25 : 0.2) : r.contactPower * (rank === 6 ? 1.35 : 1)),
            rank,
            id: ++this.sequence,
            progress: 0,
            hits: new Set(),
            crit: new Map(),
            ...(!breath
              ? {
                  dragon: {
                    position: { ...c.position },
                    heading: angle,
                    goal: { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 },
                    turnAt: c.time + 0.45,
                    trail: [{ ...c.position }],
                    contacts: new Map<number, number>(),
                    radius: long ? 6.3 : 4.5,
                    bodyLength: 6.2,
                  },
                }
              : {}),
          });
        });
      }
    }
  }
  clear(preserveImpact = false): void {
    this.marks.clear();
    if (preserveImpact) {
      for (let i = this.visuals.length - 1; i >= 0; i--)
        if (this.visuals[i].warning) this.visuals.splice(i, 1);
    } else this.visuals.length = 0;
    this.zones.length = 0;
    this.pending = [];
    this.maStarted = false;
    this.maEnd = 0;
    this.maAt = 0;
    this.maNext = 0;
    this.ready = {};
  }
}
